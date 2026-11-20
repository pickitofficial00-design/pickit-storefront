import { gql } from "@shopify/hydrogen";
import { createRequestStorefrontClient } from "../../../lib/storefront";

function formatUsTitle(raw: string): string {
  if (!raw) return "PICKIT Essential";
  let clean = raw
    .replace(/\b(202[0-9]\s*)+/g, "")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (clean.length > 76) {
    const cut = clean.slice(0, 76);
    const lastSpace = cut.lastIndexOf(" ");
    clean = (lastSpace > 45 ? cut.slice(0, lastSpace) : cut).replace(/[,\-\/|]+$/, "").trim();
  }
  return clean;
}

const PRODUCTS_QUERY = gql(`
  query PickitProducts($after: String) {
    products(first: 100, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        handle
        title
        description
        productType
        vendor
        availableForSale
        featuredImage {
          url
          altText
        }
        images(first: 15) {
          nodes {
            url
            altText
          }
        }
        options {
          name
          values
        }
        variants(first: 50) {
          nodes {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            image {
              url
              altText
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
`);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");

    const storefront = createRequestStorefrontClient(request);

    const { data, errors } = await storefront.graphql(
      PRODUCTS_QUERY,
      {
        variables: {
          after: cursor || null,
        },
      }
    );

    if (errors) {
      console.error("Shopify GraphQL errors:", errors);

      return Response.json(
        { error: "Shopify product query failed" },
        { status: 502 }
      );
    }

    const products = data.products.nodes.map((product: any) => {
      const variantNodes = product.variants?.nodes || [];
      const firstVariant = variantNodes[0];

      const imageUrls: string[] = [];
      if (product.featuredImage?.url) {
        imageUrls.push(product.featuredImage.url);
      }
      for (const img of product.images?.nodes || []) {
        if (img?.url && !imageUrls.includes(img.url)) {
          imageUrls.push(img.url);
        }
      }
      for (const v of variantNodes) {
        if (v?.image?.url && !imageUrls.includes(v.image.url)) {
          imageUrls.push(v.image.url);
        }
      }

      const price = Number(firstVariant?.price?.amount ?? 0);
      const compareAt = Number(firstVariant?.compareAtPrice?.amount ?? 0);
      const discount =
        compareAt > price && compareAt > 0
          ? Math.round(((compareAt - price) / compareAt) * 100)
          : 0;

      const variants = variantNodes.map((v: any) => ({
        id: v.id,
        title: v.title,
        price: Number(v.price?.amount ?? price),
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice.amount) : null,
        availableForSale: Boolean(v.availableForSale),
        image: v.image?.url ?? null,
        selectedOptions: v.selectedOptions || [],
      }));

      return {
        id: product.id,
        handle: product.handle,
        name: formatUsTitle(product.title),
        description: product.description,
        price,
        currency: firstVariant?.price?.currencyCode ?? "USD",
        variantId: firstVariant?.id ?? null,
        rating: 4.8,
        brand: product.vendor || "PICKIT",
        inStock: product.availableForSale,
        discount,
        category: product.productType || "Other",
        image: imageUrls[0] ?? "",
        images: imageUrls,
        imageAlt: product.featuredImage?.altText ?? product.title,
        options: product.options || [],
        variants,
      };
    });


    // Merge live JIT Meilisearch catalog when Chromebook tunnel is online (3s timeout)
    const jitBase = ((process.env.PICKIT_API_URL || "").match(/https?:\/\/[^)\]\s"']+/)?.[0]) || "https://api.pickitcart.com";
    if (!cursor && jitBase) {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 8000);
        const jr = await fetch(jitBase + "/api/search?limit=100", { signal: ctrl.signal, cache: "no-store" });
        clearTimeout(t);
        if (jr.ok) {
          const jd = await jr.json();
          const seenTitles = new Set(products.map((p: any) => p.name.toLowerCase()));
          for (const item of (jd.products || [])) {
            const cleanName = formatUsTitle(item.title || "");
            if (!cleanName || seenTitles.has(cleanName.toLowerCase())) continue;
            seenTitles.add(cleanName.toLowerCase());
            const pid = item.source_pid || item.id;
            const price = Number(item.retail_price || 19.99);
            const compareAt = Number(item.compare_at_price || 0);
            products.push({
              id: "jit::" + pid,
              handle: "jit-" + String(pid).toLowerCase(),
              name: cleanName,
              description: item.description || cleanName,
              price,
              currency: "USD",
              variantId: "jit::" + pid,
              rating: Number(item.rating || 4.8),
              brand: item.seller_name || "PICKIT",
              inStock: true,
              discount: compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0,
              category: item.category || "Trending",
              image: item.main_image || (item.images && item.images[0]) || "",
              images: item.images || [item.main_image].filter(Boolean),
              imageAlt: cleanName,
              options: [],
              variants: [{ id: "jit::" + pid, title: "Standard", price, compareAtPrice: compareAt || null, availableForSale: true, image: item.main_image || null, selectedOptions: [] }]
            });
          }
        }
      } catch (e: any) { return Response.json({ products, jitError: String(e?.message || e), jitBase, hasNextPage: data.products.pageInfo.hasNextPage, nextCursor: data.products.pageInfo.endCursor }); }
    }

    return Response.json({
      products,
      hasNextPage: data.products.pageInfo.hasNextPage,
      nextCursor: data.products.pageInfo.endCursor,
    });
  } catch (error) {
    console.error("Shopify connection error:", error);

    return Response.json(
      { error: "Could not connect to Shopify" },
      { status: 500 }
    );
  }
}
