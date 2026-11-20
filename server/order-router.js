import fs from "fs";

let cjTokenCache = null, cjTokenExp = 0;

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
  let tier = "TIER_1_STANDARD_7_12D", agency = "PRIVATE_AGENCY_MAIN", carrierHint = "Standard Tracked Air (7-12 Days)";
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

  let cjDispatch = { status: "QUEUED_FOR_PRIVATE_AGENCY" };
  if (tier !== "TIER_1_STANDARD_7_12D" || process.env.CJ_ALL_TIERS === "true") {
    try { cjDispatch = await pushOrderToCj(order, tier, isUsStock); }
    catch (e) { cjDispatch = { status: "CJ_DISPATCH_ERROR", error: e.message }; }
  }

  const job = {
    timestamp: new Date().toISOString(),
    order_id: order.id,
    order_name: order.name,
    tier,
    routed_agency: agency,
    carrier_hint: carrierHint,
    cj_dispatch: cjDispatch,
    shipping_address: order.shipping_address || {},
    items: (order.line_items || []).map(li => ({ title: li.title, sku: li.sku, quantity: li.quantity, price: li.price })),
    sla_deadline_hours: 24
  };
  fs.appendFileSync("./data/fulfillment_queue.jsonl", JSON.stringify(job) + "\n");
  return job;
}
