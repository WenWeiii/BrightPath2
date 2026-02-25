#!/usr/bin/env bash
set -euo pipefail

# Helper to build, tag, push images to Artifact Registry and deploy to Cloud Run.
# Usage: PROJECT=your-project REGION=us-central1 TAG=v1 ./scripts/push_and_deploy.sh

PROJECT=${PROJECT:-$(gcloud config get-value project 2>/dev/null)}
REGION=${REGION:-us-central1}
TAG=${TAG:-latest}
REPO=${REPO:-${REGION}-docker.pkg.dev/${PROJECT}/brightpath-repo}

if [ -z "$PROJECT" ]; then
  echo "Set PROJECT env or run 'gcloud config set project <PROJECT>'"
  exit 1
fi

echo "Using PROJECT=$PROJECT REGION=$REGION TAG=$TAG REPO=$REPO"

echo "Building frontend..."
docker build -t brightpath-frontend:local frontend/
echo "Tagging and pushing frontend..."
docker tag brightpath-frontend:local ${REPO}/brightpath-frontend:${TAG}
docker push ${REPO}/brightpath-frontend:${TAG}

echo "Building backend..."
docker build -t brightpath-backend:local backend/
echo "Tagging and pushing backend..."
docker tag brightpath-backend:local ${REPO}/brightpath-backend:${TAG}
docker push ${REPO}/brightpath-backend:${TAG}

echo "Deploying backend to Cloud Run..."
gcloud run deploy brightpath-backend \
  --image ${REPO}/brightpath-backend:${TAG} \
  --region ${REGION} --platform managed --allow-unauthenticated

echo "Deploying frontend to Cloud Run..."
gcloud run deploy brightpath-frontend \
  --image ${REPO}/brightpath-frontend:${TAG} \
  --region ${REGION} --platform managed --allow-unauthenticated

echo "Done."
