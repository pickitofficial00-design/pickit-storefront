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
if [ ! -f /app/data/.catalog_v2_ready ]; then
  echo "Clearing random CJ items and importing store niches..."
  curl -s -X DELETE -H "Authorization: Bearer $KEY" http://127.0.0.1:7700/indexes/products/documents || true
  sleep 2
  node --max-old-space-size=160 indexer/import-cj.js "sunglasses" US 2 || true
  node --max-old-space-size=160 indexer/import-cj.js "smart watch" US 2 || true
  node --max-old-space-size=160 indexer/import-cj.js "accessories" US 2 || true
  touch /app/data/.catalog_v2_ready
else
  echo "Store catalog already populated on volume."
fi

echo "Starting PICKIT Unified Engine..."
exec node --max-old-space-size=192 server/index.js
