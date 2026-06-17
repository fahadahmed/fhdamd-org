output "workload_identity_provider" {
  value = module.firebase_env.workload_identity_provider
}

output "service_account_email" {
  value = module.firebase_env.service_account_email
}

output "firestore_database" {
  value = module.firebase_env.firestore_database
}

output "storage_bucket" {
  value = module.firebase_env.storage_bucket
}
