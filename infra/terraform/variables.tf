variable "project" {
  description = "GCP project id"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "frontend_image" {
  description = "Container image for frontend (e.g., gcr.io/project/brightpath-frontend:tag)"
  type        = string
  default     = ""
}

variable "backend_image" {
  description = "Container image for backend (e.g., gcr.io/project/brightpath-backend:tag)"
  type        = string
  default     = ""
}
