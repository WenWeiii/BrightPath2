resource "google_cloud_run_service" "backend" {
  name     = "brightpath-backend"
  location = var.region

  template {
    spec {
      containers {
        image = var.backend_image
        ports {
          container_port = 8080
        }
        env {
          name  = "PORT"
          value = "8080"
        }
      }
    }
  }

  traffics {
    percent         = 100
    latest_revision = true
  }

  autogenerate_revision_name = true
}

resource "google_cloud_run_service" "frontend" {
  name     = "brightpath-frontend"
  location = var.region

  template {
    spec {
      containers {
        image = var.frontend_image
        ports {
          container_port = 8080
        }
        env {
          name  = "PORT"
          value = "8080"
        }
      }
    }
  }

  traffics {
    percent         = 100
    latest_revision = true
  }

  autogenerate_revision_name = true
}

resource "google_cloud_run_service_iam_member" "backend_invoker" {
  project = var.project
  location = var.region
  service  = google_cloud_run_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_service_iam_member" "frontend_invoker" {
  project = var.project
  location = var.region
  service  = google_cloud_run_service.frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
