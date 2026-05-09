"""
Telegram alert system — formats and sends all 9 alert types.
Uses httpx (sync) so it works in FastAPI background tasks without extra event loop.
"""
import os
import logging
import httpx
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8700298836:AAFbY2CAsYmszj45P964zT5wlmhggcCXVl4")
CHAT_ID   = os.getenv("TELEGRAM_CHAT_ID",   "8139493794")

TELEGRAM_API = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"

# IST format for timestamps
def _now_ist() -> str:
    return datetime.now().strftime("%d %b %Y  %H:%M:%S IST")


def _send(text: str) -> bool:
    """Fire-and-forget Telegram message. Returns True on success."""
    try:
        resp = httpx.post(
            TELEGRAM_API,
            json={"chat_id": CHAT_ID, "text": text, "parse_mode": "HTML"},
            timeout=10,
        )
        ok = resp.json().get("ok", False)
        if not ok:
            logger.warning("Telegram send failed: %s", resp.text)
        return ok
    except Exception as e:
        logger.error("Telegram error: %s", e)
        return False


# ── FORMATTERS FOR EACH ALERT TYPE ───────────────────────────────────────────

def _fmt_smi_level(d: dict) -> str:
    smi   = d.get("smi", 0)
    label = d.get("label", "")
    emoji = "🚀" if smi >= 70 else "🔻"
    return (
        f"{emoji} <b>SMI LEVEL ALERT</b>\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"Smart Money Index : <b>{smi}/100</b>\n"
        f"Reading           : <b>{label}</b>\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"🕐 {_now_ist()}"
    )


def _fmt_bias_change(d: dict) -> str:
    frm = d.get("from", "?")
    to  = d.get("to",   "?")
    emoji = "🟢" if to == "BULLISH" else ("🔴" if to == "BEARISH" else "🟡")
    return (
        f"🔄 <b>BIAS CHANGE</b>\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"{frm}  →  {emoji} <b>{to}</b>\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"🕐 {_now_ist()}"
    )


def _fmt_trap(d: dict) -> str:
    trap = d.get("trap_type", "Trap")
    prob = d.get("probability", 0)
    return (
        f"⚠️ <b>{trap.upper()} DETECTED</b>\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"Probability  : <b>{prob}%</b>\n"
        f"Action       : Wait for reversal confirmation\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"🕐 {_now_ist()}"
    )


def _fmt_oi_spike(d: dict) -> str:
    strike  = d.get("strike",  "?")
    oich    = d.get("oich",    0)
    buildup = d.get("buildup", "?")
    action  = d.get("action",  "")
    direction = "↑" if oich > 0 else "↓"
    return (
        f"⚡ <b>OI SPIKE (SCALPING)</b>\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"Strike   : <b>{strike}</b>\n"
        f"OI Change: <b>{direction} {abs(oich):,}</b>\n"
        f"Buildup  : <b>{buildup}</b>\n"
        f"Action   : {action}\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"🕐 {_now_ist()}"
    )


def _fmt_iv_spike(d: dict) -> str:
    strike = d.get("strike", "?")
    iv     = d.get("iv",     0)
    return (
        f"📈 <b>IV SPIKE ALERT</b>\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"Strike : <b>{strike}</b>\n"
        f"IV     : <b>{iv}%</b> (jumped >20%)\n"
        f"Signal : Potential breakout incoming\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"🕐 {_now_ist()}"
    )


def _fmt_sr_test(d: dict) -> str:
    level_type = d.get("level_type", "level").upper()
    level = d.get("level", 0)
    spot  = d.get("spot",  0)
    dist  = abs(spot - level)
    emoji = "🟢" if level_type == "SUPPORT" else "🔴"
    return (
        f"🎯 <b>{emoji} {level_type} TEST</b>\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"Level    : <b>{level}</b>\n"
        f"Spot     : <b>{spot}</b>\n"
        f"Distance : <b>{dist:.0f} pts</b>\n"
        f"Watch for rejection or breakout!\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"🕐 {_now_ist()}"
    )


def _fmt_breakout(d: dict) -> str:
    direction  = d.get("direction",  "UP")
    resistance = d.get("resistance", 0)
    emoji = "🚀" if direction == "BULLISH" else "💥"
    return (
        f"{emoji} <b>BREAKOUT CONFIRMED</b>\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"Direction  : <b>{direction}</b>\n"
        f"Level      : <b>{resistance}</b>\n"
        f"Confirmation: CE OI unwinding + PE OI building\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"🕐 {_now_ist()}"
    )


def _fmt_session_summary(d: dict) -> str:
    sig = d.get("signals", {})
    fut = d.get("futures_signals", {})
    spot = d.get("spot", 0)
    return (
        f"📊 <b>SESSION SUMMARY</b>\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        f"Spot        : <b>₹{spot:,.2f}</b>\n"
        f"SMI         : <b>{sig.get('smi',0)}/100 — {sig.get('smi_label','')}</b>\n"
        f"Bias        : <b>{sig.get('bias','')}</b>\n"
        f"PCR (OI)    : <b>{sig.get('pcr_oi',0)}</b>\n"
        f"PCR (Vol)   : <b>{sig.get('pcr_vol',0)}</b>\n"
        f"Support     : <b>{sig.get('support',0)}</b>\n"
        f"Resistance  : <b>{sig.get('resistance',0)}</b>\n"
        f"Max Pain    : <b>{sig.get('max_pain',0)}</b>\n"
        f"Trap        : <b>{sig.get('trap_type') or 'None'}</b>\n"
        f"Fut Premium : <b>{fut.get('premium',0):+.0f}</b>  ({fut.get('premium_trend','')})\n"
        f"SMI v2      : <b>{fut.get('smi_v2',0)}/100</b>\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        f"🕐 {_now_ist()}"
    )


def _fmt_futures_divergence(d: dict) -> str:
    msg = d.get("message", "Divergence detected")
    return (
        f"🔥 <b>FUTURES ↔ OPTIONS DIVERGENCE</b>\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        f"{msg}\n"
        f"This is the <b>strongest institutional signal</b>.\n"
        f"Trade with extreme caution.\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        f"🕐 {_now_ist()}"
    )


# ── FORMATTER DISPATCH ────────────────────────────────────────────────────────

_FORMATTERS = {
    "SMI_LEVEL":          _fmt_smi_level,
    "BIAS_CHANGE":        _fmt_bias_change,
    "TRAP":               _fmt_trap,
    "OI_SPIKE":           _fmt_oi_spike,
    "IV_SPIKE":           _fmt_iv_spike,
    "SR_TEST":            _fmt_sr_test,
    "BREAKOUT":           _fmt_breakout,
    "SESSION_SUMMARY":    _fmt_session_summary,
    "FUTURES_DIVERGENCE": _fmt_futures_divergence,
}


def send_alert(alert: dict) -> bool:
    """
    Send a single alert dict. Each alert must have a "type" key matching
    one of the alert type strings above.
    """
    alert_type = alert.get("type", "")
    fmt = _FORMATTERS.get(alert_type)
    if not fmt:
        logger.warning("Unknown alert type: %s", alert_type)
        return False
    text = fmt(alert)
    return _send(text)


def send_session_summary(data: dict) -> bool:
    """Convenience wrapper for scheduled session summaries."""
    return _send(_fmt_session_summary(data))


def send_raw(text: str) -> bool:
    """Send arbitrary message — use sparingly for system notifications."""
    return _send(text)
