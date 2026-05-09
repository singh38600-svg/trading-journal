"""
Signal engine — computes all 32 signals described in the blueprint.

Input  : parsed options list + futures dict + spot price
Output : SignalResult dataclass with every signal field populated
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Literal


# ─────────────────────────────────────────────────────────────────────────────
# Result container
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class StrikeInfo:
    strike: float
    ce_oi: int
    ce_oi_change: int
    ce_volume: int
    ce_ltp: float
    ce_ltp_change: float
    ce_iv: float
    pe_oi: int
    pe_oi_change: int
    pe_volume: int
    pe_ltp: float
    pe_ltp_change: float
    pe_iv: float
    ce_buildup: str = ""
    pe_buildup: str = ""
    ce_zone_strength: str = ""
    pe_zone_strength: str = ""
    ce_liquidity_score: float = 0.0
    pe_liquidity_score: float = 0.0
    gamma_exposure: float = 0.0


@dataclass
class FuturesSignals:
    buildup: str = "NEUTRAL"
    premium: float = 0.0
    premium_trend: str = "FLAT"
    futures_score: int = 50


@dataclass
class SignalResult:
    # ── Spot & Expiry ──────────────────────────────────────────────────────────
    spot: float = 0.0
    expiry_date: str = ""

    # ── PCR ────────────────────────────────────────────────────────────────────
    pcr_oi: float = 0.0          # Signal 1
    pcr_vol: float = 0.0         # Signal 2
    pcr_weighted: float = 0.0    # Signal 3

    # ── OI Buildup ─────────────────────────────────────────────────────────────
    # (per-strike; see StrikeInfo.ce_buildup / pe_buildup)

    # ── S/R Strikes ────────────────────────────────────────────────────────────
    resistance_strike: float = 0.0   # Signal 7
    support_strike: float = 0.0      # Signal 8

    # ── S/R Zones ──────────────────────────────────────────────────────────────
    resistance_zone: list[float] = field(default_factory=list)   # Signal 9
    support_zone: list[float] = field(default_factory=list)      # Signal 10

    # ── Smart Money Index ──────────────────────────────────────────────────────
    smi: int = 50            # Signal 11
    smi_label: str = "NEUTRAL"

    # ── Trap Detection ─────────────────────────────────────────────────────────
    trap_type: str = "NONE"          # Signal 12 — "BULL_TRAP" / "BEAR_TRAP" / "NONE"
    trap_probability: float = 0.0    # Signal 13 (0-100)

    # ── Bias & Confidence ──────────────────────────────────────────────────────
    market_bias: str = "NEUTRAL"     # Signal 14
    confidence: int = 50             # Signal 15

    # ── Scalping Alerts ────────────────────────────────────────────────────────
    oi_spike_strikes: list[dict] = field(default_factory=list)   # Signal 16
    iv_spike_strikes: list[dict] = field(default_factory=list)   # Signal 17

    # ── Gamma / Liquidity ──────────────────────────────────────────────────────
    max_gamma_strike: float = 0.0    # Signal 18

    # ── Net OI Flow ────────────────────────────────────────────────────────────
    net_oi_flow: int = 0             # Signal 22
    net_oi_flow_label: str = "NEUTRAL"

    # ── Complex signals ────────────────────────────────────────────────────────
    aggressive_writing_strikes: list[dict] = field(default_factory=list)  # Signal 23
    breakout_confirmed: bool = False                                        # Signal 24
    reversal_signal: bool = False                                           # Signal 25

    # ── Max Pain ───────────────────────────────────────────────────────────────
    max_pain: float = 0.0            # Signal 21

    # ── Futures signals ────────────────────────────────────────────────────────
    futures: FuturesSignals = field(default_factory=FuturesSignals)
    smi_v2: int = 50                 # Signal 30 — combined score
    rollover_pct: float = 0.0        # Signal 31
    futures_vol_ratio: float = 1.0   # Signal 32

    # ── Per-strike detail ──────────────────────────────────────────────────────
    strikes: list[StrikeInfo] = field(default_factory=list)


# ─────────────────────────────────────────────────────────────────────────────
# Helper: OI buildup classification (Signals 4 & 5)
# ─────────────────────────────────────────────────────────────────────────────

def _buildup(oi_change: int, ltp_change: float) -> str:
    if oi_change > 0 and ltp_change >= 0:
        return "LONG_BUILDUP"
    elif oi_change > 0 and ltp_change < 0:
        return "SHORT_BUILDUP"
    elif oi_change < 0 and ltp_change >= 0:
        return "SHORT_COVERING"
    else:
        return "LONG_UNWINDING"


# ─────────────────────────────────────────────────────────────────────────────
# Helper: Zone strength (Signal 6)
# ─────────────────────────────────────────────────────────────────────────────

def _zone_strength(oi: int, max_oi: int) -> str:
    if max_oi == 0:
        return "NEGLIGIBLE"
    pct = oi / max_oi
    if pct > 0.75:
        return "STRONG"
    elif pct > 0.45:
        return "MODERATE"
    elif pct > 0.20:
        return "WEAK"
    return "NEGLIGIBLE"


# ─────────────────────────────────────────────────────────────────────────────
# Helper: S/R zones — top-3 consecutive strikes (Signals 9 & 10)
# ─────────────────────────────────────────────────────────────────────────────

def _top_zone(strikes: list[StrikeInfo], key: str, n: int = 3) -> list[float]:
    """Return strikes of top-n by the given OI key, sorted ascending."""
    sorted_s = sorted(strikes, key=lambda s: getattr(s, key), reverse=True)
    top = [s.strike for s in sorted_s[:n]]
    return sorted(top)


# ─────────────────────────────────────────────────────────────────────────────
# Helper: SMI score (Signal 11)
# ─────────────────────────────────────────────────────────────────────────────

def _smi_score(pcr_oi: float, net_oi_change: int, pcr_vol: float, max_pe_oi: int, max_ce_oi: int) -> tuple[int, str]:
    # a) PCR score (30 pts)
    if pcr_oi > 1.5:
        a = 30
    elif pcr_oi > 1.2:
        a = 24
    elif pcr_oi > 0.9:
        a = 18
    elif pcr_oi > 0.7:
        a = 10
    else:
        a = 4

    # b) OI buildup score (30 pts)
    if net_oi_change > 500_000:
        b = 30
    elif net_oi_change > 100_000:
        b = 23
    elif net_oi_change > 0:
        b = 17
    elif net_oi_change > -100_000:
        b = 10
    else:
        b = 4

    # c) Volume score (20 pts)
    if pcr_vol > 1.3:
        c = 20
    elif pcr_vol > 1.0:
        c = 15
    elif pcr_vol > 0.8:
        c = 10
    else:
        c = 4

    # d) Zone score (20 pts)
    ratio = (max_pe_oi / max_ce_oi) if max_ce_oi > 0 else 0
    if ratio > 1.5:
        d = 20
    elif ratio > 1.1:
        d = 15
    elif ratio > 0.8:
        d = 10
    else:
        d = 4

    score = a + b + c + d

    if score >= 70:
        label = "STRONG_BULLISH"
    elif score >= 55:
        label = "MILDLY_BULLISH"
    elif score >= 45:
        label = "NEUTRAL"
    elif score >= 30:
        label = "MILDLY_BEARISH"
    else:
        label = "STRONG_BEARISH"

    return score, label


# ─────────────────────────────────────────────────────────────────────────────
# Helper: Trap detection (Signals 12 & 13)
# ─────────────────────────────────────────────────────────────────────────────

def _detect_trap(pcr_oi: float, strikes: list[StrikeInfo]) -> tuple[str, float]:
    max_ce_change = max((s.ce_oi_change for s in strikes), default=0)
    max_pe_change = max((s.pe_oi_change for s in strikes), default=0)

    trap_type = "NONE"
    if max_ce_change > 50_000 and pcr_oi < 0.8:
        trap_type = "BULL_TRAP"
    elif max_pe_change > 50_000 and pcr_oi > 1.2:
        trap_type = "BEAR_TRAP"

    # Probability — weighted factors (simplified without IV shift)
    # a) Price vs OI divergence (40%)
    div_score = 0.0
    if trap_type == "BULL_TRAP":
        div_score = min(40.0, (max_ce_change / 100_000) * 40)
    elif trap_type == "BEAR_TRAP":
        div_score = min(40.0, (max_pe_change / 100_000) * 40)

    # b) Volume anomaly at key strike (30%)
    total_ce_vol = sum(s.ce_volume for s in strikes)
    avg_ce_vol = total_ce_vol / len(strikes) if strikes else 1
    top_ce_vol = max((s.ce_volume for s in strikes), default=0)
    vol_score = min(30.0, (top_ce_vol / max(avg_ce_vol, 1)) * 10)

    probability = min(100.0, div_score + vol_score)
    return trap_type, round(probability, 1)


# ─────────────────────────────────────────────────────────────────────────────
# Helper: Max Pain (Signal 21)
# ─────────────────────────────────────────────────────────────────────────────

def _max_pain(strikes: list[StrikeInfo]) -> float:
    all_strikes = [s.strike for s in strikes]
    min_pain = math.inf
    max_pain_strike = 0.0

    for candidate in all_strikes:
        # CE pain: sum of (max(0, candidate - S) * CE_OI) for all S
        ce_pain = sum(max(0, candidate - s.strike) * s.ce_oi for s in strikes)
        # PE pain: sum of (max(0, S - candidate) * PE_OI) for all S
        pe_pain = sum(max(0, s.strike - candidate) * s.pe_oi for s in strikes)
        total = ce_pain + pe_pain
        if total < min_pain:
            min_pain = total
            max_pain_strike = candidate

    return max_pain_strike


# ─────────────────────────────────────────────────────────────────────────────
# Helper: Futures signals (Signals 26–32)
# ─────────────────────────────────────────────────────────────────────────────

def _futures_signals(
    futures: dict,
    prev_futures: dict | None,
    spot: float,
    current_expiry_oi: int,
    next_expiry_oi: int,
    five_day_avg_volume: int,
) -> tuple[FuturesSignals, float, float]:
    """Returns (FuturesSignals, smi_v2_input_score, rollover_pct, vol_ratio)."""
    fut_ltp = futures.get("ltp", 0)
    fut_oi = futures.get("oi", 0)
    fut_oi_change = futures.get("oi_change", 0)
    fut_volume = futures.get("volume", 0)

    # Signal 26: Futures buildup
    prev_oi = (prev_futures or {}).get("oi", fut_oi)
    oi_increasing = fut_oi > prev_oi
    price_increasing = fut_ltp > (prev_futures or {}).get("ltp", fut_ltp)

    if oi_increasing and price_increasing:
        buildup = "LONG_BUILDUP"
    elif oi_increasing and not price_increasing:
        buildup = "SHORT_BUILDUP"
    elif not oi_increasing and price_increasing:
        buildup = "SHORT_COVERING"
    else:
        buildup = "LONG_UNWINDING"

    # Signal 27: Premium
    premium = round(fut_ltp - spot, 2) if fut_ltp and spot else 0.0

    # Signal 28: Premium trend
    prev_premium = (prev_futures or {}).get("premium", premium)
    if premium > prev_premium + 1:
        premium_trend = "EXPANDING"
    elif premium < prev_premium - 1:
        premium_trend = "SHRINKING"
    else:
        premium_trend = "FLAT"

    # Futures score (for SMI v2)
    if buildup == "LONG_BUILDUP" and premium_trend == "EXPANDING":
        fscore = 90
    elif buildup == "LONG_BUILDUP":
        fscore = 70
    elif buildup == "SHORT_COVERING":
        fscore = 55
    elif buildup == "LONG_UNWINDING":
        fscore = 30
    elif buildup == "SHORT_BUILDUP" and premium_trend == "SHRINKING":
        fscore = 10
    else:
        fscore = 45

    # Signal 31: Rollover %
    total_oi = current_expiry_oi + next_expiry_oi
    rollover_pct = round((next_expiry_oi / total_oi * 100) if total_oi > 0 else 0, 1)

    # Signal 32: Volume ratio
    vol_ratio = round(fut_volume / max(five_day_avg_volume, 1), 2)

    fs = FuturesSignals(
        buildup=buildup,
        premium=premium,
        premium_trend=premium_trend,
        futures_score=fscore,
    )
    return fs, rollover_pct, vol_ratio


# ─────────────────────────────────────────────────────────────────────────────
# Main engine
# ─────────────────────────────────────────────────────────────────────────────

def compute_signals(
    snapshot: dict,
    prev_snapshot: dict | None = None,
    prev_iv_map: dict | None = None,
    alerted_oi_strikes: set | None = None,
    five_day_avg_futures_vol: int = 500_000,
) -> SignalResult:
    """
    snapshot keys: spot, options (list of flat rows), futures (dict),
                   next_expiry_futures_oi, expiry_date

    prev_snapshot : previous snapshot for trend comparisons (optional)
    prev_iv_map   : dict of (strike, type) → iv from previous reading
    alerted_oi_strikes : set of strikes already alerted this session
    """
    result = SignalResult()
    result.spot = snapshot.get("spot", 0)
    result.expiry_date = snapshot.get("expiry_date", "")

    options: list[dict] = snapshot.get("options", [])
    futures_raw: dict = snapshot.get("futures", {})
    next_expiry_oi: int = snapshot.get("next_expiry_futures_oi", 0)
    alerted = alerted_oi_strikes or set()

    # ── Build per-strike StrikeInfo list ──────────────────────────────────────
    strike_map: dict[float, dict] = {}
    for row in options:
        sp = row.get("strike_price", 0)
        if sp <= 0:
            continue
        opt_type = row.get("option_type", "")
        if sp not in strike_map:
            strike_map[sp] = {}
        strike_map[sp][opt_type] = row

    strike_infos: list[StrikeInfo] = []
    for sp, sides in sorted(strike_map.items()):
        ce = sides.get("CE", {})
        pe = sides.get("PE", {})
        si = StrikeInfo(
            strike=sp,
            ce_oi=ce.get("oi", 0),
            ce_oi_change=ce.get("oich", 0),
            ce_volume=ce.get("volume", 0),
            ce_ltp=ce.get("ltp", 0),
            ce_ltp_change=ce.get("ltpch", 0),
            ce_iv=ce.get("iv", 0.0),
            pe_oi=pe.get("oi", 0),
            pe_oi_change=pe.get("oich", 0),
            pe_volume=pe.get("volume", 0),
            pe_ltp=pe.get("ltp", 0),
            pe_ltp_change=pe.get("ltpch", 0),
            pe_iv=pe.get("iv", 0.0),
        )
        # OI buildup (Signals 4 & 5)
        si.ce_buildup = _buildup(si.ce_oi_change, si.ce_ltp_change)
        si.pe_buildup = _buildup(si.pe_oi_change, si.pe_ltp_change)
        strike_infos.append(si)

    result.strikes = strike_infos

    if not strike_infos:
        return result

    # ── Totals ────────────────────────────────────────────────────────────────
    total_pe_oi = sum(s.pe_oi for s in strike_infos)
    total_ce_oi = sum(s.ce_oi for s in strike_infos)
    total_pe_vol = sum(s.pe_volume for s in strike_infos)
    total_ce_vol = sum(s.ce_volume for s in strike_infos)
    total_ce_vol_safe = max(total_ce_vol, 1)
    total_pe_oi_safe = max(total_pe_oi, 1)
    total_ce_oi_safe = max(total_ce_oi, 1)

    # ── Signals 1, 2, 3: PCR ─────────────────────────────────────────────────
    result.pcr_oi = round(total_pe_oi / total_ce_oi_safe, 3)
    result.pcr_vol = round(total_pe_vol / total_ce_vol_safe, 3)
    result.pcr_weighted = round(
        (total_pe_oi * total_pe_vol) / max(total_ce_oi * total_ce_vol, 1), 3
    )

    # ── Signal 6: Zone Strength ───────────────────────────────────────────────
    max_ce_oi = max((s.ce_oi for s in strike_infos), default=1)
    max_pe_oi = max((s.pe_oi for s in strike_infos), default=1)
    for s in strike_infos:
        s.ce_zone_strength = _zone_strength(s.ce_oi, max_ce_oi)
        s.pe_zone_strength = _zone_strength(s.pe_oi, max_pe_oi)

    # ── Signals 7 & 8: S/R Strikes ───────────────────────────────────────────
    best_ce = max(strike_infos, key=lambda s: s.ce_oi)
    best_pe = max(strike_infos, key=lambda s: s.pe_oi)
    result.resistance_strike = best_ce.strike
    result.support_strike = best_pe.strike

    # ── Signals 9 & 10: S/R Zones ────────────────────────────────────────────
    result.resistance_zone = _top_zone(strike_infos, "ce_oi")
    result.support_zone = _top_zone(strike_infos, "pe_oi")

    # ── Signal 11: SMI ────────────────────────────────────────────────────────
    net_oi_change = sum(s.pe_oi_change for s in strike_infos) - sum(s.ce_oi_change for s in strike_infos)
    result.smi, result.smi_label = _smi_score(
        result.pcr_oi, net_oi_change, result.pcr_vol, max_pe_oi, max_ce_oi
    )

    # ── Signals 12 & 13: Trap ────────────────────────────────────────────────
    result.trap_type, result.trap_probability = _detect_trap(result.pcr_oi, strike_infos)

    # ── Signal 14: Market Bias ───────────────────────────────────────────────
    if result.pcr_oi > 1.3:
        result.market_bias = "BULLISH"
    elif result.pcr_oi < 0.7:
        result.market_bias = "BEARISH"
    else:
        result.market_bias = "NEUTRAL"

    # ── Signal 15: Confidence ────────────────────────────────────────────────
    confidence = result.smi
    if result.trap_type != "NONE":
        confidence -= 20
    result.confidence = max(10, min(100, confidence))

    # ── Signal 16: OI Spike ──────────────────────────────────────────────────
    for s in strike_infos:
        if abs(s.ce_oi_change) > five_day_avg_futures_vol // 5 and s.strike not in alerted:
            action = "SELL CE" if s.ce_oi_change > 0 else "COVER CE SHORT"
            result.oi_spike_strikes.append({
                "strike": s.strike,
                "side": "CE",
                "oi_change": s.ce_oi_change,
                "buildup": s.ce_buildup,
                "action": action,
            })
        if abs(s.pe_oi_change) > five_day_avg_futures_vol // 5 and s.strike not in alerted:
            action = "SELL PE" if s.pe_oi_change > 0 else "COVER PE SHORT"
            result.oi_spike_strikes.append({
                "strike": s.strike,
                "side": "PE",
                "oi_change": s.pe_oi_change,
                "buildup": s.pe_buildup,
                "action": action,
            })

    # ── Signal 17: IV Spike ──────────────────────────────────────────────────
    if prev_iv_map:
        for s in strike_infos:
            prev_ce_iv = prev_iv_map.get((s.strike, "CE"), 0)
            if prev_ce_iv > 0 and s.ce_iv > 0:
                iv_change_pct = abs(s.ce_iv - prev_ce_iv) / prev_ce_iv * 100
                if iv_change_pct > 20:
                    result.iv_spike_strikes.append({
                        "strike": s.strike,
                        "side": "CE",
                        "iv_now": s.ce_iv,
                        "iv_prev": prev_ce_iv,
                        "change_pct": round(iv_change_pct, 1),
                    })
            prev_pe_iv = prev_iv_map.get((s.strike, "PE"), 0)
            if prev_pe_iv > 0 and s.pe_iv > 0:
                iv_change_pct = abs(s.pe_iv - prev_pe_iv) / prev_pe_iv * 100
                if iv_change_pct > 20:
                    result.iv_spike_strikes.append({
                        "strike": s.strike,
                        "side": "PE",
                        "iv_now": s.pe_iv,
                        "iv_prev": prev_pe_iv,
                        "change_pct": round(iv_change_pct, 1),
                    })

    # ── Signal 18: Gamma Exposure ─────────────────────────────────────────────
    spot = result.spot
    for s in strike_infos:
        weight = 1.0 / (1 + abs(s.strike - spot) / 100)
        s.gamma_exposure = round((s.ce_oi + s.pe_oi) * weight, 2)
    max_gamma = max(strike_infos, key=lambda s: s.gamma_exposure)
    result.max_gamma_strike = max_gamma.strike

    # ── Signal 19: Liquidity Score ───────────────────────────────────────────
    total_ce_v = max(sum(s.ce_volume for s in strike_infos), 1)
    total_pe_v = max(sum(s.pe_volume for s in strike_infos), 1)
    for s in strike_infos:
        s.ce_liquidity_score = round(s.ce_volume / total_ce_v * 100, 2)
        s.pe_liquidity_score = round(s.pe_volume / total_pe_v * 100, 2)

    # ── Signal 21: Max Pain ───────────────────────────────────────────────────
    result.max_pain = _max_pain(strike_infos)

    # ── Signal 22: Net OI Flow ────────────────────────────────────────────────
    result.net_oi_flow = net_oi_change
    if net_oi_change > 0:
        result.net_oi_flow_label = "BULLISH"
    elif net_oi_change < 0:
        result.net_oi_flow_label = "BEARISH"
    else:
        result.net_oi_flow_label = "NEUTRAL"

    # ── Signal 23: Aggressive Writing ────────────────────────────────────────
    total_vol = sum(s.ce_volume + s.pe_volume for s in strike_infos)
    avg_vol = total_vol / max(len(strike_infos), 1)
    for s in strike_infos:
        # CE writing
        if (s.ce_volume > 2 * avg_vol and s.ce_oi_change > 0 and s.ce_ltp_change < 0):
            result.aggressive_writing_strikes.append({
                "strike": s.strike, "side": "CE",
                "signal": "INSTITUTIONAL_CE_WRITING",
            })
        # PE writing
        if (s.pe_volume > 2 * avg_vol and s.pe_oi_change > 0 and s.pe_ltp_change < 0):
            result.aggressive_writing_strikes.append({
                "strike": s.strike, "side": "PE",
                "signal": "INSTITUTIONAL_PE_WRITING",
            })

    # ── Signal 24: Breakout Confirmed ────────────────────────────────────────
    resistance = result.resistance_strike
    if spot and resistance and spot > resistance:
        resist_info = next((s for s in strike_infos if s.strike == resistance), None)
        if resist_info and resist_info.ce_oi_change < 0:
            new_support = next(
                (s for s in strike_infos if s.strike == resistance), None
            )
            if new_support and new_support.pe_oi_change > 0:
                result.breakout_confirmed = True

    # ── Signal 25: Reversal Signal ────────────────────────────────────────────
    support = result.support_strike
    if spot and support:
        dist = abs(spot - support)
        if dist < 50:
            support_info = next((s for s in strike_infos if s.strike == support), None)
            if support_info and support_info.pe_oi_change > 50_000:
                # Also check SMI shifting (simplified: SMI > 50 near support = reversal up)
                if result.smi > 50:
                    result.reversal_signal = True

    # ── Futures signals ───────────────────────────────────────────────────────
    prev_futures = (prev_snapshot or {}).get("futures", None)
    current_expiry_oi = int(futures_raw.get("oi", 0))

    result.futures, result.rollover_pct, result.futures_vol_ratio = _futures_signals(
        futures_raw, prev_futures, spot, current_expiry_oi,
        next_expiry_oi, five_day_avg_futures_vol
    )

    # ── Signal 30: SMI v2 (Combined) ──────────────────────────────────────────
    result.smi_v2 = round(result.smi * 0.6 + result.futures.futures_score * 0.4)

    # ── Signal 29: Futures / Options Divergence ───────────────────────────────
    # Embedded in smi_v2 — a large gap between options SMI and futures score signals divergence
    # (handled at alert level in telegram_bot.py)

    return result
