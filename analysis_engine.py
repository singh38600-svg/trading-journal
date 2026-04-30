"""
SMC / ICT analysis engine.
Detects: market structure, BOS/CHOCH, order blocks, FVGs, liquidity zones.
All functions accept a standard OHLCV DataFrame (open/high/low/close/volume).
"""
import numpy as np
import pandas as pd


# ─────────────────────────────────────────────
# INDICATORS (native — no external TA lib)
# ─────────────────────────────────────────────

def ema(series: pd.Series, period: int) -> pd.Series:
    return series.ewm(span=period, adjust=False).mean()


def rsi(series: pd.Series, period: int = 14) -> pd.Series:
    delta = series.diff()
    gain = delta.clip(lower=0).ewm(com=period - 1, adjust=False).mean()
    loss = (-delta.clip(upper=0)).ewm(com=period - 1, adjust=False).mean()
    rs = gain / loss.replace(0, np.nan)
    return 100 - (100 / (1 + rs))


def macd(series: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9):
    fast_ema = ema(series, fast)
    slow_ema = ema(series, slow)
    macd_line = fast_ema - slow_ema
    signal_line = ema(macd_line, signal)
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram


def atr(df: pd.DataFrame, period: int = 14) -> pd.Series:
    hl = df["high"] - df["low"]
    hc = (df["high"] - df["close"].shift()).abs()
    lc = (df["low"] - df["close"].shift()).abs()
    tr = pd.concat([hl, hc, lc], axis=1).max(axis=1)
    return tr.ewm(com=period - 1, adjust=False).mean()


def add_indicators(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["ema_50"] = ema(df["close"], 50)
    df["ema_200"] = ema(df["close"], 200)
    df["rsi"] = rsi(df["close"], 14)
    df["macd"], df["macd_signal"], df["macd_hist"] = macd(df["close"])
    df["atr"] = atr(df, 14)
    return df


# ─────────────────────────────────────────────
# SWING HIGHS / LOWS
# ─────────────────────────────────────────────

def find_swing_highs(df: pd.DataFrame, lookback: int = 5) -> pd.Series:
    highs = df["high"]
    is_swing = pd.Series(False, index=df.index)
    for i in range(lookback, len(df) - lookback):
        window = highs.iloc[i - lookback: i + lookback + 1]
        if highs.iloc[i] == window.max():
            is_swing.iloc[i] = True
    return is_swing


def find_swing_lows(df: pd.DataFrame, lookback: int = 5) -> pd.Series:
    lows = df["low"]
    is_swing = pd.Series(False, index=df.index)
    for i in range(lookback, len(df) - lookback):
        window = lows.iloc[i - lookback: i + lookback + 1]
        if lows.iloc[i] == window.min():
            is_swing.iloc[i] = True
    return is_swing


# ─────────────────────────────────────────────
# MARKET STRUCTURE
# ─────────────────────────────────────────────

def market_structure(df: pd.DataFrame, lookback: int = 5) -> dict:
    """
    Returns market bias (Bullish / Bearish / Range) plus last BOS/CHOCH label.
    Uses swing high/low sequence to determine HH/HL (bullish) or LH/LL (bearish).
    """
    swing_h = find_swing_highs(df, lookback)
    swing_l = find_swing_lows(df, lookback)

    sh_prices = df["high"][swing_h].values
    sl_prices = df["low"][swing_l].values

    if len(sh_prices) < 2 or len(sl_prices) < 2:
        return {"bias": "Range", "bos": None, "choch": None, "last_sh": None, "last_sl": None}

    hh = sh_prices[-1] > sh_prices[-2]
    hl = sl_prices[-1] > sl_prices[-2]
    lh = sh_prices[-1] < sh_prices[-2]
    ll = sl_prices[-1] < sl_prices[-2]

    if hh and hl:
        bias = "Bullish"
    elif lh and ll:
        bias = "Bearish"
    else:
        bias = "Range"

    # BOS: continuation break; CHOCH: structure flip
    recent_close = df["close"].iloc[-1]
    prev_sh = sh_prices[-2]
    prev_sl = sl_prices[-2]

    bos = None
    choch = None

    if bias == "Bullish" and recent_close > prev_sh:
        bos = "Bullish BOS"
    elif bias == "Bearish" and recent_close < prev_sl:
        bos = "Bearish BOS"
    elif bias == "Bearish" and recent_close > prev_sh:
        choch = "Bullish CHOCH"
    elif bias == "Bullish" and recent_close < prev_sl:
        choch = "Bearish CHOCH"

    return {
        "bias": bias,
        "bos": bos,
        "choch": choch,
        "last_sh": float(sh_prices[-1]),
        "last_sl": float(sl_prices[-1]),
        "prev_sh": float(prev_sh),
        "prev_sl": float(prev_sl),
    }


# ─────────────────────────────────────────────
# ORDER BLOCKS
# ─────────────────────────────────────────────

def find_order_blocks(df: pd.DataFrame, lookback: int = 5) -> list[dict]:
    """
    Institutional order blocks: last bearish candle before a bullish impulse (bullish OB)
    or last bullish candle before a bearish impulse (bearish OB).
    Returns list of dicts with zone top/bottom, type, and index.
    """
    obs = []
    closes = df["close"].values
    opens = df["open"].values
    highs = df["high"].values
    lows = df["low"].values

    for i in range(lookback, len(df) - lookback):
        # Bullish OB: bearish candle followed by strong bullish move
        if closes[i] < opens[i]:  # bearish candle
            # check if next candles break above this candle's high
            impulse_close = closes[i + 1: i + lookback + 1].max() if i + lookback + 1 <= len(df) else closes[-1]
            if impulse_close > highs[i] * 1.002:
                obs.append({
                    "type": "Bullish OB",
                    "top": float(highs[i]),
                    "bottom": float(lows[i]),
                    "index": df.index[i],
                    "mitigated": df["low"].iloc[i + 1:].min() < lows[i],
                })

        # Bearish OB: bullish candle followed by strong bearish move
        elif closes[i] > opens[i]:  # bullish candle
            impulse_close = closes[i + 1: i + lookback + 1].min() if i + lookback + 1 <= len(df) else closes[-1]
            if impulse_close < lows[i] * 0.998:
                obs.append({
                    "type": "Bearish OB",
                    "top": float(highs[i]),
                    "bottom": float(lows[i]),
                    "index": df.index[i],
                    "mitigated": df["high"].iloc[i + 1:].max() > highs[i],
                })

    # Return only the 3 most recent unmitigated OBs per direction
    bullish = [o for o in obs if o["type"] == "Bullish OB" and not o["mitigated"]][-3:]
    bearish = [o for o in obs if o["type"] == "Bearish OB" and not o["mitigated"]][-3:]
    return bullish + bearish


# ─────────────────────────────────────────────
# FAIR VALUE GAPS
# ─────────────────────────────────────────────

def find_fvgs(df: pd.DataFrame) -> list[dict]:
    """
    FVG: 3-candle pattern where candle[i-1].high < candle[i+1].low (bullish)
    or candle[i-1].low > candle[i+1].high (bearish).
    Returns recent unmitigated FVGs.
    """
    fvgs = []
    highs = df["high"].values
    lows = df["low"].values
    closes = df["close"].values

    for i in range(1, len(df) - 1):
        # Bullish FVG
        if highs[i - 1] < lows[i + 1]:
            gap_top = lows[i + 1]
            gap_bot = highs[i - 1]
            # mitigated if price later trades back into gap
            mitigated = (df["low"].iloc[i + 2:].min() <= gap_top) if i + 2 < len(df) else False
            fvgs.append({
                "type": "Bullish FVG",
                "top": float(gap_top),
                "bottom": float(gap_bot),
                "index": df.index[i],
                "mitigated": bool(mitigated),
            })

        # Bearish FVG
        elif lows[i - 1] > highs[i + 1]:
            gap_top = lows[i - 1]
            gap_bot = highs[i + 1]
            mitigated = (df["high"].iloc[i + 2:].max() >= gap_bot) if i + 2 < len(df) else False
            fvgs.append({
                "type": "Bearish FVG",
                "top": float(gap_top),
                "bottom": float(gap_bot),
                "index": df.index[i],
                "mitigated": bool(mitigated),
            })

    recent = [f for f in fvgs if not f["mitigated"]][-5:]
    return recent


# ─────────────────────────────────────────────
# LIQUIDITY ZONES
# ─────────────────────────────────────────────

def find_liquidity_zones(df: pd.DataFrame, lookback: int = 5, tolerance: float = 0.002) -> dict:
    """
    Equal highs / equal lows within tolerance → liquidity resting above/below.
    Also returns previous session highs/lows as HTF liquidity.
    """
    swing_h = find_swing_highs(df, lookback)
    swing_l = find_swing_lows(df, lookback)

    sh_prices = df["high"][swing_h].values
    sl_prices = df["low"][swing_l].values

    # Equal highs: within tolerance band
    eq_highs = []
    for i in range(len(sh_prices)):
        for j in range(i + 1, len(sh_prices)):
            if abs(sh_prices[i] - sh_prices[j]) / sh_prices[i] < tolerance:
                eq_highs.append(float((sh_prices[i] + sh_prices[j]) / 2))

    eq_lows = []
    for i in range(len(sl_prices)):
        for j in range(i + 1, len(sl_prices)):
            if abs(sl_prices[i] - sl_prices[j]) / sl_prices[i] < tolerance:
                eq_lows.append(float((sl_prices[i] + sl_prices[j]) / 2))

    # Remove duplicates
    eq_highs = sorted(set(round(x, 4) for x in eq_highs))
    eq_lows = sorted(set(round(x, 4) for x in eq_lows))

    return {
        "buy_side_liquidity": eq_highs[-3:] if eq_highs else [],   # above price — stops resting
        "sell_side_liquidity": eq_lows[:3] if eq_lows else [],     # below price — stops resting
        "prev_high": float(df["high"].iloc[-20:-1].max()),
        "prev_low": float(df["low"].iloc[-20:-1].min()),
    }


# ─────────────────────────────────────────────
# FULL ANALYSIS
# ─────────────────────────────────────────────

def analyse(df: pd.DataFrame, lookback: int = 5) -> dict:
    """
    Run complete SMC/ICT analysis on a DataFrame.
    Returns a structured dict for use by signal_generator.
    """
    df = add_indicators(df)
    structure = market_structure(df, lookback)
    order_blocks = find_order_blocks(df, lookback)
    fvgs = find_fvgs(df)
    liquidity = find_liquidity_zones(df, lookback)

    latest = df.iloc[-1]

    return {
        "symbol": None,
        "timeframe": None,
        "current_price": float(latest["close"]),
        "structure": structure,
        "order_blocks": order_blocks,
        "fvgs": fvgs,
        "liquidity": liquidity,
        "indicators": {
            "ema_50": float(latest["ema_50"]),
            "ema_200": float(latest["ema_200"]),
            "rsi": float(latest["rsi"]),
            "macd": float(latest["macd"]),
            "macd_signal": float(latest["macd_signal"]),
            "macd_hist": float(latest["macd_hist"]),
            "atr": float(latest["atr"]),
        },
        "df": df,
    }
