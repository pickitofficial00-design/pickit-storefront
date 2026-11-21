import fs from "fs";

let cjTokenCache = null, cjTokenExp = 0;

async function getShopifyToken(shop) {
  if (process.env.SHOPIFY_ADMIN_TOKEN) return process.env.SHOPIFY_ADMIN_TOKEN;
  const r = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.SHOPIFY_CLIENT_ID || "",
      client_secret: process.env.SHOPIFY_CLIENT_SECRET || "",
      grant_type: "client_credentials"
    })
  });
  const d = await r.json();
  return d.access_token || null;
}

async function tagShopifyOrder(orderId, tags, note) {
  const shop = process.env.SHOPIFY_SHOP_DOMAIN;
  if (!shop || !orderId || String(orderId) === "1001") return { status: "SKIPPED_TEST_OR_NO_SHOP" };
  const token = await getShopifyToken(shop);
  if (!token) return { status: "SKIPPED_NO_SHOPIFY_TOKEN" };
  const r = await fetch(`https://${shop}/admin/api/2025-01/orders/${orderId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ order: { id: orderId, tags, note } })
  });
  return { status: r.ok ? "SHOPIFY_ORDER_TAGGED" : `SHOPIFY_HTTP_${r.status}` };
}

async function getCjToken() {
  if (process.env.CJ_ACCESS_TOKEN) return process.env.CJ_ACCESS_TOKEN;
  if (cjTokenCache && Date.now() < cjTokenExp) return cjTokenCache;
  if (!process.env.CJ_API_KEY) return null;
  const r = await fetch("https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: process.env.CJ_API_KEY })
  });
  const d = await r.json();
  if (!d?.data?.accessToken) throw new Error("CJ Auth failed: " + JSON.stringify(d));
  cjTokenCache = d.data.accessToken;
  cjTokenExp = Date.now() + 12 * 3600 * 1000;
  return cjTokenCache;
}

async function resolveCjVid(token, rawSku) {
  const clean = String(rawSku || "").replace(/^CJ-/i, "").trim();
  if (!clean) return null;
  const r = await fetch("https://developers.cjdropshipping.com/api2.0/v1/product/query?pid=" + encodeURIComponent(clean), {
    headers: { "CJ-Access-Token": token }
  });
  const d = await r.json();
  const variants = d?.data?.variants || [];
  return variants[0]?.vid || clean;
}

async function pushOrderToCj(order, tier, isUsStock) {
  const token = await getCjToken();
  if (!token) return { status: "SKIPPED_NO_CJ_API_KEY" };
  const addr = order.shipping_address || {};
  const products = [];
  for (const li of (order.line_items || [])) {
    const vid = await resolveCjVid(token, li.sku);
    if (vid) products.push({ vid, quantity: Number(li.quantity) || 1 });
  }
  if (!products.length) return { status: "SKIPPED_NO_CJ_SKU" };

  const payload = {
    orderNumber: String(order.name || order.id || ("PICKIT-" + Date.now())),
    shippingZip: addr.zip || "10001",
    shippingCountryCode: addr.country_code || "US",
    shippingCountry: addr.country || "United States",
    shippingProvince: addr.province || "NY",
    shippingCity: addr.city || "New York",
    shippingAddress: [addr.address1, addr.address2].filter(Boolean).join(", ") || "123 Main St",
    shippingCustomerName: [addr.first_name, addr.last_name].filter(Boolean).join(" ") || order.email || "PICKIT Customer",
    shippingPhone: addr.phone || "0000000000",
    email: order.email || "",
    logisticName: tier === "TIER_3_EXPRESS_3_4D" ? (isUsStock ? "USPS+" : "DHL") : "CJPacket Ordinary",
    fromCountryCode: isUsStock ? "US" : "CN",
    products
  };

  if (order._dry_run) return { status: "DRY_RUN_READY", endpoint: "createOrderV2", payload };

  const resp = await fetch("https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrderV2", {
    method: "POST",
    headers: { "Content-Type": "application/json", "CJ-Access-Token": token },
    body: JSON.stringify(payload)
  });
  const cjRes = await resp.json();
  return { status: cjRes?.result ? "CJ_ORDER_CREATED" : "CJ_API_RESPONSE", cj_response: cjRes };
}

export async function routePaidOrder(order) {
  const shipTitle = (order?.shipping_lines?.[0]?.title || "").toLowerCase();
  let tier = "TIER_1_STANDARD_7_12D", agency = "PRIVATE_AGENCY_SHOPIFY", carrierHint = "Standard Tracked Air (7-12 Days)";
  const isUsStock = (order.line_items || []).every(li => (li.properties || []).some(p => p.name === "us_stock" && p.value === "true"));

  if (shipTitle.includes("express") || shipTitle.includes("3-4") || shipTitle.includes("3–4")) {
    tier = "TIER_3_EXPRESS_3_4D";
    agency = isUsStock ? "CJ_US_WAREHOUSE_DIRECT" : "CJ_OR_HYPERSKU_EXPRESS";
    carrierHint = isUsStock ? "USPS Priority / UPS Ground (2-4 Days)" : "DHL / FedEx International Express (3-4 Days)";
  } else if (shipTitle.includes("moderate") || shipTitle.includes("priority") || shipTitle.includes("4-7") || shipTitle.includes("4–7")) {
    tier = "TIER_2_MODERATE_4_7D";
    agency = "CJ_PRIORITY_AIR_WITH_HYPERSKU_BACKUP";
    carrierHint = "CJPacket Fast / YunExpress Priority Air (4-7 Days)";
  }

  let cjDispatch = { status: "QUEUED_FOR_PRIVATE_AGENCY_IN_SHOPIFY" };
  if (tier !== "TIER_1_STANDARD_7_12D" || process.env.CJ_ALL_TIERS === "true") {
    try { cjDispatch = await pushOrderToCj(order, tier, isUsStock); }
    catch (e) { cjDispatch = { status: "CJ_DISPATCH_ERROR", error: e.message }; }
  }

  const existingTags = order.tags ? order.tags + ", " : "";
  const routingTag = tier === "TIER_1_STANDARD_7_12D" ? "AGENCY_STANDARD_7_12D" : tier;
  const itemSummary = (order.line_items || []).map(li => `${li.quantity}x ${li.title} (SKU: ${li.sku || "N/A"})`).join(" | ");
  const shopifyTagResult = order._dry_run
    ? { status: "DRY_RUN_SKIPPED" }
    : await tagShopifyOrder(order.id, existingTags + routingTag, `PICKIT Auto-Router: ${agency} | ${carrierHint} | Items: ${itemSummary}`);

  const job = {
    timestamp: new Date().toISOString(),
    order_id: order.id,
    order_name: order.name,
    tier,
    routed_agency: agency,
    carrier_hint: carrierHint,
    shopify_tag: shopifyTagResult,
    cj_dispatch: cjDispatch,
    shipping_address: order.shipping_address || {},
    items: (order.line_items || []).map(li => ({ title: li.title, sku: li.sku, quantity: li.quantity, price: li.price })),
    sla_deadline_hours: 24,
    status: "PENDING_SCAN"
  };
  fs.mkdirSync("./data", { recursive: true });
  fs.appendFileSync("./data/fulfillment_queue.jsonl", JSON.stringify(job) + "\n");
  return job;
}

export function runSlaFailoverCheck() {
  try {
    if (!fs.existsSync("./data/fulfillment_queue.jsonl")) return { checked: 0, overdue: 0 };
    const lines = fs.readFileSync("./data/fulfillment_queue.jsonl", "utf8").trim().split("\n").filter(Boolean);
    const now = Date.now();
    let overdue = 0;
    for (const line of lines) {
      const job = JSON.parse(line);
      if (job.status === "PENDING_SCAN" && (now - new Date(job.timestamp).getTime()) > 24 * 3600 * 1000) {
        overdue++;
        console.warn("SLA_24H_FAILOVER_ALERT:", job.order_name, job.tier, job.routed_agency);
      }
    }
    return { checked: lines.length, overdue };
  } catch (e) {
    return { error: e.message };
  }
}
