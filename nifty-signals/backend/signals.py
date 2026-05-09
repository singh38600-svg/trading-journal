"""
All 32 signal calculations for the NIFTY Option Chain Intelligence System.
"""

import math
from datetime import datetime, date
from typing import Optional


# ---------------------------------------------------------------------------
# Black-Scholes IV (Newton-Raphson)
# ---------------------------------------------------------------------------

def _bs_price(S, K, T, r, sigma, option_type):
    if T <= 0 or sigma <= 0:
        return max(0.0, (S - K) if option_type == "CE" else (K - S))
    d1 = (math.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)
    from scipy.stats import norm
    if option_type == "CE":
        return S * norm.cdf(d1) - K * math.exp(-r * T) * norm.cdf(d2)
    else:
        return K * math.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)


def calc_iv(ltp, spot, strike, expiry_date, option_type, r=0.07):
    try:
        from scipy.stats import norm  # noqa
        T = max((expiry_date - date.today()).days / 365.0, 1 / 365)
        sigma = 0.2
        for _ in range(100):
            price = _bs_price(spot, strike, T, r, sigma, option_type)
            d1 = (math.log(spot / strike) + (r + 0.5 * sigma ** 2) * T) / (sigma * math.sqrt(T))
            vega = spot * math.sqrt(T) * math.exp(-0.5 * d1 ** 2) / math.sqrt(2 * math.pi)
            diff = price - ltp
            if vega < 1e-8:
                break
            sigma -= diff / vega
            if sigma <= 0:
                sigma = 0.001
            if abs(diff) < 0.01:
                break
        return round(sigma * 100, 2)
    except Exception:
        return 0.0


# ---------------------------------------------------------------------------
# PCR
# ---------------------------------------------------------------------------

def calc_pcr(chain: list[dict]) -> dict:
    total_pe_oi = sum(r["oi"] for r in chain if r["option_type"] == "PE")
    total_ce_oi = sum(r["oi"] for r in chain if r["option_type"] == "CE")
    total_pe_vol = sum(r["volume"] for r in chain if r["option_type"] == "PE")
    total_ce_vol = sum(r["volume"] for r in chain if r["option_type"] == "CE")

    pcr_oi = round(total_pe_oi / total_ce_oi, 3) if total_ce_oi else 0
    pcr_vol = round(total_pe_vol / total_ce_vol, 3) if total_ce_vol else 0
    weighted_pcr = round(
        (total_pe_oi * total_pe_vol) / (total_ce_oi * total_ce_vol), 3
    ) if (total_ce_oi * total_ce_vol) else 0

    return {
        "pcr_oi": pcr_oi,
        "pcr_vol": pcr_vol,
        "weighted_pcr": weighted_pcr,
        "total_pe_oi": total_pe_oi,
        "total_ce_oi": total_ce_oi,
        "total_pe_vol": total_pe_vol,
        "total_ce_vol": total_ce_vol,
    }


# ---------------------------------------------------------------------------
# OI Buildup
# ---------------------------------------------------------------------------

def classify_buildup(oi_change: float, ltp_change: float) -> str:
    if oi_change > 0 and ltp_change >= 0:
        return "Long Buildup"
    elif oi_change > 0 and ltp_change < 0:
        return "Short Buildup"
    elif oi_change < 0 and ltp_change >= 0:
        return "Short Covering"
    else:
        return "Long Unwinding"


def zone_strength(oi: float, max_oi: float) -> str:
    if max_oi == 0:
        return "NEGLIGIBLE"
    ratio = oi / max_oi
    if ratio > 0.75:
        return "STRONG"
    elif ratio > 0.45:
        return "MODERATE"
    elif ratio > 0.20:
        return "WEAK"
    return "NEGLIGIBLE"


# ---------------------------------------------------------------------------
# Support & Resistance
# ---------------------------------------------------------------------------

def calc_support_resistance(chain: list[dict]) -> dict:
    ce_rows = [r for r in chain if r["option_type"] == "CE" and r["oi"] > 0]
    pe_rows = [r for r in chain if r["option_type"] == "PE" and r["oi"] > 0]

    resistance_strike = max(ce_rows, key=lambda r: r["oi"])["strike_price"] if ce_rows else 0
    support_strike = max(pe_rows, key=lambda r: r["oi"])["strike_price"] if pe_rows else 0

    # Zone = top 3 by OI
    ce_sorted = sorted(ce_rows, key=lambda r: r["oi"], reverse=True)[:3]
    pe_sorted = sorted(pe_rows, key=lambda r: r["oi"], reverse=True)[:3]

    return {
        "resistance": resistance_strike,
        "support": support_strike,
        "resistance_zone": sorted([r["strike_price"] for r in ce_sorted]),
        "support_zone": sorted([r["strike_price"] for r in pe_sorted]),
    }


# ---------------------------------------------------------------------------
# Smart Money Index
# ---------------------------------------------------------------------------

def calc_smi(pcr_data: dict, chain: list[dict]) -> int:
    # a) PCR score
    pcr = pcr_data["pcr_oi"]
    if pcr > 1.5:
        a = 30
    elif pcr > 1.2:
        a = 24
    elif pcr > 0.9:
        a = 18
    elif pcr > 0.7:
        a = 10
    else:
        a = 4

    # b) OI buildup score
    net_pe_oi_chg = sum(r["oich"] for r in chain if r["option_type"] == "PE")
    net_ce_oi_chg = sum(r["oich"] for r in chain if r["option_type"] == "CE")
    net_diff = net_pe_oi_chg - net_ce_oi_chg
    if net_diff > 500_000:
        b = 30
    elif net_diff > 100_000:
        b = 23
    elif net_diff > 0:
        b = 17
    elif net_diff > -100_000:
        b = 10
    else:
        b = 4

    # c) Volume score
    pcr_vol = pcr_data["pcr_vol"]
    if pcr_vol > 1.3:
        c = 20
    elif pcr_vol > 1.0:
        c = 15
    elif pcr_vol > 0.8:
        c = 10
    else:
        c = 4

    # d) Zone score
    ce_rows = [r for r in chain if r["option_type"] == "CE" and r["oi"] > 0]
    pe_rows = [r for r in chain if r["option_type"] == "PE" and r["oi"] > 0]
    max_ce = max((r["oi"] for r in ce_rows), default=1)
    max_pe = max((r["oi"] for r in pe_rows), default=0)
    zone_ratio = max_pe / max_ce if max_ce else 0
    if zone_ratio > 1.5:
        d = 20
    elif zone_ratio > 1.1:
        d = 15
    elif zone_ratio > 0.8:
        d = 10
    else:
        d = 4

    return a + b + c + d


def smi_label(smi: int) -> str:
    if smi >= 70:
        return "STRONG BULLISH"
    elif smi >= 55:
        return "MILDLY BULLISH"
    elif smi >= 45:
        return "NEUTRAL"
    elif smi >= 30:
        return "MILDLY BEARISH"
    return "STRONG BEARISH"


# ---------------------------------------------------------------------------
# Trap Detection
# ---------------------------------------------------------------------------

def detect_trap(chain: list[dict], pcr: float) -> dict:
    ce_rows = sorted(
        [r for r in chain if r["option_type"] == "CE" and r["oi"] > 0],
        key=lambda r: r["oich"], reverse=True
    )
    pe_rows = sorted(
        [r for r in chain if r["option_type"] == "PE" and r["oi"] > 0],
        key=lambda r: r["oich"], reverse=True
    )

    bull_trap = bool(ce_rows and ce_rows[0]["oich"] > 50_000 and pcr < 0.8)
    bear_trap = bool(pe_rows and pe_rows[0]["oich"] > 50_000 and pcr > 1.2)

    trap_type = "BULL TRAP" if bull_trap else ("BEAR TRAP" if bear_trap else "NONE")

    # Trap probability
    prob = 0
    if bull_trap or bear_trap:
        prob += 40
        top = ce_rows[0] if bull_trap else pe_rows[0]
        avg_vol = sum(r["volume"] for r in chain) / max(len(chain), 1)
        if top["volume"] > avg_vol * 2:
            prob += 30
        prob += 20
    prob = min(prob, 100)

    return {"trap": trap_type, "probability": prob}


# ---------------------------------------------------------------------------
# Market Bias
# ---------------------------------------------------------------------------

def market_bias(pcr: float) -> str:
    if pcr > 1.3:
        return "BULLISH"
    elif pcr < 0.7:
        return "BEARISH"
    return "NEUTRAL"


# ---------------------------------------------------------------------------
# Max Pain
# ---------------------------------------------------------------------------

def calc_max_pain(chain: list[dict]) -> int:
    strikes = sorted(set(r["strike_price"] for r in chain if r["strike_price"] > 0))
    ce_map = {r["strike_price"]: r["oi"] for r in chain if r["option_type"] == "CE"}
    pe_map = {r["strike_price"]: r["oi"] for r in chain if r["option_type"] == "PE"}

    min_pain = float("inf")
    max_pain_strike = 0

    for s in strikes:
        pain_ce = sum(max(0, s - k) * ce_map.get(k, 0) for k in strikes)
        pain_pe = sum(max(0, k - s) * pe_map.get(k, 0) for k in strikes)
        total = pain_ce + pain_pe
        if total < min_pain:
            min_pain = total
            max_pain_strike = s

    return max_pain_strike


# ---------------------------------------------------------------------------
# OI Spike Alert
# ---------------------------------------------------------------------------

def detect_oi_spikes(chain: list[dict], threshold: int = 100_000, seen: set = None) -> list[dict]:
    if seen is None:
        seen = set()
    spikes = []
    for r in chain:
        key = f"{r['strike_price']}_{r['option_type']}"
        if abs(r["oich"]) > threshold and key not in seen:
            seen.add(key)
            buildup = classify_buildup(r["oich"], r["ltpch"])
            action = "Consider CE buy" if r["option_type"] == "PE" and r["oich"] > 0 else \
                     "Consider PE buy" if r["option_type"] == "CE" and r["oich"] > 0 else "Monitor"
            spikes.append({
                "strike": r["strike_price"],
                "option_type": r["option_type"],
                "oi_change": r["oich"],
                "buildup": buildup,
                "action": action,
            })
    return spikes


# ---------------------------------------------------------------------------
# Gamma Exposure
# ---------------------------------------------------------------------------

def calc_gamma_exposure(chain: list[dict], spot: float) -> list[dict]:
    result = []
    for r in chain:
        weight = 1 / (1 + abs(r["strike_price"] - spot) / 100)
        gamma_exp = r["oi"] * weight
        result.append({"strike": r["strike_price"], "option_type": r["option_type"], "gamma_exposure": round(gamma_exp, 2)})
    return sorted(result, key=lambda x: x["gamma_exposure"], reverse=True)[:10]


# ---------------------------------------------------------------------------
# Liquidity Score
# ---------------------------------------------------------------------------

def calc_liquidity(chain: list[dict]) -> list[dict]:
    total_vol = sum(r["volume"] for r in chain) or 1
    result = []
    strikes = sorted(set(r["strike_price"] for r in chain if r["strike_price"] > 0))
    for s in strikes:
        vol = sum(r["volume"] for r in chain if r["strike_price"] == s)
        result.append({"strike": s, "liquidity_score": round(vol / total_vol * 100, 2)})
    return sorted(result, key=lambda x: x["liquidity_score"], reverse=True)[:10]


# ---------------------------------------------------------------------------
# Net OI Flow
# ---------------------------------------------------------------------------

def calc_net_oi_flow(chain: list[dict]) -> dict:
    pe_chg = sum(r["oich"] for r in chain if r["option_type"] == "PE")
    ce_chg = sum(r["oich"] for r in chain if r["option_type"] == "CE")
    net = pe_chg - ce_chg
    return {"net_flow": net, "direction": "BULLISH" if net > 0 else "BEARISH"}


# ---------------------------------------------------------------------------
# Aggressive Writing
# ---------------------------------------------------------------------------

def detect_aggressive_writing(chain: list[dict]) -> list[dict]:
    avg_vol = sum(r["volume"] for r in chain) / max(len(chain), 1)
    result = []
    for r in chain:
        if r["volume"] > avg_vol * 2 and r["oich"] > 0 and r["ltpch"] < 0:
            result.append({
                "strike": r["strike_price"],
                "option_type": r["option_type"],
                "volume": r["volume"],
                "oi_change": r["oich"],
                "ltp_change": r["ltpch"],
            })
    return result


# ---------------------------------------------------------------------------
# Breakout & Reversal
# ---------------------------------------------------------------------------

def detect_breakout(chain: list[dict], spot: float, resistance: int) -> dict:
    if spot <= resistance:
        return {"breakout": False}
    ce_at_res = next((r for r in chain if r["strike_price"] == resistance and r["option_type"] == "CE"), None)
    pe_above = [r for r in chain if r["option_type"] == "PE" and r["strike_price"] > resistance]

    ce_unwinding = ce_at_res and ce_at_res["oich"] < 0
    pe_building = any(r["oich"] > 0 for r in pe_above)

    confirmed = ce_unwinding and pe_building
    return {"breakout": confirmed, "resistance_crossed": resistance}


def detect_reversal(chain: list[dict], spot: float, support: int, resistance: int, smi_shift: str) -> dict:
    near_level = abs(spot - support) < 50 or abs(spot - resistance) < 50
    pe_rows = [r for r in chain if r["option_type"] == "PE" and r["oich"] > 0]
    vol_spike = any(r["volume"] > 50_000 for r in pe_rows)
    reversal = near_level and vol_spike and "BULLISH" in smi_shift
    return {"reversal": reversal}


# ---------------------------------------------------------------------------
# Futures Signals
# ---------------------------------------------------------------------------

def calc_futures_signals(futures: dict, prev_futures: Optional[dict] = None) -> dict:
    spot = futures.get("spot", 0)
    fut_ltp = futures.get("ltp", 0)
    fut_oi = futures.get("oi", 0)
    fut_vol = futures.get("volume", 0)
    prev_ltp = (prev_futures or {}).get("ltp", fut_ltp)
    prev_oi = (prev_futures or {}).get("oi", fut_oi)

    premium = round(fut_ltp - spot, 2)
    prev_premium = round(prev_ltp - (prev_futures or {}).get("spot", spot), 2) if prev_futures else premium
    premium_trend = "EXPANDING" if premium > prev_premium else ("SHRINKING" if premium < prev_premium else "FLAT")

    buildup = classify_buildup(fut_oi - prev_oi, fut_ltp - prev_ltp)

    # Futures score 0-100
    if "Long Buildup" in buildup and premium_trend == "EXPANDING":
        fscore = 90
    elif "Long Buildup" in buildup:
        fscore = 70
    elif "Short Covering" in buildup:
        fscore = 55
    elif "Long Unwinding" in buildup:
        fscore = 30
    elif "Short Buildup" in buildup and premium_trend == "SHRINKING":
        fscore = 10
    else:
        fscore = 45

    return {
        "premium": premium,
        "premium_trend": premium_trend,
        "buildup": buildup,
        "futures_score": fscore,
        "day_high": futures.get("high", 0),
        "day_low": futures.get("low", 0),
        "oi": fut_oi,
        "volume": fut_vol,
    }


def calc_smi_v2(options_smi: int, futures_score: int) -> int:
    return round(options_smi * 0.6 + futures_score * 0.4)


def detect_futures_divergence(options_bias: str, futures_buildup: str) -> dict:
    divergence = False
    message = ""
    if options_bias == "BULLISH" and "Short Buildup" in futures_buildup:
        divergence = True
        message = "Options BULLISH but Futures building SHORT → MAJOR BEAR TRAP / REVERSAL"
    elif options_bias == "BEARISH" and "Long Buildup" in futures_buildup:
        divergence = True
        message = "Options BEARISH but Futures building LONG → MAJOR BULL TRAP / REVERSAL"
    return {"divergence": divergence, "message": message}


# ---------------------------------------------------------------------------
# Confidence Score
# ---------------------------------------------------------------------------

def calc_confidence(smi: int, trap: str) -> int:
    score = smi
    if trap != "NONE":
        score -= 20
    return max(10, min(100, score))


# ---------------------------------------------------------------------------
# Master compute function
# ---------------------------------------------------------------------------

def compute_all_signals(chain: list[dict], futures: dict, expiry_date: date,
                        prev_futures=None, oi_spike_seen: set = None) -> dict:
    # Filter to active strikes only
    active = [r for r in chain if r["oi"] > 0 and r["strike_price"] > 0]

    spot = futures.get("spot", 0)

    # IV calculation
    for r in active:
        r["iv"] = calc_iv(r["ltp"], spot, r["strike_price"], expiry_date, r["option_type"])

    # Buildup + zone strength
    ce_ois = [r["oi"] for r in active if r["option_type"] == "CE"]
    pe_ois = [r["oi"] for r in active if r["option_type"] == "PE"]
    max_ce_oi = max(ce_ois, default=1)
    max_pe_oi = max(pe_ois, default=1)

    for r in active:
        r["buildup"] = classify_buildup(r["oich"], r["ltpch"])
        max_oi = max_ce_oi if r["option_type"] == "CE" else max_pe_oi
        r["zone_strength"] = zone_strength(r["oi"], max_oi)

    pcr_data = calc_pcr(active)
    sr = calc_support_resistance(active)
    smi = calc_smi(pcr_data, active)
    bias = market_bias(pcr_data["pcr_oi"])
    trap_data = detect_trap(active, pcr_data["pcr_oi"])
    max_pain = calc_max_pain(active)
    net_flow = calc_net_oi_flow(active)
    spikes = detect_oi_spikes(active, seen=oi_spike_seen)
    gamma = calc_gamma_exposure(active, spot)
    liquidity = calc_liquidity(active)
    aggressive = detect_aggressive_writing(active)
    breakout = detect_breakout(active, spot, sr["resistance"])
    reversal = detect_reversal(active, spot, sr["support"], sr["resistance"], smi_label(smi))
    futures_signals = calc_futures_signals(futures, prev_futures)
    divergence = detect_futures_divergence(bias, futures_signals["buildup"])
    smi_v2 = calc_smi_v2(smi, futures_signals["futures_score"])
    confidence = calc_confidence(smi, trap_data["trap"])

    return {
        "spot": spot,
        "expiry": str(expiry_date),
        "pcr": pcr_data,
        "support_resistance": sr,
        "smi": smi,
        "smi_label": smi_label(smi),
        "smi_v2": smi_v2,
        "bias": bias,
        "trap": trap_data,
        "max_pain": max_pain,
        "net_oi_flow": net_flow,
        "oi_spikes": spikes,
        "gamma_exposure": gamma,
        "liquidity": liquidity,
        "aggressive_writing": aggressive,
        "breakout": breakout,
        "reversal": reversal,
        "futures": futures_signals,
        "futures_divergence": divergence,
        "confidence": confidence,
        "chain": active,
        "timestamp": datetime.now().isoformat(),
    }
