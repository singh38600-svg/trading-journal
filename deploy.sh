#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════
# NIFTY Option Chain Intelligence System — Deploy Script
# Deploys backend to Google Cloud Run + frontend to Firebase Hosting
#
# Prerequisites (run once):
#   gcloud auth login
#   gcloud config set project nifty-signals
#   firebase login
#   npm install -g firebase-tools
# ══════════════════════════════════════════════════════════════════
set -e

PROJECT_ID="nifty-signals"
REGION="asia-south1"          # Mumbai — lowest latency for India
SERVICE="nifty-backend"
IMAGE="gcr.io/$PROJECT_ID/$SERVICE"

echo ""
echo "══════════════════════════════════════════════"
echo "  NIFTY Intelligence System — Deploying"
echo "══════════════════════════════════════════════"

# ── STEP 1: Build & push backend Docker image ────────────────────
echo ""
echo "▸ Step 1/4: Building Docker image..."
cd "$(dirname "$0")/backend"

gcloud builds submit \
  --tag "$IMAGE" \
  --project "$PROJECT_ID"

# ── STEP 2: Deploy backend to Cloud Run ─────────────────────────
echo ""
echo "▸ Step 2/4: Deploying to Cloud Run..."

gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --concurrency 80 \
  --timeout 60 \
  --set-env-vars "FYERS_APP_ID=I3BFKK1F13-100,\
FYERS_SECRET_KEY=5FGZK2HOZ7,\
FYERS_REDIRECT_URI=http://127.0.0.1,\
TELEGRAM_BOT_TOKEN=8700298836:AAFbY2CAsYmszj45P964zT5wlmhggcCXVl4,\
TELEGRAM_CHAT_ID=8139493794,\
GCP_PROJECT_ID=$PROJECT_ID,\
REFRESH_INTERVAL=60,\
OI_SPIKE_THRESHOLD=100000" \
  --project "$PROJECT_ID"

# Get the deployed URL
BACKEND_URL=$(gcloud run services describe "$SERVICE" \
  --platform managed \
  --region "$REGION" \
  --format "value(status.url)" \
  --project "$PROJECT_ID")

echo ""
echo "✅ Backend deployed: $BACKEND_URL"

# Update CORS — set FRONTEND_ORIGIN once we know the Firebase URL
# (Will be updated automatically on next deploy after Step 4)

# ── STEP 3: Build frontend ───────────────────────────────────────
echo ""
echo "▸ Step 3/4: Building React frontend..."
cd "$(dirname "$0")/frontend"

# Write environment file pointing to deployed backend
cat > .env.production <<EOF
VITE_API_URL=$BACKEND_URL
VITE_WS_URL=${BACKEND_URL/https/wss}/ws
EOF

npm install --silent
npm run build

# ── STEP 4: Deploy frontend to Firebase Hosting ─────────────────
echo ""
echo "▸ Step 4/4: Deploying to Firebase Hosting..."

# Initialize firebase.json if not present
if [ ! -f "$(dirname "$0")/firebase.json" ]; then
  cat > "$(dirname "$0")/firebase.json" <<FBEOF
{
  "hosting": {
    "public": "frontend/dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
FBEOF
fi

cd "$(dirname "$0")"
firebase deploy --only hosting --project "$PROJECT_ID"

FRONTEND_URL=$(firebase hosting:sites:get nifty-signals --project "$PROJECT_ID" 2>/dev/null | grep -o 'https://[^ ]*' | head -1 || echo "https://$PROJECT_ID.web.app")

echo ""
echo "══════════════════════════════════════════════"
echo "  DEPLOYMENT COMPLETE"
echo "══════════════════════════════════════════════"
echo "  Backend  : $BACKEND_URL"
echo "  Frontend : $FRONTEND_URL"
echo "  Health   : $BACKEND_URL/health"
echo "  API Docs : $BACKEND_URL/docs"
echo "══════════════════════════════════════════════"
echo ""
echo "Daily auth flow:"
echo "  1. Open $FRONTEND_URL"
echo "  2. Click 'Connect Fyers' → log in → paste auth_code"
echo "  3. Dashboard goes live automatically"
echo ""
