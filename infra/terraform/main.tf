terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = var.project
  region  = var.region
}

variable "project" {}
variable "region" { default = "us-central1" }

# Note: Firestore must be enabled via the console or gcloud before creating collections.
# This template is a starter: add resources for Cloud Run, service accounts, IAM bindings, and Vertex AI.
