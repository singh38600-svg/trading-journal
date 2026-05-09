"""
Telegram alert system — 9 alert types.
"""

import os
import httpx

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8700298836:AAFbY2CAsYmszj45P964zT5wlmhggcCXVl4")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "8139493794")
BASE_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"

# Track sent alerts to avoid duplicates in session
_sent_alerts: set[str] = set()


async def _send(text: str, key: str = ""):
    if key and key in _sent_alerts:
        return
    if key:
        _sent_alerts.add(key)
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(f"{BASE_URL}/sendMessage", json={
                "chat_id": CHAT_ID,
                "text": text,
                "parse_mode": "HTML",
            })
    except Exception as e:
        print(f"Telegram error: {e}")


async def alert_smi(smi: int, label: str, spot: float):
    if smi >= 70 or smi <= 30:
        emoji = "🚨"
        key = f"smi_{smi // 10}"
        msg = (
            f"{emoji} <b>SMI ALERT</b>\n"
            f"SMI Score: <b>{smi}/100</b> — {label}\n"
            f"NIFTY Spot: {spot}"
        )
        await _send(msg, key)


async def alert_bias_change(new_bias: str, old_bias: str, spot: float):
    if new_bias != old_bias:
        msg = (
            f"🔄 <b>BIAS CHANGE</b>\n"
            f"{old_bias} → <b>{new_bias}</b>\n"
            f"NIFTY Spot: {spot}"
        )
        await _send(msg, f"bias_{new_bias}_{old_bias}")


async def alert_trap(trap: str, probability: int, spot: float):
    if trap != "NONE":
        msg = (
            f"⚠️ <b>{trap} DETECTED</b>\n"
            f"Probability: {probability}%\n"
            f"NIFTY Spot: {spot}\n"
            f"Be careful — institutional trap in play!"
        )
        await _send(msg, f"trap_{trap}_{int(spot)}")


async def alert_oi_spike(spikes: list):
    for spike in spikes:
        msg = (
            f"⚡ <b>OI SPIKE ALERT</b>\n"
            f"Strike: {spike['strike']} {spike['option_type']}\n"
            f"OI Change: {spike['oi_change']:+,}\n"
            f"Type: {spike['buildup']}\n"
            f"Action: {spike['action']}"
        )
        await _send(msg, f"spike_{spike['strike']}_{spike['option_type']}")


async def alert_iv_spike(strike: int, option_type: str, iv: float):
    msg = (
        f"📈 <b>IV SPIKE</b>\n"
        f"Strike: {strike} {option_type}\n"
        f"IV jumped to {iv}% — potential breakout incoming"
    )
    await _send(msg, f"iv_{strike}_{option_type}")


async def alert_sr_test(level: str, strike: int, spot: float):
    msg = (
        f"🎯 <b>S/R LEVEL TEST</b>\n"
        f"NIFTY approaching {level}: {strike}\n"
        f"Spot: {spot} (within 50 points)"
    )
    await _send(msg, f"sr_{strike}_{int(spot) // 50}")


async def alert_breakout(direction: str, resistance: int, spot: float):
    msg = (
        f"🚀 <b>BREAKOUT CONFIRMED</b>\n"
        f"Direction: {direction}\n"
        f"Crossed: {resistance}\n"
        f"Spot: {spot}\n"
        f"CE OI unwinding + PE OI building — confirmed move!"
    )
    await _send(msg, f"breakout_{resistance}")


async def alert_session_summary(signals: dict):
    s = signals
    spot = s.get("spot", 0)
    msg = (
        f"📊 <b>SESSION SUMMARY</b>\n"
        f"Time: {s.get('timestamp', '')[:16]}\n"
        f"Spot: {spot}\n"
        f"SMI: {s.get('smi', 0)}/100 — {s.get('smi_label', '')}\n"
        f"PCR: {s.get('pcr', {}).get('pcr_oi', 0)}\n"
        f"Bias: {s.get('bias', '')}\n"
        f"Support: {s.get('support_resistance', {}).get('support', 0)}\n"
        f"Resistance: {s.get('support_resistance', {}).get('resistance', 0)}\n"
        f"Max Pain: {s.get('max_pain', 0)}\n"
        f"Trap: {s.get('trap', {}).get('trap', 'NONE')}"
    )
    await _send(msg)


async def alert_futures_divergence(message: str, spot: float):
    msg = (
        f"🔥 <b>FUTURES DIVERGENCE — STRONGEST SIGNAL</b>\n"
        f"{message}\n"
        f"Spot: {spot}"
    )
    await _send(msg, f"diverg_{int(spot) // 100}")


async def send_startup():
    await _send("✅ <b>NIFTY Intelligence System ONLINE</b>\nReal-time monitoring active.")
