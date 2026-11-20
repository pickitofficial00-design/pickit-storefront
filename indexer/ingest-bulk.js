import { Meilisearch } from "meilisearch";
import crypto from "crypto";
import { calculateUsdRetailPrice } from "./pricing.js";

const client = new Meilisearch({ host: "http://127.0.0.1:7700", apiKey: process.env.MEILI_MASTER_KEY || "pickit_master_key_2026" });
const index = client.index("products");

function normTitle(t) {
  return String(t || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export async function ingestProducts(rawItems = []) {
  const seen = new Set();
  const docs = [];

  for (const item of rawItems) {
    // Quality & Speed Gatekeeper: skip slow dispatch (>48h) or low rating (<4.5)
    if ((item.dispatch_hours && item.dispatch_hours > 48) || (item.rating && item.rating < 4.5)) continue;

    const dedupeKey = item.source_pid || crypto.createHash("md5").update(normTitle(item.title) + "|" + (item.main_image || "")).digest("hex");
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const pricing = calculateUsdRetailPrice(item.supplier_cost);
    const usStock = Boolean(item.us_stock);
    const shippingTiers = ["STANDARD_7_12D", "MODERATE_4_7D"];
    if (usStock || item.express_air_eligible !== false) shippingTiers.push("EXPRESS_3_4D");

    docs.push({
      id: String(dedupeKey).replace(/[^a-zA-Z0-9_-]/g, "_"),
      source_pid: String(item.source_pid || dedupeKey),
      source_url: item.source_url || "",
      source_platform: item.source_platform || "CJ_ALI",
      title: item.title,
      category: item.category || "General",
      sub_category: item.sub_category || "",
      brand: item.brand || "PICKIT Select",
      seller_name: item.seller_name || "Verified Partner",
      tags: Array.isArray(item.tags) ? item.tags : [],
      main_image: item.main_image || "",
      images: Array.isArray(item.images) ? item.images : [item.main_image].filter(Boolean),
      variants: Array.isArray(item.variants) && item.variants.length ? item.variants : [{ sku: dedupeKey, color: "Standard", size: "One Size", supplier_cost: item.supplier_cost, image: item.main_image }],
      ...pricing,
      us_stock: usStock,
      shipping_tiers: shippingTiers,
      rating: Number(item.rating || 4.8),
      orders_count: Number(item.orders_count || 100),
      in_stock: true,
      created_at: Date.now()
    });
  }

  for (let i = 0; i < docs.length; i += 5000) {
    await index.addDocuments(docs.slice(i, i + 5000), { primaryKey: "id" });
  }
  return { indexed: docs.length, skipped: rawItems.length - docs.length };
}

// Seed sample multi-seller USA catalog if run directly
if (import.meta.url === "file://" + process.argv[1]) {
  const sample = [
    { source_pid: "SG-101", title: "Polarized Aviator UV400 Driving Sunglasses Men Women", category: "Sunglasses", seller_name: "OpticPro US", supplier_cost: 4.50, us_stock: true, rating: 4.9, orders_count: 1420, main_image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png", variants: [{ sku: "SG-101-BLK", color: "Matte Black", size: "Standard", supplier_cost: 4.50 }, { sku: "SG-101-GLD", color: "Gold Frame", size: "Standard", supplier_cost: 4.80 }] },
    { source_pid: "SG-102", title: "Retro Square Cat Eye Fashion Sunglasses UV Protection", category: "Sunglasses", seller_name: "SunVibe Direct", supplier_cost: 3.20, us_stock: false, rating: 4.7, orders_count: 890, main_image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png", variants: [{ sku: "SG-102-TRT", color: "Tortoise", size: "Standard", supplier_cost: 3.20 }] },
    { source_pid: "SW-201", title: "AMOLED Fitness Smartwatch Heart Rate GPS Waterproof", category: "Smartwatches", seller_name: "TechPulse USA", supplier_cost: 18.50, us_stock: true, rating: 4.9, orders_count: 3210, main_image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-3_large.png", variants: [{ sku: "SW-201-BLK", color: "Obsidian Black", size: "44mm", supplier_cost: 18.50 }] }
  ];
  const res = await ingestProducts(sample);
  console.log("SAMPLE_CATALOG_INDEXED:", JSON.stringify(res));
}
