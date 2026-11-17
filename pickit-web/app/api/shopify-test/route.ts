import { gql } from "@shopify/hydrogen";
import { createRequestStorefrontClient } from "../../../lib/storefront";

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
        name: product.title,
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
