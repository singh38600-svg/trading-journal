"""
CSV Import — Bulk-load historical Fyers tradebook into your journal.
Auto-detects column names from common Fyers export formats.
"""
import streamlit as st
import pandas as pd
import numpy as np
from datetime import datetime
from supabase import create_client
import os
import io

st.set_page_config(page_title="Import CSV", page_icon="📥", layout="wide")

# Reuse global styling
st.markdown("""
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Geist:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
    .stApp { background: #0a0e1a; }
    html, body, [class*="css"] { font-family: 'Geist', sans-serif !important; color: #f8fafc; }
    h1 { font-family: 'Fraunces', serif !important; font-weight: 400 !important; font-size: 3rem !important; letter-spacing: -0.03em !important; color: #f8fafc !important; }
    h3 { font-family: 'Geist', sans-serif !important; font-weight: 500 !important; font-size: 0.75rem !important; letter-spacing: 0.15em !important; text-transform: uppercase !important; color: #64748b !important; }
    .panel { background: #131826; border: 1px solid #1f2937; border-radius: 14px; padding: 24px; }
    .stButton > button { background: #5eead4 !important; color: #0a0e1a !important; border: none !important; border-radius: 10px !important; font-weight: 600 !important; }
    [data-testid="stMetric"] { background: #131826; border: 1px solid #1f2937; border-radius: 12px; padding: 16px; }
    .stAlert { background: #131826 !important; border: 1px solid #1f2937 !important; border-radius: 12px !important; }
    [data-testid="stFileUploader"] { background: #131826; border: 2px dashed #1f2937; border-radius: 14px; padding: 20px; }
    .hero-eyebrow { font-size: 0.7rem; letter-spacing: 0.25em; text-transform: uppercase; color: #5eead4; margin-bottom: 0.5rem; }
</style>
""", unsafe_allow_html=True)

SUPABASE_URL = st.secrets.get("SUPABASE_URL", os.getenv("SUPABASE_URL", ""))
SUPABASE_KEY = st.secrets.get("SUPABASE_KEY", os.getenv("SUPABASE_KEY", ""))

@st.cache_resource
def get_db():
    if not SUPABASE_URL or not SUPABASE_KEY: return None
    return create_client(SUPABASE_URL, SUPABASE_KEY)

db = get_db()

# ── HEADER ──
st.markdown('<div class="hero-eyebrow">◈ Bulk Import</div>', unsafe_allow_html=True)
st.markdown('<h1>Import historical trades.</h1>', unsafe_allow_html=True)
st.markdown('<div style="color:#94a3b8; max-width:680px; margin-top:8px;">Drop your Fyers tradebook CSV here. Columns are auto-detected — works with standard Fyers exports.</div>', unsafe_allow_html=True)

st.markdown("<div style='height:32px;'></div>", unsafe_allow_html=True)

# ── HOW TO ──
with st.expander("📖 How to export from Fyers"):
    st.markdown("""
    1. Go to **myaccount.fyers.in** and log in
    2. Navigate to **Reports → Tradebook** (or Profit & Loss)
    3. Set your date range (you can do years at once)
    4. Click **Export to Excel/CSV**
    5. Drop the downloaded file below
    """)

# ── UPLOAD ──
uploaded = st.file_uploader("Upload CSV", type=["csv", "xlsx", "xls"], label_visibility="collapsed")

if uploaded:
    try:
        if uploaded.name.endswith(".csv"):
            raw = pd.read_csv(uploaded)
        else:
            raw = pd.read_excel(uploaded)
    except Exception as e:
        st.error(f"Could not read file: {e}")
        st.stop()

    st.markdown("<h3>Preview</h3>", unsafe_allow_html=True)
    st.dataframe(raw.head(10), use_container_width=True, hide_index=True)
    st.caption(f"{len(raw)} rows · {len(raw.columns)} columns detected")

    # ── COLUMN MAPPING (auto-detect with manual override) ──
    st.markdown("<h3>Column Mapping</h3>", unsafe_allow_html=True)

    cols = list(raw.columns)
    cols_lower = {c.lower().strip(): c for c in cols}

    def auto(*names):
        for n in names:
            for k, v in cols_lower.items():
                if n in k:
                    return v
        return None

    col_symbol = auto("symbol", "scrip", "instrument")
    col_side = auto("side", "buy/sell", "transaction", "type")
    col_qty = auto("traded qty", "quantity", "qty", "filled")
    col_price = auto("trade price", "avg price", "price")
    col_pnl = auto("p&l", "pnl", "profit", "net p")
    col_time = auto("trade date", "order time", "date", "time", "timestamp")
    col_fees = auto("brokerage", "fees", "charges", "commission")

    mc1, mc2, mc3 = st.columns(3)
    with mc1:
        col_symbol = st.selectbox("Symbol column", [None] + cols, index=(cols.index(col_symbol)+1) if col_symbol in cols else 0)
        col_side = st.selectbox("Side (Buy/Sell) column", [None] + cols, index=(cols.index(col_side)+1) if col_side in cols else 0)
        col_time = st.selectbox("Date/Time column", [None] + cols, index=(cols.index(col_time)+1) if col_time in cols else 0)
    with mc2:
        col_qty = st.selectbox("Quantity column", [None] + cols, index=(cols.index(col_qty)+1) if col_qty in cols else 0)
        col_price = st.selectbox("Price column", [None] + cols, index=(cols.index(col_price)+1) if col_price in cols else 0)
        col_fees = st.selectbox("Fees/Brokerage column (optional)", [None] + cols, index=(cols.index(col_fees)+1) if col_fees in cols else 0)
    with mc3:
        col_pnl = st.selectbox("P&L column (optional)", [None] + cols, index=(cols.index(col_pnl)+1) if col_pnl in cols else 0)
        compute_pnl = st.checkbox("Auto-compute P&L from buy/sell pairs (FIFO)", value=col_pnl is None, help="If your CSV doesn't have a P&L column, we pair buy/sell fills FIFO per symbol")
        clear_first = st.checkbox("Clear existing trades before import", value=False, help="Wipe the trades table first — only use if re-importing fresh")

    st.markdown("<div style='height:16px;'></div>", unsafe_allow_html=True)

    # ── BUILD ROWS ──
    if st.button("⟳  IMPORT TO JOURNAL", use_container_width=True, type="primary"):
        if not db:
            st.error("Database not connected. Check secrets.")
            st.stop()

        if not (col_symbol and col_side and col_qty and col_price):
            st.error("Symbol, Side, Quantity, and Price columns are required.")
            st.stop()

        with st.spinner("Processing..."):
            df = raw.copy()

            # Normalize side
            def norm_side(v):
                s = str(v).strip().upper()
                if s in ("B", "BUY", "1", "LONG"): return "BUY"
                if s in ("S", "SELL", "-1", "2", "SHORT"): return "SELL"
                return s

            df["_symbol"] = df[col_symbol].astype(str).str.strip()
            df["_side"] = df[col_side].apply(norm_side)
            df["_qty"] = pd.to_numeric(df[col_qty], errors="coerce").fillna(0).abs()
            df["_price"] = pd.to_numeric(df[col_price], errors="coerce").fillna(0)
            df["_fees"] = pd.to_numeric(df[col_fees], errors="coerce").fillna(0) if col_fees else 0

            # Time parsing
            if col_time:
                df["_time"] = pd.to_datetime(df[col_time], errors="coerce", dayfirst=True)
                df["_time"] = df["_time"].fillna(pd.Timestamp.now())
            else:
                df["_time"] = pd.Timestamp.now()

            # P&L
            if col_pnl and not compute_pnl:
                df["_pnl"] = pd.to_numeric(df[col_pnl], errors="coerce").fillna(0)
            elif compute_pnl:
                # FIFO matching per symbol
                df = df.sort_values("_time").reset_index(drop=True)
                df["_pnl"] = 0.0
                # build per-symbol FIFO queues
                queues = {}  # symbol -> list of (qty, price) for open BUYs (or open SELLs for shorts)
                for i, r in df.iterrows():
                    sym = r["_symbol"]
                    side = r["_side"]
                    qty = r["_qty"]
                    price = r["_price"]
                    fees = r["_fees"]
                    queues.setdefault(sym, [])
                    pnl = 0.0

                    if not queues[sym] or (queues[sym][0][2] == side):
                        # Same direction or empty → push
                        queues[sym].append([qty, price, side])
                    else:
                        # Opposite direction → match FIFO
                        remaining = qty
                        while remaining > 0 and queues[sym]:
                            open_qty, open_price, open_side = queues[sym][0]
                            match_qty = min(remaining, open_qty)
                            if open_side == "BUY":  # closing a long
                                pnl += (price - open_price) * match_qty
                            else:  # closing a short
                                pnl += (open_price - price) * match_qty
                            remaining -= match_qty
                            queues[sym][0][0] -= match_qty
                            if queues[sym][0][0] <= 0:
                                queues[sym].pop(0)
                        if remaining > 0:
                            queues[sym].append([remaining, price, side])
                    df.at[i, "_pnl"] = pnl - fees
            else:
                df["_pnl"] = -df["_fees"]

            # Clear first if asked
            if clear_first:
                try:
                    db.table("trades").delete().neq("id", 0).execute()
                    st.info("Existing trades cleared.")
                except Exception as e:
                    st.warning(f"Clear failed (continuing): {e}")

            # Insert in batches
            rows = []
            for _, r in df.iterrows():
                rows.append({
                    "symbol": r["_symbol"],
                    "side": r["_side"],
                    "quantity": float(r["_qty"]),
                    "entry_price": float(r["_price"]),
                    "pnl": float(r["_pnl"]),
                    "fees": float(r["_fees"]),
                    "status": "FILLED",
                    "trade_time": r["_time"].isoformat() if pd.notnull(r["_time"]) else datetime.now().isoformat(),
                })

            BATCH = 200
            inserted = 0
            errors = 0
            progress = st.progress(0)
            for i in range(0, len(rows), BATCH):
                batch = rows[i:i+BATCH]
                try:
                    db.table("trades").insert(batch).execute()
                    inserted += len(batch)
                except Exception as e:
                    errors += len(batch)
                    st.warning(f"Batch {i//BATCH} failed: {e}")
                progress.progress(min((i + BATCH) / len(rows), 1.0))

            progress.empty()

            r1, r2, r3 = st.columns(3)
            r1.metric("Inserted", f"{inserted:,}")
            r2.metric("Errors", f"{errors:,}")
            total_pnl = df["_pnl"].sum()
            r3.metric("Imported P&L", f"₹{total_pnl:,.0f}")

            if inserted > 0:
                st.success(f"✓ {inserted} trades imported. Open the main dashboard to view.")
                st.cache_data.clear()
else:
    st.markdown("""
    <div class="panel" style="text-align:center; padding:48px 24px; border:2px dashed #1f2937;">
        <div style="font-family:'Fraunces',serif; font-size:1.5rem; color:#94a3b8;">Drop a CSV or Excel file above</div>
        <div style="color:#64748b; margin-top:8px; font-size:0.85rem;">Supports .csv, .xlsx, .xls — Fyers tradebook format auto-detected</div>
    </div>
    """, unsafe_allow_html=True)
