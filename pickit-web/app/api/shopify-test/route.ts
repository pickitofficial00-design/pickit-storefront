
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
        variants(first: 1) {
          nodes {
            id
            price {
              amount
              currencyCode
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

    const products = data.products.nodes.map((product) => {
      const variant = product.variants.nodes[0];

      return {
        id: product.id,
        handle: product.handle,
        name: product.title,
        description: product.description,
        price: Number(variant?.price.amount ?? 0),
        currency: variant?.price.currencyCode ?? "USD",
        variantId: variant?.id ?? null,
        rating: 0,
        brand: product.vendor || "Unbranded",
        inStock: product.availableForSale,
        discount: 0,
        category: product.productType || "Other",
        image: product.featuredImage?.url ?? "",
        imageAlt: product.featuredImage?.altText ?? product.title,
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
