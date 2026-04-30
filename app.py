"""
Trading Journal — Premium P&L Dashboard
Live sync with Fyers, full quantitative metrics, editorial design.
"""
import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from datetime import datetime, timedelta
from supabase import create_client
from fyers_apiv3 import fyersModel
import os

# ════════════════════════════════════════════════════════════════
# PAGE CONFIG
# ════════════════════════════════════════════════════════════════
st.set_page_config(
    page_title="Trading Journal",
    page_icon="◈",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ════════════════════════════════════════════════════════════════
# CUSTOM CSS — EDITORIAL FINANCIAL AESTHETIC
# ════════════════════════════════════════════════════════════════
st.markdown("""
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

<style>
    :root {
        --bg-base: #0a0e1a;
        --bg-elevated: #0f1420;
        --bg-card: #131826;
        --bg-card-hover: #161c2e;
        --border: #1f2937;
        --text-primary: #f8fafc;
        --text-secondary: #94a3b8;
        --text-muted: #64748b;
        --accent: #5eead4;
        --accent-glow: rgba(94, 234, 212, 0.15);
        --gold: #fbbf24;
        --success: #10b981;
        --success-soft: rgba(16, 185, 129, 0.1);
        --danger: #f43f5e;
        --danger-soft: rgba(244, 63, 94, 0.1);
    }

    .stApp {
        background: var(--bg-base);
        background-image:
            radial-gradient(at 20% 0%, rgba(94, 234, 212, 0.04) 0px, transparent 50%),
            radial-gradient(at 80% 0%, rgba(251, 191, 36, 0.03) 0px, transparent 50%);
    }

    html, body, [class*="css"], .stMarkdown, p, span, div {
        font-family: 'Geist', -apple-system, sans-serif !important;
        color: var(--text-primary);
    }

    h1 {
        font-family: 'Fraunces', serif !important;
        font-weight: 400 !important;
        font-size: 3.5rem !important;
        letter-spacing: -0.03em !important;
        line-height: 1 !important;
        color: var(--text-primary) !important;
        margin-bottom: 0.25rem !important;
        font-variation-settings: "opsz" 144;
    }
    h2 {
        font-family: 'Fraunces', serif !important;
        font-weight: 400 !important;
        font-size: 1.8rem !important;
        letter-spacing: -0.02em !important;
        color: var(--text-primary) !important;
    }
    h3 {
        font-family: 'Geist', sans-serif !important;
        font-weight: 500 !important;
        font-size: 0.75rem !important;
        letter-spacing: 0.15em !important;
        text-transform: uppercase !important;
        color: var(--text-muted) !important;
        margin-top: 1.5rem !important;
        margin-bottom: 0.75rem !important;
    }

    [data-testid="stMetric"] {
        background: linear-gradient(180deg, var(--bg-card) 0%, var(--bg-elevated) 100%);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 22px 24px;
        position: relative;
        overflow: hidden;
        transition: all 0.2s ease;
    }
    [data-testid="stMetric"]:hover {
        border-color: var(--accent);
        background: linear-gradient(180deg, var(--bg-card-hover) 0%, var(--bg-elevated) 100%);
    }
    [data-testid="stMetric"]::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--accent), transparent);
        opacity: 0.4;
    }
    [data-testid="stMetricLabel"] {
        color: var(--text-muted) !important;
        font-size: 0.7rem !important;
        font-weight: 500 !important;
        letter-spacing: 0.12em !important;
        text-transform: uppercase !important;
    }
    [data-testid="stMetricValue"] {
        font-family: 'Fraunces', serif !important;
        font-size: 2rem !important;
        font-weight: 500 !important;
        letter-spacing: -0.02em !important;
        color: var(--text-primary) !important;
    }
    [data-testid="stMetricDelta"] {
        font-family: 'JetBrains Mono', monospace !important;
        font-size: 0.8rem !important;
    }

    [data-testid="stSidebar"] {
        background: var(--bg-elevated);
        border-right: 1px solid var(--border);
    }

    .stButton > button {
        background: var(--accent) !important;
        color: var(--bg-base) !important;
        border: none !important;
        border-radius: 10px !important;
        font-family: 'Geist', sans-serif !important;
        font-weight: 600 !important;
        font-size: 0.85rem !important;
        letter-spacing: 0.02em !important;
        padding: 10px 20px !important;
        transition: all 0.2s !important;
    }
    .stButton > button:hover {
        background: #4dd4be !important;
        transform: translateY(-1px);
        box-shadow: 0 6px 20px var(--accent-glow);
    }

    .stTabs [data-baseweb="tab-list"] {
        gap: 4px;
        border-bottom: 1px solid var(--border);
    }
    .stTabs [data-baseweb="tab"] {
        background: transparent !important;
        border: none !important;
        border-radius: 0 !important;
        color: var(--text-muted) !important;
        font-family: 'Geist', sans-serif !important;
        font-weight: 500 !important;
        font-size: 0.85rem !important;
        padding: 12px 20px !important;
        margin-bottom: -1px;
        border-bottom: 2px solid transparent !important;
    }
    .stTabs [aria-selected="true"] {
        color: var(--accent) !important;
        border-bottom: 2px solid var(--accent) !important;
    }

    [data-testid="stDataFrame"] {
        border: 1px solid var(--border);
        border-radius: 12px;
        overflow: hidden;
    }

    hr { border-color: var(--border) !important; margin: 2rem 0 !important; }

    .text-muted { color: var(--text-muted); font-size: 0.85rem; }

    .hero-eyebrow {
        font-family: 'Geist', sans-serif;
        font-size: 0.7rem;
        letter-spacing: 0.25em;
        text-transform: uppercase;
        color: var(--accent);
        margin-bottom: 0.5rem;
    }
    .hero-meta {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.75rem;
        color: var(--text-muted);
        letter-spacing: 0.05em;
    }

    .pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 100px;
        font-size: 0.7rem;
        font-weight: 500;
    }
    .pill-on { background: var(--success-soft); color: var(--success); border: 1px solid rgba(16,185,129,0.3); }
    .pill-off { background: var(--danger-soft); color: var(--danger); border: 1px solid rgba(244,63,94,0.3); }
    .pill-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

    .panel {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 24px;
    }

    #MainMenu, footer { visibility: hidden; }
    header[data-testid="stHeader"] { background: transparent; }

    .stAlert {
        background: var(--bg-card) !important;
        border: 1px solid var(--border) !important;
        border-radius: 12px !important;
    }

    .stTextInput > div > div > input,
    .stSelectbox > div > div {
        background: var(--bg-card) !important;
        border: 1px solid var(--border) !important;
        border-radius: 10px !important;
        color: var(--text-primary) !important;
    }
</style>
""", unsafe_allow_html=True)

# ════════════════════════════════════════════════════════════════
# CONNECTIONS
# ════════════════════════════════════════════════════════════════
SUPABASE_URL = st.secrets.get("SUPABASE_URL", os.getenv("SUPABASE_URL", ""))
SUPABASE_KEY = st.secrets.get("SUPABASE_KEY", os.getenv("SUPABASE_KEY", ""))
FYERS_APP_ID = st.secrets.get("FYERS_APP_ID", os.getenv("FYERS_APP_ID", ""))
FYERS_TOKEN = st.secrets.get("FYERS_ACCESS_TOKEN", os.getenv("FYERS_ACCESS_TOKEN", ""))

def get_db():
    if not SUPABASE_URL or not SUPABASE_KEY: return None
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def get_fyers():
    if not FYERS_APP_ID or not FYERS_TOKEN: return None
    try:
        return fyersModel.FyersModel(client_id=FYERS_APP_ID, token=FYERS_TOKEN, is_async=False)
    except Exception:
        return None

db = get_db()
fyers = get_fyers()

# ════════════════════════════════════════════════════════════════
# DATA LAYER
# ════════════════════════════════════════════════════════════════
@st.cache_data(ttl=30)
def fetch_trades():
    if not db: return pd.DataFrame()
    try:
        res = db.table("trades").select("*").order("trade_time", desc=False).execute()
        df = pd.DataFrame(res.data) if res.data else pd.DataFrame()
        if not df.empty:
            df["trade_time"] = pd.to_datetime(df["trade_time"], errors="coerce")
            for c in ["pnl", "quantity", "entry_price", "exit_price", "fees"]:
                if c in df.columns:
                    df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0)
        return df
    except Exception as e:
        st.error(f"Database error: {e}")
        return pd.DataFrame()

@st.cache_data(ttl=30)
def fetch_positions():
    if not db: return pd.DataFrame()
    try:
        res = db.table("positions").select("*").execute()
        return pd.DataFrame(res.data) if res.data else pd.DataFrame()
    except Exception:
        return pd.DataFrame()

def sync_history_from_fyers():
    """Pull last few days of FILLED orders from Fyers orderbook API.
    Combines with tradebook for fill prices, FIFO-pairs to compute P&L.
    Auto-clears recent rows to avoid duplicates."""
    if not fyers or not db: return 0, "Not connected"
    try:
        ob = fyers.orderbook()
        if ob.get("s") != "ok":
            return 0, ob.get("message", "Orderbook fetch failed")

        orders = ob.get("orderBook", []) or []
        # Keep only filled/partially-filled
        filled = [o for o in orders if o.get("status") in (2, 6) or str(o.get("status","")).lower() in ("filled","traded","complete")]

        if not filled:
            return 0, "No filled orders found in last 7 days"

        # Sort by time
        def _ts(o):
            v = o.get("orderDateTime") or o.get("orderNumStatus") or 0
            try: return float(v)
            except: return 0
        filled.sort(key=_ts)

        # FIFO pairing
        queues = {}
        rows = []
        for o in filled:
            sym = o.get("symbol")
            side = "BUY" if o.get("side") == 1 else "SELL"
            qty = abs(float(o.get("filledQty", o.get("qty", 0)) or 0))
            price = float(o.get("tradedPrice", o.get("limitPrice", 0)) or 0)
            if qty == 0 or not sym or price == 0:
                continue
            queues.setdefault(sym, [])
            pnl = 0.0

            if not queues[sym] or queues[sym][0][2] == side:
                queues[sym].append([qty, price, side])
            else:
                remaining = qty
                while remaining > 0 and queues[sym]:
                    oq, op, os_ = queues[sym][0]
                    m = min(remaining, oq)
                    if os_ == "BUY":
                        pnl += (price - op) * m
                    else:
                        pnl += (op - price) * m
                    remaining -= m
                    queues[sym][0][0] -= m
                    if queues[sym][0][0] <= 0:
                        queues[sym].pop(0)
                if remaining > 0:
                    queues[sym].append([remaining, price, side])

            ts_val = o.get("orderDateTime") or 0
            try:
                ts_val = float(ts_val)
                trade_time = datetime.fromtimestamp(ts_val).isoformat() if ts_val > 0 else datetime.now().isoformat()
            except Exception:
                trade_time = datetime.now().isoformat()

            rows.append({
                "symbol": sym, "side": side,
                "quantity": qty, "entry_price": price,
                "pnl": pnl, "fees": 0, "status": "FILLED",
                "trade_time": trade_time,
            })

        # Wipe recent to be idempotent (last 8 days)
        cutoff = (datetime.now() - timedelta(days=8)).date().isoformat()
        try:
            db.table("trades").delete().gte("trade_time", cutoff).execute()
        except Exception:
            pass

        for i in range(0, len(rows), 100):
            db.table("trades").insert(rows[i:i+100]).execute()

        return len(rows), None
    except Exception as e:
        return 0, str(e)

def sync_from_fyers():
    """Pull today's fills from Fyers, FIFO-pair them by symbol to compute P&L,
    upsert positions. Idempotent: clears today's rows before re-inserting."""
    if not fyers or not db: return 0, 0, "Not connected"
    inserted, updated = 0, 0
    try:
        tb = fyers.tradebook()
        if tb.get("s") == "ok" and tb.get("tradeBook"):
            fills = tb["tradeBook"]
            # Sort fills chronologically (use orderDateTime if available)
            def _ts(t):
                v = t.get("orderDateTime") or t.get("orderTimestamp") or 0
                try: return float(v)
                except: return 0
            fills = sorted(fills, key=_ts)

            # FIFO pairing per symbol
            queues = {}  # symbol -> [[qty, price, side], ...]
            rows = []
            for t in fills:
                sym = t.get("symbol")
                side = "BUY" if t.get("side") == 1 else "SELL"
                qty = abs(float(t.get("tradedQty", 0) or 0))
                price = float(t.get("tradePrice", 0) or 0)
                if qty == 0 or not sym:
                    continue
                queues.setdefault(sym, [])
                pnl = 0.0

                if not queues[sym] or queues[sym][0][2] == side:
                    queues[sym].append([qty, price, side])
                else:
                    remaining = qty
                    while remaining > 0 and queues[sym]:
                        oq, op, os_ = queues[sym][0]
                        m = min(remaining, oq)
                        if os_ == "BUY":
                            pnl += (price - op) * m
                        else:
                            pnl += (op - price) * m
                        remaining -= m
                        queues[sym][0][0] -= m
                        if queues[sym][0][0] <= 0:
                            queues[sym].pop(0)
                    if remaining > 0:
                        queues[sym].append([remaining, price, side])

                # Use orderDateTime if it's a valid epoch, else now
                ts_val = t.get("orderDateTime") or 0
                try:
                    ts_val = float(ts_val)
                    trade_time = datetime.fromtimestamp(ts_val).isoformat() if ts_val > 0 else datetime.now().isoformat()
                except Exception:
                    trade_time = datetime.now().isoformat()

                rows.append({
                    "symbol": sym, "side": side,
                    "quantity": qty, "entry_price": price,
                    "pnl": pnl, "fees": 0, "status": "FILLED",
                    "trade_time": trade_time,
                })

            # Idempotent: delete today's existing rows, then re-insert
            today = datetime.now().date().isoformat()
            try:
                db.table("trades").delete().gte("trade_time", today).execute()
            except Exception:
                pass

            if rows:
                # batch insert
                for i in range(0, len(rows), 100):
                    db.table("trades").insert(rows[i:i+100]).execute()
                inserted = len(rows)

        pos = fyers.positions()
        if pos.get("s") == "ok" and pos.get("netPositions"):
            for p in pos["netPositions"]:
                row = {
                    "symbol": p.get("symbol"),
                    "quantity": float(p.get("netQty", 0) or 0),
                    "avg_price": float(p.get("avgPrice", 0) or 0),
                    "ltp": float(p.get("ltp", 0) or 0),
                    "pnl": float(p.get("pl", 0) or 0),
                    "updated_at": datetime.now().isoformat(),
                }
                db.table("positions").upsert(row, on_conflict="symbol").execute()
                updated += 1
        return inserted, updated, None
    except Exception as e:
        return 0, 0, str(e)

# ════════════════════════════════════════════════════════════════
# QUANT METRICS
# ════════════════════════════════════════════════════════════════
def _empty_metrics(n=0):
    return {
        "total_pnl": 0, "gross_profit": 0, "gross_loss": 0,
        "trades": n, "wins": 0, "losses": 0, "win_rate": 0,
        "avg_win": 0, "avg_loss": 0, "largest_win": 0, "largest_loss": 0,
        "profit_factor": 0, "payoff": 0, "expectancy": 0, "avg_trade": 0,
        "max_dd": 0, "max_dd_pct": 0,
        "sharpe": 0, "sortino": 0, "calmar": 0, "recovery": 0,
        "max_streak_w": 0, "max_streak_l": 0, "kelly": 0,
        "equity_curve": pd.DataFrame(columns=["trade_time", "cum_pnl"]),
        "drawdown_curve": pd.DataFrame(columns=["trade_time", "dd"]),
    }

def compute_metrics(df):
    if df.empty or "pnl" not in df.columns:
        return _empty_metrics()
    df = df.copy()
    df["pnl"] = pd.to_numeric(df["pnl"], errors="coerce").fillna(0)
    closed = df[df["pnl"] != 0].sort_values("trade_time").reset_index(drop=True)
    if closed.empty:
        return _empty_metrics(n=len(df))

    wins = closed[closed["pnl"] > 0]
    losses = closed[closed["pnl"] < 0]
    n, n_w, n_l = len(closed), len(wins), len(losses)

    total_pnl = closed["pnl"].sum()
    gross_profit = wins["pnl"].sum() if n_w else 0
    gross_loss = abs(losses["pnl"].sum()) if n_l else 0
    win_rate = (n_w / n * 100) if n else 0
    avg_win = wins["pnl"].mean() if n_w else 0
    avg_loss = losses["pnl"].mean() if n_l else 0
    largest_win = wins["pnl"].max() if n_w else 0
    largest_loss = losses["pnl"].min() if n_l else 0

    profit_factor = (gross_profit / gross_loss) if gross_loss > 0 else (float('inf') if gross_profit > 0 else 0)
    payoff = abs(avg_win / avg_loss) if avg_loss != 0 else 0
    expectancy = closed["pnl"].mean()

    closed["cum_pnl"] = closed["pnl"].cumsum()
    running_max = closed["cum_pnl"].cummax()
    drawdown_series = closed["cum_pnl"] - running_max
    max_dd = drawdown_series.min()
    rm_max = running_max.max()
    max_dd_pct = (max_dd / rm_max * 100) if rm_max and rm_max != 0 else 0

    returns = closed["pnl"]
    sharpe = (returns.mean() / returns.std() * np.sqrt(252)) if returns.std() > 0 else 0
    downside = returns[returns < 0].std()
    sortino = (returns.mean() / downside * np.sqrt(252)) if downside and downside > 0 else 0
    calmar = (total_pnl / abs(max_dd)) if max_dd != 0 else 0
    recovery = (total_pnl / abs(max_dd)) if max_dd != 0 else 0

    sign = np.sign(closed["pnl"])
    streak_w, streak_l, cur_w, cur_l = 0, 0, 0, 0
    for s in sign:
        if s > 0:
            cur_w += 1; cur_l = 0
            streak_w = max(streak_w, cur_w)
        elif s < 0:
            cur_l += 1; cur_w = 0
            streak_l = max(streak_l, cur_l)

    kelly = (win_rate/100 - (1 - win_rate/100) / payoff) * 100 if payoff > 0 else 0
    avg_trade = total_pnl / n if n else 0

    return {
        "total_pnl": total_pnl, "gross_profit": gross_profit, "gross_loss": gross_loss,
        "trades": n, "wins": n_w, "losses": n_l, "win_rate": win_rate,
        "avg_win": avg_win, "avg_loss": avg_loss,
        "largest_win": largest_win, "largest_loss": largest_loss,
        "profit_factor": profit_factor, "payoff": payoff,
        "expectancy": expectancy, "avg_trade": avg_trade,
        "max_dd": max_dd, "max_dd_pct": max_dd_pct,
        "sharpe": sharpe, "sortino": sortino, "calmar": calmar, "recovery": recovery,
        "max_streak_w": streak_w, "max_streak_l": streak_l, "kelly": kelly,
        "equity_curve": closed[["trade_time", "cum_pnl"]],
        "drawdown_curve": pd.DataFrame({"trade_time": closed["trade_time"], "dd": drawdown_series}),
    }

# ════════════════════════════════════════════════════════════════
# CHART STYLE
# ════════════════════════════════════════════════════════════════
def style_fig(fig, height=320, show_legend=False):
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="#131826",
        font=dict(family="Geist, sans-serif", color="#94a3b8", size=11),
        height=height,
        margin=dict(l=10, r=10, t=20, b=10),
        showlegend=show_legend,
        xaxis=dict(gridcolor="rgba(255,255,255,0.04)", zerolinecolor="rgba(255,255,255,0.04)", showline=False),
        yaxis=dict(gridcolor="rgba(255,255,255,0.04)", zerolinecolor="rgba(255,255,255,0.04)", showline=False),
        hoverlabel=dict(bgcolor="#0f1420", bordercolor="#5eead4", font_family="JetBrains Mono"),
    )
    return fig

# ════════════════════════════════════════════════════════════════
# SIDEBAR
# ════════════════════════════════════════════════════════════════
with st.sidebar:
    st.markdown("""
    <div style="padding: 8px 0 16px 0;">
        <div style="font-family:'Fraunces',serif; font-size:1.6rem; font-weight:500; letter-spacing:-0.02em; color:#f8fafc;">Journal</div>
        <div style="font-family:'JetBrains Mono',monospace; font-size:0.65rem; letter-spacing:0.2em; color:#5eead4; text-transform:uppercase; margin-top:2px;">◈ Live · Fyers</div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<hr style='margin:0.5rem 0 1rem 0;'>", unsafe_allow_html=True)

    if st.button("⟳  SYNC FROM FYERS", use_container_width=True):
        with st.spinner("Pulling..."):
            t, p, err = sync_from_fyers()
            if err:
                st.error(err)
            else:
                st.success(f"{t} fills · {p} positions")
                st.cache_data.clear()

    if st.button("⟲  PULL LAST 7 DAYS", use_container_width=True):
        with st.spinner("Pulling history from Fyers..."):
            n, err = sync_history_from_fyers()
            if err:
                st.error(err)
            else:
                st.success(f"{n} historical fills imported")
                st.cache_data.clear()

    st.markdown("<div style='height:1rem;'></div>", unsafe_allow_html=True)
    st.markdown("<h3>Connections</h3>", unsafe_allow_html=True)

    db_pill = '<span class="pill pill-on"><span class="pill-dot"></span>online</span>' if db else '<span class="pill pill-off"><span class="pill-dot"></span>offline</span>'
    fy_pill = '<span class="pill pill-on"><span class="pill-dot"></span>online</span>' if fyers else '<span class="pill pill-off"><span class="pill-dot"></span>offline</span>'
    st.markdown(f"<div style='display:flex; justify-content:space-between; padding:6px 0;'><span class='text-muted'>Database</span>{db_pill}</div>", unsafe_allow_html=True)
    st.markdown(f"<div style='display:flex; justify-content:space-between; padding:6px 0;'><span class='text-muted'>Broker</span>{fy_pill}</div>", unsafe_allow_html=True)

    st.markdown("<div style='height:1rem;'></div>", unsafe_allow_html=True)
    st.markdown("<h3>Filter</h3>", unsafe_allow_html=True)
    period = st.selectbox("Period", ["All time", "Today", "Last 7 days", "Last 30 days", "Last 90 days", "This year"], label_visibility="collapsed")

# ════════════════════════════════════════════════════════════════
# DATA & FILTER
# ════════════════════════════════════════════════════════════════
trades_df_all = fetch_trades()
positions_df = fetch_positions()

def apply_filter(df, period):
    if df.empty or "trade_time" not in df.columns:
        return df
    df = df.copy()
    df["trade_time"] = pd.to_datetime(df["trade_time"], errors="coerce")
    now = datetime.now()
    if period == "Today":
        return df[df["trade_time"].dt.date == now.date()]
    if period == "Last 7 days":
        return df[df["trade_time"] >= now - timedelta(days=7)]
    if period == "Last 30 days":
        return df[df["trade_time"] >= now - timedelta(days=30)]
    if period == "Last 90 days":
        return df[df["trade_time"] >= now - timedelta(days=90)]
    if period == "This year":
        return df[df["trade_time"].dt.year == now.year]
    return df

trades_df = apply_filter(trades_df_all, period)
M = compute_metrics(trades_df)

# ════════════════════════════════════════════════════════════════
# HERO
# ════════════════════════════════════════════════════════════════
hero_left, hero_right = st.columns([3, 1])
with hero_left:
    st.markdown('<div class="hero-eyebrow">◈ Trading Journal</div>', unsafe_allow_html=True)
    st.markdown('<h1>Performance, in clarity.</h1>', unsafe_allow_html=True)
    st.markdown(f'<div class="hero-meta">{datetime.now().strftime("%A · %d %B %Y · %H:%M")} · {period.upper()}</div>', unsafe_allow_html=True)
with hero_right:
    if M and M.get("trades", 0) > 0:
        pnl = M.get("total_pnl", 0)
        color = "var(--success)" if pnl >= 0 else "var(--danger)"
        sign = "+" if pnl >= 0 else ""
        st.markdown(f"""
        <div style="text-align:right; padding-top:8px;">
            <div style="font-family:'Geist',sans-serif; font-size:0.65rem; letter-spacing:0.2em; text-transform:uppercase; color:#64748b;">Net P&amp;L</div>
            <div style="font-family:'Fraunces',serif; font-size:3rem; font-weight:500; color:{color}; line-height:1; letter-spacing:-0.03em;">{sign}₹{pnl:,.0f}</div>
            <div style="font-family:'JetBrains Mono',monospace; font-size:0.75rem; color:#64748b; margin-top:4px;">{M.get('trades',0)} TRADES · {M.get('win_rate',0):.1f}% WIN</div>
        </div>
        """, unsafe_allow_html=True)

st.markdown("<hr>", unsafe_allow_html=True)

# ════════════════════════════════════════════════════════════════
# EMPTY STATE OR DASHBOARD
# ════════════════════════════════════════════════════════════════
if not M or M.get("trades", 0) == 0:
    st.markdown("""
    <div class="panel" style="text-align:center; padding:80px 24px;">
        <div style="font-family:'Fraunces',serif; font-size:2.4rem; color:#f8fafc; margin-bottom:12px; letter-spacing:-0.02em;">No trades yet.</div>
        <div style="color:#94a3b8; max-width:520px; margin:0 auto; line-height:1.6;">
            Sync from Fyers using the sidebar, or import your historical tradebook from the
            <strong style="color:#5eead4;">Import CSV</strong> page in the navigation.
        </div>
    </div>
    """, unsafe_allow_html=True)
else:
    # ─── PRIMARY KPI ROW ───
    k1, k2, k3, k4, k5 = st.columns(5)
    k1.metric("Win Rate", f"{M['win_rate']:.1f}%", f"{M['wins']}W / {M['losses']}L")
    pf = M['profit_factor']
    pf_str = "∞" if pf == float('inf') else f"{pf:.2f}"
    k2.metric("Profit Factor", pf_str)
    k3.metric("Sharpe", f"{M['sharpe']:.2f}")
    k4.metric("Max Drawdown", f"₹{M['max_dd']:,.0f}", f"{M['max_dd_pct']:.1f}%")
    k5.metric("Expectancy", f"₹{M['expectancy']:,.0f}")

    st.markdown("<div style='height:24px;'></div>", unsafe_allow_html=True)

    tab_overview, tab_analytics, tab_log, tab_insights, tab_positions = st.tabs([
        "Overview", "Analytics", "Trade Log", "Insights", "Positions"
    ])

    # ─── OVERVIEW ───
    with tab_overview:
        col_a, col_b = st.columns([2, 1])
        with col_a:
            st.markdown("<h3>Equity Curve</h3>", unsafe_allow_html=True)
            ec = M["equity_curve"].copy()
            fig = go.Figure()
            fig.add_trace(go.Scatter(
                x=ec["trade_time"], y=ec["cum_pnl"],
                fill="tozeroy",
                line=dict(color="#5eead4", width=2.5, shape="spline"),
                fillcolor="rgba(94,234,212,0.08)",
                hovertemplate="<b>₹%{y:,.0f}</b><br>%{x|%d %b %Y}<extra></extra>",
            ))
            fig.add_hline(y=0, line=dict(color="rgba(255,255,255,0.1)", width=1, dash="dot"))
            style_fig(fig, height=380)
            st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False})

        with col_b:
            st.markdown("<h3>Drawdown</h3>", unsafe_allow_html=True)
            dd = M["drawdown_curve"]
            fig = go.Figure()
            fig.add_trace(go.Scatter(
                x=dd["trade_time"], y=dd["dd"],
                fill="tozeroy",
                line=dict(color="#f43f5e", width=1.5),
                fillcolor="rgba(244,63,94,0.12)",
                hovertemplate="<b>₹%{y:,.0f}</b><br>%{x|%d %b}<extra></extra>",
            ))
            style_fig(fig, height=380)
            st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False})

        st.markdown("<h3>Daily P&amp;L</h3>", unsafe_allow_html=True)
        daily = trades_df.groupby(trades_df["trade_time"].dt.date)["pnl"].sum().reset_index()
        daily.columns = ["date", "pnl"]
        colors = ["#10b981" if x >= 0 else "#f43f5e" for x in daily["pnl"]]
        fig = go.Figure(go.Bar(
            x=daily["date"], y=daily["pnl"],
            marker=dict(color=colors, line=dict(width=0)),
            hovertemplate="<b>₹%{y:,.0f}</b><br>%{x|%d %b %Y}<extra></extra>",
        ))
        fig.add_hline(y=0, line=dict(color="rgba(255,255,255,0.15)", width=1))
        style_fig(fig, height=240)
        st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False})

    # ─── ANALYTICS ───
    with tab_analytics:
        a1, a2 = st.columns(2)
        with a1:
            st.markdown("<h3>P&amp;L Distribution</h3>", unsafe_allow_html=True)
            fig = go.Figure()
            fig.add_trace(go.Histogram(
                x=trades_df["pnl"], nbinsx=30,
                marker=dict(color="#5eead4", line=dict(color="#0f1420", width=1)),
                opacity=0.85,
            ))
            fig.add_vline(x=0, line=dict(color="rgba(255,255,255,0.2)", width=1, dash="dash"))
            style_fig(fig, height=300)
            st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False})

        with a2:
            st.markdown("<h3>Win vs Loss</h3>", unsafe_allow_html=True)
            fig = go.Figure(go.Pie(
                labels=["Wins", "Losses"],
                values=[M["wins"], M["losses"]],
                hole=0.7,
                marker=dict(colors=["#10b981", "#f43f5e"], line=dict(color="#0f1420", width=2)),
                textinfo="none",
                hovertemplate="<b>%{label}</b><br>%{value} (%{percent})<extra></extra>",
            ))
            fig.add_annotation(
                text=f"<b style='font-size:32px; color:#f8fafc;'>{M['win_rate']:.0f}%</b>",
                showarrow=False, font=dict(family="Fraunces", size=32),
            )
            style_fig(fig, height=300, show_legend=True)
            fig.update_layout(legend=dict(orientation="h", yanchor="bottom", y=-0.1, xanchor="center", x=0.5))
            st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False})

        if "trade_time" in trades_df.columns and not trades_df.empty:
            st.markdown("<h3>Performance by Hour &amp; Weekday</h3>", unsafe_allow_html=True)
            tdf = trades_df.copy()
            tdf["hour"] = tdf["trade_time"].dt.hour
            tdf["weekday"] = tdf["trade_time"].dt.day_name()
            heatmap_data = tdf.groupby(["weekday", "hour"])["pnl"].sum().reset_index()
            weekdays_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            pivot = heatmap_data.pivot(index="weekday", columns="hour", values="pnl").reindex(weekdays_order)

            fig = go.Figure(go.Heatmap(
                z=pivot.values, x=pivot.columns, y=pivot.index,
                colorscale=[[0, "#f43f5e"], [0.5, "#131826"], [1, "#10b981"]],
                zmid=0,
                hovertemplate="<b>%{y}, %{x}:00</b><br>₹%{z:,.0f}<extra></extra>",
                colorbar=dict(thickness=8, len=0.7, tickfont=dict(family="JetBrains Mono", size=9, color="#64748b")),
            ))
            style_fig(fig, height=280)
            st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False})

        if "symbol" in trades_df.columns:
            st.markdown("<h3>Symbol Leaderboard</h3>", unsafe_allow_html=True)
            sym = trades_df.groupby("symbol").agg(
                pnl=("pnl", "sum"), trades=("pnl", "count")
            ).reset_index().sort_values("pnl", ascending=True).tail(15)
            colors = ["#10b981" if x >= 0 else "#f43f5e" for x in sym["pnl"]]
            fig = go.Figure(go.Bar(
                y=sym["symbol"], x=sym["pnl"], orientation="h",
                marker=dict(color=colors, line=dict(width=0)),
                hovertemplate="<b>%{y}</b><br>₹%{x:,.0f}<extra></extra>",
            ))
            fig.add_vline(x=0, line=dict(color="rgba(255,255,255,0.15)", width=1))
            style_fig(fig, height=max(280, len(sym)*22))
            st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False})

    # ─── TRADE LOG ───
    with tab_log:
        st.markdown("<h3>All Trades</h3>", unsafe_allow_html=True)
        f1, f2, f3 = st.columns([2, 1, 1])
        with f1:
            search = st.text_input("Search", placeholder="Search by symbol", label_visibility="collapsed")
        with f2:
            side_filter = st.selectbox("Side", ["All", "BUY", "SELL"], label_visibility="collapsed")
        with f3:
            outcome_filter = st.selectbox("Outcome", ["All", "Wins", "Losses"], label_visibility="collapsed")

        view = trades_df.copy()
        if search:
            view = view[view["symbol"].astype(str).str.contains(search, case=False, na=False)]
        if side_filter != "All" and "side" in view.columns:
            view = view[view["side"] == side_filter]
        if outcome_filter == "Wins":
            view = view[view["pnl"] > 0]
        elif outcome_filter == "Losses":
            view = view[view["pnl"] < 0]

        display_cols = [c for c in ["trade_time","symbol","side","quantity","entry_price","exit_price","pnl","fees","status","notes"] if c in view.columns]
        if "trade_time" in view.columns:
            view = view.sort_values("trade_time", ascending=False)
        st.dataframe(view[display_cols], use_container_width=True, hide_index=True, height=500)
        st.markdown(f'<div class="text-muted">{len(view)} of {len(trades_df)} trades</div>', unsafe_allow_html=True)

    # ─── INSIGHTS ───
    with tab_insights:
        c1, c2, c3 = st.columns(3)
        with c1:
            st.markdown("<h3>Returns</h3>", unsafe_allow_html=True)
            st.metric("Gross Profit", f"₹{M['gross_profit']:,.0f}")
            st.metric("Gross Loss", f"₹{M['gross_loss']:,.0f}")
            st.metric("Average Trade", f"₹{M['avg_trade']:,.0f}")
            st.metric("Average Win", f"₹{M['avg_win']:,.0f}")
            st.metric("Average Loss", f"₹{M['avg_loss']:,.0f}")
        with c2:
            st.markdown("<h3>Risk</h3>", unsafe_allow_html=True)
            st.metric("Sortino Ratio", f"{M['sortino']:.2f}")
            st.metric("Calmar Ratio", f"{M['calmar']:.2f}")
            st.metric("Recovery Factor", f"{M['recovery']:.2f}")
            st.metric("Largest Win", f"₹{M['largest_win']:,.0f}")
            st.metric("Largest Loss", f"₹{M['largest_loss']:,.0f}")
        with c3:
            st.markdown("<h3>Behavior</h3>", unsafe_allow_html=True)
            st.metric("Payoff Ratio", f"{M['payoff']:.2f}")
            kelly_val = max(min(M['kelly'], 100), -100)
            st.metric("Kelly %", f"{kelly_val:.1f}%")
            st.metric("Max Win Streak", f"{M['max_streak_w']}")
            st.metric("Max Loss Streak", f"{M['max_streak_l']}")
            st.metric("Total Trades", f"{M['trades']}")

    # ─── POSITIONS ───
    with tab_positions:
        st.markdown("<h3>Open Positions</h3>", unsafe_allow_html=True)
        if not positions_df.empty:
            st.dataframe(positions_df, use_container_width=True, hide_index=True)
        else:
            st.markdown('<div class="panel"><div style="text-align:center; color:#64748b; padding:20px;">No open positions.</div></div>', unsafe_allow_html=True)
