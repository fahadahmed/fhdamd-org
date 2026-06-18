terraform {
  backend "gcs" {
    # This bucket must be created manually before first `terraform init`:
    #   gcloud storage buckets create gs://pdf-craft-prd-tfstate \
    #     --project=pdf-craft-prd --location=US --uniform-bucket-level-access
    bucket = "pdf-craft-prd-tfstate"
    prefix = "terraform/prod"
  }
}
