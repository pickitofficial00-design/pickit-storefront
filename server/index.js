import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Meilisearch } from "meilisearch";
import { getOrCreateShopifyVariant } from "./jit-shopify.js";
import { routePaidOrder } from "./order-router.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

const meili = new Meilisearch({ host: "http://127.0.0.1:7700", apiKey: process.env.MEILI_MASTER_KEY || "pickit_master_key_2026" });

// Unified Search & Faceted Filter API for Web & Mobile App
app.get("/api/search", async (req, res) => {
  try {
    const { q = "", category, minPrice, maxPrice, shippingTier, usStock, minRating, seller, color, size, sort, page = 1, limit = 24 } = req.query;
    const filters = ["in_stock = true"];
    if (category) filters.push(`category = "${String(category).replace(/"/g, "")}"`);
    if (minPrice) filters.push(`retail_price >= ${Number(minPrice)}`);
    if (maxPrice) filters.push(`retail_price <= ${Number(maxPrice)}`);
    if (shippingTier) filters.push(`shipping_tiers = "${String(shippingTier).replace(/"/g, "")}"`);
    if (usStock === "true") filters.push("us_stock = true");
    if (minRating) filters.push(`rating >= ${Number(minRating)}`);
    if (seller) filters.push(`seller_name = "${String(seller).replace(/"/g, "")}"`);
    if (color) filters.push(`variants.color = "${String(color).replace(/"/g, "")}"`);
    if (size) filters.push(`variants.size = "${String(size).replace(/"/g, "")}"`);

    const sortMap = {
      price_asc: ["retail_price:asc"],
      price_desc: ["retail_price:desc"],
      rating: ["rating:desc"],
      popular: ["orders_count:desc"]
    };

    const result = await meili.index("products").search(String(q), {
      filter: filters.join(" AND "),
      sort: sortMap[sort] || undefined,
      facets: ["category", "shipping_tiers", "us_stock", "seller_name", "variants.color", "variants.size"],
      limit: Math.min(100, Number(limit) || 24),
      offset: (Math.max(1, Number(page) || 1) - 1) * (Math.min(100, Number(limit) || 24))
    });

    res.json({
      ok: true,
      query: q,
      totalHits: result.estimatedTotalHits,
      processingTimeMs: result.processingTimeMs,
      facets: result.facetDistribution,
      products: result.hits
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Just-In-Time Shopify Cart Bridge
app.post("/api/jit-cart", async (req, res) => {
  try {
    const { productId, variantSku } = req.body || {};
    if (!productId) return res.status(400).json({ ok: false, error: "productId required" });
    const item = await getOrCreateShopifyVariant({ productId, variantSku });
    res.json({ ok: true, item });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Shopify Paid Order 3-Tier Fulfillment Router
app.post("/webhooks/orders-paid", async (req, res) => {
  try {
    const job = await routePaidOrder(req.body || {});
    res.json({ ok: true, routed: job });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("PICKIT_UNIFIED_ENGINE_ONLINE_PORT_" + PORT));
