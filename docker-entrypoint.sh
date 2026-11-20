#!/bin/sh
set -e
mkdir -p /app/data /app/data.ms

echo "Starting Meilisearch (low-memory mode)..."
meilisearch --master-key "${MEILI_MASTER_KEY:-pickit_master_key_2026}" \
  --db-path /app/data.ms \
  --http-addr 127.0.0.1:7700 \
  --max-indexing-memory 100Mb \
  --max-indexing-threads 1 \
  --http-payload-size-limit 10Mb \
  --no-analytics &

for i in $(seq 1 30); do
  if curl -s http://127.0.0.1:7700/health | grep -q "available"; then
    break
  fi
  sleep 1
done

echo "Configuring Meilisearch index & importing CJ catalog..."
node --max-old-space-size=160 indexer/setup-meili.js || true
node --max-old-space-size=160 indexer/import-cj.js || true

echo "Starting PICKIT Unified Engine..."
exec node --max-old-space-size=192 server/index.js
