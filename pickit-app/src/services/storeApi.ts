// Single API adapter for PICKIT.
// Currently talks to your pickit-web API (which connects to Shopify).
// Later, when you replace Shopify with your own backend, you ONLY edit this file!

const API_BASE_URL = "https://pickit-storefront.vercel.app";

export interface Product {
  id: string;
  handle: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  variantId: string | null;
  rating: number;
  brand: string;
  inStock: boolean;
  discount: number;
  category: string;
  image: string;
  imageAlt: string;
}

export interface ProductsResponse {
  products: Product[];
  hasNextPage: boolean;
  nextCursor: string | null;
}

export async function fetchProducts(cursor?: string | null): Promise<ProductsResponse> {
  const url = new URL(`${API_BASE_URL}/api/shopify-test`);
  if (cursor) {
    url.searchParams.set("cursor", cursor);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Failed to fetch products (${res.status})`);
  }
  return res.json();
}

export async function createCheckoutUrl(
  items: { variantId: string; quantity: number }[]
): Promise<string> {
  // Calls your web checkout endpoint (we will add /api/checkout to pickit-web next)
  const res = await fetch(`${API_BASE_URL}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });

  if (!res.ok) {
    throw new Error("Checkout endpoint not ready yet");
  }
  const data = await res.json();
  return data.checkoutUrl;
}
