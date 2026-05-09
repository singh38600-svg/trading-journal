# NIFTY Option Chain Intelligence System

Real-time institutional-grade option chain analysis for NIFTY.
Decodes smart money positioning, detects traps, generates 32 signals, and fires Telegram alerts.

---

## What it does

| Feature | Details |
|---|---|
| Option Chain | Live CE/PE heatmap with OI, volume, IV, buildup classification |
| 32 Signals | PCR (3 types), SMI, S/R zones, Trap detection, Max Pain, Breakout, Reversal, Gamma, Liquidity… |
| Futures | Premium tracker, buildup, divergence vs options (strongest signal) |
| Telegram | 9 alert types: SMI level, bias change, trap, OI spike, breakout, S/R test, session summaries |
| Storage | Google Firestore — all snapshots, alerts, token persisted across restarts |
| Real-time | WebSocket push — frontend updates every 60 seconds during market hours (9:15–15:30 IST) |

---

## Project Structure

```
nifty-signals/
├── backend/
│   ├── main.py              ← FastAPI app, WebSocket, background refresh
│   ├── signals.py           ← All 32 signal calculations
│   ├── fyers_client.py      ← Fyers API v3 wrapper (auth + data)
│   ├── telegram_alerts.py   ← Telegram bot (9 alert formatters)
│   ├── firestore_client.py  ← Firestore persistence
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example         ← Copy to .env and fill in
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── hooks/useWebSocket.js
│   │   └── components/
│   │       ├── Header.jsx
│   │       ├── SignalCards.jsx        ← SMI gauge, PCR, Bias, Trap, S/R, Confidence
│   │       ├── OptionChainHeatmap.jsx ← Full chain with heat coloring
│   │       ├── FuturesPanel.jsx
│   │       ├── SignalsPanel.jsx
│   │       └── HistoricalLog.jsx
│   └── package.json
└── deploy.sh                ← One-command deploy to GCP
```

---

## Setup — Local (for testing)

### Prerequisites
- Python 3.11+
- Node.js 18+
- Fyers account with API app created

### 1. Backend

```bash
cd backend
cp .env.example .env          # credentials are already pre-filled
pip install -r requirements.txt
uvicorn main:app --reload --port 8080
```

Open **http://localhost:8080/docs** — you'll see the interactive API.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

### 3. Daily auth (every morning before market open)

1. Click **Connect Fyers** button on the dashboard
2. The Fyers login page opens in a new tab
3. Log in with your Fyers credentials
4. After login, Fyers redirects to `http://127.0.0.1` — copy the `auth_code` value from the URL
5. Paste it into the auth modal on the dashboard and click **Connect**
6. The dashboard starts loading live data immediately

---

## Deploy to Google Cloud

### Prerequisites (one-time)

```bash
# Install Google Cloud CLI
# https://cloud.google.com/sdk/docs/install

gcloud auth login
gcloud config set project nifty-signals

# Enable required APIs
gcloud services enable run.googleapis.com \
  cloudbuild.googleapis.com \
  firestore.googleapis.com

# Create Firestore database (one-time)
gcloud firestore databases create --region=asia-south1

# Install Firebase CLI
npm install -g firebase-tools
firebase login
firebase init hosting   # select nifty-signals project, use frontend/dist as public dir
```

### Deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

This:
1. Builds the Docker image and pushes to Google Container Registry
2. Deploys backend to Cloud Run (Mumbai region)
3. Builds React frontend with the backend URL
4. Deploys frontend to Firebase Hosting

Takes ~5 minutes on first deploy, ~2 minutes after.

---

## API Reference

All endpoints available at `http://localhost:8080/docs` (Swagger UI)

| Endpoint | Method | Description |
|---|---|---|
| `/auth/url` | GET | Get Fyers login URL |
| `/auth/token?auth_code=XXX` | POST | Exchange auth_code for token |
| `/auth/status` | GET | Check if authenticated |
| `/chain` | GET | Latest processed signals (all 32) |
| `/chain/refresh` | POST | Force immediate refresh |
| `/expiries` | GET | Available NIFTY expiry dates |
| `/history?days=7` | GET | Historical signal log |
| `/ws` | WebSocket | Real-time push (connects automatically) |
| `/health` | GET | System health check |

---

## Signals Reference

### Options (25 signals)
1. PCR OI — `total_pe_oi / total_ce_oi`
2. PCR Volume
3. Weighted PCR
4–5. OI Buildup (Long/Short Buildup, Covering, Unwinding) — per strike
6. Zone Strength — STRONG / MODERATE / WEAK / NEGLIGIBLE
7–8. Support & Resistance strikes (highest OI)
9–10. S/R Zones (cluster of top 3 consecutive strikes)
11. Smart Money Index (0–100 composite)
12. Trap Detection (Bull/Bear Trap)
13. Trap Probability (%)
14. Market Bias (BULLISH / BEARISH / NEUTRAL)
15. Confidence Score
16. OI Spike Alert (scalping — fires once per strike per session)
17. IV Spike Alert
18. Gamma Exposure (simplified)
19. Liquidity Score
20. Session Behavior (Opening / Mid-day / Closing phase)
21. Max Pain
22. Net OI Flow
23. Aggressive Writing Detection
24. Breakout Signal (price + OI + volume confirmation)
25. Reversal Signal

### Futures (7 signals)
26. Futures Buildup
27. Premium (Futures − Spot)
28. Premium Trend (Expanding / Flat / Shrinking)
29. **Futures ↔ Options Divergence** (strongest signal)
30. Combined SMI v2
31. Rollover Tracking
32. Futures Volume Ratio (vs 5-day average)

---

## Telegram Alerts

Your bot @Nifty50Otionbot sends to chat `8139493794`:

| # | Alert | Trigger |
|---|---|---|
| 1 | 🚀/🔻 SMI Level | SMI crosses 70 or drops below 30 |
| 2 | 🔄 Bias Change | BULLISH ↔ BEARISH ↔ NEUTRAL flip |
| 3 | ⚠ Trap Detected | Bull/Bear trap conditions met |
| 4 | ⚡ OI Spike | Strike OI change > 100,000 |
| 5 | 📈 IV Spike | IV jumps >20% |
| 6 | 🎯 S/R Test | Spot within 50 pts of key level |
| 7 | 🚀 Breakout | Price + OI + volume confirmed |
| 8 | 📊 Session Summary | Auto at 9:30, 12:00, 15:15 IST |
| 9 | 🔥 Futures Divergence | Options vs Futures conflict |

---

## Troubleshooting

**"Not authenticated" error**
→ Complete the daily Fyers auth (Connect Fyers button). Tokens expire at midnight.

**No data showing**
→ Check market hours (9:15–15:30 IST weekdays). Use `POST /chain/refresh` to force a fetch.

**Telegram not sending**
→ Verify bot token and chat ID in `.env`. The bot must have sent at least one message to the chat first.

**Firestore permission denied**
→ Set `GOOGLE_APPLICATION_CREDENTIALS` to your service account JSON path, or run on Cloud Run (uses default credentials automatically).

**IV showing 0 for all strikes**
→ IV requires `ltp > 0`. Deep ITM/OTM strikes with zero price will show 0 — this is correct behaviour.
