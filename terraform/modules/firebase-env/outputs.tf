output "workload_identity_provider" {
  description = "Full WIF provider resource name — set as GCP_WORKLOAD_IDENTITY_PROVIDER in GitHub secrets"
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "service_account_email" {
  description = "Deployment service account email — set as GCP_SERVICE_ACCOUNT in GitHub secrets"
  value       = google_service_account.github_deploy.email
}

output "firestore_database" {
  value = google_firestore_database.default.name
}

output "storage_bucket" {
  value = google_firebase_storage_bucket.default.bucket_id
}
