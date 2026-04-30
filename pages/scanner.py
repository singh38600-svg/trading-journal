"""
Trade Scanner — Streamlit page.
Runs SMC/ICT analysis and generates A+ setups for any symbol.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from signal_generator import generate_setup, scan_watchlist
from backtester import run_backtest, format_backtest_report
from market_data import fetch_ohlcv
from analysis_engine import analyse

st.set_page_config(page_title="Trade Scanner", page_icon="◈", layout="wide")

# ── Styles ──────────────────────────────────────────────────────
st.markdown("""
<style>
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
  :root {
    --bg: #0a0e1a; --card: #131826; --border: #1f2937;
    --text: #f8fafc; --muted: #64748b; --accent: #5eead4;
    --green: #10b981; --red: #f43f5e; --gold: #fbbf24;
  }
  .stApp { background: var(--bg); }
  .setup-box {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 8px; padding: 20px; margin: 10px 0;
    font-family: 'JetBrains Mono', monospace; font-size: 13px;
    white-space: pre-wrap; color: var(--text);
  }
  .metric-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 8px; padding: 16px; text-align: center;
  }
  h1, h2, h3 { font-family: 'Geist', sans-serif !important; color: var(--text) !important; }
  .stButton > button {
    background: #5eead4 !important; color: #0a0e1a !important;
    font-weight: 600; border: none; border-radius: 6px;
    padding: 8px 20px;
  }
</style>
""", unsafe_allow_html=True)

# ── Header ───────────────────────────────────────────────────────
st.markdown("# ◈ Trade Scanner")
st.markdown("SMC · ICT · Price Action · A+ setups only")
st.divider()

tab1, tab2, tab3 = st.tabs(["Single Analysis", "Watchlist Scan", "Backtest"])

# ══════════════════════════════════════════════════════════════════
# TAB 1 — SINGLE SYMBOL ANALYSIS
# ══════════════════════════════════════════════════════════════════
with tab1:
    col1, col2, col3 = st.columns([2, 1, 1])
    with col1:
        symbol = st.text_input("Symbol", value="BTC/USDT",
                               help="Crypto: BTC/USDT | Equity: NIFTY, BANKNIFTY, RELIANCE.NS")
    with col2:
        timeframe = st.selectbox("Timeframe", ["15m", "1h", "4h", "1d", "1w"], index=2)
    with col3:
        bars = st.number_input("Bars", min_value=100, max_value=1000, value=300, step=50)

    run_btn = st.button("Run Analysis", key="single_run")

    if run_btn:
        with st.spinner(f"Fetching {symbol} {timeframe}..."):
            try:
                # Fetch and analyse
                df = fetch_ohlcv(symbol, interval=timeframe, bars=int(bars))
                analysis = analyse(df)
                analysis["symbol"] = symbol
                analysis["timeframe"] = timeframe

                # ── Metrics row ───────────────────────────────────
                price = analysis["current_price"]
                ind = analysis["indicators"]
                st = analysis["structure"]

                c1, c2, c3, c4, c5 = st.columns(5) if hasattr(st, "columns") else (None,)*5

                cols = globals()["st"].columns(5)
                cols[0].metric("Price", f"{price:.4f}")
                cols[1].metric("RSI", f"{ind['rsi']:.1f}")
                cols[2].metric("EMA 50", f"{ind['ema_50']:.4f}")
                cols[3].metric("Structure", analysis["structure"]["bias"])
                cols[4].metric("ATR", f"{ind['atr']:.4f}")

                # ── Chart ─────────────────────────────────────────
                fig = go.Figure()
                fig.add_trace(go.Candlestick(
                    x=df.index, open=df["open"], high=df["high"],
                    low=df["low"], close=df["close"],
                    name=symbol,
                    increasing_line_color="#10b981",
                    decreasing_line_color="#f43f5e",
                ))

                # EMA overlays
                ema50_series = analysis["df"]["ema_50"]
                ema200_series = analysis["df"]["ema_200"]
                fig.add_trace(go.Scatter(x=df.index, y=ema50_series,
                                         line=dict(color="#fbbf24", width=1), name="EMA 50"))
                fig.add_trace(go.Scatter(x=df.index, y=ema200_series,
                                         line=dict(color="#818cf8", width=1), name="EMA 200"))

                # Order block zones
                for ob in analysis["order_blocks"]:
                    color = "rgba(16,185,129,0.15)" if ob["type"] == "Bullish OB" else "rgba(244,63,94,0.15)"
                    border = "#10b981" if ob["type"] == "Bullish OB" else "#f43f5e"
                    fig.add_hrect(y0=ob["bottom"], y1=ob["top"],
                                  fillcolor=color, line_width=1, line_color=border,
                                  annotation_text=ob["type"], annotation_position="top left")

                # FVG zones
                for fvg in analysis["fvgs"]:
                    color = "rgba(94,234,212,0.10)" if fvg["type"] == "Bullish FVG" else "rgba(251,191,36,0.10)"
                    fig.add_hrect(y0=fvg["bottom"], y1=fvg["top"],
                                  fillcolor=color, line_width=0)

                fig.update_layout(
                    paper_bgcolor="#0a0e1a", plot_bgcolor="#0a0e1a",
                    font=dict(color="#94a3b8"),
                    xaxis=dict(gridcolor="#1f2937", rangeslider_visible=False),
                    yaxis=dict(gridcolor="#1f2937"),
                    height=500,
                    legend=dict(bgcolor="#131826", bordercolor="#1f2937"),
                    margin=dict(l=0, r=0, t=30, b=0),
                )
                globals()["st"].plotly_chart(fig, use_container_width=True)

                # ── Trade setup ───────────────────────────────────
                globals()["st"].markdown("### Trade Setup")
                setup = generate_setup(symbol, timeframe, int(bars))
                globals()["st"].markdown(f'<div class="setup-box">{setup}</div>', unsafe_allow_html=True)

            except Exception as e:
                globals()["st"].error(f"Error: {e}")

# ══════════════════════════════════════════════════════════════════
# TAB 2 — WATCHLIST SCAN
# ══════════════════════════════════════════════════════════════════
with tab2:
    st2 = globals()["st"]

    default_watchlist = "BTC/USDT\nETH/USDT\nSOL/USDT\nNIFTY\nBANKNIFTY"
    watchlist_input = st2.text_area("Watchlist (one per line)", value=default_watchlist, height=150)
    tf_scan = st2.selectbox("Timeframe", ["1h", "4h", "1d"], index=1, key="wl_tf")

    if st2.button("Scan All", key="scan_btn"):
        symbols = [s.strip() for s in watchlist_input.strip().split("\n") if s.strip()]
        with st2.spinner(f"Scanning {len(symbols)} symbols on {tf_scan}..."):
            results = scan_watchlist(symbols, tf_scan)
            for res in results:
                is_trade = "NO TRADE" not in res and "ERROR" not in res
                if is_trade:
                    st2.success("A+ Setup Found")
                elif "ERROR" in res:
                    st2.error(res)
                else:
                    st2.info(res[:200])
                st2.markdown(f'<div class="setup-box">{res}</div>', unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════════════
# TAB 3 — BACKTEST
# ══════════════════════════════════════════════════════════════════
with tab3:
    st3 = globals()["st"]
    col_a, col_b, col_c = st3.columns(3)
    with col_a:
        bt_symbol = st3.text_input("Symbol", value="BTC/USDT", key="bt_sym")
    with col_b:
        bt_tf = st3.selectbox("Timeframe", ["1d", "4h", "1h"], key="bt_tf")
    with col_c:
        bt_bars = st3.number_input("Bars", min_value=200, max_value=1000, value=500, step=50, key="bt_bars")

    if st3.button("Run Backtest", key="bt_run"):
        with st3.spinner("Running 4-strategy backtest..."):
            try:
                result = run_backtest(bt_symbol, bt_tf, int(bt_bars))
                report = format_backtest_report(result)
                st3.markdown(f'<div class="setup-box">{report}</div>', unsafe_allow_html=True)

                # Metrics table
                rows = []
                for name, m in result["strategies"].items():
                    if "error" not in m:
                        rows.append({
                            "Strategy": name,
                            "Trades": m.get("total_trades", 0),
                            "Win Rate": f"{m.get('win_rate',0)*100:.1f}%",
                            "Avg RR": f"1:{m.get('avg_rr',0):.2f}",
                            "Expectancy": f"{m.get('expectancy_r',0):.2f}R",
                            "Max DD": f"{m.get('max_drawdown_r',0):.2f}R",
                            "Status": "✅ Keep" if m.get("kept") else "❌ Discard",
                        })
                if rows:
                    st3.dataframe(pd.DataFrame(rows), use_container_width=True)
                st3.markdown(f"**Recommended:** `{result['recommended']}`")

            except Exception as e:
                st3.error(f"Backtest error: {e}")
