"""
Fyers API v3 client — option chain, futures quotes, and OAuth token management.
"""

import os
import json
import httpx
from datetime import date, datetime
from pathlib import Path

APP_ID = os.getenv("FYERS_APP_ID", "I3BFKK1F13-100")
SECRET_KEY = os.getenv("FYERS_SECRET_KEY", "5FGZK2HOZ7")
REDIRECT_URI = os.getenv("FYERS_REDIRECT_URI", "http://127.0.0.1")
API_BASE = "https://api-t1.fyers.in"
TOKEN_FILE = Path("/tmp/fyers_token.json")


# ---------------------------------------------------------------------------
# Token management
# ---------------------------------------------------------------------------

def save_token(access_token: str):
    TOKEN_FILE.write_text(json.dumps({"token": access_token, "date": str(date.today())}))


def load_token() -> str | None:
    if not TOKEN_FILE.exists():
        return None
    data = json.loads(TOKEN_FILE.read_text())
    if data.get("date") != str(date.today()):
        return None  # Token expired (daily)
    return data.get("token")


def get_auth_url() -> str:
    import hashlib
    app_hash = hashlib.sha256(f"{APP_ID}:{SECRET_KEY}".encode()).hexdigest()
    return (
        f"https://api-t1.fyers.in/api/v3/generate-authcode"
        f"?client_id={APP_ID}&redirect_uri={REDIRECT_URI}"
        f"&response_type=code&state=nifty&appHash={app_hash}"
    )


async def exchange_token(auth_code: str) -> str:
    import hashlib
    app_hash = hashlib.sha256(f"{APP_ID}:{SECRET_KEY}".encode()).hexdigest()
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{API_BASE}/api/v3/token",
            json={
                "grant_type": "authorization_code",
                "appIdHash": app_hash,
                "code": auth_code,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        token = data["access_token"]
        save_token(token)
        return token


# ---------------------------------------------------------------------------
# Option Chain
# ---------------------------------------------------------------------------

async def fetch_option_chain(symbol: str = "NSE:NIFTY50-INDEX", expiry: str = "") -> dict:
    token = load_token()
    if not token:
        raise ValueError("No valid Fyers token. Please authenticate first.")

    params = {"symbol": symbol, "strikecount": 20, "timestamp": ""}
    if expiry:
        params["timestamp"] = expiry

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(
            f"{API_BASE}/data-rest/v3/options-chain",
            params=params,
            headers={"Authorization": f"{APP_ID}:{token}"},
        )
        resp.raise_for_status()
        data = resp.json()

    if data.get("s") != "ok":
        raise ValueError(f"Fyers API error: {data.get('message', 'unknown')}")

    return data


def parse_option_chain(raw: dict) -> tuple[list[dict], float, str]:
    """Returns (chain_rows, spot_price, expiry_date_str)."""
    rows = raw.get("optionsChain", [])
    spot = 0.0
    expiry_str = ""

    processed = []
    for r in rows:
        if r.get("strike_price") == -1:
            spot = r.get("ltp", 0)
            continue
        # Extract expiry from symbol e.g. NSE:NIFTY26APR17100CE
        if not expiry_str and r.get("symbol"):
            sym = r["symbol"]
            # Format: NSE:NIFTY{DDMMMYY}{STRIKE}{TYPE}
            try:
                inner = sym.split(":")[1].replace("NIFTY", "")
                expiry_str = inner[:7]  # e.g. "26APR25"
            except Exception:
                pass

        processed.append({
            "strike_price": r.get("strike_price", 0),
            "option_type": r.get("option_type", ""),
            "oi": r.get("oi", 0),
            "oich": r.get("oich", 0),
            "prev_oi": r.get("prev_oi", 0),
            "volume": r.get("volume", 0),
            "ltp": r.get("ltp", 0),
            "ltpch": r.get("ltpch", 0),
            "bid": r.get("bid", 0),
            "ask": r.get("ask", 0),
            "symbol": r.get("symbol", ""),
            "fyToken": r.get("fyToken", ""),
        })

    return processed, spot, expiry_str


def parse_expiry_date(expiry_str: str) -> date:
    try:
        return datetime.strptime(expiry_str, "%d%b%y").date()
    except Exception:
        return date.today()


# ---------------------------------------------------------------------------
# Futures
# ---------------------------------------------------------------------------

def _current_expiry_symbol() -> str:
    """Returns the nearest Thursday expiry symbol for NIFTY futures."""
    from datetime import timedelta
    today = date.today()
    # Find nearest Thursday
    days_until_thu = (3 - today.weekday()) % 7
    if days_until_thu == 0 and today.weekday() == 3:
        days_until_thu = 7
    expiry = today + timedelta(days=days_until_thu)
    return f"NSE:NIFTY{expiry.strftime('%d%b%y').upper()}FUT"


async def fetch_futures(symbol: str = "") -> dict:
    token = load_token()
    if not token:
        raise ValueError("No valid Fyers token.")

    if not symbol:
        symbol = _current_expiry_symbol()

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"{API_BASE}/data-rest/v3/quotes",
            params={"symbols": symbol},
            headers={"Authorization": f"{APP_ID}:{token}"},
        )
        resp.raise_for_status()
        data = resp.json()

    if data.get("s") != "ok":
        raise ValueError(f"Fyers futures API error: {data.get('message', 'unknown')}")

    q = data.get("d", [{}])[0].get("v", {})
    return {
        "ltp": q.get("lp", 0),
        "oi": q.get("oi", 0),
        "volume": q.get("volume", 0),
        "high": q.get("high_price", 0),
        "low": q.get("low_price", 0),
        "symbol": symbol,
    }
