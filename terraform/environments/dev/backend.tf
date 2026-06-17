terraform {
  backend "gcs" {
    # This bucket must be created manually before first `terraform init`:
    #   gcloud storage buckets create gs://pdf-craft-dev-tfstate \
    #     --project=pdf-craft-dev --location=US --uniform-bucket-level-access
    bucket = "pdf-craft-dev-tfstate"
    prefix = "terraform/dev"
  }
}
