#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# One-time GCP project setup for nifty-signals
# Run once from your local machine after installing gcloud CLI.
# ──────────────────────────────────────────────────────────────────────────────
set -e

PROJECT_ID="nifty-signals"
REGION="asia-south1"
SA_NAME="nifty-backend-sa"
SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

echo "==> Setting project..."
gcloud config set project "$PROJECT_ID"

echo "==> Enabling required APIs..."
gcloud services enable \
  run.googleapis.com \
  firestore.googleapis.com \
  containerregistry.googleapis.com \
  firebase.googleapis.com

echo "==> Creating service account..."
gcloud iam service-accounts create "$SA_NAME" \
  --display-name "NIFTY Backend Service Account" || true

echo "==> Granting Firestore access..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member "serviceAccount:$SA_EMAIL" \
  --role "roles/datastore.user"

echo "==> Downloading service account key..."
gcloud iam service-accounts keys create backend/service-account.json \
  --iam-account "$SA_EMAIL"

echo ""
echo "==> GCP setup complete!"
echo "    Add GOOGLE_APPLICATION_CREDENTIALS=service-account.json to .env"
echo "    Keep service-account.json SECRET — never commit it to git!"
echo ""
echo "==> Next steps:"
echo "    1. Run: bash deployment/cloud-run-deploy.sh"
echo "    2. Run: bash deployment/firebase-deploy.sh <backend-url>"
