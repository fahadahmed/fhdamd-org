variable "project_id" {
  type    = string
  default = "pdf-craft-dev"
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
