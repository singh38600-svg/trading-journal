"""
Fyers OAuth token management.

Daily workflow:
  1. Call /api/auth/login-url  → get the Fyers consent URL
  2. Open that URL in a browser, log in, approve
  3. Fyers redirects to http://127.0.0.1?auth_code=XXXX
  4. Call /api/auth/callback?auth_code=XXXX  → get & store access token
  5. All subsequent API calls use that token (valid until market close)
"""

import hashlib
import json
import logging
from pathlib import Path
from datetime import datetime, date

import httpx
from fyers_apiv3 import fyersModel

from .config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

TOKEN_FILE = Path("/tmp/fyers_token.json")   # ephemeral; fine for Cloud Run


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _app_id_hash() -> str:
    """SHA-256( APP_ID:SECRET_KEY ) used in Fyers auth flow."""
    raw = f"{settings.FYERS_APP_ID}:{settings.FYERS_SECRET_KEY}"
    return hashlib.sha256(raw.encode()).hexdigest()


def _save_token(token_data: dict) -> None:
    token_data["saved_date"] = date.today().isoformat()
    TOKEN_FILE.write_text(json.dumps(token_data))


def _load_token() -> dict | None:
    if not TOKEN_FILE.exists():
        return None
    data = json.loads(TOKEN_FILE.read_text())
    # Invalidate token if it was saved on a previous calendar day
    if data.get("saved_date") != date.today().isoformat():
        TOKEN_FILE.unlink(missing_ok=True)
        return None
    return data


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def get_login_url() -> str:
    """Return the Fyers consent URL the user must visit once per day."""
    session = fyersModel.SessionModel(
        client_id=settings.FYERS_APP_ID,
        secret_key=settings.FYERS_SECRET_KEY,
        redirect_uri=settings.FYERS_REDIRECT_URI,
        response_type="code",
        grant_type="authorization_code",
    )
    return session.generate_authcode()


def exchange_auth_code(auth_code: str) -> dict:
    """Exchange the auth_code for an access_token and persist it."""
    session = fyersModel.SessionModel(
        client_id=settings.FYERS_APP_ID,
        secret_key=settings.FYERS_SECRET_KEY,
        redirect_uri=settings.FYERS_REDIRECT_URI,
        response_type="code",
        grant_type="authorization_code",
    )
    session.set_token(auth_code)
    response = session.generate_token()

    if response.get("s") != "ok":
        raise ValueError(f"Token exchange failed: {response}")

    token_data = {
        "access_token": response["access_token"],
        "refresh_token": response.get("refresh_token", ""),
    }
    _save_token(token_data)
    logger.info("Fyers access token saved successfully.")
    return token_data


def get_fyers_client() -> fyersModel.FyersModel:
    """Return an authenticated FyersModel instance, or raise if not logged in."""
    token_data = _load_token()
    if not token_data:
        raise RuntimeError(
            "No valid Fyers token. Call GET /api/auth/login-url, "
            "complete login in browser, then POST /api/auth/callback."
        )
    return fyersModel.FyersModel(
        client_id=settings.FYERS_APP_ID,
        token=token_data["access_token"],
        log_path="/tmp/",
        is_async=False,
    )


def is_authenticated() -> bool:
    return _load_token() is not None
