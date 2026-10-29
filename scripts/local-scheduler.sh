#!/bin/bash
# Runs the pipeline on a loop for local development. Only lives as long as
# this process does — for production, use Vercel Cron instead (see README).
cd "$(dirname "$0")/.."
INTERVAL_SECONDS="${1:-1800}"  # default: every 30 minutes

echo "Local scheduler starting — running pipeline every ${INTERVAL_SECONDS}s. Ctrl+C to stop."
while true; do
  echo ""
  echo "=== $(date) ==="
  npm run pipeline
  sleep "$INTERVAL_SECONDS"
done
