resource "google_artifact_registry_repository" "brightpath_repo" {
  provider = google
  project  = var.project
  location = var.region
  repository_id = "brightpath-repo"
  description   = "Artifact Registry repo for BrightPath container images"
  format = "DOCKER"
  kms_key_name = null
}

# Grant the deployer SA permission to write to the repository
resource "google_artifact_registry_repository_iam_member" "deployer_writer" {
  project    = var.project
  location   = var.region
  repository = google_artifact_registry_repository.brightpath_repo.repository_id
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${google_service_account.deployer.email}"
}

output "artifact_registry_repo" {
  value = "${var.region}-docker.pkg.dev/${var.project}/${google_artifact_registry_repository.brightpath_repo.repository_id}"
}
