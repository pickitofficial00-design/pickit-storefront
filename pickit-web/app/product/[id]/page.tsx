
import { gql } from "@shopify/hydrogen";
import { headers } from "next/headers";
import AddToCartButton from "../../context/AddToCartButton";
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

  const variant = product.variants.nodes[0];
  const price = Number(variant?.price.amount ?? 0);
  const currency = variant?.price.currencyCode ?? "USD";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        fontFamily: "Arial, sans-serif",
        color: "#171717",
      }}
    >
      <header
        style={{
          padding: "20px 6%",
          borderBottom: "1px solid #eeeeee",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <a
          href="/"
          style={{
            fontSize: 30,
            fontWeight: 900,
            color: "#f26b21",
            textDecoration: "none",
          }}
        >
          PICKIT
        </a>

        <a href="/" style={{ fontWeight: 600 }}>
          ← Continue shopping
        </a>
      </header>

      <section
        style={{
          maxWidth: 1100,
          margin: "50px auto",
          padding: "0 20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 45,
          alignItems: "center",
        }}
      >
        {product.featuredImage?.url ? (
          <img
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            style={{
              width: "100%",
              maxHeight: 480,
              objectFit: "contain",
              background: "#f5f3ef",
              borderRadius: 16,
            }}
          />
        ) : (
          <div
            style={{
              minHeight: 300,
              background: "#f5f3ef",
              borderRadius: 16,
              display: "grid",
              placeItems: "center",
              color: "#777",
            }}
          >
            No product image
          </div>
        )}

        <div>
          <p style={{ color: "#f26b21", fontWeight: 700 }}>
            {product.productType || "Other"}
          </p>

          <h1 style={{ fontSize: 34, lineHeight: 1.2 }}>
            {product.title}
          </h1>

          <p style={{ color: "#777", lineHeight: 1.7 }}>
            {product.description || "Discover this product at PICKIT."}
          </p>

          <h2 style={{ fontSize: 30 }}>
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency,
            }).format(price)}
          </h2>

          <p
            style={{
              color: product.availableForSale ? "#16803c" : "#dc2626",
              fontWeight: 700,
              margin: "15px 0",
            }}
          >
            {product.availableForSale ? "● Available" : "● Out of Stock"}
          </p>

          {product.availableForSale && variant ? (
            <AddToCartButton
              product={{
                id: variant.id,
                variantId: variant.id,
                name: product.title,
                price,
                image: product.featuredImage?.url ?? "",
              }}
            />
          ) : (
            <button
              disabled
              style={{
                width: "100%",
                padding: 16,
                background: "#cccccc",
                color: "#666666",
                border: "none",
                borderRadius: 8,
                cursor: "not-allowed",
                fontWeight: 700,
              }}
            >
              Currently Unavailable
            </button>
          )}

          <p style={{ marginTop: 20, color: "#777", fontSize: 13 }}>
            PICKIT — Discover. Choose. Enjoy.
          </p>
        </div>
      </section>
    </main>
  );
}
