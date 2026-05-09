"""
Firestore database layer.

Collections:
  signals_log   — every computed signal snapshot (TTL: 30 days)
  session_data  — OI snapshots at opening/mid-day/closing windows
  alerts        — log of every Telegram alert sent
"""

import logging
from datetime import datetime, timezone
from typing import Any

from .config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Lazy import — only needed when running on GCP
_db = None


def _get_db():
    global _db
    if _db is None:
        try:
            from google.cloud import firestore
            _db = firestore.Client(project=settings.GCP_PROJECT_ID)
        except Exception as e:
            logger.warning(f"Firestore unavailable (running locally?): {e}")
            _db = None
    return _db


# ─────────────────────────────────────────────────────────────────────────────
# Write helpers
# ─────────────────────────────────────────────────────────────────────────────

def log_signal(signal_data: dict) -> None:
    """Save a signal snapshot to signals_log collection."""
    db = _get_db()
    if not db:
        return
    try:
        signal_data["timestamp"] = datetime.now(timezone.utc)
        db.collection("signals_log").add(signal_data)
    except Exception as e:
        logger.error(f"Firestore write error (signals_log): {e}")


def log_alert(alert_type: str, message: str, metadata: dict | None = None) -> None:
    """Log every sent Telegram alert."""
    db = _get_db()
    if not db:
        return
    try:
        db.collection("alerts").add({
            "type": alert_type,
            "message": message,
            "metadata": metadata or {},
            "timestamp": datetime.now(timezone.utc),
        })
    except Exception as e:
        logger.error(f"Firestore write error (alerts): {e}")


def save_session_snapshot(session_name: str, signal_data: dict) -> None:
    """
    Save OI snapshot for opening / mid-day / closing analysis (Signal 20).
    Document ID: YYYY-MM-DD_{session_name}
    """
    db = _get_db()
    if not db:
        return
    try:
        doc_id = f"{datetime.now().date().isoformat()}_{session_name}"
        signal_data["session"] = session_name
        signal_data["timestamp"] = datetime.now(timezone.utc)
        db.collection("session_data").document(doc_id).set(signal_data)
    except Exception as e:
        logger.error(f"Firestore write error (session_data): {e}")


# ─────────────────────────────────────────────────────────────────────────────
# Read helpers
# ─────────────────────────────────────────────────────────────────────────────

def get_recent_signals(limit: int = 100) -> list[dict]:
    """Return the most recent signal snapshots (for the historical log table)."""
    db = _get_db()
    if not db:
        return []
    try:
        docs = (
            db.collection("signals_log")
            .order_by("timestamp", direction="DESCENDING")
            .limit(limit)
            .stream()
        )
        return [{"id": d.id, **d.to_dict()} for d in docs]
    except Exception as e:
        logger.error(f"Firestore read error: {e}")
        return []


def get_session_snapshots(date_str: str | None = None) -> dict:
    """Return opening / mid-day / closing snapshots for a given date."""
    db = _get_db()
    if not db:
        return {}
    if date_str is None:
        date_str = datetime.now().date().isoformat()
    result = {}
    for session in ["OPENING", "MID_DAY", "CLOSING"]:
        try:
            doc = db.collection("session_data").document(f"{date_str}_{session}").get()
            if doc.exists:
                result[session] = doc.to_dict()
        except Exception as e:
            logger.error(f"Firestore read error ({session}): {e}")
    return result
