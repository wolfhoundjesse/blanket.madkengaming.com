#!/usr/bin/env bash

# fetch-yesterday.sh
# Cron job wrapper script to fetch and store yesterday's temperature data
# Run daily at 2am: 0 2 * * * /path/to/fetch-yesterday.sh

set -euo pipefail

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Change to project root
cd "$PROJECT_ROOT"

# Load environment variables from .env file if it exists
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

# Run the TypeScript script with Bun
bun run "$SCRIPT_DIR/fetch-yesterday.ts"
