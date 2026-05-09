"""
NIFTY Option Chain Intelligence System — FastAPI Backend
========================================================

Endpoints:
  GET  /api/health              — health check
  GET  /api/auth/login-url      — get Fyers consent URL (step 1 of daily login)
  GET  /api/auth/callback       — exchange auth_code for token (step 2)
  GET  /api/auth/status         — check if token is valid today
  GET  /api/signals             — latest computed signals (full snapshot)
  GET  /api/history             — last N signal snapshots from Firestore
  GET  /api/session-analysis    — opening/mid-day/closing OI comparison
  WS   /ws/live                 — WebSocket: push signal updates every N seconds

Background task: polls Fyers every REFRESH_INTERVAL_SECONDS, computes signals,
dispatches Telegram alerts, saves to Firestore.
"""

import asyncio
import json
import logging
from contextlib import asynccontextmanager
from dataclasses import asdict
from datetime import datetime, time as dtime, timezone

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .fyers_auth import get_login_url, exchange_auth_code, is_authenticated
from .fyers_data import fetch_full_snapshot
from .iv_calculator import enrich_options_with_iv
from .signals import compute_signals, SignalResult
from .telegram_bot import dispatch_alerts, alert_session_summary
from .firestore_db import log_signal, save_session_snapshot, get_recent_signals, get_session_snapshots
from .models import (
    AuthStatusModel, LoginUrlModel, HealthModel, SignalResultModel
)

logger = logging.getLogger(__name__)
settings = get_settings()

# ─────────────────────────────────────────────────────────────────────────────
# In-memory state (single-process; good enough for one Cloud Run instance)
# ─────────────────────────────────────────────────────────────────────────────

_latest_result: SignalResult | None = None
_prev_result: SignalResult | None = None
_prev_snapshot: dict | None = None
_alerted_oi_strikes: set = set()
_alerted_smi_high: bool = False
_alerted_smi_low: bool = False
_prev_iv_map: dict = {}
_session_summaries_sent: set = set()   # e.g. {"2024-01-15_OPENING"}
_ws_clients: list[WebSocket] = []
_five_day_avg_futures_vol: int = 500_000   # updated as we see data


# ─────────────────────────────────────────────────────────────────────────────
# Expiry date helper — parsed from options
# ─────────────────────────────────────────────────────────────────────────────

def _extract_expiry_from_options(options: list[dict]):
    """Parse expiry date from symbol string like NSE:NIFTY26APR17100CE."""
    from datetime import date
    import re
    for row in options:
        sym = row.get("symbol", "")
        # Match pattern like 26APR25 or 25APR embedded in symbol
        m = re.search(r"NIFTY(\d{2})([A-Z]{3})(\d{2})", sym)
        if m:
            day, mon, yr = m.group(1), m.group(2), m.group(3)
            try:
                return datetime.strptime(f"{day}{mon}20{yr}", "%d%b%Y").date()
            except ValueError:
                pass
    # Default to nearest Thursday
    from .fyers_data import _next_thursday
    return _next_thursday()


# ─────────────────────────────────────────────────────────────────────────────
# Core polling loop
# ─────────────────────────────────────────────────────────────────────────────

async def _poll_once():
    global _latest_result, _prev_result, _prev_snapshot, _alerted_oi_strikes
    global _alerted_smi_high, _alerted_smi_low, _prev_iv_map

    if not is_authenticated():
        logger.debug("Skipping poll — no Fyers token.")
        return

    try:
        snapshot = fetch_full_snapshot()
        options = snapshot.get("options", [])
        spot = snapshot.get("spot", 0)

        # Enrich with IV
        from datetime import date
        expiry_date = _extract_expiry_from_options(options)
        enrich_options_with_iv(options, spot, expiry_date)
        snapshot["options"] = options

        # Build IV map for spike detection
        iv_map = {
            (row["strike_price"], row["option_type"]): row.get("iv", 0)
            for row in options
        }

        result = compute_signals(
            snapshot,
            prev_snapshot=_prev_snapshot,
            prev_iv_map=_prev_iv_map,
            alerted_oi_strikes=_alerted_oi_strikes,
            five_day_avg_futures_vol=_five_day_avg_futures_vol,
        )

        # Dispatch alerts
        _alerted_oi_strikes, _alerted_smi_high, _alerted_smi_low = dispatch_alerts(
            result, _prev_result, _alerted_oi_strikes,
            _alerted_smi_high, _alerted_smi_low
        )

        # Session summaries (Signal 20 + Alert 8)
        _maybe_send_session_summary(result)

        # Persist
        result_dict = _result_to_dict(result)
        log_signal(result_dict)

        # Broadcast to WebSocket clients
        await _broadcast(result_dict)

        # Rotate state
        _prev_result = _latest_result
        _latest_result = result
        _prev_snapshot = snapshot
        _prev_iv_map = iv_map

    except Exception as e:
        logger.error(f"Poll error: {e}", exc_info=True)


def _maybe_send_session_summary(result: SignalResult):
    global _session_summaries_sent
    now = datetime.now(timezone.utc).astimezone()
    today = now.date().isoformat()

    sessions = {
        "OPENING":  dtime(9, 30),
        "MID_DAY":  dtime(12, 0),
        "CLOSING":  dtime(15, 15),
    }
    for name, t in sessions.items():
        key = f"{today}_{name}"
        if key not in _session_summaries_sent and now.time() >= t:
            alert_session_summary(result, name)
            save_session_snapshot(name, _result_to_dict(result))
            _session_summaries_sent.add(key)


async def _polling_loop():
    while True:
        await _poll_once()
        await asyncio.sleep(settings.REFRESH_INTERVAL_SECONDS)


# ─────────────────────────────────────────────────────────────────────────────
# WebSocket broadcast
# ─────────────────────────────────────────────────────────────────────────────

async def _broadcast(data: dict):
    dead = []
    for ws in _ws_clients:
        try:
            await ws.send_text(json.dumps(data, default=str))
        except Exception:
            dead.append(ws)
    for ws in dead:
        _ws_clients.remove(ws)


# ─────────────────────────────────────────────────────────────────────────────
# Serialisation helper
# ─────────────────────────────────────────────────────────────────────────────

def _result_to_dict(result: SignalResult) -> dict:
    d = asdict(result)
    d["timestamp"] = datetime.now().isoformat()
    return d


# ─────────────────────────────────────────────────────────────────────────────
# App lifespan — start background polling on startup
# ─────────────────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(_polling_loop())
    logger.info("Background polling task started.")
    yield
    task.cancel()


# ─────────────────────────────────────────────────────────────────────────────
# App factory
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="NIFTY Option Chain Intelligence System",
    version="1.0.0",
    description="Institutional-grade option chain analysis with 32 signals.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/api/health", response_model=HealthModel)
async def health():
    return HealthModel(
        status="ok",
        version="1.0.0",
        authenticated=is_authenticated(),
    )


@app.get("/api/auth/login-url", response_model=LoginUrlModel)
async def auth_login_url():
    url = get_login_url()
    return LoginUrlModel(
        login_url=url,
        instructions=(
            "1. Open the login_url in your browser.\n"
            "2. Log in with your Fyers credentials and approve.\n"
            "3. You will be redirected to http://127.0.0.1?auth_code=XXXX\n"
            "4. Copy the auth_code value and call GET /api/auth/callback?auth_code=XXXX"
        ),
    )


@app.get("/api/auth/callback", response_model=AuthStatusModel)
async def auth_callback(auth_code: str = Query(..., description="auth_code from Fyers redirect")):
    try:
        exchange_auth_code(auth_code)
        return AuthStatusModel(authenticated=True, message="Login successful! Token valid until today midnight.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/auth/status", response_model=AuthStatusModel)
async def auth_status():
    ok = is_authenticated()
    return AuthStatusModel(
        authenticated=ok,
        message="Token is valid." if ok else "Not authenticated. Call /api/auth/login-url to start login.",
    )


@app.get("/api/signals")
async def get_signals():
    """Return the latest computed signal snapshot."""
    if _latest_result is None:
        if not is_authenticated():
            raise HTTPException(
                status_code=401,
                detail="Not authenticated. Visit /api/auth/login-url to log in."
            )
        raise HTTPException(status_code=503, detail="No data yet — polling in progress, please wait 30s.")
    return _result_to_dict(_latest_result)


@app.get("/api/history")
async def get_history(limit: int = Query(default=100, le=500)):
    """Return recent signal snapshots from Firestore."""
    return {"records": get_recent_signals(limit)}


@app.get("/api/session-analysis")
async def session_analysis(date: str | None = None):
    """Return opening / mid-day / closing OI snapshots for the given date."""
    return get_session_snapshots(date)


@app.websocket("/ws/live")
async def websocket_live(websocket: WebSocket):
    """
    WebSocket endpoint — clients connect here to receive live signal updates.
    The server pushes a new message every time polling runs.
    """
    await websocket.accept()
    _ws_clients.append(websocket)
    # Send the current snapshot immediately on connect
    if _latest_result:
        await websocket.send_text(json.dumps(_result_to_dict(_latest_result), default=str))
    try:
        while True:
            # Keep connection alive (client can send pings, we ignore them)
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in _ws_clients:
            _ws_clients.remove(websocket)
