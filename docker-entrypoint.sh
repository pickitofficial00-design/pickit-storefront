#!/bin/sh
set -e
mkdir -p /app/data /app/data/meili.ms

echo "Starting Meilisearch (persistent volume, low-memory mode)..."
meilisearch --master-key "${MEILI_MASTER_KEY:-pickit_master_key_2026}" \
  --db-path /app/data/meili.ms \
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

echo "Configuring Meilisearch index..."
node --max-old-space-size=160 indexer/setup-meili.js || true

KEY="${MEILI_MASTER_KEY:-pickit_master_key_2026}"
STATS=$(curl -s -H "Authorization: Bearer $KEY" http://127.0.0.1:7700/indexes/products/stats || true)
if ! echo "$STATS" | grep -q '"numberOfDocuments":[1-9]'; then
  echo "Index is empty — importing CJ catalog (US + Global)..."
  node --max-old-space-size=160 indexer/import-cj.js "" US 2 || true
  node --max-old-space-size=160 indexer/import-cj.js "" "" 2 || true
else
  echo "Existing Meilisearch catalog found on volume — skipping initial import."
fi

echo "Starting PICKIT Unified Engine..."
exec node --max-old-space-size=192 server/index.js
