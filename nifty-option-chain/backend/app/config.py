"""
Central configuration — reads from environment variables.
Copy .env.example to .env and fill in your values before running.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── Fyers API ──────────────────────────────────────────────────────────────
    FYERS_APP_ID: str = "I3BFKK1F13-100"
    FYERS_SECRET_KEY: str = "5FGZK2HOZ7"
    FYERS_REDIRECT_URI: str = "http://127.0.0.1"
    FYERS_API_BASE: str = "https://api-t1.fyers.in"

    # ── Telegram ───────────────────────────────────────────────────────────────
    TELEGRAM_BOT_TOKEN: str = "8700298836:AAFbY2CAsYmszj45P964zT5wlmhggcCXVl4"
    TELEGRAM_CHAT_ID: str = "8139493794"

    # ── Google Cloud ───────────────────────────────────────────────────────────
    GCP_PROJECT_ID: str = "nifty-signals"
    GOOGLE_APPLICATION_CREDENTIALS: str = ""   # path to service-account JSON

    # ── App behaviour ──────────────────────────────────────────────────────────
    REFRESH_INTERVAL_SECONDS: int = 30          # how often to poll Fyers
    OI_SPIKE_THRESHOLD: int = 100_000           # OI change that triggers alert
    IV_SPIKE_THRESHOLD_PCT: float = 20.0        # % IV jump that triggers alert
    SR_PROXIMITY_POINTS: int = 50               # how close to S/R for alert

    # ── CORS ───────────────────────────────────────────────────────────────────
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
