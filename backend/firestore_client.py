"""
Firestore client — persists snapshots, alerts, token, and session OI history.
All operations fail gracefully — if Firestore is unavailable the app still works,
just without persistence.
"""
import os
import logging
from datetime import datetime, date
from typing import Optional

logger = logging.getLogger(__name__)

_db = None   # lazy-initialized


def _get_db():
    global _db
    if _db is not None:
        return _db
    try:
        from google.cloud import firestore
        project = os.getenv("GCP_PROJECT_ID", "nifty-signals")
        _db = firestore.Client(project=project)
        logger.info("Firestore connected to project: %s", project)
    except Exception as e:
        logger.warning("Firestore unavailable (running without persistence): %s", e)
        _db = False   # mark as explicitly unavailable
    return _db


def _available() -> bool:
    return _get_db() not in (None, False)


# ── TOKEN ─────────────────────────────────────────────────────────────────────

def save_token(token: str):
    if not _available():
        return
    try:
        _get_db().collection("config").document("fyers_token").set({
            "token": token,
            "date":  str(date.today()),
            "updated_at": datetime.utcnow(),
        })
    except Exception as e:
        logger.error("save_token failed: %s", e)


def load_token() -> Optional[str]:
    if not _available():
        return None
    try:
        doc = _get_db().collection("config").document("fyers_token").get()
        if doc.exists:
            data = doc.to_dict()
            if data.get("date") == str(date.today()):
                return data.get("token")
    except Exception as e:
        logger.error("load_token failed: %s", e)
    return None


# ── SIGNALS SNAPSHOT ──────────────────────────────────────────────────────────

def save_snapshot(data: dict):
    """
    Save a processed signals snapshot to Firestore for historical log.
    Stored under: signals_log/{YYYY-MM-DD}/{HH:MM:SS}
    """
    if not _available():
        return
    try:
        ts = datetime.utcnow()
        day_key  = ts.strftime("%Y-%m-%d")
        time_key = ts.strftime("%H:%M:%S")
        # Store a compact version (not full strike table — too large)
        snapshot = {
            "timestamp":  data.get("timestamp"),
            "spot":       data.get("spot"),
            "expiry":     data.get("expiry"),
            "signals":    data.get("signals", {}),
            "futures":    data.get("futures", {}),
            "futures_signals": data.get("futures_signals", {}),
            "session":    data.get("session", {}),
            "total_oi":   (
                data.get("signals", {}).get("total_ce_oi", 0) +
                data.get("signals", {}).get("total_pe_oi", 0)
            ),
        }
        _get_db().collection("signals_log").document(day_key)\
            .collection("snapshots").document(time_key).set(snapshot)
    except Exception as e:
        logger.error("save_snapshot failed: %s", e)


def get_today_history(limit: int = 50) -> list[dict]:
    """Fetch today's signal snapshots for session behavior analysis."""
    if not _available():
        return []
    try:
        day_key = date.today().strftime("%Y-%m-%d")
        docs = (
            _get_db().collection("signals_log").document(day_key)
            .collection("snapshots")
            .order_by("timestamp")
            .limit(limit)
            .stream()
        )
        return [d.to_dict() for d in docs]
    except Exception as e:
        logger.error("get_today_history failed: %s", e)
        return []


def get_historical_log(days: int = 7, limit_per_day: int = 10) -> list[dict]:
    """Fetch summary rows for the historical log table on the dashboard."""
    if not _available():
        return []
    results = []
    try:
        from datetime import timedelta
        today = date.today()
        db = _get_db()
        for i in range(days):
            day = (today - timedelta(days=i)).strftime("%Y-%m-%d")
            docs = (
                db.collection("signals_log").document(day)
                .collection("snapshots")
                .order_by("timestamp", direction="DESCENDING")
                .limit(limit_per_day)
                .stream()
            )
            results.extend(d.to_dict() for d in docs)
    except Exception as e:
        logger.error("get_historical_log failed: %s", e)
    return results


# ── ALERTS LOG ────────────────────────────────────────────────────────────────

def save_alert(alert: dict):
    """Persist each triggered alert for audit trail."""
    if not _available():
        return
    try:
        _get_db().collection("alerts").add({
            **alert,
            "fired_at": datetime.utcnow(),
        })
    except Exception as e:
        logger.error("save_alert failed: %s", e)


# ── SESSION DATA ──────────────────────────────────────────────────────────────

def save_session_point(total_oi: int):
    """Store an OI reading for session behavior analysis (Signal 20)."""
    if not _available():
        return
    try:
        day_key = date.today().strftime("%Y-%m-%d")
        _get_db().collection("session_data").document(day_key)\
            .collection("oi_log").add({
                "total_oi":  total_oi,
                "timestamp": datetime.utcnow(),
            })
    except Exception as e:
        logger.error("save_session_point failed: %s", e)
