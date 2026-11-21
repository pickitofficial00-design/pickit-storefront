import dotenv from "dotenv";
import { Meilisearch } from "meilisearch";
dotenv.config();

const KEY = process.env.MEILI_MASTER_KEY || "pickit_master_key_2026";
const meili = new Meilisearch({ host: "http://127.0.0.1:7700", apiKey: KEY });

async function waitTask(task) {
  const uid = task.taskUid ?? task.uid;
  for (let i = 0; i < 60; i++) {
    const r = await fetch(`http://127.0.0.1:7700/tasks/${uid}`, { headers: { Authorization: `Bearer ${KEY}` } });
    const t = await r.json();
    if (t.status === "succeeded" || t.status === "failed") return t;
    await new Promise(res => setTimeout(res, 500));
  }
  return { status: "timeout" };
}

async function getToken(shop) {
  if (process.env.SHOPIFY_ADMIN_TOKEN) return process.env.SHOPIFY_ADMIN_TOKEN;
  const r = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: process.env.SHOPIFY_CLIENT_ID || "", client_secret: process.env.SHOPIFY_CLIENT_SECRET || "", grant_type: "client_credentials" })
  });
  const d = await r.json();
  if (!d.access_token) throw new Error("Shopify auth failed: " + JSON.stringify(d));
  return d.access_token;
}

export async function syncShopify() {
  const shop = process.env.SHOPIFY_SHOP_DOMAIN;
  if (!shop) throw new Error("Missing SHOPIFY_SHOP_DOMAIN");
  const token = await getToken(shop);
  const r = await fetch(`https://${shop}/admin/api/2025-01/products.json?limit=250&status=active`, { headers: { "X-Shopify-Access-Token": token } });
  const d = await r.json();
  if (!r.ok) throw new Error(`Shopify HTTP ${r.status}`);
  const list = d.products || [];
  const docs = list.map(p => {
    const v0 = p.variants?.[0] || {};
    const price = Number(v0.price || 0);
    const images = (p.images || []).map(i => i.src).filter(Boolean).slice(0, 6);
    const mainImg = p.image?.src || images[0] || "";
    return {
      id: "SHOP_" + p.id, source_pid: "SHOP_" + p.id, source_url: `https://${shop}/products/${p.handle}`,
      source_platform: "SHOPIFY", title: p.title, category: p.product_type || "Featured",
      sub_category: "", brand: p.vendor || "PICKIT Select", seller_name: p.vendor || "PICKIT",
      tags: p.tags ? p.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      main_image: mainImg, images, retail_price: price, supplier_cost: price, us_stock: true,
      shipping_tiers: ["STANDARD_7_12D", "MODERATE_4_7D", "EXPRESS_3_4D"],
      rating: 4.9, orders_count: 100, in_stock: true, created_at: Date.now(),
      variants: (p.variants || []).slice(0, 20).map(v => ({ sku: v.sku || String(v.id), shopify_variant_id: String(v.id), color: v.option1 || "Standard", size: v.option2 || "One Size", title: v.title, price: Number(v.price || price), image: mainImg }))
    };
  });
  const idx = meili.index("products");
  await waitTask(await idx.deleteAllDocuments());
  let indexed = 0;
  for (let i = 0; i < docs.length; i += 25) {
    const chunk = docs.slice(i, i + 25);
    const res = await waitTask(await idx.addDocuments(chunk));
    if (res.status !== "succeeded") throw new Error("Batch failed: " + JSON.stringify(res.error || res.status));
    indexed += chunk.length;
  }
  return { ok: true, fetched: list.length, indexed };
}

if (process.argv[1]?.endsWith("sync-shopify.js")) {
  syncShopify().then(r => console.log("SHOPIFY_SYNC_RESULT:", JSON.stringify(r))).catch(e => { console.error("SHOPIFY_SYNC_ERROR:", e.message); process.exit(1); });
}
