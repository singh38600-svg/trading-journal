#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Deploy NIFTY backend to Google Cloud Run
# Run this from the repo root: bash deployment/cloud-run-deploy.sh
# ──────────────────────────────────────────────────────────────────────────────
set -e

PROJECT_ID="nifty-signals"
REGION="asia-south1"         # Mumbai — lowest latency for Indian markets
SERVICE_NAME="nifty-backend"
IMAGE="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "==> Building Docker image..."
cd backend
docker build -t "$IMAGE" .
cd ..

echo "==> Pushing image to Google Container Registry..."
docker push "$IMAGE"

echo "==> Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --timeout 300 \
  --set-env-vars "GCP_PROJECT_ID=$PROJECT_ID" \
  --set-env-vars "FYERS_APP_ID=I3BFKK1F13-100" \
  --set-env-vars "FYERS_SECRET_KEY=5FGZK2HOZ7" \
  --set-env-vars "FYERS_REDIRECT_URI=http://127.0.0.1" \
  --set-env-vars "TELEGRAM_BOT_TOKEN=8700298836:AAFbY2CAsYmszj45P964zT5wlmhggcCXVl4" \
  --set-env-vars "TELEGRAM_CHAT_ID=8139493794"

echo ""
echo "==> Deployment complete!"
BACKEND_URL=$(gcloud run services describe "$SERVICE_NAME" \
  --project "$PROJECT_ID" --region "$REGION" --format "value(status.url)")
echo "    Backend URL: $BACKEND_URL"
echo ""
echo "==> Update frontend/.env.production with:"
echo "    VITE_API_URL=$BACKEND_URL"
echo "    VITE_WS_URL=${BACKEND_URL/https/wss}/ws/live"
