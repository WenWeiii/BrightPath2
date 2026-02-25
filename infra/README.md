This folder contains sample infrastructure templates and deployment notes.

- `terraform/` (recommended): create Firestore, Cloud Run, and service accounts.
 - `terraform/` (recommended): create Firestore, Cloud Run, and service accounts.

Terraform usage (starter):

1. Initialize Terraform and provide variables (project, frontend_image, backend_image):

```bash
cd infra/terraform
terraform init
terraform apply -var="project=YOUR_PROJECT_ID" \
	-var="frontend_image=gcr.io/YOUR_PROJECT/brightpath-frontend:TAG" \
	-var="backend_image=gcr.io/YOUR_PROJECT/brightpath-backend:TAG" -auto-approve
```

2. Required APIs: enable `run.googleapis.com`, `cloudbuild.googleapis.com`, `artifactregistry.googleapis.com` (or `containerregistry.googleapis.com`) and `iam.googleapis.com` before applying.

This terraform module is a minimal starter. Extend it to provision Firestore, Artifact Registry, VPC connectors, and more granular IAM.
- `gcloud` commands: use `gcloud run deploy`, `gcloud ai models upload` for Vertex.

This scaffold contains starter templates; adapt them to your project and organization.
