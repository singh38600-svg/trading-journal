"""
A+ trade setup generator.
Filters analysis output → produces high-probability setups only (RR >= 1:2).
"""
from analysis_engine import analyse
from market_data import fetch_ohlcv


def _score_confluence(analysis: dict, direction: str) -> tuple[int, list[str]]:
    """Return (score 0-100, list of confluence reasons)."""
    score = 0
    factors = []
    structure = analysis["structure"]
    ind = analysis["indicators"]
    price = analysis["current_price"]
    fvgs = analysis["fvgs"]
    obs = analysis["order_blocks"]
    liq = analysis["liquidity"]

    if direction == "BUY":
        if structure["bias"] == "Bullish":
            score += 20
            factors.append("Bullish market structure (HH/HL)")
        if structure["choch"] == "Bullish CHOCH":
            score += 15
            factors.append("Bullish Change of Character (CHOCH)")
        if structure["bos"] == "Bullish BOS":
            score += 10
            factors.append("Bullish Break of Structure (BOS)")
        if price > ind["ema_50"]:
            score += 10
            factors.append("Price above 50 EMA")
        if price > ind["ema_200"]:
            score += 10
            factors.append("Price above 200 EMA")
        if 40 < ind["rsi"] < 65:
            score += 10
            factors.append(f"RSI in bullish zone ({ind['rsi']:.1f})")
        if ind["macd_hist"] > 0:
            score += 5
            factors.append("MACD histogram positive")
        bullish_fvg = [f for f in fvgs if f["type"] == "Bullish FVG" and f["bottom"] <= price <= f["top"]]
        if bullish_fvg:
            score += 15
            factors.append(f"Price in Bullish FVG ({bullish_fvg[-1]['bottom']:.2f} – {bullish_fvg[-1]['top']:.2f})")
        bullish_ob = [o for o in obs if o["type"] == "Bullish OB" and o["bottom"] <= price <= o["top"]]
        if bullish_ob:
            score += 15
            factors.append(f"Price in Bullish OB ({bullish_ob[-1]['bottom']:.2f} – {bullish_ob[-1]['top']:.2f})")
        if liq["sell_side_liquidity"] and price > min(liq["sell_side_liquidity"]):
            score += 5
            factors.append("Sell-side liquidity swept below")

    else:  # SELL
        if structure["bias"] == "Bearish":
            score += 20
            factors.append("Bearish market structure (LH/LL)")
        if structure["choch"] == "Bearish CHOCH":
            score += 15
            factors.append("Bearish Change of Character (CHOCH)")
        if structure["bos"] == "Bearish BOS":
            score += 10
            factors.append("Bearish Break of Structure (BOS)")
        if price < ind["ema_50"]:
            score += 10
            factors.append("Price below 50 EMA")
        if price < ind["ema_200"]:
            score += 10
            factors.append("Price below 200 EMA")
        if 35 < ind["rsi"] < 60:
            score += 10
            factors.append(f"RSI in bearish zone ({ind['rsi']:.1f})")
        if ind["macd_hist"] < 0:
            score += 5
            factors.append("MACD histogram negative")
        bearish_fvg = [f for f in fvgs if f["type"] == "Bearish FVG" and f["bottom"] <= price <= f["top"]]
        if bearish_fvg:
            score += 15
            factors.append(f"Price in Bearish FVG ({bearish_fvg[-1]['bottom']:.2f} – {bearish_fvg[-1]['top']:.2f})")
        bearish_ob = [o for o in obs if o["type"] == "Bearish OB" and o["bottom"] <= price <= o["top"]]
        if bearish_ob:
            score += 15
            factors.append(f"Price in Bearish OB ({bearish_ob[-1]['bottom']:.2f} – {bearish_ob[-1]['top']:.2f})")
        if liq["buy_side_liquidity"] and price < max(liq["buy_side_liquidity"]):
            score += 5
            factors.append("Buy-side liquidity swept above")

    return min(score, 100), factors


def generate_setup(symbol: str, timeframe: str = "4h", bars: int = 300) -> str:
    """
    Fetch data, run analysis, generate trade setup string.
    Returns formatted setup or 'NO TRADE' if no A+ setup found.
    """
    df = fetch_ohlcv(symbol, interval=timeframe, bars=bars)
    analysis = analyse(df)
    analysis["symbol"] = symbol
    analysis["timeframe"] = timeframe

    price = analysis["current_price"]
    atr_val = analysis["indicators"]["atr"]
    structure = analysis["structure"]

    # Determine candidate direction
    bias = structure["bias"]
    choch = structure["choch"]

    if choch == "Bullish CHOCH" or bias == "Bullish":
        direction = "BUY"
    elif choch == "Bearish CHOCH" or bias == "Bearish":
        direction = "SELL"
    else:
        return _no_trade(symbol, timeframe, "Range-bound market — no directional bias")

    score, factors = _score_confluence(analysis, direction)

    # Minimum confluence threshold
    if score < 50:
        return _no_trade(symbol, timeframe, f"Confidence too low ({score}/100) — not an A+ setup")

    # ── Entry, SL, Targets ─────────────────────────────────────────
    obs = analysis["order_blocks"]
    fvgs = analysis["fvgs"]

    if direction == "BUY":
        # Entry: current price or nearest bullish OB top
        bullish_obs = [o for o in obs if o["type"] == "Bullish OB"]
        if bullish_obs:
            ob = bullish_obs[-1]
            entry = ob["top"]
        else:
            entry = price

        sl = entry - (atr_val * 1.5)
        sl = min(sl, structure["last_sl"] - atr_val * 0.3) if structure["last_sl"] else sl

        risk = entry - sl
        t1 = entry + risk * 1.5
        t2 = entry + risk * 2.5
        t3 = entry + risk * 4.0

        # Use next liquidity level as T3 if available
        liq_targets = analysis["liquidity"]["buy_side_liquidity"]
        if liq_targets:
            t3 = max(t3, max(liq_targets))

    else:  # SELL
        bearish_obs = [o for o in obs if o["type"] == "Bearish OB"]
        if bearish_obs:
            ob = bearish_obs[-1]
            entry = ob["bottom"]
        else:
            entry = price

        sl = entry + (atr_val * 1.5)
        sl = max(sl, structure["last_sh"] + atr_val * 0.3) if structure["last_sh"] else sl

        risk = sl - entry
        t1 = entry - risk * 1.5
        t2 = entry - risk * 2.5
        t3 = entry - risk * 4.0

        liq_targets = analysis["liquidity"]["sell_side_liquidity"]
        if liq_targets:
            t3 = min(t3, min(liq_targets))

    rr = abs((t2 - entry) / (entry - sl)) if direction == "BUY" else abs((entry - t2) / (sl - entry))

    if rr < 2.0:
        return _no_trade(symbol, timeframe, f"RR {rr:.1f} below minimum 1:2 threshold")

    # ── Setup type classification ───────────────────────────────────
    has_ob = any("OB" in f for f in factors)
    has_fvg = any("FVG" in f for f in factors)
    has_bos = any("BOS" in f or "CHOCH" in f for f in factors)

    if has_ob and has_fvg and has_bos:
        setup_type = "Hybrid (SMC + ICT)"
    elif has_ob:
        setup_type = "SMC"
    elif has_fvg:
        setup_type = "ICT"
    else:
        setup_type = "Price Action"

    # ── FVG / OB summary for reasoning ─────────────────────────────
    ob_desc = "None identified" if not obs else f"{obs[-1]['type']} @ {obs[-1]['bottom']:.2f}–{obs[-1]['top']:.2f}"
    fvg_desc = "None identified" if not fvgs else f"{fvgs[-1]['type']} @ {fvgs[-1]['bottom']:.2f}–{fvgs[-1]['top']:.2f}"
    liq_desc = (f"Buy-side @ {analysis['liquidity']['buy_side_liquidity']}" if direction == "BUY"
                else f"Sell-side @ {analysis['liquidity']['sell_side_liquidity']}")

    sweep_desc = "Sell-side swept" if direction == "BUY" else "Buy-side swept"

    output = f"""
╔══════════════════════════════════════════════════════════╗
  TRADE SETUP — {symbol} / {timeframe.upper()}
╚══════════════════════════════════════════════════════════╝

TRADE SETUP:
  Direction       : {direction}
  Entry           : {entry:.4f}
  Stop Loss       : {sl:.4f}
  Target 1 (T1)  : {t1:.4f}   [RR 1:{abs((t1-entry)/(entry-sl)) if direction == 'BUY' else abs((entry-t1)/(sl-entry)):.1f}]
  Target 2 (T2)  : {t2:.4f}   [RR 1:{abs((t2-entry)/(entry-sl)) if direction == 'BUY' else abs((entry-t2)/(sl-entry)):.1f}]
  Target 3 (T3)  : {t3:.4f}   [RR 1:{abs((t3-entry)/(entry-sl)) if direction == 'BUY' else abs((entry-t3)/(sl-entry)):.1f}]
  Risk/Reward     : 1:{rr:.1f} (at T2)
  Setup Type      : {setup_type}
  Confidence      : {score}/100

REASONING:
  Market Structure : {structure['bias']} | BOS: {structure['bos'] or 'None'} | CHOCH: {structure['choch'] or 'None'}
  Liquidity Sweep  : {sweep_desc} | Zones: {liq_desc}
  Order Block      : {ob_desc}
  FVG              : {fvg_desc}
  Confluence       :
    {''.join(f"    ✓ {f}{chr(10)}" for f in factors)}
  Indicators       :
    EMA 50 : {analysis['indicators']['ema_50']:.4f}
    EMA 200: {analysis['indicators']['ema_200']:.4f}
    RSI    : {analysis['indicators']['rsi']:.1f}
    MACD   : {analysis['indicators']['macd']:.4f} | Signal: {analysis['indicators']['macd_signal']:.4f}
    ATR    : {analysis['indicators']['atr']:.4f}
"""
    return output.strip()


def _no_trade(symbol: str, timeframe: str, reason: str) -> str:
    return f"""
╔══════════════════════════════════════════════════════════╗
  NO TRADE — {symbol} / {timeframe.upper()}
╚══════════════════════════════════════════════════════════╝
  Reason: {reason}
  Capital preservation mode — waiting for A+ setup.
""".strip()


def scan_watchlist(symbols: list[str], timeframe: str = "4h") -> list[str]:
    """Scan multiple symbols, return setups only (no-trade entries filtered out)."""
    results = []
    for sym in symbols:
        try:
            result = generate_setup(sym, timeframe)
            results.append(result)
        except Exception as e:
            results.append(f"ERROR [{sym}]: {e}")
    return results
