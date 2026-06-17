terraform {
  backend "gcs" {
    # This bucket must be created manually before first `terraform init`:
    #   gcloud storage buckets create gs://pdf-craft-stg-tfstate \
    #     --project=pdf-craft-stg --location=US --uniform-bucket-level-access
    bucket = "pdf-craft-stg-tfstate"
    prefix = "terraform/staging"
  }
}
