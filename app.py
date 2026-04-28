"""
Trading Journal Dashboard
Live P&L sync with Fyers API, stored in Supabase, visualized with Streamlit.
"""
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
from supabase import create_client
from fyers_apiv3 import fyersModel
import os

# ---------- PAGE CONFIG ----------
st.set_page_config(
    page_title="Trading Journal",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ---------- CUSTOM STYLING ----------
st.markdown("""
<style>
    .main {background-color: #0e1117;}
    .stMetric {
        background-color: #1a1d24;
        padding: 18px;
        border-radius: 12px;
        border: 1px solid #2a2e39;
    }
    .stMetric label {color: #9ca3af !important; font-size: 13px !important;}
    .stMetric [data-testid="stMetricValue"] {font-size: 28px !important; font-weight: 600;}
    h1, h2, h3 {color: #f8fafc; font-weight: 600;}
    .stTabs [data-baseweb="tab-list"] {gap: 4px;}
    .stTabs [data-baseweb="tab"] {
        background-color: #1a1d24;
        border-radius: 8px;
        padding: 8px 16px;
    }
    .stTabs [aria-selected="true"] {background-color: #3b82f6;}
</style>
""", unsafe_allow_html=True)

# ---------- LOAD SECRETS ----------
SUPABASE_URL = st.secrets.get("SUPABASE_URL", os.getenv("SUPABASE_URL", ""))
SUPABASE_KEY = st.secrets.get("SUPABASE_KEY", os.getenv("SUPABASE_KEY", ""))
FYERS_APP_ID = st.secrets.get("FYERS_APP_ID", os.getenv("FYERS_APP_ID", ""))
FYERS_SECRET = st.secrets.get("FYERS_SECRET_KEY", os.getenv("FYERS_SECRET_KEY", ""))
FYERS_TOKEN = st.secrets.get("FYERS_ACCESS_TOKEN", os.getenv("FYERS_ACCESS_TOKEN", ""))

# ---------- DB CLIENT ----------
@st.cache_resource
def get_db():
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
    return create_client(SUPABASE_URL, SUPABASE_KEY)

db = get_db()

# ---------- FYERS CLIENT ----------
@st.cache_resource
def get_fyers():
    if not FYERS_APP_ID or not FYERS_TOKEN:
        return None
    return fyersModel.FyersModel(client_id=FYERS_APP_ID, token=FYERS_TOKEN, is_async=False)

fyers = get_fyers()

# ---------- DATA HELPERS ----------
def fetch_trades():
    if not db:
        return pd.DataFrame()
    try:
        res = db.table("trades").select("*").order("trade_time", desc=True).execute()
        return pd.DataFrame(res.data) if res.data else pd.DataFrame()
    except Exception as e:
        st.error(f"DB error: {e}")
        return pd.DataFrame()

def fetch_positions():
    if not db:
        return pd.DataFrame()
    try:
        res = db.table("positions").select("*").execute()
        return pd.DataFrame(res.data) if res.data else pd.DataFrame()
    except Exception:
        return pd.DataFrame()

def sync_from_fyers():
    """Pull today's trades and positions from Fyers and upsert into Supabase."""
    if not fyers or not db:
        st.warning("Fyers or Supabase not connected.")
        return 0, 0
    inserted_trades, updated_pos = 0, 0
    try:
        # ---- Fetch today's tradebook ----
        tb = fyers.tradebook()
        if tb.get("s") == "ok" and tb.get("tradeBook"):
            for t in tb["tradeBook"]:
                row = {
                    "symbol": t.get("symbol"),
                    "side": "BUY" if t.get("side") == 1 else "SELL",
                    "quantity": t.get("tradedQty"),
                    "entry_price": t.get("tradePrice"),
                    "pnl": 0,
                    "fees": 0,
                    "status": "FILLED",
                    "trade_time": datetime.fromtimestamp(t.get("orderDateTime", 0)).isoformat() if t.get("orderDateTime") else datetime.now().isoformat(),
                }
                db.table("trades").insert(row).execute()
                inserted_trades += 1
        # ---- Fetch positions ----
        pos = fyers.positions()
        if pos.get("s") == "ok" and pos.get("netPositions"):
            for p in pos["netPositions"]:
                row = {
                    "symbol": p.get("symbol"),
                    "quantity": p.get("netQty"),
                    "avg_price": p.get("avgPrice"),
                    "ltp": p.get("ltp"),
                    "pnl": p.get("pl"),
                    "updated_at": datetime.now().isoformat(),
                }
                db.table("positions").upsert(row, on_conflict="symbol").execute()
                updated_pos += 1
    except Exception as e:
        st.error(f"Sync failed: {e}")
    return inserted_trades, updated_pos

# ---------- METRICS ----------
def calc_metrics(df):
    if df.empty or "pnl" not in df.columns:
        return {}
    df["pnl"] = pd.to_numeric(df["pnl"], errors="coerce").fillna(0)
    closed = df[df["status"] == "FILLED"] if "status" in df.columns else df
    if closed.empty:
        return {}
    wins = closed[closed["pnl"] > 0]
    losses = closed[closed["pnl"] < 0]
    total_pnl = closed["pnl"].sum()
    win_rate = (len(wins) / len(closed) * 100) if len(closed) else 0
    avg_win = wins["pnl"].mean() if len(wins) else 0
    avg_loss = losses["pnl"].mean() if len(losses) else 0
    profit_factor = abs(wins["pnl"].sum() / losses["pnl"].sum()) if len(losses) and losses["pnl"].sum() != 0 else 0
    expectancy = closed["pnl"].mean()
    # Drawdown
    closed_sorted = closed.sort_values("trade_time")
    cum = closed_sorted["pnl"].cumsum()
    peak = cum.cummax()
    dd = (cum - peak).min()
    return {
        "total_pnl": total_pnl,
        "trades": len(closed),
        "win_rate": win_rate,
        "avg_win": avg_win,
        "avg_loss": avg_loss,
        "profit_factor": profit_factor,
        "expectancy": expectancy,
        "max_dd": dd,
        "best": closed["pnl"].max(),
        "worst": closed["pnl"].min(),
    }

# ---------- SIDEBAR ----------
with st.sidebar:
    st.title("📈 Trading Journal")
    st.caption("Live sync with Fyers")
    st.divider()
    if st.button("🔄 Sync Now", use_container_width=True, type="primary"):
        with st.spinner("Pulling from Fyers..."):
            t, p = sync_from_fyers()
            st.success(f"{t} trades, {p} positions synced")
            st.cache_data.clear()
    st.divider()
    st.caption("Status")
    st.write("DB:", "🟢 Connected" if db else "🔴 Not connected")
    st.write("Fyers:", "🟢 Connected" if fyers else "🔴 Not connected")
    st.divider()
    auto_refresh = st.checkbox("Auto-refresh (30s)", value=False)
    if auto_refresh:
        st.rerun()

# ---------- MAIN ----------
st.title("Trading Journal")
st.caption(f"Last updated: {datetime.now().strftime('%d %b %Y, %I:%M %p')}")

trades_df = fetch_trades()
pos_df = fetch_positions()
metrics = calc_metrics(trades_df)

# ---- Top KPI row ----
c1, c2, c3, c4, c5 = st.columns(5)
with c1:
    pnl = metrics.get("total_pnl", 0)
    st.metric("Total P&L", f"₹{pnl:,.0f}", delta=f"{pnl:+,.0f}")
with c2:
    st.metric("Trades", f"{metrics.get('trades', 0)}")
with c3:
    st.metric("Win Rate", f"{metrics.get('win_rate', 0):.1f}%")
with c4:
    st.metric("Profit Factor", f"{metrics.get('profit_factor', 0):.2f}")
with c5:
    st.metric("Max Drawdown", f"₹{metrics.get('max_dd', 0):,.0f}")

st.divider()

# ---- Tabs ----
tab1, tab2, tab3, tab4 = st.tabs(["📊 Overview", "💼 Positions", "📋 Trade Log", "🎯 Performance"])

with tab1:
    cA, cB = st.columns([2, 1])
    with cA:
        st.subheader("Equity Curve")
        if not trades_df.empty and "pnl" in trades_df.columns:
            df_sorted = trades_df.sort_values("trade_time")
            df_sorted["pnl"] = pd.to_numeric(df_sorted["pnl"], errors="coerce").fillna(0)
            df_sorted["cum_pnl"] = df_sorted["pnl"].cumsum()
            fig = go.Figure()
            fig.add_trace(go.Scatter(
                x=df_sorted["trade_time"], y=df_sorted["cum_pnl"],
                fill="tozeroy", line=dict(color="#3b82f6", width=2),
                fillcolor="rgba(59,130,246,0.1)"
            ))
            fig.update_layout(
                template="plotly_dark", height=380,
                margin=dict(l=0, r=0, t=10, b=0),
                paper_bgcolor="#0e1117", plot_bgcolor="#0e1117",
                xaxis_title=None, yaxis_title="Cumulative P&L (₹)"
            )
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("No trades yet. Click 'Sync Now' to pull from Fyers.")
    with cB:
        st.subheader("Win / Loss")
        if metrics:
            wins_n = len(trades_df[pd.to_numeric(trades_df.get("pnl", 0), errors="coerce") > 0]) if not trades_df.empty else 0
            losses_n = metrics.get("trades", 0) - wins_n
            fig = go.Figure(go.Pie(
                labels=["Wins", "Losses"], values=[wins_n, losses_n],
                marker=dict(colors=["#10b981", "#ef4444"]),
                hole=0.6
            ))
            fig.update_layout(
                template="plotly_dark", height=380,
                margin=dict(l=0, r=0, t=10, b=0),
                paper_bgcolor="#0e1117", showlegend=True
            )
            st.plotly_chart(fig, use_container_width=True)

with tab2:
    st.subheader("Open Positions")
    if not pos_df.empty:
        st.dataframe(pos_df, use_container_width=True, hide_index=True)
    else:
        st.info("No open positions.")

with tab3:
    st.subheader("All Trades")
    if not trades_df.empty:
        st.dataframe(trades_df, use_container_width=True, hide_index=True)
    else:
        st.info("No trades logged yet.")

with tab4:
    if metrics:
        c1, c2, c3 = st.columns(3)
        with c1:
            st.metric("Avg Win", f"₹{metrics.get('avg_win', 0):,.0f}")
            st.metric("Best Trade", f"₹{metrics.get('best', 0):,.0f}")
        with c2:
            st.metric("Avg Loss", f"₹{metrics.get('avg_loss', 0):,.0f}")
            st.metric("Worst Trade", f"₹{metrics.get('worst', 0):,.0f}")
        with c3:
            st.metric("Expectancy", f"₹{metrics.get('expectancy', 0):,.0f}")
            rr = abs(metrics.get('avg_win', 0) / metrics.get('avg_loss', 1)) if metrics.get('avg_loss') else 0
            st.metric("Avg R:R", f"{rr:.2f}")
    else:
        st.info("Performance metrics will appear once you have trades.")
