import { gql } from "@shopify/hydrogen";
import { createRequestStorefrontClient } from "../../../lib/storefront";

function formatUsTitle(raw: string): string {
  if (!raw) return "PICKIT Essential";
  let clean = raw
    .replace(/\b(202[0-9]\s*)+/g, "")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (clean.length > 82) {
    const cut = clean.slice(0, 82);
    const lastSpace = cut.lastIndexOf(" ");
    clean = (lastSpace > 50 ? cut.slice(0, lastSpace) : cut).replace(/[,\-\/|]+$/, "").trim();
  }
  return clean;
}

const SINGLE_PRODUCT_QUERY = gql(`
  query PickitSingleProduct($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      productType
      vendor
      tags
      availableForSale
      featuredImage {
        url
        altText
      }
      images(first: 20) {
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
          sku
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
`);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get("handle");

    if (!handle) {
      return Response.json({ error: "Missing product handle" }, { status: 400 });
    }

    const storefront = createRequestStorefrontClient(request);
    const { data, errors } = await storefront.graphql(SINGLE_PRODUCT_QUERY, {
      variables: { handle },
    });

    if (errors || !data?.product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    const product = data.product;
    const variantNodes = product.variants?.nodes || [];
    const firstVariant = variantNodes[0];

    const imageUrls: string[] = [];
    if (product.featuredImage?.url) imageUrls.push(product.featuredImage.url);
    for (const img of product.images?.nodes || []) {
      if (img?.url && !imageUrls.includes(img.url)) imageUrls.push(img.url);
    }
    for (const v of variantNodes) {
      if (v?.image?.url && !imageUrls.includes(v.image.url)) imageUrls.push(v.image.url);
    }

    const price = Number(firstVariant?.price?.amount ?? 0);
    const compareAt = Number(firstVariant?.compareAtPrice?.amount ?? 0);
    const discount =
      compareAt > price && compareAt > 0
        ? Math.round(((compareAt - price) / compareAt) * 100)
        : 0;

    return Response.json({
      id: product.id,
      handle: product.handle,
      name: formatUsTitle(product.title),
      rawTitle: product.title,
      description: product.description || "",
      descriptionHtml: product.descriptionHtml || "",
      tags: product.tags || [],
      price,
      currency: firstVariant?.price?.currencyCode ?? "USD",
      variantId: firstVariant?.id ?? null,
      rating: 4.8,
      brand: product.vendor && product.vendor !== "Unbranded" ? product.vendor : "PICKIT",
      inStock: product.availableForSale,
      discount,
      category: product.productType || "Essentials",
      image: imageUrls[0] ?? "",
      images: imageUrls,
      imageAlt: product.featuredImage?.altText ?? product.title,
      options: product.options || [],
      variants: variantNodes.map((v: any) => ({
        id: v.id,
        title: v.title,
        sku: v.sku || null,
        price: Number(v.price?.amount ?? price),
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice.amount) : null,
        availableForSale: Boolean(v.availableForSale),
        image: v.image?.url ?? null,
        selectedOptions: v.selectedOptions || [],
      })),
    });
  } catch (error) {
    console.error("Single product fetch error:", error);
    return Response.json({ error: "Failed to load product details" }, { status: 500 });
  }
}
