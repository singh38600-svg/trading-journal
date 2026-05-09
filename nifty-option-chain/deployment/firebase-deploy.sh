#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Deploy NIFTY frontend to Firebase Hosting
# Run from repo root: bash deployment/firebase-deploy.sh <BACKEND_URL>
# ──────────────────────────────────────────────────────────────────────────────
set -e

BACKEND_URL="${1:-https://nifty-backend-XXXX-uc.a.run.app}"
PROJECT_ID="nifty-signals"

echo "==> Building React frontend..."
cd frontend

# Write production env
cat > .env.production <<EOF
VITE_API_URL=$BACKEND_URL
VITE_WS_URL=${BACKEND_URL/https/wss}/ws/live
EOF

npm install
npm run build
cd ..

echo "==> Deploying to Firebase Hosting..."
npx firebase-tools deploy --only hosting --project "$PROJECT_ID"

echo ""
echo "==> Frontend deployed! Check Firebase console for URL."
