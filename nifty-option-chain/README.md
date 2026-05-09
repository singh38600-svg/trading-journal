# NIFTY Option Chain Intelligence System

Institutional-grade option chain analysis with 32 signals, real-time WebSocket updates, Telegram alerts, and a dark-themed React dashboard.

## Architecture

```
nifty-option-chain/
├── backend/          FastAPI + Python (Fyers API, signals, Telegram)
├── frontend/         React + Tailwind (dark dashboard)
└── deployment/       Docker + Cloud Run + Firebase scripts
```

## Daily Login (Required Every Market Day)

Fyers tokens expire at midnight. Each morning before market open:

1. Visit `http://localhost:8000/api/auth/login-url`
2. Open the returned URL in your browser
3. Log in to Fyers and approve
4. Copy the `auth_code` from the redirect URL
5. Visit `http://localhost:8000/api/auth/callback?auth_code=YOUR_CODE`

Dashboard starts streaming data automatically.

---

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # fill in values
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                     # opens http://localhost:3000
```

---

## Production Deployment (Google Cloud)

### One-time GCP Setup

```bash
bash deployment/setup-gcp.sh
```

### Deploy Backend to Cloud Run

```bash
bash deployment/cloud-run-deploy.sh
```

### Deploy Frontend to Firebase Hosting

```bash
bash deployment/firebase-deploy.sh https://YOUR-CLOUD-RUN-URL
```

---

## Signal Reference

| # | Signal | Description |
|---|--------|-------------|
| 1-3 | PCR (OI, Vol, Weighted) | Put-Call ratio variants |
| 4-5 | OI Buildup | Long/Short buildup per strike |
| 6 | Zone Strength | STRONG/MODERATE/WEAK/NEGLIGIBLE |
| 7-8 | S/R Strikes | Max OI strikes |
| 9-10 | S/R Zones | Top-3 cluster zones |
| 11 | SMI | Smart Money Index 0-100 |
| 12-13 | Trap Detection | Bull/Bear trap + probability |
| 14 | Market Bias | BULLISH/BEARISH/NEUTRAL |
| 15 | Confidence | SMI-adjusted confidence % |
| 16 | OI Spike | Scalping OI spike alerts |
| 17 | IV Spike | Volatility expansion alert |
| 18 | Gamma Exposure | Max hedging pressure strike |
| 19 | Liquidity Score | Per-strike liquidity % |
| 20 | Session Analysis | Opening/Mid-day/Closing OI comparison |
| 21 | Max Pain | Expiry target level |
| 22 | Net OI Flow | Total PE-CE OI delta |
| 23 | Aggressive Writing | Institutional selling detection |
| 24 | Breakout Confirmed | Price + OI + Volume confirmation |
| 25 | Reversal Signal | High-probability reversal detection |
| 26 | Futures Buildup | Long/Short buildup in futures |
| 27 | Futures Premium | Futures premium tracker |
| 28 | Premium Trend | Expanding/Shrinking premium |
| 29 | F/O Divergence | Strongest institutional signal |
| 30 | SMI v2 | Combined options+futures score |
| 31 | Rollover % | Rollover to next expiry |
| 32 | Futures Vol Ratio | Volume vs 5-day average |

---

## Telegram Alerts

Alerts fire automatically for:
- SMI crossing 70 or dropping below 30
- Market bias change
- Trap detection
- OI spikes (scalping)
- IV spikes
- S/R level tests
- Confirmed breakouts
- Futures-options divergence
- Scheduled session summaries (9:30, 12:00, 15:15 IST)
