import fs from "fs";
import { ingestProducts } from "./ingest-bulk.js";
const file = process.argv[2];
if (!file) { console.log("Usage: node indexer/import-csv.js path/to/feed.csv"); process.exit(1); }
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean);
const headers = lines[0].split(",").map(h => h.trim());
const items = lines.slice(1).map((line, idx) => {
  const cols = line.split(",");
  const row = Object.fromEntries(headers.map((h, i) => [h, (cols[i] || "").trim()]));
  return {
    source_pid: row.sku || "CSV-" + idx, title: row.title, category: row.category || "General",
    seller_name: row.seller_name || "Verified Partner", supplier_cost: Number(row.supplier_cost || 5),
    us_stock: row.us_stock === "true" || row.us_stock === "1", rating: Number(row.rating || 4.8),
    orders_coount: Number(row.orders_count || 120), main_image: row.image_url,
    variants: [{sku: row.sku || "SKU-" + idx, color: row.color || "Standard", size: row.size || "One Size", supplier_cost: Number(row.supplier_cost || 5)}]
  };
});
ingestProducts(items).then(r => console.log("CSV_IMPORT_COMPLETE:", r));
