#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════
# NIFTY Intelligence System — One-Command Cloud Setup
# Run this inside Google Cloud Shell (browser terminal)
# Takes ~10 minutes, fully automatic after you answer 2 questions
# ══════════════════════════════════════════════════════════════
set -e

# ── Colours for readable output ──────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓ $1${NC}"; }
info() { echo -e "${YELLOW}▸ $1${NC}"; }
err()  { echo -e "${RED}✗ $1${NC}"; exit 1; }

echo ""
echo "══════════════════════════════════════════════════════"
echo "   NIFTY Option Chain Intelligence — Cloud Setup"
echo "══════════════════════════════════════════════════════"
echo ""

# ── 1. Get project ID ─────────────────────────────────────────
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
  read -p "Enter your Google Cloud Project ID: " PROJECT_ID
  gcloud config set project "$PROJECT_ID"
fi
ok "Project: $PROJECT_ID"

REGION="asia-south1"    # Mumbai
SERVICE="nifty-backend"
IMAGE="gcr.io/$PROJECT_ID/$SERVICE"

# ── 2. Enable required Google Cloud APIs ──────────────────────
info "Enabling APIs (takes ~2 minutes)..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  firestore.googleapis.com \
  artifactregistry.googleapis.com \
  --project "$PROJECT_ID" --quiet
ok "APIs enabled"

# ── 3. Create Firestore database ──────────────────────────────
info "Setting up Firestore database..."
gcloud firestore databases create \
  --region=asia-south1 \
  --project "$PROJECT_ID" --quiet 2>/dev/null || true
ok "Firestore ready"

# ── 4. Build & deploy backend to Cloud Run ────────────────────
info "Building backend Docker image (takes ~3 minutes)..."
cd "$(dirname "$0")/backend"

gcloud builds submit \
  --tag "$IMAGE" \
  --project "$PROJECT_ID"
ok "Image built"

info "Deploying backend to Cloud Run..."
gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --concurrency 80 \
  --timeout 60 \
  --set-env-vars "\
FYERS_APP_ID=I3BFKK1F13-100,\
FYERS_SECRET_KEY=5FGZK2HOZ7,\
FYERS_REDIRECT_URI=http://127.0.0.1,\
TELEGRAM_BOT_TOKEN=8700298836:AAFbY2CAsYmszj45P964zT5wlmhggcCXVl4,\
TELEGRAM_CHAT_ID=8139493794,\
GCP_PROJECT_ID=$PROJECT_ID,\
REFRESH_INTERVAL=60,\
OI_SPIKE_THRESHOLD=100000" \
  --project "$PROJECT_ID"

BACKEND_URL=$(gcloud run services describe "$SERVICE" \
  --platform managed \
  --region "$REGION" \
  --format "value(status.url)" \
  --project "$PROJECT_ID")
ok "Backend live: $BACKEND_URL"

# ── 5. Build React frontend ───────────────────────────────────
info "Building frontend..."
cd "$(dirname "$0")/frontend"

# Write env file pointing to the deployed backend
cat > .env.production <<EOF
VITE_API_URL=$BACKEND_URL
VITE_WS_URL=${BACKEND_URL/https/wss}/ws
EOF

npm install --silent
npm run build
ok "Frontend built"

# ── 6. Deploy frontend to Firebase Hosting ────────────────────
info "Deploying frontend to Firebase Hosting..."
cd "$(dirname "$0")"

# Write firebase config
cat > firebase.json <<EOF
{
  "hosting": {
    "public": "frontend/dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
EOF

# Install firebase CLI if missing
if ! command -v firebase &>/dev/null; then
  npm install -g firebase-tools --silent
fi

firebase login --no-localhost
firebase use --add "$PROJECT_ID"
firebase deploy --only hosting --project "$PROJECT_ID"

FRONTEND_URL="https://$PROJECT_ID.web.app"
ok "Frontend live: $FRONTEND_URL"

# ── 7. Update backend CORS with the frontend URL ──────────────
info "Updating backend CORS settings..."
gcloud run services update "$SERVICE" \
  --region "$REGION" \
  --update-env-vars "FRONTEND_ORIGIN=$FRONTEND_URL" \
  --project "$PROJECT_ID" --quiet
ok "CORS updated"

# ── Done! ─────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════════"
echo -e "${GREEN}   DEPLOYMENT COMPLETE!${NC}"
echo "══════════════════════════════════════════════════════"
echo ""
echo -e "  Dashboard  : ${GREEN}$FRONTEND_URL${NC}"
echo -e "  Backend    : ${GREEN}$BACKEND_URL${NC}"
echo -e "  Health     : ${GREEN}$BACKEND_URL/health${NC}"
echo ""
echo "══════════════════════════════════════════════════════"
echo "  DAILY LOGIN (every morning before 9:15 AM)"
echo "══════════════════════════════════════════════════════"
echo ""
echo "  1. Open $FRONTEND_URL"
echo "  2. Click the blue 'Connect Fyers' button"
echo "  3. Log in to Fyers in the new tab that opens"
echo "  4. Copy the auth_code from the redirect URL"
echo "  5. Paste it back and click Connect"
echo "  6. Dashboard goes live — done!"
echo ""
