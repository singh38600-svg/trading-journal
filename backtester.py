"""
Backtesting engine — simulates SMC/ICT setups on historical data.
Tracks win rate, drawdown, RR, expectancy per strategy.
Auto-discards strategies below threshold.
"""
import numpy as np
import pandas as pd
from analysis_engine import analyse, find_order_blocks, find_fvgs, market_structure, add_indicators
from market_data import fetch_ohlcv


STRATEGY_THRESHOLDS = {
    "min_win_rate": 0.55,
    "min_rr": 2.0,
}


# ─────────────────────────────────────────────
# SIGNAL GENERATORS PER STRATEGY
# ─────────────────────────────────────────────

def _signals_price_action(df: pd.DataFrame) -> pd.DataFrame:
    """Pure price action: enter on BOS, SL below last swing low."""
    df = add_indicators(df)
    signals = []
    for i in range(20, len(df) - 1):
        sub = df.iloc[:i + 1]
        ms = market_structure(sub)
        atr = float(df["atr"].iloc[i]) if "atr" in df.columns else (df["high"].iloc[i] - df["low"].iloc[i])
        price = float(df["close"].iloc[i])

        if ms["bos"] == "Bullish BOS":
            sl = ms["last_sl"] - atr * 0.5 if ms["last_sl"] else price - atr * 2
            signals.append({"index": i, "direction": "BUY", "entry": price, "sl": sl, "source": "PA"})
        elif ms["bos"] == "Bearish BOS":
            sl = ms["last_sh"] + atr * 0.5 if ms["last_sh"] else price + atr * 2
            signals.append({"index": i, "direction": "SELL", "entry": price, "sl": sl, "source": "PA"})

    return pd.DataFrame(signals)


def _signals_smc(df: pd.DataFrame) -> pd.DataFrame:
    """SMC: enter at order block with BOS confirmation."""
    df = add_indicators(df)
    signals = []
    for i in range(30, len(df) - 1):
        sub = df.iloc[:i + 1]
        ms = market_structure(sub)
        obs = find_order_blocks(sub)
        price = float(df["close"].iloc[i])
        atr = float(df["atr"].iloc[i])

        bullish_obs = [o for o in obs if o["type"] == "Bullish OB" and o["bottom"] <= price <= o["top"]]
        bearish_obs = [o for o in obs if o["type"] == "Bearish OB" and o["bottom"] <= price <= o["top"]]

        if bullish_obs and ms["bias"] in ("Bullish", "Range"):
            ob = bullish_obs[-1]
            sl = ob["bottom"] - atr * 0.3
            signals.append({"index": i, "direction": "BUY", "entry": price, "sl": sl, "source": "SMC"})
        elif bearish_obs and ms["bias"] in ("Bearish", "Range"):
            ob = bearish_obs[-1]
            sl = ob["top"] + atr * 0.3
            signals.append({"index": i, "direction": "SELL", "entry": price, "sl": sl, "source": "SMC"})

    return pd.DataFrame(signals)


def _signals_ict(df: pd.DataFrame) -> pd.DataFrame:
    """ICT: enter at FVG with EMA confirmation."""
    df = add_indicators(df)
    signals = []
    for i in range(30, len(df) - 1):
        sub = df.iloc[:i + 1]
        fvgs = find_fvgs(sub)
        price = float(df["close"].iloc[i])
        atr = float(df["atr"].iloc[i])
        ema50 = float(df["ema_50"].iloc[i])

        bullish_fvg = [f for f in fvgs if f["type"] == "Bullish FVG" and f["bottom"] <= price <= f["top"]]
        bearish_fvg = [f for f in fvgs if f["type"] == "Bearish FVG" and f["bottom"] <= price <= f["top"]]

        if bullish_fvg and price > ema50:
            fvg = bullish_fvg[-1]
            sl = fvg["bottom"] - atr * 0.3
            signals.append({"index": i, "direction": "BUY", "entry": price, "sl": sl, "source": "ICT"})
        elif bearish_fvg and price < ema50:
            fvg = bearish_fvg[-1]
            sl = fvg["top"] + atr * 0.3
            signals.append({"index": i, "direction": "SELL", "entry": price, "sl": sl, "source": "ICT"})

    return pd.DataFrame(signals)


def _signals_hybrid(df: pd.DataFrame) -> pd.DataFrame:
    """Hybrid: OB + FVG + BOS confluence (highest filter)."""
    df = add_indicators(df)
    signals = []
    for i in range(40, len(df) - 1):
        sub = df.iloc[:i + 1]
        ms = market_structure(sub)
        obs = find_order_blocks(sub)
        fvgs = find_fvgs(sub)
        price = float(df["close"].iloc[i])
        atr = float(df["atr"].iloc[i])
        ema50 = float(df["ema_50"].iloc[i])

        bull_ob = any(o["type"] == "Bullish OB" and o["bottom"] <= price <= o["top"] for o in obs)
        bull_fvg = any(f["type"] == "Bullish FVG" and f["bottom"] <= price <= f["top"] for f in fvgs)
        bear_ob = any(o["type"] == "Bearish OB" and o["bottom"] <= price <= o["top"] for o in obs)
        bear_fvg = any(f["type"] == "Bearish FVG" and f["bottom"] <= price <= f["top"] for f in fvgs)

        if bull_ob and bull_fvg and ms["bias"] == "Bullish" and price > ema50:
            sl = price - atr * 1.5
            signals.append({"index": i, "direction": "BUY", "entry": price, "sl": sl, "source": "Hybrid"})
        elif bear_ob and bear_fvg and ms["bias"] == "Bearish" and price < ema50:
            sl = price + atr * 1.5
            signals.append({"index": i, "direction": "SELL", "entry": price, "sl": sl, "source": "Hybrid"})

    return pd.DataFrame(signals)


# ─────────────────────────────────────────────
# TRADE SIMULATION
# ─────────────────────────────────────────────

def _simulate_trades(df: pd.DataFrame, signals: pd.DataFrame,
                     rr_t1: float = 1.5, rr_t2: float = 2.5) -> pd.DataFrame:
    """
    For each signal, simulate forward: did price hit T1/T2 or SL first?
    Returns trade log with outcome, actual RR, pnl.
    """
    if signals.empty:
        return pd.DataFrame()

    results = []
    closes = df["close"].values
    highs = df["high"].values
    lows = df["low"].values

    for _, sig in signals.iterrows():
        idx = int(sig["index"])
        entry = sig["entry"]
        sl = sig["sl"]
        direction = sig["direction"]
        risk = abs(entry - sl)

        if risk == 0:
            continue

        t1 = entry + risk * rr_t1 if direction == "BUY" else entry - risk * rr_t1
        t2 = entry + risk * rr_t2 if direction == "BUY" else entry - risk * rr_t2

        outcome = "OPEN"
        exit_price = entry
        bars_held = 0

        for j in range(idx + 1, min(idx + 100, len(df))):
            bars_held += 1
            h, l = highs[j], lows[j]

            if direction == "BUY":
                if l <= sl:
                    outcome = "SL"
                    exit_price = sl
                    break
                if h >= t2:
                    outcome = "T2"
                    exit_price = t2
                    break
                if h >= t1:
                    outcome = "T1"
                    exit_price = t1
            else:
                if h >= sl:
                    outcome = "SL"
                    exit_price = sl
                    break
                if l <= t2:
                    outcome = "T2"
                    exit_price = t2
                    break
                if l <= t1:
                    outcome = "T1"
                    exit_price = t1

        actual_rr = abs(exit_price - entry) / risk if risk else 0
        pnl_r = actual_rr if outcome in ("T1", "T2") else -1.0

        results.append({
            "source": sig.get("source", "Unknown"),
            "direction": direction,
            "entry": entry,
            "sl": sl,
            "exit": exit_price,
            "outcome": outcome,
            "actual_rr": round(actual_rr, 2),
            "pnl_r": round(pnl_r, 2),
            "bars_held": bars_held,
        })

    return pd.DataFrame(results)


# ─────────────────────────────────────────────
# METRICS
# ─────────────────────────────────────────────

def _compute_metrics(trades: pd.DataFrame) -> dict:
    if trades.empty:
        return {"error": "No trades generated"}

    closed = trades[trades["outcome"] != "OPEN"]
    if closed.empty:
        return {"error": "No closed trades"}

    wins = closed[closed["outcome"].isin(["T1", "T2"])]
    win_rate = len(wins) / len(closed)
    avg_rr = closed["actual_rr"].mean()
    expectancy = closed["pnl_r"].mean()

    equity = closed["pnl_r"].cumsum()
    peak = equity.cummax()
    drawdown = (equity - peak)
    max_dd = drawdown.min()

    return {
        "total_trades": len(closed),
        "win_rate": round(win_rate, 3),
        "avg_rr": round(avg_rr, 2),
        "expectancy_r": round(expectancy, 2),
        "max_drawdown_r": round(max_dd, 2),
        "gross_r": round(closed["pnl_r"].sum(), 2),
        "passes_threshold": win_rate >= STRATEGY_THRESHOLDS["min_win_rate"] and avg_rr >= STRATEGY_THRESHOLDS["min_rr"],
    }


# ─────────────────────────────────────────────
# PUBLIC API
# ─────────────────────────────────────────────

def run_backtest(symbol: str, timeframe: str = "1d", bars: int = 500) -> dict:
    """
    Run all 4 strategies on historical data. Return metrics + keep only passing strategies.
    """
    df = fetch_ohlcv(symbol, interval=timeframe, bars=bars)
    df = add_indicators(df)

    strategies = {
        "Price Action": _signals_price_action,
        "SMC": _signals_smc,
        "ICT": _signals_ict,
        "Hybrid": _signals_hybrid,
    }

    results = {}
    for name, sig_fn in strategies.items():
        try:
            signals = sig_fn(df)
            trades = _simulate_trades(df, signals)
            metrics = _compute_metrics(trades)
            metrics["strategy"] = name
            metrics["kept"] = metrics.get("passes_threshold", False)
            results[name] = metrics
        except Exception as e:
            results[name] = {"strategy": name, "error": str(e), "kept": False}

    return {
        "symbol": symbol,
        "timeframe": timeframe,
        "bars_analysed": len(df),
        "strategies": results,
        "recommended": _pick_best(results),
    }


def _pick_best(results: dict) -> str:
    """Return the best passing strategy by expectancy."""
    passing = {k: v for k, v in results.items() if v.get("passes_threshold") and "expectancy_r" in v}
    if not passing:
        return "No strategy meets threshold — avoid trading this instrument/timeframe"
    best = max(passing, key=lambda k: passing[k]["expectancy_r"])
    return best


def format_backtest_report(result: dict) -> str:
    lines = [
        f"\n{'═'*60}",
        f"  BACKTEST REPORT — {result['symbol']} / {result['timeframe'].upper()}",
        f"  Bars analysed: {result['bars_analysed']}",
        f"{'═'*60}",
    ]
    for name, m in result["strategies"].items():
        if "error" in m:
            lines.append(f"\n  [{name}] ERROR: {m['error']}")
            continue
        status = "✅ KEEP" if m.get("kept") else "❌ DISCARD"
        lines += [
            f"\n  [{name}] {status}",
            f"    Trades     : {m.get('total_trades', 0)}",
            f"    Win Rate   : {m.get('win_rate', 0)*100:.1f}%",
            f"    Avg RR     : 1:{m.get('avg_rr', 0):.2f}",
            f"    Expectancy : {m.get('expectancy_r', 0):.2f}R per trade",
            f"    Max DD     : {m.get('max_drawdown_r', 0):.2f}R",
            f"    Gross P&L  : {m.get('gross_r', 0):.2f}R",
        ]
    lines += [
        f"\n{'─'*60}",
        f"  RECOMMENDED STRATEGY: {result['recommended']}",
        f"{'─'*60}\n",
    ]
    return "\n".join(lines)
