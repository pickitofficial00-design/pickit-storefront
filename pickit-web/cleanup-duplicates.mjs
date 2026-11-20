import fs from "node:fs";

const shop = process.env.SHOP_DOMAIN;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

if (!shop || !clientId || !clientSecret) {
  console.error("Missing SHOP_DOMAIN, CLIENT_ID, or CLIENT_SECRET");
  process.exit(1);
}

console.log("Requesting Admin API token from Shopify...");
const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  }),
});

const tokenData = await tokenRes.json();
if (!tokenData.access_token) {
  console.error("Failed to get token:", tokenData);
  process.exit(1);
}

const token = tokenData.access_token;
const endpoint = `https://${shop}/admin/api/2025-01/graphql.json`;

async function gql(query, variables = {}) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

console.log("Fetching all products from Shopify Admin...");
const all = [];
let cursor = null;
let hasNext = true;

while (hasNext) {
  const data = await gql(
    `query($c: String) {
      products(first: 250, after: $c) {
        pageInfo { hasNextPage endCursor }
        nodes { id title handle createdAt }
      }
    }`,
    { c: cursor }
  );
  if (data.errors) {
    console.error(data.errors);
    process.exit(1);
  }
  const p = data.data.products;
  all.push(...p.nodes);
  hasNext = p.pageInfo.hasNextPage;
  cursor = p.pageInfo.endCursor;
  process.stdout.write(`\rLoaded ${all.length} products...`);
}

const groups = new Map();
for (const item of all) {
  const key = item.title.trim().toLowerCase();
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(item);
}

const toDelete = [];
for (const items of groups.values()) {
  if (items.length > 1) {
    items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    toDelete.push(...items.slice(1));
  }
}

fs.writeFileSync("deleted-duplicates-backup.json", JSON.stringify(toDelete, null, 2));
console.log(
  `\nKeeping ${all.length - toDelete.length} unique products. Deleting ${toDelete.length} duplicates (backup saved to deleted-duplicates-backup.json)...`
);

let deleted = 0;
for (const dup of toDelete) {
  const res = await gql(
    `mutation($id: ID!) {
      productDelete(input: { id: $id }) {
        deletedProductId
        userErrors { message }
      }
    }`,
    { id: dup.id }
  );
  if (res.data?.productDelete?.userErrors?.length) {
    console.error("\nError deleting", dup.id, res.data.productDelete.userErrors);
  }
  deleted++;
  if (deleted % 25 === 0 || deleted === toDelete.length) {
    process.stdout.write(`\rDeleted ${deleted} / ${toDelete.length} duplicates...`);
  }
  await new Promise((r) => setTimeout(r, 350));
}

console.log("\nDone! All duplicate products removed cleanly.");
