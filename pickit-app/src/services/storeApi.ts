// Single API adapter for PICKIT.
// Streams Page 1 immediately for instant front-page load and caches full catalog across screens.

const API_BASE_URL = "https://pickit-storefront.vercel.app";

export interface ProductVariant {
  id: string;
  title: string;
  sku?: string | null;
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
  descriptionHtml?: string;
  tags?: string[];
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

let cachedProducts: Product[] = [];
let isFetchingAll = false;
let activeFetchPromise: Promise<ProductsResponse> | null = null;
const listeners = new Set<(products: Product[], done: boolean) => void>();

function notifyListeners(products: Product[], done: boolean) {
  for (const listener of listeners) {
    try {
      listener(products, done);
    } catch {}
  }
}

export function subscribeCatalog(listener: (products: Product[], done: boolean) => void): () => void {
  listeners.add(listener);
  if (cachedProducts.length > 0) {
    listener(cachedProducts, !isFetchingAll);
  }
  return () => {
    listeners.delete(listener);
  };
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

export async function fetchProducts(
  cursor?: string | null,
  options?: { forceRefresh?: boolean; onProgress?: (products: Product[], done: boolean) => void }
): Promise<ProductsResponse> {
  if (cursor) {
    return fetchProductPage(cursor);
  }

  const forceRefresh = Boolean(options?.forceRefresh);
  const onProgress = options?.onProgress;

  if (!forceRefresh && cachedProducts.length > 0) {
    onProgress?.(cachedProducts, !isFetchingAll);
    if (activeFetchPromise) {
      return activeFetchPromise;
    }
    return {
      products: cachedProducts,
      hasNextPage: false,
      nextCursor: null,
    };
  }

  if (activeFetchPromise && !forceRefresh) {
    return activeFetchPromise;
  }

  isFetchingAll = true;
  const runFetch = (async () => {
    const allProducts: Product[] = [];
    const seenIds = new Set<string>();
    let nextCursor: string | null = null;
    let hasNextPage = true;
    let pageCount = 0;

    try {
      while (hasNextPage && pageCount < 100) {
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

        cachedProducts = [...allProducts];
        const done = !hasNextPage || pageCount >= 100;

        // Immediately deliver Page 1, then update every 3 pages to keep scrolling smooth
        if (pageCount === 1 || pageCount % 3 === 0 || done) {
          onProgress?.(cachedProducts, done);
          notifyListeners(cachedProducts, done);
        }
      }

      isFetchingAll = false;
      notifyListeners(cachedProducts, true);
      return {
        products: cachedProducts,
        hasNextPage: false,
        nextCursor: null,
      };
    } catch (err) {
      isFetchingAll = false;
      if (allProducts.length > 0) {
        cachedProducts = [...allProducts];
        onProgress?.(cachedProducts, true);
        notifyListeners(cachedProducts, true);
        return {
          products: cachedProducts,
          hasNextPage: false,
          nextCursor: null,
        };
      }
      throw err;
    } finally {
      activeFetchPromise = null;
    }
  })();

  activeFetchPromise = runFetch;
  return runFetch;
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
