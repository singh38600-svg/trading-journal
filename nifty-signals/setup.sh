#!/bin/bash
# NIFTY Intelligence System — Full Google Cloud Setup Script
# Run this ONCE from Google Cloud Shell after billing is enabled.
set -e

PROJECT_ID="nifty-signals"
REGION="asia-south1"
SERVICE="nifty-backend"

echo "============================================"
echo "  NIFTY Smart Money System — Cloud Setup   "
echo "============================================"
echo ""

# ── Step 1: Set project ──────────────────────────────────────────────────────
echo "[1/8] Setting Google Cloud project..."
gcloud config set project $PROJECT_ID 2>/dev/null || {
  echo "Project $PROJECT_ID not found. Creating it..."
  gcloud projects create $PROJECT_ID --name="NIFTY Signals" || true
  gcloud config set project $PROJECT_ID
}
echo "      ✓ Project: $PROJECT_ID"

# ── Step 2: Enable APIs ──────────────────────────────────────────────────────
echo "[2/8] Enabling required APIs (takes ~2 min)..."
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  firestore.googleapis.com \
  artifactregistry.googleapis.com \
  --project=$PROJECT_ID
echo "      ✓ APIs enabled"

# ── Step 3: Create Firestore DB ──────────────────────────────────────────────
echo "[3/8] Creating Firestore database..."
gcloud firestore databases create --location=asia-south1 --project=$PROJECT_ID 2>/dev/null || \
  echo "      (Firestore already exists — OK)"
echo "      ✓ Firestore ready"

# ── Step 4: Create Artifact Registry repo ───────────────────────────────────
echo "[4/8] Creating container registry..."
gcloud artifacts repositories create nifty-repo \
  --repository-format=docker \
  --location=$REGION \
  --project=$PROJECT_ID 2>/dev/null || \
  echo "      (Registry already exists — OK)"
gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet
echo "      ✓ Registry ready"

# ── Step 5: Build & push backend Docker image ────────────────────────────────
echo "[5/8] Building backend Docker image (takes ~5 min)..."
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/nifty-repo/${SERVICE}:latest"
gcloud builds submit ./backend \
  --tag=$IMAGE \
  --project=$PROJECT_ID
echo "      ✓ Image built and pushed"

# ── Step 6: Deploy to Cloud Run ──────────────────────────────────────────────
echo "[6/8] Deploying backend to Cloud Run..."
gcloud run deploy $SERVICE \
  --image=$IMAGE \
  --platform=managed \
  --region=$REGION \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=2 \
  --port=8080 \
  --set-env-vars="FYERS_APP_ID=I3BFKK1F13-100,FYERS_SECRET_KEY=5FGZK2HOZ7,TELEGRAM_BOT_TOKEN=8700298836:AAFbY2CAsYmszj45P964zT5wlmhggcCXVl4,TELEGRAM_CHAT_ID=8139493794,REFRESH_INTERVAL=60" \
  --project=$PROJECT_ID

BACKEND_URL=$(gcloud run services describe $SERVICE \
  --platform=managed --region=$REGION \
  --format='value(status.url)' --project=$PROJECT_ID)
echo "      ✓ Backend: $BACKEND_URL"

# ── Step 7: Build frontend ────────────────────────────────────────────────────
echo "[7/8] Building frontend..."
cd frontend
npm install --silent
VITE_API_URL="${BACKEND_URL}" \
VITE_WS_URL="${BACKEND_URL/https/wss}/ws" \
npm run build
cd ..
echo "      ✓ Frontend built"

# ── Step 8: Deploy to Firebase Hosting ──────────────────────────────────────
echo "[8/8] Deploying frontend to Firebase Hosting..."
npm install -g firebase-tools --silent 2>/dev/null || true

# Firebase login
firebase login --no-localhost 2>/dev/null || firebase login

firebase use $PROJECT_ID --add 2>/dev/null || firebase use $PROJECT_ID
firebase deploy --only hosting --project=$PROJECT_ID

FRONTEND_URL="https://${PROJECT_ID}.web.app"

echo ""
echo "============================================"
echo "  DEPLOYMENT COMPLETE!                     "
echo "============================================"
echo ""
echo "  Dashboard : $FRONTEND_URL"
echo "  Backend   : $BACKEND_URL"
echo ""
echo "  DAILY STEPS (every morning before 9:15 AM):"
echo "  1. Open $FRONTEND_URL"
echo "  2. Click 'Connect Fyers'"
echo "  3. Log in to Fyers → copy auth_code from URL"
echo "  4. Paste it in the dashboard → click Connect"
echo "  5. Done! Dashboard shows live data."
echo ""
echo "  Telegram alerts go to @Nifty50Otionbot"
echo "============================================"
