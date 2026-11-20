import { Meilisearch } from "meilisearch";
const client = new Meilisearch({ host: "http://127.0.0.1:7700", apiKey: process.env.MEILI_MASTER_KEY || "pickit_master_key_2026" });
const index = client.index("products");
await index.updateSettings({
  searchableAttributes: ["title", "category", "sub_category", "brand", "tags", "seller_name", "variants.color", "variants.size"],
  filterableAttributes: ["retail_price", "category", "sub_category", "shipping_tiers", "us_stock", "rating", "orders_count", "seller_name", "variants.color", "variants.size", "in_stock"],
  sortableAttributes: ["retail_price", "rating", "orders_count", "created_at"],
  rankingRules: ["words", "typo", "proximity", "attribute", "sort", "exactness", "orders_count:desc", "rating:desc"]
});
console.log("MEILISEARCH_USA_SCHEMA_READY");
