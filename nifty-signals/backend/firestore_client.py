"""
Firestore persistence — signals snapshots, alerts log, token storage.
"""

import os
from datetime import datetime

try:
    from google.cloud import firestore
    _db = firestore.Client()
    FIRESTORE_AVAILABLE = True
except Exception:
    _db = None
    FIRESTORE_AVAILABLE = False


def _col(name: str):
    if not FIRESTORE_AVAILABLE or _db is None:
        return None
    return _db.collection(name)


async def save_snapshot(signals: dict):
    col = _col("signals_log")
    if col is None:
        return
    try:
        col.add({**signals, "saved_at": datetime.utcnow()})
    except Exception as e:
        print(f"Firestore save error: {e}")


async def save_alert(alert_type: str, message: str, spot: float):
    col = _col("alerts")
    if col is None:
        return
    try:
        col.add({
            "type": alert_type,
            "message": message,
            "spot": spot,
            "timestamp": datetime.utcnow(),
        })
    except Exception as e:
        print(f"Firestore alert error: {e}")


async def get_history(days: int = 1) -> list[dict]:
    col = _col("signals_log")
    if col is None:
        return []
    try:
        from datetime import timedelta
        since = datetime.utcnow() - timedelta(days=days)
        docs = col.where("saved_at", ">=", since).order_by("saved_at", direction=firestore.Query.DESCENDING).limit(500).stream()
        return [d.to_dict() for d in docs]
    except Exception as e:
        print(f"Firestore read error: {e}")
        return []


async def save_token_fs(token: str):
    col = _col("session_data")
    if col is None:
        return
    try:
        col.document("fyers_token").set({"token": token, "date": str(datetime.utcnow().date())})
    except Exception as e:
        print(f"Firestore token save error: {e}")


async def load_token_fs() -> str | None:
    col = _col("session_data")
    if col is None:
        return None
    try:
        doc = col.document("fyers_token").get()
        if doc.exists:
            data = doc.to_dict()
            if data.get("date") == str(datetime.utcnow().date()):
                return data.get("token")
    except Exception as e:
        print(f"Firestore token load error: {e}")
    return None
