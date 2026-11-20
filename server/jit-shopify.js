import Database from "better-sqlite3";
import { Meilisearch } from "meilisearch";

const db = new Database("./data/jit_cache.db");
db.exec(`CREATE TABLE IF NOT EXISTS jit_map (
  cache_key TEXT PRIMARY KEY,
  source_pid TEXT,
  variant_sku TEXT,
  shopify_product_id TEXT,
  shopify_variant_id TEXT,
  retail_price REAL,
  created_at INTEGER
)`);

const meili = new Meilisearch({ host: "http://127.0.0.1:7700", apiKey: process.env.MEILI_MASTER_KEY || "pickit_master_key_2026" });

let cachedToken = null, tokenExp = 0;
async function getAdminToken(shop) {
  if (process.env.SHOPIFY_ADMIN_TOKEN) return process.env.SHOPIFY_ADMIN_TOKEN;
  if (cachedToken && Date.now() < tokenExp) return cachedToken;
  const r = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: process.env.SHOPIFY_CLIENT_ID, client_secret: process.env.SHOPIFY_CLIENT_SECRET, grant_type: "client_credentials" })
  });
  const d = await r.json();
  if (!d.access_token) throw new Error("Token exchange failed: " + JSON.stringify(d));
  cachedToken = d.access_token;
  tokenExp = Date.now() + ((d.expires_in || 86000) - 300) * 1000;
  return cachedToken;
}

async function shopifyGql(shop, token, query, variables) {
  const resp = await fetch(`https://${shop}/admin/api/2025-01/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables })
  });
  return resp.json();
}

export async function getOrCreateShopifyVariant({ productId, variantSku }) {
  const doc = await meili.index("products").getDocument(productId);
  const variants = Array.isArray(doc.variants) ? doc.variants : [];
  const chosen = variants.find(v => v.sku === variantSku) || variants[0] || { sku: doc.source_pid, color: "Standard", size: "One Size" };
  const cacheKey = `${doc.source_pid}::${chosen.sku}`;

  const cached = db.prepare("SELECT * FROM jit_map WHERE cache_key = ?").get(cacheKey);
  if (cached) return { cached: true, ...cached, title: doc.title, image: chosen.image || doc.main_image };

  const shop = process.env.SHOPIFY_SHOP_DOMAIN;
  const hasCreds = process.env.SHOPIFY_ADMIN_TOKEN || (process.env.SHOPIFY_CLIENT_ID && process.env.SHOPIFY_CLIENT_SECRET);
  if (!shop || !hasCreds) {
    const mockId = "gid://shopify/ProductVariant/DRY_" + Date.now();
    return { cached: false, dry_run: true, cache_key: cacheKey, shopify_variant_id: mockId, retail_price: doc.retail_price, title: doc.title };
  }

  const token = await getAdminToken(shop);
  const createMut = `mutation productCreate($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
    productCreate(product: $product, media: $media) {
      product { id variants(first: 5) { edges { node { id } } } }
      userErrors { field message }
    }
  }`;

  const media = (doc.images || [doc.main_image]).filter(Boolean).slice(0, 5).map(originalSource => ({ originalSource, mediaContentType: "IMAGE" }));
  const createRes = await shopifyGql(shop, token, createMut, {
    product: {
      title: doc.title,
      vendor: doc.seller_name || "PICKIT Select",
      productType: doc.category || "General",
      tags: [...(doc.tags || []), doc.us_stock ? "US_STOCK" : "GLOBAL_AIR", "SRC_PID:" + doc.source_pid].filter(Boolean),
      status: "ACTIVE",
      productOptions: [{ name: "Style", values: [{ name: chosen.color || "Standard" }] }]
    },
    media
  });

  const created = createRes?.data?.productCreate?.product;
  const shopifyVariantId = created?.variants?.edges?.[0]?.node?.id;
  if (!shopifyVariantId) throw new Error("Shopify productCreate failed: " + JSON.stringify(createRes));

  const updateVarMut = `mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      productVariants { id price }
      userErrors { field message }
    }
  }`;

  await shopifyGql(shop, token, updateVarMut, {
    productId: created.id,
    variants: [{
      id: shopifyVariantId,
      price: String(doc.retail_price),
      compareAtPrice: doc.compare_at_price ? String(doc.compare_at_price) : null,
      inventoryItem: { sku: chosen.sku, tracked: false }
    }]
  });

  db.prepare("INSERT OR REPLACE INTO jit_map VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    cacheKey, doc.source_pid, chosen.sku, created.id, shopifyVariantId, doc.retail_price, Date.now()
  );

  return { cached: false, cache_key: cacheKey, shopify_product_id: created.id, shopify_variant_id: shopifyVariantId, retail_price: doc.retail_price, title: doc.title };
}
