#!/bin/sh
set -e
mkdir -p /app/data /app/data.ms

echo "Starting Meilisearch (150MB memory cap)..."
meilisearch --master-key "${MEILI_MASTER_KEY:-pickit_master_key_2026}" --db-path /app/data.ms --http-addr 127.0.0.1:7700 --max-indexing-memory 150Mb --no-analytics &

for i in $(seq 1 30); do
  if curl -s http://127.0.0.1:7700/health | grep -q "available"; then
    break
  fi
  sleep 1
done

echo "Configuring Meilisearch index & importing CJ catalog..."
node indexer/setup-meili.js || true
node indexer/import-cj.js || true

echo "Starting PICKIT Unified Engine..."
exec node server/index.js
