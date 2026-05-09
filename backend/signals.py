"""
Signal Engine — All 32 calculated signals for NIFTY Option Chain Intelligence System.
Inputs: raw option chain data from Fyers API + futures quote data.
Output: fully processed signals dict ready to send to frontend and Telegram.
"""
import math
import numpy as np
from datetime import datetime, date
from scipy.stats import norm
from typing import Optional

# ── CONSTANTS ────────────────────────────────────────────────────────────────
RISK_FREE_RATE = 0.065          # RBI repo rate approximation
OI_SPIKE_THRESHOLD = 100_000    # overridden from env in main.py
ACTIVE_OI_MIN = 1               # strikes with OI below this are skipped


# ── BLACK-SCHOLES HELPERS ────────────────────────────────────────────────────

def _bs_price(S: float, K: float, T: float, r: float, sigma: float, opt: str) -> float:
    """Theoretical option price from Black-Scholes."""
    if T <= 0 or sigma <= 0:
        return max(0.0, S - K) if opt == "CE" else max(0.0, K - S)
    d1 = (math.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)
    if opt == "CE":
        return S * norm.cdf(d1) - K * math.exp(-r * T) * norm.cdf(d2)
    return K * math.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)


def _bs_vega(S: float, K: float, T: float, r: float, sigma: float) -> float:
    if T <= 0 or sigma <= 0:
        return 0.0
    d1 = (math.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * math.sqrt(T))
    return S * norm.pdf(d1) * math.sqrt(T)


def calc_iv(market_price: float, S: float, K: float, T: float, opt: str) -> float:
    """
    Newton-Raphson implied volatility solver.
    Returns IV as a percentage (e.g. 18.5 means 18.5%).
    Returns 0.0 if price/time data is invalid.
    """
    if market_price <= 0.01 or T <= 0 or S <= 0 or K <= 0:
        return 0.0
    r = RISK_FREE_RATE
    sigma = 0.30  # start at 30%
    for _ in range(200):
        price = _bs_price(S, K, T, r, sigma, opt)
        vega = _bs_vega(S, K, T, r, sigma)
        if vega < 1e-10:
            break
        diff = price - market_price
        if abs(diff) < 1e-5:
            break
        sigma -= diff / vega
        sigma = max(0.001, min(sigma, 10.0))  # clamp [0.1%, 1000%]
    return round(sigma * 100, 2)


def _days_to_expiry(expiry_str: str) -> float:
    """Return fraction-of-year to expiry. expiry_str format: YYYY-MM-DD."""
    try:
        exp = date.fromisoformat(expiry_str)
        today = date.today()
        days = (exp - today).days
        return max(days, 0) / 365.0
    except Exception:
        return 0.0


# ── OI BUILDUP CLASSIFIER ────────────────────────────────────────────────────

def oi_buildup(oi_change: float, ltp_change: float) -> str:
    if oi_change > 0 and ltp_change >= 0:
        return "Long Buildup"       # buyers adding positions
    if oi_change > 0 and ltp_change < 0:
        return "Short Buildup"      # writers selling options (bearish for CE, bullish for PE)
    if oi_change < 0 and ltp_change >= 0:
        return "Short Covering"     # shorts exiting
    if oi_change < 0 and ltp_change < 0:
        return "Long Unwinding"     # longs exiting
    return "Neutral"


# ── ZONE STRENGTH ────────────────────────────────────────────────────────────

def zone_strength(strike_oi: float, max_oi: float) -> str:
    if max_oi <= 0:
        return "NEGLIGIBLE"
    pct = strike_oi / max_oi
    if pct >= 0.75:
        return "STRONG"
    if pct >= 0.45:
        return "MODERATE"
    if pct >= 0.20:
        return "WEAK"
    return "NEGLIGIBLE"


# ── MAIN SIGNAL ENGINE ────────────────────────────────────────────────────────

class SignalEngine:
    def __init__(self, oi_spike_threshold: int = OI_SPIKE_THRESHOLD):
        self.oi_spike_threshold = oi_spike_threshold
        # tracks which strikes have already fired an OI spike alert this session
        self._alerted_spikes: set = set()
        self._prev_signals: dict = {}    # for trend comparisons
        self._prev_futures: dict = {}

    def reset_session(self):
        """Call this at market open (9:15 IST) to clear intra-session state."""
        self._alerted_spikes.clear()
        self._prev_signals.clear()
        self._prev_futures.clear()

    # ── PUBLIC ENTRY POINT ────────────────────────────────────────────────────

    def process(
        self,
        raw_chain: list[dict],
        expiry: str,
        futures_quote: Optional[dict] = None,
        session_oi_history: Optional[list] = None,
    ) -> dict:
        """
        Process raw Fyers option chain rows + optional futures quote.
        Returns a complete signals dict.
        """
        spot = self._extract_spot(raw_chain)
        T = _days_to_expiry(expiry)

        # Build per-strike maps
        ce_map: dict[float, dict] = {}
        pe_map: dict[float, dict] = {}
        for row in raw_chain:
            sp = float(row.get("strike_price", 0))
            if sp <= 0:
                continue
            oi = float(row.get("oi", 0))
            if oi < ACTIVE_OI_MIN:
                continue
            entry = {
                "oi":       oi,
                "oich":     float(row.get("oich", 0)),
                "volume":   float(row.get("volume", 0)),
                "ltp":      float(row.get("ltp", 0)),
                "ltpch":    float(row.get("ltpch", 0)),
                "prev_oi":  float(row.get("prev_oi", 0)),
                "symbol":   row.get("symbol", ""),
                "iv":       calc_iv(float(row.get("ltp", 0)), spot, sp, T,
                                    row.get("option_type", "CE")),
            }
            if row.get("option_type") == "CE":
                ce_map[sp] = entry
            elif row.get("option_type") == "PE":
                pe_map[sp] = entry

        strikes_sorted = sorted(set(ce_map) | set(pe_map))

        # Aggregate totals
        total_ce_oi  = sum(v["oi"]     for v in ce_map.values())
        total_pe_oi  = sum(v["oi"]     for v in pe_map.values())
        total_ce_vol = sum(v["volume"] for v in ce_map.values())
        total_pe_vol = sum(v["volume"] for v in pe_map.values())
        net_ce_oich  = sum(v["oich"]   for v in ce_map.values())
        net_pe_oich  = sum(v["oich"]   for v in pe_map.values())

        max_ce_oi = max((v["oi"] for v in ce_map.values()), default=0)
        max_pe_oi = max((v["oi"] for v in pe_map.values()), default=0)

        # ── SIGNALS 1-3: PCR ─────────────────────────────────────────────────
        pcr_oi  = round(total_pe_oi  / total_ce_oi,  3) if total_ce_oi  > 0 else 0
        pcr_vol = round(total_pe_vol / total_ce_vol, 3) if total_ce_vol > 0 else 0
        w_pe = total_pe_oi * total_pe_vol
        w_ce = total_ce_oi * total_ce_vol
        weighted_pcr = round(w_pe / w_ce, 3) if w_ce > 0 else 0

        # ── SIGNALS 7-8: Support & Resistance ────────────────────────────────
        resistance = max(ce_map, key=lambda s: ce_map[s]["oi"], default=0)
        support    = max(pe_map, key=lambda s: pe_map[s]["oi"], default=0)

        # ── SIGNALS 9-10: Cluster-based S/R zones (top 3 consecutive) ────────
        resistance_zone = self._cluster_zone(ce_map, n=3)
        support_zone    = self._cluster_zone(pe_map, n=3)

        # ── SIGNAL 11: Smart Money Index (SMI) ───────────────────────────────
        smi, smi_label = self._calc_smi(pcr_oi, net_pe_oich, net_ce_oich, pcr_vol, max_pe_oi, max_ce_oi)

        # ── SIGNAL 14: Market Bias ────────────────────────────────────────────
        bias = "BULLISH" if pcr_oi > 1.3 else ("BEARISH" if pcr_oi < 0.7 else "NEUTRAL")

        # ── SIGNALS 12-13: Trap detection ────────────────────────────────────
        trap_type, trap_prob = self._detect_trap(ce_map, pe_map, pcr_oi, spot, resistance, support)

        # ── SIGNAL 15: Confidence ─────────────────────────────────────────────
        confidence = max(10, min(100, smi - (20 if trap_type else 0)))

        # ── SIGNAL 21: Max Pain ───────────────────────────────────────────────
        max_pain = self._calc_max_pain(ce_map, pe_map, strikes_sorted)

        # ── SIGNAL 22: Net OI Flow ────────────────────────────────────────────
        net_oi_flow = int(net_pe_oich - net_ce_oich)

        # ── SIGNAL 16: OI Spike Alerts ───────────────────────────────────────
        oi_spikes = self._detect_oi_spikes(ce_map, pe_map)

        # ── SIGNAL 23: Aggressive Writing ────────────────────────────────────
        aggressive_writing = self._detect_aggressive_writing(ce_map, pe_map, total_ce_vol, total_pe_vol)

        # ── SIGNAL 24: Breakout ───────────────────────────────────────────────
        breakout = self._detect_breakout(spot, resistance, ce_map, pe_map)

        # ── SIGNAL 25: Reversal ───────────────────────────────────────────────
        reversal = self._detect_reversal(spot, support, resistance, ce_map, pe_map, smi)

        # ── Build per-strike table rows ───────────────────────────────────────
        strike_rows = []
        for sp in strikes_sorted:
            ce = ce_map.get(sp, {})
            pe = pe_map.get(sp, {})
            gamma_w = 1 / (1 + abs(sp - spot) / 100) if spot > 0 else 0
            ce_vol_total = total_ce_vol or 1
            pe_vol_total = total_pe_vol or 1
            strike_rows.append({
                "strike": sp,
                "atm": (spot > 0 and abs(sp - spot) < 100),  # within 100 pts of spot
                "ce": {
                    **ce,
                    "buildup":      oi_buildup(ce.get("oich", 0), ce.get("ltpch", 0)),
                    "zone_strength": zone_strength(ce.get("oi", 0), max_ce_oi),
                } if ce else None,
                "pe": {
                    **pe,
                    "buildup":      oi_buildup(pe.get("oich", 0), pe.get("ltpch", 0)),
                    "zone_strength": zone_strength(pe.get("oi", 0), max_pe_oi),
                } if pe else None,
                # SIGNAL 18: Gamma exposure (simplified)
                "gamma_exposure": round(
                    ((ce.get("oi", 0) + pe.get("oi", 0)) * gamma_w) / 1_000_000, 3
                ),
                # SIGNAL 19: Liquidity score
                "liquidity_score": round(
                    ((ce.get("volume", 0) / ce_vol_total) + (pe.get("volume", 0) / pe_vol_total)) * 50, 2
                ),
            })

        # ── FUTURES SIGNALS ───────────────────────────────────────────────────
        futures_signals = {}
        if futures_quote:
            futures_signals = self._process_futures(futures_quote, spot, smi)

        # ── SIGNAL 20: Session Behavior ───────────────────────────────────────
        session_info = self._session_behavior(session_oi_history)

        result = {
            "spot":       round(spot, 2),
            "expiry":     expiry,
            "timestamp":  datetime.now().isoformat(),
            "strikes":    strike_rows,
            "signals": {
                "pcr_oi":           pcr_oi,
                "pcr_vol":          pcr_vol,
                "weighted_pcr":     weighted_pcr,
                "resistance":       resistance,
                "support":          support,
                "resistance_zone":  resistance_zone,
                "support_zone":     support_zone,
                "smi":              smi,
                "smi_label":        smi_label,
                "bias":             bias,
                "trap_type":        trap_type,
                "trap_probability": trap_prob,
                "confidence":       confidence,
                "max_pain":         max_pain,
                "net_oi_flow":      net_oi_flow,
                "oi_spikes":        oi_spikes,
                "aggressive_writing": aggressive_writing,
                "breakout_signal":  breakout,
                "reversal_signal":  reversal,
                "total_ce_oi":      int(total_ce_oi),
                "total_pe_oi":      int(total_pe_oi),
                "total_ce_vol":     int(total_ce_vol),
                "total_pe_vol":     int(total_pe_vol),
            },
            "futures":         futures_quote or {},
            "futures_signals": futures_signals,
            "session":         session_info,
        }

        # Save snapshot for next-cycle trend comparison
        self._prev_signals = result["signals"].copy()
        self._prev_futures = futures_signals.copy()
        return result

    # ── PRIVATE HELPERS ───────────────────────────────────────────────────────

    def _extract_spot(self, raw_chain: list[dict]) -> float:
        for row in raw_chain:
            if float(row.get("strike_price", 0)) == -1:
                return float(row.get("ltp", 0))
        return 0.0

    def _cluster_zone(self, oi_map: dict[float, dict], n: int = 3) -> list[float]:
        """Return top-n consecutive strikes by OI."""
        if not oi_map:
            return []
        sorted_by_oi = sorted(oi_map, key=lambda s: oi_map[s]["oi"], reverse=True)
        if len(sorted_by_oi) <= n:
            return sorted(sorted_by_oi)
        # pick top strike, then try to extend with adjacent strikes
        zone = [sorted_by_oi[0]]
        for s in sorted_by_oi[1:]:
            if len(zone) >= n:
                break
            # check if adjacent (within 100 pts) to any strike already in zone
            if any(abs(s - z) <= 100 for z in zone):
                zone.append(s)
        return sorted(zone)

    def _calc_smi(
        self,
        pcr_oi: float,
        net_pe_oich: float,
        net_ce_oich: float,
        pcr_vol: float,
        max_pe_oi: float,
        max_ce_oi: float,
    ) -> tuple[int, str]:
        """Signal 11: Smart Money Index 0-100."""
        # a) PCR Score (30 pts)
        if pcr_oi > 1.5:  a = 30
        elif pcr_oi > 1.2: a = 24
        elif pcr_oi > 0.9: a = 18
        elif pcr_oi > 0.7: a = 10
        else:              a = 4

        # b) OI Buildup Score (30 pts)
        net_flow = net_pe_oich - net_ce_oich
        if net_flow > 500_000:  b = 30
        elif net_flow > 100_000: b = 23
        elif net_flow > 0:       b = 17
        elif net_flow > -100_000: b = 10
        else:                     b = 4

        # c) Volume Score (20 pts)
        if pcr_vol > 1.3:  c = 20
        elif pcr_vol > 1.0: c = 15
        elif pcr_vol > 0.8: c = 10
        else:               c = 4

        # d) Zone Score (20 pts)
        zone_ratio = (max_pe_oi / max_ce_oi) if max_ce_oi > 0 else 0
        if zone_ratio > 1.5:  d = 20
        elif zone_ratio > 1.1: d = 15
        elif zone_ratio > 0.8: d = 10
        else:                   d = 4

        smi = a + b + c + d

        if smi >= 70:   label = "STRONG BULLISH"
        elif smi >= 55: label = "MILDLY BULLISH"
        elif smi >= 45: label = "NEUTRAL"
        elif smi >= 30: label = "MILDLY BEARISH"
        else:           label = "STRONG BEARISH"

        return smi, label

    def _detect_trap(
        self,
        ce_map: dict,
        pe_map: dict,
        pcr: float,
        spot: float,
        resistance: float,
        support: float,
    ) -> tuple[Optional[str], int]:
        """Signals 12-13: Trap type and probability."""
        trap_type = None
        prob = 0

        if ce_map:
            top_ce_oich = max(v["oich"] for v in ce_map.values())
            if top_ce_oich > 50_000 and pcr < 0.8:
                trap_type = "Bull Trap"
                prob = min(100, int(40 + (top_ce_oich / 10_000) + (0.8 - pcr) * 60))

        if pe_map and not trap_type:
            top_pe_oich = max(v["oich"] for v in pe_map.values())
            if top_pe_oich > 50_000 and pcr > 1.2:
                trap_type = "Bear Trap"
                prob = min(100, int(40 + (top_pe_oich / 10_000) + (pcr - 1.2) * 60))

        return trap_type, prob

    def _calc_max_pain(
        self,
        ce_map: dict,
        pe_map: dict,
        strikes: list,
    ) -> float:
        """Signal 21: Max Pain — strike where option buyers lose the most."""
        if not strikes:
            return 0.0
        min_pain = float("inf")
        max_pain_strike = strikes[0]
        for K in strikes:
            pain_ce = sum(max(0, K - s) * ce_map[s]["oi"] for s in ce_map)
            pain_pe = sum(max(0, s - K) * pe_map[s]["oi"] for s in pe_map)
            total = pain_ce + pain_pe
            if total < min_pain:
                min_pain = total
                max_pain_strike = K
        return max_pain_strike

    def _detect_oi_spikes(self, ce_map: dict, pe_map: dict) -> list[dict]:
        """Signal 16: New OI spikes not yet alerted this session."""
        spikes = []
        for sp, v in {**ce_map, **pe_map}.items():
            key = f"{sp}-{v.get('symbol', '')}"
            if abs(v["oich"]) >= self.oi_spike_threshold and key not in self._alerted_spikes:
                self._alerted_spikes.add(key)
                spikes.append({
                    "strike":  sp,
                    "symbol":  v["symbol"],
                    "oich":    int(v["oich"]),
                    "buildup": oi_buildup(v["oich"], v["ltpch"]),
                    "action":  "Watch for direction confirmation",
                })
        return spikes

    def _detect_aggressive_writing(
        self,
        ce_map: dict,
        pe_map: dict,
        total_ce_vol: float,
        total_pe_vol: float,
    ) -> list[dict]:
        """Signal 23: Institutional option writing detection."""
        results = []
        n = len(ce_map) or 1
        avg_ce_vol = total_ce_vol / n
        avg_pe_vol = total_pe_vol / (len(pe_map) or 1)

        for sp, v in ce_map.items():
            if (v["volume"] > 2 * avg_ce_vol and v["oich"] > 0 and v["ltpch"] < 0):
                results.append({"strike": sp, "type": "CE", "action": "Aggressive CE Writing (Bearish)"})
        for sp, v in pe_map.items():
            if (v["volume"] > 2 * avg_pe_vol and v["oich"] > 0 and v["ltpch"] < 0):
                results.append({"strike": sp, "type": "PE", "action": "Aggressive PE Writing (Bullish)"})
        return results

    def _detect_breakout(self, spot: float, resistance: float, ce_map: dict, pe_map: dict) -> bool:
        """Signal 24: Confirmed breakout (not fake)."""
        if spot <= 0 or resistance <= 0:
            return False
        if spot < resistance - 50:   # spot hasn't crossed resistance yet
            return False
        ce_unwinding = ce_map.get(resistance, {}).get("oich", 0) < 0
        pe_building  = any(v["oich"] > 10_000 for s, v in pe_map.items() if s >= resistance - 100)
        return ce_unwinding and pe_building

    def _detect_reversal(
        self,
        spot: float,
        support: float,
        resistance: float,
        ce_map: dict,
        pe_map: dict,
        smi: int,
    ) -> bool:
        """Signal 25: High-probability reversal."""
        if spot <= 0:
            return False
        near_support    = support > 0 and abs(spot - support) < 75
        near_resistance = resistance > 0 and abs(spot - resistance) < 75
        if not (near_support or near_resistance):
            return False
        opposite_building = (
            any(v["oich"] > 20_000 for v in (pe_map if near_resistance else ce_map).values())
        )
        smi_shifting = self._prev_signals and abs(smi - self._prev_signals.get("smi", smi)) >= 5
        return opposite_building and smi_shifting

    def _process_futures(self, fq: dict, spot: float, options_smi: int) -> dict:
        """Signals 26-32: Futures-based signals."""
        ltp    = float(fq.get("ltp", 0))
        oi     = float(fq.get("oi", 0))
        oich   = float(fq.get("oich", 0))
        vol    = float(fq.get("volume", 0))
        avg5   = float(fq.get("avg_5day_vol", vol or 1))
        prev_ltp = float(self._prev_futures.get("ltp", ltp))

        # 26: Futures buildup
        price_dir = ltp - prev_ltp
        fut_buildup = oi_buildup(oich, price_dir)

        # 27: Premium
        premium = round(ltp - spot, 2) if spot > 0 else 0

        # 28: Premium trend
        prev_premium = self._prev_futures.get("premium", premium)
        if premium > prev_premium + 2:
            premium_trend = "Expanding"
        elif premium < prev_premium - 2:
            premium_trend = "Shrinking"
        else:
            premium_trend = "Flat"

        # 29: Futures ↔ Options divergence
        divergence = None
        if options_smi >= 55 and fut_buildup == "Short Buildup":
            divergence = "⚠ Options BULLISH but Futures SHORT — Major Bear Trap risk"
        elif options_smi <= 35 and fut_buildup == "Long Buildup":
            divergence = "⚠ Options BEARISH but Futures LONG — Major Bull Trap risk"

        # 30: Combined SMI v2
        fut_score_map = {
            "Long Buildup": 80 if premium_trend == "Expanding" else 65,
            "Short Covering": 55,
            "Long Unwinding": 35,
            "Short Buildup": 15 if premium_trend == "Shrinking" else 30,
            "Neutral": 45,
        }
        fut_score = fut_score_map.get(fut_buildup, 45)
        smi_v2 = round(options_smi * 0.6 + fut_score * 0.4)

        # 32: Volume ratio
        vol_ratio = round(vol / avg5, 2) if avg5 > 0 else 1.0

        return {
            "buildup":       fut_buildup,
            "premium":       premium,
            "premium_trend": premium_trend,
            "divergence":    divergence,
            "smi_v2":        smi_v2,
            "vol_ratio":     vol_ratio,
        }

    def _session_behavior(self, history: Optional[list]) -> dict:
        """Signal 20: Session phase and institutional behavior observation."""
        now = datetime.now()
        hour = now.hour
        minute = now.minute
        t = hour * 60 + minute

        if 555 <= t < 600:
            phase = "Opening (9:15–10:00)"
        elif 720 <= t < 780:
            phase = "Mid-day (12:00–13:00)"
        elif 870 <= t <= 930:
            phase = "Closing (14:30–15:30)"
        else:
            phase = "Regular"

        if not history or len(history) < 2:
            return {"phase": phase, "observation": "Insufficient data for session analysis"}

        first_oi  = history[0].get("total_oi", 0)
        latest_oi = history[-1].get("total_oi", 0)
        delta = latest_oi - first_oi

        if delta > 500_000:
            obs = "Institutions accumulating positions"
        elif delta < -500_000:
            obs = "Institutions exiting positions"
        else:
            obs = "Positions stable — retail-driven movement"

        return {"phase": phase, "observation": obs}

    # ── ALERT TRIGGER CHECKER ─────────────────────────────────────────────────

    def check_alerts(self, current: dict) -> list[dict]:
        """
        Compare current signals against previous snapshot and return
        list of triggered alerts. Each alert has: type, message, data.
        """
        alerts = []
        sig = current.get("signals", {})
        fut_sig = current.get("futures_signals", {})
        prev = self._prev_signals

        smi = sig.get("smi", 50)
        prev_smi = prev.get("smi", 50) if prev else 50

        # 1: SMI Level
        if (smi >= 70 and prev_smi < 70) or (smi < 30 and prev_smi >= 30):
            alerts.append({"type": "SMI_LEVEL", "smi": smi, "label": sig.get("smi_label")})

        # 2: Bias change
        if prev and sig.get("bias") != prev.get("bias"):
            alerts.append({"type": "BIAS_CHANGE", "from": prev.get("bias"), "to": sig.get("bias")})

        # 3: Trap detected
        if sig.get("trap_type"):
            alerts.append({"type": "TRAP", "trap_type": sig["trap_type"], "probability": sig.get("trap_probability", 0)})

        # 4: OI spikes
        for spike in sig.get("oi_spikes", []):
            alerts.append({"type": "OI_SPIKE", **spike})

        # 7: Breakout
        if sig.get("breakout_signal") and not prev.get("breakout_signal"):
            alerts.append({"type": "BREAKOUT", "direction": sig.get("bias"), "resistance": sig.get("resistance")})

        # 9: Futures divergence
        if fut_sig.get("divergence"):
            alerts.append({"type": "FUTURES_DIVERGENCE", "message": fut_sig["divergence"]})

        # 6: S/R test (spot within 50 pts of key level)
        spot = current.get("spot", 0)
        for level_name, level in [("resistance", sig.get("resistance", 0)), ("support", sig.get("support", 0))]:
            if level and spot and abs(spot - level) <= 50:
                alerts.append({"type": "SR_TEST", "level_type": level_name, "level": level, "spot": spot})

        return alerts
