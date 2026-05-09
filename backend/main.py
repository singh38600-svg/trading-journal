"""
NIFTY Option Chain Intelligence System — FastAPI Backend
Endpoints: auth, option chain, futures, WebSocket real-time push.
Background task polls Fyers every REFRESH_INTERVAL seconds during market hours.
"""
import os
import asyncio
import logging
import json
from datetime import datetime
from typing import Optional

import pytz
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from fyers_client import FyersClient
from signals import SignalEngine
import telegram_alerts as tg
import firestore_client as fs

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s — %(message)s")
logger = logging.getLogger(__name__)

REFRESH_INTERVAL   = int(os.getenv("REFRESH_INTERVAL", 60))
FRONTEND_ORIGIN    = os.getenv("FRONTEND_ORIGIN", "*")
OI_SPIKE_THRESHOLD = int(os.getenv("OI_SPIKE_THRESHOLD", 100_000))
IST = pytz.timezone("Asia/Kolkata")

# ── APP SETUP ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="NIFTY Option Chain Intelligence",
    description="Real-time institutional signals for NIFTY options",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── SINGLETONS ────────────────────────────────────────────────────────────────
fyers   = FyersClient()
engine  = SignalEngine(oi_spike_threshold=OI_SPIKE_THRESHOLD)

# Restore token from Firestore if available (survives Cloud Run cold starts)
_stored_token = fs.load_token()
if _stored_token and not fyers.is_authenticated():
    fyers.set_token(_stored_token)

# In-memory state
_latest_data:    dict = {}
_ws_clients:     set  = set()
_session_oi_log: list = []  # list of {total_oi, timestamp}

# Tracks which session summary alerts have fired today
_session_alerts_fired: set = set()


# ── MARKET HOURS ──────────────────────────────────────────────────────────────

def _is_market_open() -> bool:
    now = datetime.now(IST)
    if now.weekday() >= 5:   # Saturday or Sunday
        return False
    t = now.hour * 60 + now.minute
    return 555 <= t <= 930  # 9:15 → 15:30


# ── WEBSOCKET MANAGER ─────────────────────────────────────────────────────────

async def _broadcast(data: dict):
    dead = set()
    for ws in _ws_clients:
        try:
            await ws.send_text(json.dumps(data))
        except Exception:
            dead.add(ws)
    _ws_clients.difference_update(dead)


# ── BACKGROUND REFRESH LOOP ───────────────────────────────────────────────────

async def _refresh_once():
    """Fetch option chain + futures, compute signals, push to clients + Telegram."""
    global _latest_data, _session_oi_log, _session_alerts_fired

    if not fyers.is_authenticated():
        logger.info("Skipping refresh — not authenticated")
        return

    # Fetch option chain
    raw_resp = fyers.get_option_chain("NSE:NIFTY50", strike_count=20)
    if not raw_resp["success"]:
        logger.warning("Option chain fetch failed: %s", raw_resp["error"])
        return

    raw_data = raw_resp["data"]
    chain_rows = fyers.extract_options_rows(raw_data)
    expiry = fyers.extract_expiry_from_chain(raw_data)

    # Fetch futures quote
    futures_quote = fyers.get_futures_quote()

    # Compute all signals
    result = engine.process(chain_rows, expiry, futures_quote, _session_oi_log)

    # Update in-memory state
    _latest_data = result

    # Track OI for session behavior (Signal 20)
    total_oi = (
        result["signals"].get("total_ce_oi", 0) +
        result["signals"].get("total_pe_oi", 0)
    )
    _session_oi_log.append({"total_oi": total_oi, "timestamp": result["timestamp"]})
    if len(_session_oi_log) > 100:
        _session_oi_log = _session_oi_log[-100:]

    # Persist to Firestore
    fs.save_snapshot(result)
    fs.save_session_point(total_oi)

    # Check and send alerts
    alerts = engine.check_alerts(result)
    for alert in alerts:
        tg.send_alert(alert)
        fs.save_alert(alert)

    # Scheduled session summaries (Signal 8): 9:30, 12:00, 15:15 IST
    now_ist = datetime.now(IST)
    for summary_time in ["09:30", "12:00", "15:15"]:
        key = f"{now_ist.strftime('%Y-%m-%d')}-{summary_time}"
        if now_ist.strftime("%H:%M") == summary_time and key not in _session_alerts_fired:
            tg.send_session_summary(result)
            _session_alerts_fired.add(key)

    # Push to all connected WebSocket clients
    await _broadcast(result)
    logger.info(
        "Refreshed — spot=%.2f  SMI=%d  bias=%s  alerts=%d",
        result.get("spot", 0),
        result["signals"].get("smi", 0),
        result["signals"].get("bias", ""),
        len(alerts),
    )


async def _background_loop():
    while True:
        if _is_market_open():
            try:
                await _refresh_once()
            except Exception as e:
                logger.error("Refresh error: %s", e)
        await asyncio.sleep(REFRESH_INTERVAL)


@app.on_event("startup")
async def _startup():
    # Reset session state at startup
    engine.reset_session()
    asyncio.create_task(_background_loop())
    logger.info("NIFTY Intelligence System started. Refresh interval: %ds", REFRESH_INTERVAL)


# ── AUTH ENDPOINTS ────────────────────────────────────────────────────────────

@app.get("/auth/url", tags=["Auth"])
async def get_auth_url():
    """
    Step 1 — Call this to get the Fyers login URL.
    Open the returned URL in browser, login, then copy the auth_code
    from the redirect URL and call POST /auth/token.
    """
    url = fyers.get_auth_url()
    return {"auth_url": url, "instructions": "Open this URL, login to Fyers, then copy auth_code from the redirect URL"}


@app.post("/auth/token", tags=["Auth"])
async def set_token(auth_code: str = Query(..., description="auth_code from Fyers redirect URL")):
    """
    Step 2 — Exchange auth_code for access token.
    Call this once per day after logging in via /auth/url.
    """
    result = fyers.generate_token(auth_code)
    if result["success"]:
        # Persist token to Firestore so it survives Cloud Run restarts
        fs.save_token(result["token"])
        engine.reset_session()
        tg.send_raw("✅ <b>Fyers connected successfully.</b> NIFTY Intelligence System is now live.")
        # Trigger immediate first refresh
        asyncio.create_task(_refresh_once())
        return {"success": True, "message": "Authenticated. Data refresh started."}
    raise HTTPException(status_code=400, detail=result["error"])


@app.get("/auth/status", tags=["Auth"])
async def auth_status():
    return {
        "authenticated": fyers.is_authenticated(),
        "market_open":   _is_market_open(),
    }


# ── DATA ENDPOINTS ────────────────────────────────────────────────────────────

@app.get("/chain", tags=["Data"])
async def get_chain():
    """
    Latest processed option chain with all 32 signals.
    Returns cached data — no live Fyers call on each request.
    """
    if not _latest_data:
        if not fyers.is_authenticated():
            raise HTTPException(status_code=401, detail="Not authenticated. Visit /auth/url first.")
        raise HTTPException(status_code=503, detail="Data not yet available. Wait for first refresh.")
    return _latest_data


@app.post("/chain/refresh", tags=["Data"])
async def force_refresh():
    """Force an immediate data refresh (outside auto-refresh cycle)."""
    if not fyers.is_authenticated():
        raise HTTPException(status_code=401, detail="Not authenticated.")
    asyncio.create_task(_refresh_once())
    return {"message": "Refresh triggered. Check /chain in ~5 seconds."}


@app.get("/expiries", tags=["Data"])
async def get_expiries():
    """List available NIFTY expiry dates."""
    if not fyers.is_authenticated():
        raise HTTPException(status_code=401, detail="Not authenticated.")
    return {"expiries": fyers.get_expiries("NSE:NIFTY50")}


@app.get("/history", tags=["Data"])
async def get_history(days: int = Query(7, ge=1, le=30)):
    """Historical signal log for the dashboard table (last N days)."""
    data = fs.get_historical_log(days=days)
    return {"history": data}


@app.get("/health", tags=["System"])
async def health():
    return {
        "status":          "ok",
        "authenticated":   fyers.is_authenticated(),
        "market_open":     _is_market_open(),
        "last_update":     _latest_data.get("timestamp", "never"),
        "connected_clients": len(_ws_clients),
    }


# ── WEBSOCKET ─────────────────────────────────────────────────────────────────

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Real-time updates. Frontend connects here and receives a new data
    payload every time the option chain is refreshed.
    """
    await websocket.accept()
    _ws_clients.add(websocket)
    logger.info("WS client connected. Total: %d", len(_ws_clients))

    # Send latest data immediately on connect
    if _latest_data:
        try:
            await websocket.send_text(json.dumps(_latest_data))
        except Exception:
            pass

    try:
        while True:
            # Keep connection alive; actual data is pushed via _broadcast
            await asyncio.sleep(30)
            await websocket.send_text(json.dumps({"type": "ping"}))
    except WebSocketDisconnect:
        _ws_clients.discard(websocket)
        logger.info("WS client disconnected. Total: %d", len(_ws_clients))
    except Exception as e:
        _ws_clients.discard(websocket)
        logger.warning("WS error: %s", e)
