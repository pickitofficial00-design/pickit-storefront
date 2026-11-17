// Single API adapter for PICKIT.
// Automatically paginates through all pages and preserves full image galleries & variants.

const API_BASE_URL = "https://pickit-storefront.vercel.app";

export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  availableForSale: boolean;
  image?: string | null;
  selectedOptions: { name: string; value: string }[];
}

export interface ProductOption {
  name: string;
  values: string[];
}

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
  images?: string[];
  imageAlt: string;
  options?: ProductOption[];
  variants?: ProductVariant[];
}

export interface ProductsResponse {
  products: Product[];
  hasNextPage: boolean;
  nextCursor: string | null;
}

async function fetchProductPage(cursor?: string | null): Promise<ProductsResponse> {
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

export async function fetchProducts(cursor?: string | null): Promise<ProductsResponse> {
  if (cursor) {
    return fetchProductPage(cursor);
  }

  const allProducts: Product[] = [];
  const seenIds = new Set<string>();
  let nextCursor: string | null = null;
  let hasNextPage = true;
  let pageCount = 0;

  while (hasNextPage && pageCount < 15) {
    const page = await fetchProductPage(nextCursor);
    for (const item of page.products || []) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        allProducts.push(item);
      }
    }
    hasNextPage = Boolean(page.hasNextPage && page.nextCursor);
    nextCursor = page.nextCursor || null;
    pageCount++;
  }

  return {
    products: allProducts,
    hasNextPage: false,
    nextCursor: null,
  };
}

export async function createCheckoutUrl(
  items: { variantId: string; quantity: number }[]
): Promise<string> {
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

export async function fetchProductByHandle(handle: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/product?handle=${encodeURIComponent(handle)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
