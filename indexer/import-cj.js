import dotenv from "dotenv";
import { ingestProducts } from "./ingest-bulk.js";
dotenv.config();

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getCjToken() {
  if (process.env.CJ_ACCESS_TOKEN) return process.env.CJ_ACCESS_TOKEN;
  const r = await fetch("https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: process.env.CJ_API_KEY })
  });
  const d = await r.json();
  if (!d?.data?.accessToken) throw new Error("CJ Auth failed: " + JSON.stringify(d));
  return d.data.accessToken;
}

export async function importFromCj({ keyword = "", countryCode = "", pages = 5 } = {}) {
  const token = await getCjToken();
  await sleep(1200);
  let totalIndexed = 0;
  for (let page = 1; page <= pages; page++) {
    const url = new URL("https://developers.cjdropshipping.com/api2.0/v1/product/list");
    if (keyword) url.searchParams.set("productNameEn", keyword);
    if (countryCode) url.searchParams.set("countryCode", countryCode);
    url.searchParams.set("pageNum", String(page));
    url.searchParams.set("pageSize", "50");
    const r = await fetch(url, { headers: { "CJ-Access-Token": token } });
    const d = await r.json();
    const list = d?.data?.list || [];
    if (!list.length) { console.log("CJ_PAGE_EMPTY:", page, d?.message || ""); break; }
    const mapped = list.map(p => ({
      source_pid: "CJ-" + p.pid,
      source_platform: "CJ_API",
      source_url: "https://cjdropshipping.com/product/-p-" + p.pid + ".html",
      title: p.productNameEn,
      category: p.categoryName || keyword || "Trending",
      seller_name: countryCode === "US" ? "CJ US Warehouse" : "CJ Priority Global",
      supplier_cost: Number(String(p.sellPrice || "5").split("--")[0]) || 5,
      us_stock: countryCode === "US",
      rating: 4.8,
      orders_count: Number(p.listedNum || 150),
      main_image: p.productImage,
      images: [p.productImage].filter(Boolean)
    }));
    const res = await ingestProducts(mapped);
    totalIndexed += res.indexed;
    console.log(`Page ${page}: +${res.indexed} items (total: ${totalIndexed})`);
    await sleep(1200);
  }
  return { totalIndexed };
}

if (process.argv[2] !== undefined) {
  importFromCj({ keyword: process.argv[2], countryCode: process.argv[3] || "", pages: Number(process.argv[4] || 4) })
    .then(r => console.log("CJ_IMPORT_COMPLETE:", r))
    .catch(console.error);
}
