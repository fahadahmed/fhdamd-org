variable "project_id" {
  type        = string
  description = "GCP/Firebase project ID for this environment"
}

variable "region" {
  type    = string
  default = "us-central1"
}

variable "github_repo" {
  type        = string
  description = "GitHub repository in 'owner/repo' format"
  default     = "fahadahmed/fhdamd-org"
}

variable "environment_label" {
  type        = string
  description = "Human-readable environment name, e.g. 'staging' or 'production'"
}
