"""
Market data layer — fetches OHLCV from yfinance (equities/indices) and CCXT (crypto).
"""
import pandas as pd
import yfinance as yf
import ccxt
from datetime import datetime, timedelta

# NSE symbol map for yfinance
NSE_SYMBOLS = {
    "NIFTY": "^NSEI",
    "BANKNIFTY": "^NSEBANK",
    "SENSEX": "^BSESN",
    "FINNIFTY": "NIFTY_FIN_SERVICE.NS",
}

INTERVAL_MAP_YF = {
    "1m": "1m", "5m": "5m", "15m": "15m", "30m": "30m",
    "1h": "1h", "4h": "4h", "1d": "1d", "1w": "1wk", "1M": "1mo",
}

INTERVAL_MAP_CCXT = {
    "1m": "1m", "5m": "5m", "15m": "15m", "30m": "30m",
    "1h": "1h", "4h": "4h", "1d": "1d", "1w": "1w",
}

PERIOD_FOR_INTERVAL = {
    "1m": "7d", "5m": "60d", "15m": "60d", "30m": "60d",
    "1h": "730d", "4h": "730d", "1d": "5y", "1w": "10y", "1M": "max",
}


def fetch_ohlcv_equity(symbol: str, interval: str = "1d", bars: int = 500) -> pd.DataFrame:
    """
    Fetch OHLCV for equities/indices via yfinance.
    symbol: use NSE_SYMBOLS keys (NIFTY, BANKNIFTY) or raw yfinance tickers (RELIANCE.NS).
    interval: 1m 5m 15m 30m 1h 4h 1d 1w 1M
    """
    ticker = NSE_SYMBOLS.get(symbol.upper(), symbol)
    yf_interval = INTERVAL_MAP_YF.get(interval, "1d")
    period = PERIOD_FOR_INTERVAL.get(interval, "2y")

    raw = yf.download(ticker, period=period, interval=yf_interval,
                      auto_adjust=True, progress=False)

    if raw.empty:
        raise ValueError(f"No data returned for {symbol} ({ticker})")

    # Flatten multi-level columns if present
    if isinstance(raw.columns, pd.MultiIndex):
        raw.columns = raw.columns.get_level_values(0)

    df = raw[["Open", "High", "Low", "Close", "Volume"]].copy()
    df.columns = ["open", "high", "low", "close", "volume"]
    df.index = pd.to_datetime(df.index)
    df = df.dropna().tail(bars)
    return df


def fetch_ohlcv_crypto(symbol: str, interval: str = "1d", bars: int = 500,
                       exchange_id: str = "binance") -> pd.DataFrame:
    """
    Fetch OHLCV for crypto via CCXT.
    symbol: e.g. BTC/USDT, ETH/USDT
    interval: 1m 5m 15m 30m 1h 4h 1d 1w
    """
    exchange_class = getattr(ccxt, exchange_id)
    exchange = exchange_class({"enableRateLimit": True})

    tf = INTERVAL_MAP_CCXT.get(interval, "1d")
    since = None
    if bars:
        ms_per_bar = {
            "1m": 60000, "5m": 300000, "15m": 900000, "30m": 1800000,
            "1h": 3600000, "4h": 14400000, "1d": 86400000, "1w": 604800000,
        }
        ms = ms_per_bar.get(tf, 86400000)
        since = exchange.milliseconds() - (bars * ms * 2)

    raw = exchange.fetch_ohlcv(symbol, timeframe=tf, since=since, limit=bars)
    if not raw:
        raise ValueError(f"No data returned for {symbol}")

    df = pd.DataFrame(raw, columns=["timestamp", "open", "high", "low", "close", "volume"])
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms", utc=True)
    df = df.set_index("timestamp").tail(bars)
    return df


def fetch_ohlcv(symbol: str, interval: str = "1d", bars: int = 500) -> pd.DataFrame:
    """
    Auto-route: if '/' in symbol → crypto (CCXT), else → equity (yfinance).
    Returns a clean OHLCV DataFrame with datetime index.
    """
    if "/" in symbol:
        return fetch_ohlcv_crypto(symbol, interval, bars)
    return fetch_ohlcv_equity(symbol, interval, bars)


def get_current_price(symbol: str) -> float:
    """Return latest close price for any symbol."""
    df = fetch_ohlcv(symbol, interval="1d", bars=2)
    return float(df["close"].iloc[-1])
