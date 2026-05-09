"""
Pydantic response models for FastAPI endpoints.
These define the exact JSON shape the frontend will receive.
"""

from pydantic import BaseModel
from typing import Optional


class FuturesSignalsModel(BaseModel):
    buildup: str
    premium: float
    premium_trend: str
    futures_score: int


class StrikeInfoModel(BaseModel):
    strike: float
    ce_oi: int
    ce_oi_change: int
    ce_volume: int
    ce_ltp: float
    ce_ltp_change: float
    ce_iv: float
    ce_buildup: str
    ce_zone_strength: str
    ce_liquidity_score: float
    pe_oi: int
    pe_oi_change: int
    pe_volume: int
    pe_ltp: float
    pe_ltp_change: float
    pe_iv: float
    pe_buildup: str
    pe_zone_strength: str
    pe_liquidity_score: float
    gamma_exposure: float


class SignalResultModel(BaseModel):
    spot: float
    expiry_date: str
    timestamp: str

    # PCR
    pcr_oi: float
    pcr_vol: float
    pcr_weighted: float

    # S/R
    resistance_strike: float
    support_strike: float
    resistance_zone: list[float]
    support_zone: list[float]

    # SMI
    smi: int
    smi_label: str
    smi_v2: int

    # Trap
    trap_type: str
    trap_probability: float

    # Bias
    market_bias: str
    confidence: int

    # Scalping
    oi_spike_strikes: list[dict]
    iv_spike_strikes: list[dict]

    # Other signals
    max_gamma_strike: float
    net_oi_flow: int
    net_oi_flow_label: str
    aggressive_writing_strikes: list[dict]
    breakout_confirmed: bool
    reversal_signal: bool
    max_pain: float

    # Futures
    futures: FuturesSignalsModel
    rollover_pct: float
    futures_vol_ratio: float

    # Detail
    strikes: list[StrikeInfoModel]


class AuthStatusModel(BaseModel):
    authenticated: bool
    message: str


class LoginUrlModel(BaseModel):
    login_url: str
    instructions: str


class HealthModel(BaseModel):
    status: str
    version: str
    authenticated: bool
