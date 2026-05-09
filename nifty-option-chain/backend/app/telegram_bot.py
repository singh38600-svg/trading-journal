"""
Telegram alert system.

Sends formatted alerts for every signal type defined in the blueprint.
All messages are Markdown (HTML parse mode) for rich formatting.
"""

import asyncio
import logging
from datetime import datetime

import httpx

from .config import get_settings
from .signals import SignalResult

logger = logging.getLogger(__name__)
settings = get_settings()

TELEGRAM_API = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}"


# ─────────────────────────────────────────────────────────────────────────────
# Low-level send
# ─────────────────────────────────────────────────────────────────────────────

async def _send(text: str) -> bool:
    """Fire-and-forget Telegram message."""
    url = f"{TELEGRAM_API}/sendMessage"
    payload = {
        "chat_id": settings.TELEGRAM_CHAT_ID,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                logger.warning(f"Telegram send failed: {resp.text}")
                return False
        return True
    except Exception as e:
        logger.error(f"Telegram error: {e}")
        return False


def send_alert(text: str) -> None:
    """Synchronous wrapper — runs async send in a new event loop if needed."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.ensure_future(_send(text))
        else:
            loop.run_until_complete(_send(text))
    except RuntimeError:
        asyncio.run(_send(text))


# ─────────────────────────────────────────────────────────────────────────────
# Alert formatters
# ─────────────────────────────────────────────────────────────────────────────

def _now() -> str:
    return datetime.now().strftime("%H:%M:%S")


def alert_smi_level(result: SignalResult) -> None:
    """Alert 1 — SMI crosses 70 or drops below 30."""
    emoji = "🚀" if result.smi >= 70 else "💀"
    msg = (
        f"{emoji} <b>SMI LEVEL ALERT</b> | {_now()}\n\n"
        f"📊 SMI Score: <b>{result.smi}/100</b> ({result.smi_label})\n"
        f"📈 Spot: {result.spot}\n"
        f"📉 PCR: {result.pcr_oi}\n"
        f"🎯 Support: {result.support_strike} | Resistance: {result.resistance_strike}\n"
        f"🔮 Max Pain: {result.max_pain}\n"
        f"💡 Confidence: {result.confidence}%"
    )
    send_alert(msg)


def alert_bias_change(result: SignalResult, prev_bias: str) -> None:
    """Alert 2 — Market bias changed."""
    msg = (
        f"🔄 <b>BIAS CHANGE ALERT</b> | {_now()}\n\n"
        f"Was: <b>{prev_bias}</b>  →  Now: <b>{result.market_bias}</b>\n"
        f"📊 PCR: {result.pcr_oi} | SMI: {result.smi}\n"
        f"📈 Spot: {result.spot}"
    )
    send_alert(msg)


def alert_trap(result: SignalResult) -> None:
    """Alert 3 — Trap detected."""
    emoji = "🐂" if result.trap_type == "BULL_TRAP" else "🐻"
    msg = (
        f"⚠️ <b>{emoji} {result.trap_type} DETECTED</b> | {_now()}\n\n"
        f"Probability: <b>{result.trap_probability}%</b>\n"
        f"📈 Spot: {result.spot}\n"
        f"📊 PCR: {result.pcr_oi}\n"
        f"🎯 Resistance: {result.resistance_strike} | Support: {result.support_strike}\n\n"
        f"⚡ <i>Caution: Don't chase the move — it may reverse!</i>"
    )
    send_alert(msg)


def alert_oi_spike(spike: dict, spot: float) -> None:
    """Alert 4 — OI spike at a strike (scalping)."""
    msg = (
        f"⚡ <b>OI SPIKE ALERT</b> | {_now()}\n\n"
        f"Strike: <b>{spike['strike']}</b> {spike['side']}\n"
        f"OI Change: <b>{spike['oi_change']:+,}</b>\n"
        f"Buildup: {spike['buildup']}\n"
        f"📈 Spot: {spot}\n"
        f"💡 Suggested Action: <b>{spike['action']}</b>"
    )
    send_alert(msg)


def alert_iv_spike(spike: dict, spot: float) -> None:
    """Alert 5 — IV spike at a strike."""
    msg = (
        f"📈 <b>IV SPIKE ALERT</b> | {_now()}\n\n"
        f"Strike: <b>{spike['strike']}</b> {spike['side']}\n"
        f"IV: {spike['iv_prev']}% → <b>{spike['iv_now']}%</b>\n"
        f"Change: +{spike['change_pct']}%\n"
        f"📈 Spot: {spot}\n"
        f"⚡ <i>Volatility expansion — potential breakout incoming!</i>"
    )
    send_alert(msg)


def alert_sr_test(result: SignalResult, level_type: str, level: float) -> None:
    """Alert 6 — Spot within 50 pts of S/R."""
    emoji = "🔴" if level_type == "RESISTANCE" else "🟢"
    msg = (
        f"🎯 <b>S/R LEVEL TEST</b> | {_now()}\n\n"
        f"{emoji} {level_type}: <b>{level}</b>\n"
        f"📈 Spot: {result.spot} (within 50 pts)\n"
        f"📊 SMI: {result.smi} | PCR: {result.pcr_oi}\n"
        f"💡 Watch for rejection or breakout!"
    )
    send_alert(msg)


def alert_breakout(result: SignalResult) -> None:
    """Alert 7 — Confirmed breakout."""
    msg = (
        f"🚀 <b>BREAKOUT CONFIRMED</b> | {_now()}\n\n"
        f"Price has crossed Resistance: <b>{result.resistance_strike}</b>\n"
        f"📈 Spot: {result.spot}\n"
        f"✅ CE OI unwinding at breakout level\n"
        f"✅ PE OI building at new support\n"
        f"📊 SMI: {result.smi} | PCR: {result.pcr_oi}\n"
        f"🎯 Next Resistance: Check option chain"
    )
    send_alert(msg)


def alert_session_summary(result: SignalResult, session_name: str) -> None:
    """Alert 8 — Scheduled session summary (9:30, 12:00, 15:15 IST)."""
    fut = result.futures
    div_flag = ""
    if abs(result.smi - fut.futures_score) > 30:
        div_flag = "\n🔥 <b>OPTIONS vs FUTURES DIVERGENCE DETECTED!</b>"

    msg = (
        f"📊 <b>{session_name} SESSION SUMMARY</b> | {_now()}\n\n"
        f"{'─' * 30}\n"
        f"📈 Spot: <b>{result.spot}</b>\n"
        f"📊 SMI: <b>{result.smi}/100</b> ({result.smi_label})\n"
        f"📊 SMI v2: <b>{result.smi_v2}/100</b>\n"
        f"📉 PCR (OI): {result.pcr_oi} | PCR (Vol): {result.pcr_vol}\n"
        f"🎯 Bias: <b>{result.market_bias}</b>\n"
        f"🎯 Support: {result.support_strike} | Resistance: {result.resistance_strike}\n"
        f"🔮 Max Pain: {result.max_pain}\n"
        f"{'─' * 30}\n"
        f"📦 Futures: {fut.buildup} | Premium: {fut.premium:+.1f}\n"
        f"📦 Premium Trend: {fut.premium_trend}\n"
        f"📦 Vol Ratio: {result.futures_vol_ratio}x\n"
        f"📦 Rollover: {result.rollover_pct}%\n"
        f"{'─' * 30}\n"
        f"⚠️  Trap: {result.trap_type}"
        f"{'  [' + str(result.trap_probability) + '%]' if result.trap_type != 'NONE' else ''}\n"
        f"🔥 Net OI Flow: {result.net_oi_flow:+,} ({result.net_oi_flow_label})\n"
        f"🎯 Max Gamma Strike: {result.max_gamma_strike}"
        f"{div_flag}"
    )
    send_alert(msg)


def alert_futures_divergence(result: SignalResult) -> None:
    """Alert 9 — Options vs Futures divergence (strongest signal)."""
    options_view = "BULLISH" if result.smi > 55 else ("BEARISH" if result.smi < 45 else "NEUTRAL")
    fut_view = "BULLISH" if result.futures.futures_score > 60 else (
        "BEARISH" if result.futures.futures_score < 40 else "NEUTRAL"
    )
    msg = (
        f"🔥 <b>FUTURES-OPTIONS DIVERGENCE</b> | {_now()}\n\n"
        f"Options Signal: <b>{options_view}</b> (SMI {result.smi})\n"
        f"Futures Signal: <b>{fut_view}</b> (Score {result.futures.futures_score})\n"
        f"📈 Spot: {result.spot}\n"
        f"📦 Futures: {result.futures.buildup} | Premium: {result.futures.premium:+.1f}\n\n"
        f"⚡ <b>INSTITUTIONAL POSITIONING CONFLICT — MAJOR MOVE LIKELY!</b>\n"
        f"🎯 Smart Money may be setting up a large directional move."
    )
    send_alert(msg)


# ─────────────────────────────────────────────────────────────────────────────
# Master dispatcher — called after every data refresh
# ─────────────────────────────────────────────────────────────────────────────

def dispatch_alerts(
    result: SignalResult,
    prev_result: SignalResult | None,
    alerted_oi_strikes: set,
    alerted_smi_high: bool,
    alerted_smi_low: bool,
) -> tuple[set, bool, bool]:
    """
    Evaluate all conditions and fire relevant alerts.
    Returns updated (alerted_oi_strikes, alerted_smi_high, alerted_smi_low).
    """
    spot = result.spot

    # Alert 1: SMI threshold crossed
    if result.smi >= 70 and not alerted_smi_high:
        alert_smi_level(result)
        alerted_smi_high = True
        alerted_smi_low = False
    elif result.smi < 30 and not alerted_smi_low:
        alert_smi_level(result)
        alerted_smi_low = True
        alerted_smi_high = False
    elif 30 <= result.smi < 70:
        alerted_smi_high = False
        alerted_smi_low = False

    # Alert 2: Bias change
    if prev_result and prev_result.market_bias != result.market_bias:
        alert_bias_change(result, prev_result.market_bias)

    # Alert 3: Trap detected
    if result.trap_type != "NONE":
        prev_trap = prev_result.trap_type if prev_result else "NONE"
        if prev_trap == "NONE":   # only alert on new detection
            alert_trap(result)

    # Alert 4: OI spikes (scalping)
    for spike in result.oi_spike_strikes:
        key = (spike["strike"], spike["side"])
        if key not in alerted_oi_strikes:
            alert_oi_spike(spike, spot)
            alerted_oi_strikes.add(key)

    # Alert 5: IV spikes
    for spike in result.iv_spike_strikes:
        alert_iv_spike(spike, spot)

    # Alert 6: S/R test
    if spot and result.resistance_strike:
        if abs(spot - result.resistance_strike) <= 50:
            alert_sr_test(result, "RESISTANCE", result.resistance_strike)
    if spot and result.support_strike:
        if abs(spot - result.support_strike) <= 50:
            alert_sr_test(result, "SUPPORT", result.support_strike)

    # Alert 7: Breakout
    if result.breakout_confirmed:
        prev_bo = prev_result.breakout_confirmed if prev_result else False
        if not prev_bo:
            alert_breakout(result)

    # Alert 9: Futures divergence
    options_bullish = result.smi > 55
    futures_bullish = result.futures.futures_score > 60
    options_bearish = result.smi < 45
    futures_bearish = result.futures.futures_score < 40

    divergence = (options_bullish and futures_bearish) or (options_bearish and futures_bullish)
    if divergence:
        prev_div = False
        if prev_result:
            po_bull = prev_result.smi > 55
            pf_bull = prev_result.futures.futures_score > 60
            po_bear = prev_result.smi < 45
            pf_bear = prev_result.futures.futures_score < 40
            prev_div = (po_bull and pf_bear) or (po_bear and pf_bull)
        if not prev_div:
            alert_futures_divergence(result)

    return alerted_oi_strikes, alerted_smi_high, alerted_smi_low
