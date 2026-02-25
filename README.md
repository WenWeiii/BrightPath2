# BrightPath-Vertex (scaffold)

[![CI/CD (Build -> GCR -> Cloud Run)](https://github.com/WenWeiii/BrightPath2/actions/workflows/ci-cd.yml/badge.svg?branch=main)](https://github.com/WenWeiii/BrightPath2/actions/workflows/ci-cd.yml)

This repository is a scaffold for a scalable web application using Google Cloud and Vertex AI focused on SDG 13 (Climate Action) and SDG 3 (Good Health).

Structure:
- `frontend/` — Next.js (TypeScript) dashboard demo
- `backend/` — Node.js (TypeScript) API with Vertex AI client example
- `ml/` — sample Vertex AI training and prediction scripts
- `infra/` — sample Terraform templates and deployment notes
- `cloudbuild.yaml` — example Cloud Build pipeline

See the README files in each folder for local run instructions.

## SDG Mapping

- **SDG 13 — Climate Action**: The app ingests and analyzes environmental sensor data (e.g., PM2.5, temperature, humidity) to provide near-term air-quality predictions. These predictions can inform alerts, reduce exposure and support community-level climate resilience.
- **SDG 3 — Good Health and Well-being**: By predicting air quality and surfacing risk indicators, the app helps protect public health — particularly respiratory and cardiovascular outcomes linked to air pollution.

## Vertex AI Integration Notes

- `backend/src/vertexClient.ts` contains a small helper showing how to call a Vertex AI endpoint using Application Default Credentials.
- For local development the `ml/predict.py` Flask server mocks a Vertex endpoint. Set `USE_VERTEX=true` and provide `GCP_PROJECT`, `VERTEX_LOCATION`, and `VERTEX_ENDPOINT_ID` to use real Vertex endpoints.

## CI / CD (Cloud Build -> Cloud Run)

This repository includes a `cloudbuild.yaml` pipeline that:

- Builds and pushes the frontend and backend container images to Container Registry.
- Deploys each image to Cloud Run services `brightpath-frontend` and `brightpath-backend`.

To enable and run Cloud Build deploys:

1. Enable required APIs: `gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com`
2. Grant Cloud Build service account the roles: `roles/run.admin`, `roles/iam.serviceAccountUser`, and `roles/storage.admin`.
3. Trigger a build from your repo (or push to a branch configured with Cloud Build triggers) which will run `cloudbuild.yaml` and deploy.

Adjust `cloudbuild.yaml` substitutions for `_REGION` as needed.

## GitHub Actions CI/CD

This repository also includes a GitHub Actions workflow (`.github/workflows/ci-cd.yml`) as an alternative to Cloud Build. The workflow:

- Builds Docker images for frontend and backend
- Pushes images to Container Registry (GCR)
- Deploys both services to Cloud Run

Required repository secrets:

- `GCP_PROJECT` — your GCP project id
- `GCP_SA_KEY` — JSON service account key with sufficient permissions (roles/run.admin, roles/storage.admin, roles/iam.serviceAccountUser)
- `GCP_REGION` — optional, default is `us-central1`

To enable the GitHub Actions deploy, create the above secrets in your repository settings and push to `main` (or run the workflow manually via Actions -> Run workflow).

## Pushing images to Artifact Registry (examples)

After building container images locally you can push them to Artifact Registry and deploy. Replace `YOUR_PROJECT`, `REGION`, `TAG` and `REPO` as appropriate.

1) Authenticate and configure Docker to push to Artifact Registry (Docker v2):

```bash
# Authenticate gcloud
gcloud auth login
gcloud config set project YOUR_PROJECT

# Configure Docker credential helper
gcloud auth configure-docker ${REGION}-docker.pkg.dev
```

2) Tag and push an image to Artifact Registry:

```bash
# Example: tag frontend image
docker build -t brightpath-frontend:local frontend/
docker tag brightpath-frontend:local ${REGION}-docker.pkg.dev/YOUR_PROJECT/brightpath-repo/brightpath-frontend:TAG
docker push ${REGION}-docker.pkg.dev/YOUR_PROJECT/brightpath-repo/brightpath-frontend:TAG

# Example: tag backend image
docker build -t brightpath-backend:local backend/
docker tag brightpath-backend:local ${REGION}-docker.pkg.dev/YOUR_PROJECT/brightpath-repo/brightpath-backend:TAG
docker push ${REGION}-docker.pkg.dev/YOUR_PROJECT/brightpath-repo/brightpath-backend:TAG
```

3) Deploy to Cloud Run using the pushed image:

```bash
gcloud run deploy brightpath-backend \
	--image ${REGION}-docker.pkg.dev/YOUR_PROJECT/brightpath-repo/brightpath-backend:TAG \
	--region ${REGION} --platform managed --allow-unauthenticated

gcloud run deploy brightpath-frontend \
	--image ${REGION}-docker.pkg.dev/YOUR_PROJECT/brightpath-repo/brightpath-frontend:TAG \
	--region ${REGION} --platform managed --allow-unauthenticated
```

4) Useful commands:

```bash
# List services
gcloud run services list --platform managed --region ${REGION}

# View service URL
gcloud run services describe brightpath-frontend --platform managed --region ${REGION} --format="value(status.url)"

## Local helper scripts and Makefile

You can use the provided `Makefile` and `scripts/push_and_deploy.sh` to simplify builds and deployments.

Examples:

```bash
# build both images locally
make build-all

# push images and deploy using Makefile variables
PROJECT=YOUR_PROJECT REGION=us-central1 TAG=v1 make push-all deploy-all

# or use the helper script
PROJECT=YOUR_PROJECT REGION=us-central1 TAG=v1 ./scripts/push_and_deploy.sh
```

```




# BrightPath2