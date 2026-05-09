"""
Fyers API client — auth flow, option chain fetch, futures quotes.
Handles daily token expiry gracefully.
"""
import os
import json
import logging
from pathlib import Path
from datetime import datetime, date
from typing import Optional

from fyers_apiv3 import fyersModel
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

APP_ID       = os.getenv("FYERS_APP_ID",       "I3BFKK1F13-100")
SECRET_KEY   = os.getenv("FYERS_SECRET_KEY",   "5FGZK2HOZ7")
REDIRECT_URI = os.getenv("FYERS_REDIRECT_URI",  "http://127.0.0.1")

TOKEN_FILE = Path("/tmp/fyers_token.json")   # ephemeral store; Firestore is primary


# ── TOKEN PERSISTENCE (local fallback) ───────────────────────────────────────

def _save_token_local(token: str):
    TOKEN_FILE.write_text(json.dumps({"token": token, "date": str(date.today())}))


def _load_token_local() -> Optional[str]:
    try:
        data = json.loads(TOKEN_FILE.read_text())
        if data.get("date") == str(date.today()):
            return data["token"]
    except Exception:
        pass
    return None


# ── FYERS CLIENT CLASS ────────────────────────────────────────────────────────

class FyersClient:
    """
    Wraps Fyers API v3.
    Usage:
        client = FyersClient()
        client.set_token("your_access_token")
        chain = client.get_option_chain("NSE:NIFTY50", strike_count=20)
    """

    def __init__(self):
        self._token: Optional[str] = _load_token_local()
        self._fyers: Optional[fyersModel.FyersModel] = None
        if self._token:
            self._build_model()

    # ── AUTH ──────────────────────────────────────────────────────────────────

    def get_auth_url(self) -> str:
        """Step 1: Generate Fyers OAuth URL. User opens this URL, logs in, then
        pastes back the auth_code from the redirect URL."""
        session = fyersModel.SessionModel(
            client_id=APP_ID,
            secret_key=SECRET_KEY,
            redirect_uri=REDIRECT_URI,
            response_type="code",
            grant_type="authorization_code",
        )
        return session.generate_authcode()

    def generate_token(self, auth_code: str) -> dict:
        """
        Step 2: Exchange auth_code for access_token.
        Returns {"success": True, "token": "..."} or {"success": False, "error": "..."}
        """
        try:
            session = fyersModel.SessionModel(
                client_id=APP_ID,
                secret_key=SECRET_KEY,
                redirect_uri=REDIRECT_URI,
                response_type="code",
                grant_type="authorization_code",
            )
            session.set_token(auth_code)
            resp = session.generate_token()
            if resp.get("s") == "ok" or "access_token" in resp:
                token = resp["access_token"]
                self.set_token(token)
                return {"success": True, "token": token}
            return {"success": False, "error": resp.get("message", str(resp))}
        except Exception as e:
            logger.error("Token generation failed: %s", e)
            return {"success": False, "error": str(e)}

    def set_token(self, token: str):
        self._token = token
        _save_token_local(token)
        self._build_model()

    def get_token(self) -> Optional[str]:
        return self._token

    def is_authenticated(self) -> bool:
        return bool(self._token and self._fyers)

    def _build_model(self):
        self._fyers = fyersModel.FyersModel(
            client_id=APP_ID,
            token=self._token,
            is_async=False,
            log_path="",
        )

    # ── OPTION CHAIN ──────────────────────────────────────────────────────────

    def get_option_chain(
        self,
        symbol: str = "NSE:NIFTY50",
        strike_count: int = 20,
        expiry_timestamp: str = "",
    ) -> dict:
        """
        Fetch raw option chain from Fyers.
        Returns {"success": True, "data": {...}} or {"success": False, "error": "..."}
        expiry_timestamp: "" = nearest weekly expiry (Fyers default)
        """
        if not self.is_authenticated():
            return {"success": False, "error": "Not authenticated. Please login via /auth/url"}
        try:
            resp = self._fyers.optionchain(data={
                "symbol":      symbol,
                "strikecount": strike_count,
                "timestamp":   expiry_timestamp,
            })
            if resp.get("code") == 200 or resp.get("s") == "ok":
                return {"success": True, "data": resp.get("data", resp)}
            return {"success": False, "error": resp.get("message", str(resp))}
        except Exception as e:
            logger.error("Option chain fetch failed: %s", e)
            return {"success": False, "error": str(e)}

    # ── FUTURES QUOTE ─────────────────────────────────────────────────────────

    def get_futures_quote(self, futures_symbol: Optional[str] = None) -> dict:
        """
        Fetch current NIFTY futures quote.
        futures_symbol: e.g. "NSE:NIFTYJUN25FUT". If None, auto-constructs nearest month.
        Returns flat dict with ltp, oi, oich, volume, day_high, day_low.
        """
        if not self.is_authenticated():
            return {}
        symbol = futures_symbol or self._nearest_futures_symbol()
        try:
            resp = self._fyers.quotes(data={"symbols": symbol})
            if (resp.get("code") == 200 or resp.get("s") == "ok") and resp.get("d"):
                v = resp["d"][0].get("v", {})
                return {
                    "symbol":   symbol,
                    "ltp":      float(v.get("lp", 0)),
                    "oi":       float(v.get("oi", 0)),
                    "oich":     float(v.get("oich", 0)),
                    "volume":   float(v.get("volume", 0)),
                    "day_high": float(v.get("high_price", 0)),
                    "day_low":  float(v.get("low_price", 0)),
                    "prev_close": float(v.get("prev_close_price", 0)),
                }
        except Exception as e:
            logger.warning("Futures quote failed for %s: %s", symbol, e)
        return {}

    # ── AVAILABLE EXPIRIES ────────────────────────────────────────────────────

    def get_expiries(self, symbol: str = "NSE:NIFTY50") -> list[str]:
        """Return list of available expiry dates from the option chain response."""
        resp = self.get_option_chain(symbol, strike_count=1)
        if not resp["success"]:
            return []
        expiry_data = resp["data"].get("expiryData", [])
        return [e.get("date", "") for e in expiry_data if e.get("date")]

    # ── HELPERS ───────────────────────────────────────────────────────────────

    @staticmethod
    def _nearest_futures_symbol() -> str:
        """Construct NSE NIFTY futures symbol for current/next month."""
        now = datetime.now()
        # Last Thursday of month is expiry; if past it, move to next month
        month_abbr = ["JAN","FEB","MAR","APR","MAY","JUN",
                       "JUL","AUG","SEP","OCT","NOV","DEC"]
        m = now.month - 1   # 0-indexed
        y = str(now.year)[2:]
        return f"NSE:NIFTY{month_abbr[m]}{y}FUT"

    @staticmethod
    def extract_expiry_from_chain(raw_data: dict) -> str:
        """Pull the nearest expiry date string from raw option chain data."""
        expiry_list = raw_data.get("expiryData", [])
        if expiry_list:
            return expiry_list[0].get("date", "")
        # Fallback: parse from first option symbol
        chain = raw_data.get("optionsChain", [])
        for row in chain:
            sym = row.get("symbol", "")
            # Symbol format: NSE:NIFTY26APR17100CE → extract date part
            # We'll use the prev_oi approach — just return empty and let caller handle
            pass
        return ""

    @staticmethod
    def extract_options_rows(raw_data: dict) -> list[dict]:
        """Return the flat optionsChain list from raw API response."""
        return raw_data.get("optionsChain", [])
