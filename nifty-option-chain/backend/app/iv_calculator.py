"""
Black-Scholes Implied Volatility calculator.

Uses bisection method to invert the BS price formula and find IV.
All inputs are standard: spot, strike, risk-free rate, time-to-expiry, option type.
"""

import math
from datetime import date, datetime
from typing import Literal


RISK_FREE_RATE = 0.065   # 6.5% India repo rate (update annually)
MIN_IV = 0.001
MAX_IV = 5.0             # 500% IV cap


# ─────────────────────────────────────────────────────────────────────────────
# Black-Scholes core
# ─────────────────────────────────────────────────────────────────────────────

def _norm_cdf(x: float) -> float:
    """Standard normal CDF using math.erfc approximation."""
    return 0.5 * math.erfc(-x / math.sqrt(2))


def bs_price(
    S: float,
    K: float,
    T: float,
    r: float,
    sigma: float,
    option_type: Literal["CE", "PE"],
) -> float:
    """Black-Scholes European option price."""
    if T <= 0 or sigma <= 0:
        # At expiry: intrinsic value only
        if option_type == "CE":
            return max(0.0, S - K)
        return max(0.0, K - S)

    d1 = (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)

    if option_type == "CE":
        return S * _norm_cdf(d1) - K * math.exp(-r * T) * _norm_cdf(d2)
    else:
        return K * math.exp(-r * T) * _norm_cdf(-d2) - S * _norm_cdf(-d1)


def calculate_iv(
    market_price: float,
    S: float,
    K: float,
    expiry_date: date,
    option_type: Literal["CE", "PE"],
    r: float = RISK_FREE_RATE,
) -> float:
    """
    Return implied volatility (as a decimal, e.g. 0.18 = 18%) via bisection.
    Returns 0.0 if the price is invalid or IV cannot be computed.
    """
    if market_price <= 0 or S <= 0 or K <= 0:
        return 0.0

    T = max((expiry_date - date.today()).days, 0) / 365.0
    if T <= 0:
        return 0.0

    intrinsic = max(0.0, S - K) if option_type == "CE" else max(0.0, K - S)
    if market_price < intrinsic:
        return 0.0

    low, high = MIN_IV, MAX_IV
    for _ in range(100):   # bisection iterations
        mid = (low + high) / 2.0
        price = bs_price(S, K, T, r, mid, option_type)
        if abs(price - market_price) < 0.01:
            return round(mid * 100, 2)   # return as % e.g. 18.5
        if price < market_price:
            low = mid
        else:
            high = mid

    return round(((low + high) / 2) * 100, 2)


def enrich_options_with_iv(options: list[dict], spot: float, expiry_date: date) -> list[dict]:
    """
    Add 'iv' field (%) to each option row in-place.
    Skips rows where LTP is 0.
    """
    for row in options:
        ltp = row.get("ltp", 0)
        strike = row.get("strike_price", 0)
        opt_type = row.get("option_type", "CE")
        if ltp > 0 and strike > 0:
            row["iv"] = calculate_iv(ltp, spot, strike, expiry_date, opt_type)
        else:
            row["iv"] = 0.0
    return options
