import { NextResponse } from "next/server";

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || "h1fecw-jq.myshopify.com";
const CLIENT_ID = process.env.SHOPIFY_ADMIN_CLIENT_ID || "";
const CLIENT_SECRET = process.env.SHOPIFY_ADMIN_CLIENT_SECRET || "";
const IMPORTER_PIN = process.env.ADMIN_IMPORTER_PIN || "246810";

interface PricingSettings {
  enabled: boolean;
  markupMultiplier: number;
  roundTo99: boolean;
  includeCompareAt: boolean;
  compareAtBoostPercent: number;
  minProfitUsd: number;
}

interface CandidateProduct {
  id: string;
  title: string;
  category: string;
  supplierCost: number;
  rating: number;
  ordersCount: number;
  shipsToUSA: boolean;
  usCarrier: string;
  shippingDays: string;
  image: string;
  highlights: string[];
  specs: Record<string, string>;
  variants: { title: string; priceOffset?: number }[];
  tags: string[];
}

const CURATED_US_CATALOG: CandidateProduct[] = [
  {
    id: "pk_sel_101",
    title: "MagSafe 3-in-1 Foldable Magnetic Wireless Charging Station",
    category: "Tech & Accessories",
    supplierCost: 14.5,
    rating: 4.9,
    ordersCount: 4820,
    shipsToUSA: true,
    usCarrier: "USPS / UPS Tracked",
    shippingDays: "3–5 Day US Delivery",
    image: "https://images.unsplash.com/photo-1615526675159-e248c3021d3f?auto=format&fit=crop&w=900&q=85",
    highlights: [
      "Charges iPhone, Apple Watch & AirPods simultaneously at up to 15W fast wireless speed",
      "Ultra-compact tri-fold silicone hinge slips flat into any carry-on or desk drawer",
      "Strong N52 neodymium magnetic alignment holds phone securely in portrait or StandBy mode",
      "Built-in smart thermal protection prevents overheating overnight"
    ],
    specs: {
      "Output Power": "15W Phone / 5W Earbuds / 3W Watch",
      "Connector": "USB-C PD (20W+ Adapter Recommended)",
      "Compatibility": "iPhone 12–16 Series, Apple Watch, Qi Earbuds",
      "Shipping Origin": "Ships to USA (Tracked)"
    },
    variants: [{ title: "Matte Obsidian" }, { title: "Arctic White" }],
    tags: ["tech", "wireless-charger", "magsafe", "bestseller", "ships-to-usa"]
  },
  {
    id: "pk_sel_102",
    title: "Portable Rechargeable Cordless Espresso & Coffee Maker",
    category: "Kitchen & Home",
    supplierCost: 22.0,
    rating: 4.8,
    ordersCount: 3190,
    shipsToUSA: true,
    usCarrier: "UPS Ground / USPS",
    shippingDays: "3–5 Day US Delivery",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=85",
    highlights: [
      "19-bar high-pressure extraction produces rich crema anywhere—office, car, or campsite",
      "Works with both ground coffee and standard Nespresso-style capsules",
      "Self-heating 7500mAh USB-C battery brews hot espresso from cold water in 3 minutes",
      "Leak-proof food-grade stainless steel chamber disassembles for 10-second rinse"
    ],
    specs: {
      "Pump Pressure": "19 Bar",
      "Battery Capacity": "7500mAh Rechargeable USB-C",
      "Water Tank": "80ml Stainless Steel",
      "Shipping Origin": "Ships to USA (Tracked)"
    },
    variants: [{ title: "Midnight Black" }, { title: "Brushed Slate" }],
    tags: ["kitchen", "coffee", "travel", "bestseller", "ships-to-usa"]
  },
  {
    id: "pk_sel_103",
    title: "Smart Motion-Sensor LED Under-Cabinet Light Bar (2-Pack)",
    category: "Smart Home",
    supplierCost: 11.2,
    rating: 4.9,
    ordersCount: 6450,
    shipsToUSA: true,
    usCarrier: "USPS First Class Tracked",
    shippingDays: "2–4 Day US Delivery",
    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=85",
    highlights: [
      "Instant hands-free PIR motion activation illuminates kitchens, closets & stairways",
      "3 selectable color temperatures (Warm 3000K, Natural 4500K, Daylight 6000K) + stepless dimming",
      "Snap-on magnetic adhesive mounts install in seconds with zero drilling or wiring",
      "USB-C rechargeable battery lasts up to 45 days per charge in Auto-Sensor mode"
    ],
    specs: {
      "Length": "15.7 in (40cm) Aircraft Aluminum",
      "Color Modes": "3000K / 4500K / 6000K",
      "Battery": "1500mAh USB-C Rechargeable",
      "Shipping Origin": "Ships to USA (Tracked)"
    },
    variants: [{ title: "15.7 Inch (2-Pack)" }, { title: "23.6 Inch (2-Pack)", priceOffset: 8 }],
    tags: ["home", "smart-home", "led-lighting", "bestseller", "ships-to-usa"]
  },
  {
    id: "pk_sel_104",
    title: "Deep-Tissue Heated Neck & Shoulder Shiatsu Massager",
    category: "Fitness & Wellness",
    supplierCost: 18.4,
    rating: 4.8,
    ordersCount: 5110,
    shipsToUSA: true,
    usCarrier: "UPS / FedEx US Tracked",
    shippingDays: "3–5 Day US Delivery",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=85",
    highlights: [
      "6D ergonomic kneading nodes mimic real thumb-pressure massage to melt away desk tension",
      "Soothing 107°F infrared heat therapy boosts circulation and muscle recovery",
      "Hands-free wearable backpack strap design lets you work or relax while massaging",
      "Whisper-quiet brushless motor (<42dB) with 10-minute auto safety shutoff"
    ],
    specs: {
      "Heat Level": "107°F (42°C) Constant Warmth",
      "Battery Runtime": "Up to 90 Minutes Cordless",
      "Charging": "USB-C Fast Charge",
      "Shipping Origin": "Ships to USA (Tracked)"
    },
    variants: [{ title: "Charcoal Gray" }, { title: "Warm Sand" }],
    tags: ["wellness", "fitness", "recovery", "bestseller", "ships-to-usa"]
  },
  {
    id: "pk_sel_105",
    title: "Pro Electric Spin Scrubber with 7 Replaceable Brush Heads",
    category: "Kitchen & Home",
    supplierCost: 16.8,
    rating: 4.8,
    ordersCount: 7290,
    shipsToUSA: true,
    usCarrier: "USPS / UPS Ground",
    shippingDays: "3–5 Day US Delivery",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=85",
    highlights: [
      "High-torque 420 RPM dual-speed motor cuts bathroom, tile & grout scrubbing time in half",
      "Telescoping stainless handle extends from 12 in to 47 in—no bending or kneeling",
      "IPX7 full-body waterproof seal safe for shower stalls, tubs, and outdoor patio furniture",
      "Includes 7 specialized heads for corners, flat tile, glass, stove tops, and car wheels"
    ],
    specs: {
      "Speed Modes": "320 RPM (Daily) / 420 RPM (Deep Clean)",
      "Extension Length": "12 in – 47 in Adjustable",
      "Waterproof Rating": "IPX7",
      "Shipping Origin": "Ships to USA (Tracked)"
    },
    variants: [{ title: "Standard 7-Head Kit" }],
    tags: ["home", "cleaning", "kitchen", "bestseller", "ships-to-usa"]
  },
  {
    id: "pk_sel_106",
    title: "4K Ultra-HD Dual Dash Cam with Night Vision & Wi-Fi App",
    category: "Auto & Gear",
    supplierCost: 24.0,
    rating: 4.9,
    ordersCount: 3940,
    shipsToUSA: true,
    usCarrier: "USPS / FedEx US Tracked",
    shippingDays: "3–5 Day US Delivery",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=85",
    highlights: [
      "Crystal-clear 4K UHD front + 1080P rear wide-angle lenses capture license plates day or night",
      "Sony STARVIS F1.6 aperture + WDR night vision delivers sharp low-light footage",
      "Built-in 5GHz Wi-Fi pairs with iOS & Android app to view or download clips in seconds",
      "G-Sensor collision lock & 24-hour parking monitor protect your vehicle around the clock"
    ],
    specs: {
      "Resolution": "Front 3840x2160P + Rear 1920x1080P",
      "Field of View": "170° Front / 140° Rear",
      "Storage": "Supports MicroSD up to 256GB",
      "Shipping Origin": "Ships to USA (Tracked)"
    },
    variants: [{ title: "Front + Rear Dual Kit" }, { title: "Dual Kit + 64GB Card", priceOffset: 10 }],
    tags: ["auto", "tech", "car-accessories", "bestseller", "ships-to-usa"]
  }
];

function normalizePricing(raw?: Partial<PricingSettings>): PricingSettings {
  return {
    enabled: raw?.enabled !== false,
    markupMultiplier: Math.max(1.1, Number(raw?.markupMultiplier) || 2.4),
    roundTo99: raw?.roundTo99 !== false,
    includeCompareAt: raw?.includeCompareAt !== false,
    compareAtBoostPercent: Math.max(10, Number(raw?.compareAtBoostPercent) || 38),
    minProfitUsd: Math.max(0, Number(raw?.minProfitUsd) ?? 12),
  };
}

function calculateRetailPrices(supplierCost: number, cfg: PricingSettings, offset = 0) {
  const baseCost = Number(supplierCost || 15) + offset;
  if (!cfg.enabled) {
    const raw = Math.max(9.99, baseCost);
    return {
      retailPrice: raw.toFixed(2),
      compareAtPrice: null as string | null,
      estimatedProfit: "0.00",
    };
  }

  let rawRetail = baseCost * cfg.markupMultiplier;
  if (rawRetail - baseCost < cfg.minProfitUsd) {
    rawRetail = baseCost + cfg.minProfitUsd;
  }

  const finalRetailNum = cfg.roundTo99
    ? Math.max(9, Math.ceil(rawRetail)) - 0.01
    : Number(rawRetail.toFixed(2));

  let compareAtPrice: string | null = null;
  if (cfg.includeCompareAt) {
    const rawCompare = finalRetailNum * (1 + cfg.compareAtBoostPercent / 100);
    const finalCompareNum = cfg.roundTo99
      ? Math.ceil(rawCompare) - 0.01
      : Number(rawCompare.toFixed(2));
    compareAtPrice = finalCompareNum.toFixed(2);
  }

  return {
    retailPrice: finalRetailNum.toFixed(2),
    compareAtPrice,
    estimatedProfit: (finalRetailNum - baseCost).toFixed(2),
  };
}

function buildUsRetailHtml(highlights: string[], specs: Record<string, string>): string {
  const bullets = highlights
    .map((h) => `<li style="margin-bottom:6px;">${h}</li>`)
    .join("");
  const rows = Object.entries(specs)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;width:40%;">${k}</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">${v}</td></tr>`
    )
    .join("");

  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;color:#111827;line-height:1.6;">
      <h3 style="font-size:16px;font-weight:800;margin-bottom:8px;">Key Highlights</h3>
      <ul style="padding-left:20px;margin-bottom:18px;">${bullets}</ul>
      <h3 style="font-size:16px;font-weight:800;margin-bottom:8px;">Specifications</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px;"><tbody>${rows}</tbody></table>
      <p style="font-size:13px;color:#4b5563;"><strong>PICKIT US Shipping Guarantee:</strong> Verified Ship-to-USA fulfillment with tracking (FREE on orders $35+) and 30-day hassle-free returns.</p>
    </div>
  `.trim();
}

async function getShopifyAdminToken(): Promise<string> {
  if (process.env.SHOPIFY_ADMIN_ACCESS_TOKEN) {
    return process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  }
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Missing SHOPIFY_ADMIN_CLIENT_ID or SHOPIFY_ADMIN_CLIENT_SECRET in Vercel.");
  }

  const res = await fetch(`https://${STORE_DOMAIN}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(
      data.error_description ||
        data.error ||
        "Could not obtain Shopify Admin token. Make sure you clicked Test App in Shopify Dev Dashboard to install it on PICKIT."
    );
  }
  return data.access_token;
}

async function shopifyAdminGraphql(token: string, query: string, variables: Record<string, any> = {}) {
  const res = await fetch(`https://${STORE_DOMAIN}/admin/api/2025-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(json.errors?.[0]?.message || `Shopify Admin HTTP ${res.status}`);
  }
  return json.data;
}

async function publishProductToAllChannels(token: string, productId: string) {
  const pubData = await shopifyAdminGraphql(
    token,
    `query { publications(first: 10) { nodes { id name } } }`
  );
  const pubs = pubData?.publications?.nodes || [];
  if (pubs.length === 0) return;

  await shopifyAdminGraphql(
    token,
    `mutation PublishProduct($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) {
        userErrors { field message }
      }
    }`,
    {
      id: productId,
      input: pubs.map((p: any) => ({ publicationId: p.id })),
    }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      pin,
      action,
      query,
      category,
      shipToUsaOnly = true,
      pricingSettings,
      products = [],
    } = body || {};

    if (!pin || String(pin).trim() !== String(IMPORTER_PIN).trim()) {
      return NextResponse.json({ error: "Invalid Admin PIN." }, { status: 401 });
    }

    const pricing = normalizePricing(pricingSettings);

    // 1. Auto-Select & Filter Products (Ship to USA ON + Live Pricing Preview)
    if (action === "discover") {
      const q = (query || "").toLowerCase().trim();
      const cat = (category || "All").toLowerCase().trim();

      const matched = CURATED_US_CATALOG.filter((item) => {
        if (shipToUsaOnly && !item.shipsToUSA) return false;
        const catMatch = cat === "all" || item.category.toLowerCase().includes(cat);
        const queryMatch =
          !q ||
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.tags.some((t) => t.includes(q));
        return catMatch && queryMatch;
      }).map((item) => {
        const calc = calculateRetailPrices(item.supplierCost, pricing, 0);
        return {
          ...item,
          retailPrice: calc.retailPrice,
          compareAtPrice: calc.compareAtPrice,
          estimatedProfit: calc.estimatedProfit,
          winScore: Math.min(99, Math.round(item.rating * 18 + (item.ordersCount > 4000 ? 9 : 6))),
        };
      });

      return NextResponse.json({ ok: true, candidates: matched });
    }

    // 2. Push Selected Products Live to Shopify with USA Shipping & Pricing Settings Active
    if (action === "import_products") {
      if (!Array.isArray(products) || products.length === 0) {
        return NextResponse.json({ error: "Select at least one product to import." }, { status: 400 });
      }

      const filteredProducts = shipToUsaOnly
        ? products.filter((p: any) => p.shipsToUSA !== false)
        : products;

      if (filteredProducts.length === 0) {
        return NextResponse.json(
          { error: "No selected products meet the Ship to USA requirement." },
          { status: 400 }
        );
      }

      const token = await getShopifyAdminToken();
      const results: { title: string; status: string; id?: string; error?: string }[] = [];

      for (const item of filteredProducts) {
        try {
          const descriptionHtml = buildUsRetailHtml(
            item.highlights || ["Verified Ship-to-USA everyday essential", "Fast tracked US delivery"],
            {
              ...(item.specs || {}),
              "Shipping Region": "United States (All 50 States)",
              "Carrier": item.usCarrier || "USPS / UPS Tracked",
            }
          );

          const baseTags = Array.isArray(item.tags) ? item.tags : [];
          const finalTags = Array.from(
            new Set([...baseTags, "pickit-auto-imported", "ships-to-usa", "us-shipping"])
          );

          const createRes = await shopifyAdminGraphql(
            token,
            `mutation CreateProduct($input: ProductInput!, $media: [CreateMediaInput!]) {
              productCreate(input: $input, media: $media) {
                product {
                  id
                  title
                  handle
                  variants(first: 10) {
                    nodes { id title }
                  }
                }
                userErrors { field message }
              }
            }`,
            {
              input: {
                title: item.title,
                vendor: "PICKIT",
                productType: item.category || "Essentials",
                status: "ACTIVE",
                tags: finalTags,
                descriptionHtml,
                productOptions:
                  item.variants && item.variants.length > 1
                    ? [{ name: "Style", values: item.variants.map((v: any) => ({ name: v.title })) }]
                    : undefined,
              },
              media: item.image
                ? [{ originalSource: item.image, alt: item.title, mediaContentType: "IMAGE" }]
                : [],
            }
          );

          const userErrors = createRes?.productCreate?.userErrors || [];
          const createdProduct = createRes?.productCreate?.product;
          if (userErrors.length > 0 || !createdProduct?.id) {
            results.push({
              title: item.title,
              status: "failed",
              error: userErrors[0]?.message || "Shopify rejected product creation.",
            });
            continue;
          }

          // Apply active Pricing Settings + Physical Shipping Enabled on all variants
          const variantNodes = createdProduct.variants?.nodes || [];
          if (variantNodes.length > 0) {
            await shopifyAdminGraphql(
              token,
              `mutation UpdateVariants($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
                productVariantsBulkUpdate(productId: $productId, variants: $variants) {
                  userErrors { field message }
                }
              }`,
              {
                productId: createdProduct.id,
                variants: variantNodes.map((v: any, idx: number) => {
                  const offset = Number(item.variants?.[idx]?.priceOffset || 0);
                  const priced = calculateRetailPrices(Number(item.supplierCost || 15), pricing, offset);
                  return {
                    id: v.id,
                    price: priced.retailPrice,
                    compareAtPrice: priced.compareAtPrice,
                    inventoryPolicy: "CONTINUE",
                    inventoryItem: {
                      requiresShipping: true,
                      tracked: false,
                    },
                  };
                }),
              }
            );
          }

          await publishProductToAllChannels(token, createdProduct.id);
          results.push({ title: item.title, status: "imported", id: createdProduct.id });
        } catch (err: any) {
          results.push({ title: item.title, status: "failed", error: err?.message || "Import failed" });
        }
      }

      return NextResponse.json({ ok: true, results });
    }

    // 3. Scan & Auto-Optimize Draft DSers Imports with Active Pricing & USA Shipping Settings
    if (action === "optimize_dsers") {
      const token = await getShopifyAdminToken();
      const draftData = await shopifyAdminGraphql(
        token,
        `query {
          products(first: 20, query: "status:draft") {
            nodes {
              id
              title
              productType
              tags
              variants(first: 10) {
                nodes { id price compareAtPrice }
              }
            }
          }
        }`
      );

      const drafts = draftData?.products?.nodes || [];
      if (drafts.length === 0) {
        return NextResponse.json({
          ok: true,
          optimizedCount: 0,
          message: "No DRAFT DSers products found in Shopify right now.",
        });
      }

      let optimizedCount = 0;
      for (const prod of drafts) {
        const cleanTitle = prod.title
          .replace(/\[.*?\]|\(.*?\)/g, "")
          .replace(/\b(2024|2025|2026|hot sale|free shipping|dropshipping|new arrival)\b/gi, "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 72);

        const descHtml = buildUsRetailHtml(
          [
            "Engineered for reliable everyday performance and long-lasting durability",
            "Quality-checked for US retail standards with fast Ship-to-USA tracked delivery",
            "Backed by PICKIT 30-day hassle-free return guarantee",
          ],
          {
            Brand: "PICKIT",
            Category: prod.productType || "Everyday Essentials",
            "Shipping Region": "United States (Tracked Delivery)",
          }
        );

        const mergedTags = Array.from(
          new Set([...(prod.tags || []), "pickit-dsers-optimized", "ships-to-usa"])
        );

        await shopifyAdminGraphql(
          token,
          `mutation OptimizeDraft($input: ProductInput!) {
            productUpdate(input: $input) {
              product { id }
              userErrors { field message }
            }
          }`,
          {
            input: {
              id: prod.id,
              title: cleanTitle || prod.title,
              vendor: "PICKIT",
              status: "ACTIVE",
              tags: mergedTags,
              descriptionHtml: descHtml,
            },
          }
        );

        const vNodes = prod.variants?.nodes || [];
        if (vNodes.length > 0) {
          await shopifyAdminGraphql(
            token,
            `mutation PriceVariants($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
              productVariantsBulkUpdate(productId: $productId, variants: $variants) {
                userErrors { field message }
              }
            }`,
            {
              productId: prod.id,
              variants: vNodes.map((v: any) => {
                const rawCost = Number(v.price || 15);
                const priced = calculateRetailPrices(rawCost, pricing, 0);
                return {
                  id: v.id,
                  price: priced.retailPrice,
                  compareAtPrice: priced.compareAtPrice,
                  inventoryPolicy: "CONTINUE",
                  inventoryItem: {
                    requiresShipping: true,
                    tracked: false,
                  },
                };
              }),
            }
          );
        }

        await publishProductToAllChannels(token, prod.id);
        optimizedCount++;
      }

      return NextResponse.json({
        ok: true,
        optimizedCount,
        message: `Optimized & published ${optimizedCount} DSers product(s) with Ship-to-USA & Pricing Settings active!`,
      });
    }

    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  } catch (err: any) {
    console.error("Importer API error:", err);
    return NextResponse.json(
      { error: err?.message || "Unexpected importer server error." },
      { status: 500 }
    );
  }
}
