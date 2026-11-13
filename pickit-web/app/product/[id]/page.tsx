import { gql } from "@shopify/hydrogen";
import { headers } from "next/headers";
import ProductDetails from "./ProductDetails";
import { createRequestStorefrontClient } from "../../../lib/storefront";

export const instant = false;

const PRODUCT_QUERY = gql(`
  query PickitProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      productType
      availableForSale
      featuredImage {
        url
        altText
      }
      images(first: 10) {
        nodes {
          url
          altText
        }
      }
      variants(first: 25) {
        nodes {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          image {
            url
            altText
          }
        }
      }
    }
  }
`);

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: handle } = await params;

  const request = new Request("https://pickit-storefront.vercel.app", {
    headers: await headers(),
  });

  const storefront = createRequestStorefrontClient(request);

  let product;

  try {
    const { data, errors } = await storefront.graphql(PRODUCT_QUERY, {
      variables: { handle },
    });

    if (errors) {
      throw new Error("Shopify product query failed");
    }

    product = data.product;
  } catch {
    return (
      <main style={{ padding: 40, fontFamily: "Arial" }}>
        <h1>Unable to load product</h1>
        <p>Please try again later.</p>
        <a href="/">Back to PICKIT</a>
      </main>
    );
  }

  if (!product) {
    return (
      <main style={{ padding: 40, fontFamily: "Arial" }}>
        <h1>Product not found</h1>
        <a href="/">Back to PICKIT</a>
      </main>
    );
  }

  return (
    <ProductDetails
      product={{
        id: product.id,
        title: product.title,
        description: product.description,
        productType: product.productType,
        availableForSale: product.availableForSale,
        featuredImage: product.featuredImage ?? null,
        images: product.images?.nodes ?? [],
        variants: product.variants?.nodes ?? [],
      }}
    />
  );
}
