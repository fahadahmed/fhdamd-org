#!/usr/bin/env bash
# firebase-tools intermittently fails to authenticate against Workload Identity
# Federation credentials on the first CLI invocation in a job — see #201.
# Retrying lets the credential exchange settle.
set -uo pipefail

for attempt in 1 2 3; do
  if firebase deploy "$@"; then
    exit 0
  fi
  echo "::warning::firebase deploy attempt $attempt failed, retrying in 10s..." >&2
  sleep 10
done

echo "::error::firebase deploy failed after 3 attempts" >&2
exit 1
