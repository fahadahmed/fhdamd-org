terraform {
  required_version = ">= 1.9"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 6.0"
    }
  }
}

data "google_project" "current" {
  project_id = var.project_id
}

# ─── APIs ────────────────────────────────────────────────────────────────────

resource "google_project_service" "apis" {
  for_each = toset([
    "cloudresourcemanager.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "sts.googleapis.com",
    "firebase.googleapis.com",
    "firestore.googleapis.com",
    "storage.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "firebaseapphosting.googleapis.com",
    "identitytoolkit.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudfunctions.googleapis.com",
    "eventarc.googleapis.com",
    "pubsub.googleapis.com",
    "cloudscheduler.googleapis.com",
    "cloudbilling.googleapis.com",
  ])
  project            = var.project_id
  service            = each.key
  disable_on_destroy = false
}

# ─── Firestore ───────────────────────────────────────────────────────────────

resource "google_firestore_database" "default" {
  project     = var.project_id
  name        = "(default)"
  location_id = "nam5"
  type        = "FIRESTORE_NATIVE"

  lifecycle {
    prevent_destroy = true
  }

  depends_on = [google_project_service.apis]
}

# ─── Storage ─────────────────────────────────────────────────────────────────
# Note: Firebase's default Storage bucket must be provisioned once via
# `firebase init storage --project <project_id>` before this resource can be
# created — the Storage product itself isn't bootstrapped by this API call.

resource "google_firebase_storage_bucket" "default" {
  provider  = google-beta
  project   = var.project_id
  bucket_id = "${var.project_id}.firebasestorage.app"

  lifecycle {
    prevent_destroy = true
  }

  depends_on = [google_project_service.apis]
}

# ─── Secret Manager ──────────────────────────────────────────────────────────
# Secrets are created empty; values must be populated before first deploy.
# Run: gcloud secrets versions add <name> --data-file=- --project=<project_id>

locals {
  secret_names = toset([
    "firebaseApiKey",
    "firebaseAuthDomain",
    "firebaseProjectId",
    "firebaseStorageBucket",
    "firebaseMessengerId",
    "firebaseAppId",
    "firebaseMeasurementId",
    "firebaseServiceAccountKey",
    "recaptchaSiteKey",
    "recaptchaSecretKey",
    "baseAppUrl",
    "baseFunctionsUrl",
    "viteProjectId",
    "pdfProcessorUrl",
    "appEnv",
    "resendApiKey",
    # Bound directly by Cloud Functions via defineSecret(), not apphosting.yaml
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "APP_BASE_URL",
    "RESEND_API_KEY",
    "RESEND_AUDIENCE_ID",
    "DATOCMS_API_TOKEN",
    "DATOCMS_ENV",
  ])
}

resource "google_secret_manager_secret" "app_secrets" {
  for_each  = local.secret_names
  project   = var.project_id
  secret_id = each.key

  replication {
    auto {}
  }

  depends_on = [google_project_service.apis]
}

# ─── Artifact Registry ───────────────────────────────────────────────────────

resource "google_artifact_registry_repository" "cloud_run" {
  project       = var.project_id
  repository_id = "cloud-run-source-deploy"
  format        = "DOCKER"
  location      = var.region
  description   = "Docker images for Cloud Run services"

  depends_on = [google_project_service.apis]
}

# ─── Workload Identity Federation ────────────────────────────────────────────

resource "google_iam_workload_identity_pool" "github" {
  project                    = var.project_id
  workload_identity_pool_id  = "github-actions"
  display_name               = "GitHub Actions"
  description                = "OIDC identity pool for GitHub Actions"

  depends_on = [google_project_service.apis]
}

resource "google_iam_workload_identity_pool_provider" "github" {
  project                             = var.project_id
  workload_identity_pool_id           = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id  = "github-actions"
  display_name                        = "GitHub Actions OIDC"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
    "attribute.ref"        = "assertion.ref"
  }

  # Only tokens from this repository can use the pool
  attribute_condition = "assertion.repository == '${var.github_repo}'"
}

# ─── Service Account ─────────────────────────────────────────────────────────

resource "google_service_account" "github_deploy" {
  project      = var.project_id
  account_id   = "github-deploy"
  display_name = "GitHub Actions Deploy (${var.environment_label})"
  description  = "Impersonated by GitHub Actions via WIF to deploy pdf-craft ${var.environment_label}"
}

# Allow GitHub Actions OIDC tokens from this repo to impersonate the SA
resource "google_service_account_iam_member" "github_oidc" {
  service_account_id = google_service_account.github_deploy.name
  role                = "roles/iam.workloadIdentityUser"
  member              = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_repo}"
}

locals {
  deploy_roles = toset([
    "roles/firebase.developAdmin",      # firebase deploy (rules, functions, apphosting)
    "roles/secretmanager.admin",        # create/update secrets
    "roles/storage.admin",              # storage rules + bucket management
    "roles/datastore.owner",            # firestore rules
    "roles/run.admin",                  # cloud run (app hosting + gen2 functions)
    "roles/cloudbuild.builds.editor",   # trigger cloud builds
    "roles/artifactregistry.admin",     # push container images
    "roles/iam.serviceAccountUser",     # act as other SAs (cloud build etc.)
    "roles/cloudfunctions.developer",   # deploy gen2 functions
    "roles/eventarc.admin",             # onMessagePublished / onSchedule triggers
    "roles/pubsub.admin",               # topics/subscriptions for onMessagePublished
    "roles/cloudscheduler.admin",       # onSchedule jobs
    "roles/iam.workloadIdentityPoolAdmin", # manage the WIF pool/provider this SA authenticates through
    "roles/iam.serviceAccountAdmin",       # manage IAM policy on its own service account (WIF binding)
    "roles/resourcemanager.projectIamAdmin", # firebase deploy --only apphosting sets project IAM policy directly
  ])
}

resource "google_project_iam_member" "github_deploy" {
  for_each = local.deploy_roles
  project  = var.project_id
  role     = each.value
  member   = "serviceAccount:${google_service_account.github_deploy.email}"
}

# ─── App Hosting compute service account ─────────────────────────────────────
# Created automatically by Firebase on first backend creation, but ships with
# no IAM bindings — without these, builds fail with no logs and secrets are
# inaccessible to the running app.

locals {
  apphosting_compute_roles = toset([
    "roles/logging.logWriter",             # write build/runtime logs
    "roles/firebaseapphosting.computeRunner",
    "roles/secretmanager.secretAccessor",  # read apphosting.yaml secret payloads
    "roles/secretmanager.viewer",          # read secret version metadata (build-time resolution)
    "roles/pubsub.publisher",              # server actions publish directly to the app-event topic
  ])
}

resource "google_project_iam_member" "apphosting_compute" {
  for_each = local.apphosting_compute_roles
  project  = var.project_id
  role     = each.value
  member   = "serviceAccount:firebase-app-hosting-compute@${var.project_id}.iam.gserviceaccount.com"
}

# ─── Gen2 Cloud Functions service agents ─────────────────────────────────────
# Required for onMessagePublished/onSchedule triggers (Pub/Sub -> Eventarc ->
# Cloud Run). `firebase deploy --only functions` checks for these on every
# deploy and fails outright if the deploying principal can't grant them
# itself — granting them once via Terraform avoids needing to give
# github-deploy broad project IAM-admin rights just for this.

resource "google_project_iam_member" "pubsub_token_creator" {
  project = var.project_id
  role    = "roles/iam.serviceAccountTokenCreator"
  member  = "serviceAccount:service-${data.google_project.current.number}@gcp-sa-pubsub.iam.gserviceaccount.com"

  depends_on = [google_project_service.apis]
}

locals {
  default_compute_sa_roles = toset([
    "roles/run.invoker",
    "roles/eventarc.eventReceiver",
  ])
}

resource "google_project_iam_member" "default_compute_sa" {
  for_each = local.default_compute_sa_roles
  project  = var.project_id
  role     = each.value
  member   = "serviceAccount:${data.google_project.current.number}-compute@developer.gserviceaccount.com"

  depends_on = [google_project_service.apis]
}
