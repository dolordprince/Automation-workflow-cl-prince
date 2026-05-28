#!/bin/bash
# Use environment variable instead of hardcoded token
TOKEN="${GITHUB_TOKEN}"

if [ -z "$TOKEN" ]; then
  echo "Error: GITHUB_TOKEN environment variable not set"
  exit 1
fi

# rest of your script...
