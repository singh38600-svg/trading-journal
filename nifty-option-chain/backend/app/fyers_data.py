"""
Fetches raw data from Fyers API:
  - Options chain (all strikes for nearest expiry)
  - Futures quote (current + next expiry)
  - Spot price (embedded in options chain response)
"""

import logging
from datetime import date, timedelta
from typing import Optional

from .fyers_auth import get_fyers_client
from .config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Symbol used to fetch the options chain
NIFTY_INDEX_SYMBOL = "NSE:NIFTY50-INDEX"


# ─────────────────────────────────────────────────────────────────────────────
# Expiry helpers
# ─────────────────────────────────────────────────────────────────────────────

def _next_thursday(from_date: Optional[date] = None) -> date:
    """Return the nearest upcoming Thursday (NIFTY weekly expiry)."""
    d = from_date or date.today()
    days_ahead = (3 - d.weekday()) % 7   # 3 = Thursday
    if days_ahead == 0:
        days_ahead = 7
    return d + timedelta(days=days_ahead)


def _expiry_string(expiry: date) -> str:
    """Convert a date to Fyers futures symbol format, e.g. 25APR."""
    return expiry.strftime("%y%b").upper()   # '25APR'


# ─────────────────────────────────────────────────────────────────────────────
# Options chain
# ─────────────────────────────────────────────────────────────────────────────

def fetch_options_chain(symbol: str = NIFTY_INDEX_SYMBOL) -> dict:
    """
    Returns raw options chain data from Fyers.
    Response contains a flat list of CE and PE rows under 'optionsChain',
    plus a spot row where strike_price == -1.
    """
    fyers = get_fyers_client()
    data = {
        "symbol": symbol,
        "strikecount": 20,     # 20 strikes above + 20 below ATM
        "timestamp": "",
    }
    response = fyers.optionchain(data=data)

    if response.get("s") != "ok":
        raise RuntimeError(f"Options chain fetch failed: {response}")

    return response


# ─────────────────────────────────────────────────────────────────────────────
# Futures quote
# ─────────────────────────────────────────────────────────────────────────────

def fetch_futures_data(expiry: Optional[date] = None) -> dict:
    """
    Fetches NIFTY futures quote for the given (or nearest) expiry.
    Returns a dict with futures LTP, OI, volume, high, low etc.
    """
    fyers = get_fyers_client()
    exp = expiry or _next_thursday()
    symbol = f"NSE:NIFTY{_expiry_string(exp)}FUT"

    response = fyers.quotes(data={"symbols": symbol})
    if response.get("s") != "ok":
        logger.warning(f"Futures fetch failed for {symbol}: {response}")
        return {}

    quotes = response.get("d", [])
    if not quotes:
        return {}

    q = quotes[0].get("v", {})
    return {
        "symbol": symbol,
        "ltp": q.get("lp", 0),
        "oi": q.get("oi", 0),
        "oi_change": q.get("oich", 0),
        "volume": q.get("volume", 0),
        "day_high": q.get("high", 0),
        "day_low": q.get("low", 0),
        "prev_close": q.get("prev_close_price", 0),
    }


def fetch_next_expiry_futures_oi() -> int:
    """OI on the *next* weekly expiry — used for rollover tracking."""
    try:
        next_exp = _next_thursday(_next_thursday() + timedelta(days=1))
        data = fetch_futures_data(next_exp)
        return int(data.get("oi", 0))
    except Exception as e:
        logger.warning(f"Could not fetch next expiry futures OI: {e}")
        return 0


# ─────────────────────────────────────────────────────────────────────────────
# Combined snapshot
# ─────────────────────────────────────────────────────────────────────────────

def fetch_full_snapshot() -> dict:
    """
    Master fetch function — returns everything needed for signal calculation.
    {
        "spot": float,
        "options": [list of flat CE/PE rows],
        "futures": {...},
        "next_expiry_futures_oi": int,
        "expiry_date": str,
    }
    """
    raw = fetch_options_chain()
    option_rows: list[dict] = raw.get("data", {}).get("optionsChain", [])

    # Extract spot price row (strike_price == -1)
    spot_row = next((r for r in option_rows if r.get("strike_price") == -1), {})
    spot_price = spot_row.get("ltp", 0)

    # Filter to only active option rows (has valid strike and OI > 0 or LTP > 0)
    active_options = [
        r for r in option_rows
        if r.get("strike_price", -1) > 0
        and (r.get("oi", 0) > 0 or r.get("ltp", 0) > 0)
    ]

    # Extract expiry from first valid symbol: "NSE:NIFTY26APR17100CE"
    expiry_date = ""
    if active_options:
        sym = active_options[0].get("symbol", "")
        # symbol format: NSE:NIFTY<DDMMM><STRIKE><TYPE>
        # expiry is embedded; just store the symbol for display
        expiry_date = sym[9:14] if len(sym) > 14 else ""

    futures = fetch_futures_data()
    next_oi = fetch_next_expiry_futures_oi()

    return {
        "spot": spot_price,
        "options": active_options,
        "futures": futures,
        "next_expiry_futures_oi": next_oi,
        "expiry_date": expiry_date,
    }
