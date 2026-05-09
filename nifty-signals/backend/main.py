"""
FastAPI backend — WebSocket real-time push, REST endpoints, background refresh.
"""

import asyncio
import json
import os
from datetime import date, datetime
from typing import Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from fyers_client import (
    get_auth_url, exchange_token, fetch_option_chain,
    parse_option_chain, parse_expiry_date, fetch_futures, load_token,
)
from signals import compute_all_signals
from telegram_alerts import (
    alert_smi, alert_bias_change, alert_trap, alert_oi_spike,
    alert_sr_test, alert_breakout, alert_session_summary,
    alert_futures_divergence, send_startup,
)
from firestore_client import save_snapshot, get_history, save_token_fs, load_token_fs

app = FastAPI(title="NIFTY Option Chain Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# State
# ---------------------------------------------------------------------------

_state = {
    "signals": None,
    "prev_signals": None,
    "prev_futures": None,
    "oi_spike_seen": set(),
    "last_bias": None,
}
_ws_clients: list[WebSocket] = []
REFRESH_INTERVAL = int(os.getenv("REFRESH_INTERVAL", "60"))


# ---------------------------------------------------------------------------
# WebSocket
# ---------------------------------------------------------------------------

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    _ws_clients.append(ws)
    try:
        if _state["signals"]:
            await ws.send_text(json.dumps(_state["signals"], default=str))
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        _ws_clients.remove(ws)


async def broadcast(data: dict):
    dead = []
    for ws in _ws_clients:
        try:
            await ws.send_text(json.dumps(data, default=str))
        except Exception:
            dead.append(ws)
    for ws in dead:
        _ws_clients.remove(ws)


# ---------------------------------------------------------------------------
# Background refresh loop
# ---------------------------------------------------------------------------

async def refresh_loop():
    await asyncio.sleep(5)  # wait for startup
    while True:
        try:
            await do_refresh()
        except Exception as e:
            print(f"Refresh error: {e}")
        await asyncio.sleep(REFRESH_INTERVAL)


async def do_refresh():
    token = load_token()
    if not token:
        # Try Firestore fallback
        token = await load_token_fs()
        if not token:
            return

    raw = await fetch_option_chain()
    chain, spot, expiry_str = parse_option_chain(raw)
    expiry_date = parse_expiry_date(expiry_str) if expiry_str else date.today()

    futures_raw = await fetch_futures()
    futures_raw["spot"] = spot

    signals = compute_all_signals(
        chain, futures_raw, expiry_date,
        prev_futures=_state["prev_futures"],
        oi_spike_seen=_state["oi_spike_seen"],
    )

    prev = _state["signals"]
    _state["prev_signals"] = prev
    _state["prev_futures"] = futures_raw
    _state["signals"] = signals

    await broadcast(signals)
    await save_snapshot(signals)
    await _fire_alerts(signals, prev)


async def _fire_alerts(signals: dict, prev: Optional[dict]):
    spot = signals.get("spot", 0)
    smi = signals.get("smi", 0)
    label = signals.get("smi_label", "")
    bias = signals.get("bias", "")
    trap = signals.get("trap", {})
    sr = signals.get("support_resistance", {})
    divergence = signals.get("futures_divergence", {})
    breakout = signals.get("breakout", {})
    spikes = signals.get("oi_spikes", [])

    await alert_smi(smi, label, spot)

    old_bias = (prev or {}).get("bias", bias)
    if bias != old_bias:
        await alert_bias_change(bias, old_bias, spot)

    if trap.get("trap") != "NONE":
        await alert_trap(trap["trap"], trap["probability"], spot)

    if spikes:
        await alert_oi_spike(spikes)

    for level_name in ["support", "resistance"]:
        level_val = sr.get(level_name, 0)
        if level_val and abs(spot - level_val) < 50:
            await alert_sr_test(level_name.upper(), level_val, spot)

    if breakout.get("breakout"):
        await alert_breakout("BULLISH", breakout.get("resistance_crossed", 0), spot)

    if divergence.get("divergence"):
        await alert_futures_divergence(divergence["message"], spot)

    # Session summaries at 9:30, 12:00, 15:15 IST
    now_h = datetime.now().hour
    now_m = datetime.now().minute
    if (now_h == 9 and now_m == 30) or (now_h == 12 and now_m == 0) or (now_h == 15 and now_m == 15):
        await alert_session_summary(signals)


@app.on_event("startup")
async def startup():
    asyncio.create_task(refresh_loop())
    await send_startup()


# ---------------------------------------------------------------------------
# REST Endpoints
# ---------------------------------------------------------------------------

class AuthRequest(BaseModel):
    auth_code: str


@app.get("/auth/url")
async def auth_url():
    return {"url": get_auth_url()}


@app.post("/auth/token")
async def auth_token(req: AuthRequest):
    try:
        token = await exchange_token(req.auth_code)
        await save_token_fs(token)
        return {"status": "ok", "message": "Authenticated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/signals")
async def get_signals():
    if not _state["signals"]:
        raise HTTPException(status_code=503, detail="No data yet. Authenticate first.")
    return _state["signals"]


@app.get("/history")
async def history(days: int = 1):
    return await get_history(days)


@app.post("/refresh")
async def manual_refresh():
    await do_refresh()
    return {"status": "refreshed"}


@app.get("/health")
async def health():
    return {"status": "ok", "authenticated": bool(load_token())}
