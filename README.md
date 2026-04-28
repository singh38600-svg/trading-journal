# 📈 Trading Journal — Live P&L Dashboard

A free, self-hosted trading journal that syncs live with your Fyers account.

## What it does
- Pulls trades and positions from Fyers automatically
- Stores everything in your Supabase database
- Shows a beautiful dashboard with P&L, equity curve, win rate, drawdown, and more
- Runs free on Streamlit Community Cloud

## How to use (daily)
1. Open your app URL
2. Go to the "🔑 Fyers Auth" page in the sidebar
3. Click the login link, paste the auth_code, get a token
4. Update `FYERS_ACCESS_TOKEN` in Streamlit Secrets
5. Go back to main dashboard, click "🔄 Sync Now"

That's it. Tokens expire daily so this 1-min step is required each morning.

## Tech stack
- **Streamlit** — dashboard UI (Python)
- **Supabase** — Postgres database (free tier)
- **Fyers API v3** — broker connection
- **Plotly** — charts

## Files
- `app.py` — main dashboard
- `pages/1_🔑_Fyers_Auth.py` — daily token generator
- `requirements.txt` — Python dependencies
