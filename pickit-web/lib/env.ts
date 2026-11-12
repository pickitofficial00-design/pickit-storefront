const shopId = process.env.NEXT_PUBLIC_SHOP_ID;
const clientId = process.env.NEXT_PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID;
const sessionSecret = process.env.SESSION_SECRET;
const siteOrigin = process.env.SITE_ORIGIN;

if (!shopId || !clientId || !sessionSecret || !siteOrigin) {
  throw new Error("Missing Shopify environment variables");
}

export const env = {
  SHOP_ID: shopId,
  PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID: clientId,
  SESSION_SECRET: sessionSecret,
  SITE_ORIGIN: siteOrigin,
  PRIVATE_STOREFRONT_API_TOKEN:
  process.env.PRIVATE_STOREFRONT_API_TOKEN!,
};