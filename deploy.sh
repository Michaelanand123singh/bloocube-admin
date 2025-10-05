#!/usr/bin/env bash
set -euo pipefail

# Usage: ./deploy.sh <PROJECT_ID> <REGION>
PROJECT_ID=${1:-}
REGION=${2:-us-central1}
SERVICE=bloocube-admin
IMAGE=gcr.io/${PROJECT_ID}/${SERVICE}:$(git rev-parse --short HEAD || echo latest)

if [[ -z "${PROJECT_ID}" ]]; then
  echo "PROJECT_ID is required. Usage: ./deploy.sh <PROJECT_ID> <REGION>" >&2
  exit 1
fi

echo "Building image: ${IMAGE}"
 gcloud builds submit --project ${PROJECT_ID} --tag ${IMAGE} .

echo "Deploying to Cloud Run: ${SERVICE} in ${REGION}"
 gcloud run deploy ${SERVICE} \
  --project ${PROJECT_ID} \
  --image ${IMAGE} \
  --region ${REGION} \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars NODE_ENV=production \
  --set-env-vars NEXT_PUBLIC_ADMIN_API_URL=${NEXT_PUBLIC_ADMIN_API_URL:-https://YOUR_BACKEND_HOST}

echo "Done. Service URL:"
 gcloud run services describe ${SERVICE} --project ${PROJECT_ID} --region ${REGION} --format 'value(status.url)'
