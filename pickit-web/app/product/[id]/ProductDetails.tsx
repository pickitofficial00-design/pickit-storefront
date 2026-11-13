"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import AddToCartButton from "../../context/AddToCartButton";

type ProductImage = {
  url: string;
  altText: string | null;
};

type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: {
    amount: string;
    currencyCode: string;
  };
  image?: ProductImage | null;
};

type Props = {
  product: {
    id: string;
    title: string;
    description: string;
    productType: string;
    availableForSale: boolean;
    featuredImage: ProductImage | null;
    images: ProductImage[];
    variants: ProductVariant[];
  };
};

export default function ProductDetails({ product }: Props) {
  const { cartCount } = useCart();

  const initialVariant =
    product.variants.find((v) => v.availableForSale) ??
    product.variants[0] ??
    null;

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    initialVariant?.id ?? ""
  );

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ??
    initialVariant;

  const allImages =
    product.images.length > 0
      ? product.images
      : product.featuredImage
      ? [product.featuredImage]
      : [];

  const [activeImageUrl, setActiveImageUrl] = useState<string>(
    selectedVariant?.image?.url ?? allImages[0]?.url ?? ""
  );

  const price = Number(selectedVariant?.price.amount ?? 0);
  const currency = selectedVariant?.price.currencyCode ?? "USD";
  const isAvailable = Boolean(
    product.availableForSale && selectedVariant?.availableForSale
  );

  const hasMultipleVariants =
    product.variants.length > 1 ||
    (product.variants.length === 1 &&
      product.variants[0].title !== "Default Title");

  const displayTitle =
    hasMultipleVariants && selectedVariant
      ? `${product.title} — ${selectedVariant.title}`
      : product.title;

  function handleSelectVariant(variant: ProductVariant) {
    setSelectedVariantId(variant.id);
    if (variant.image?.url) {
      setActiveImageUrl(variant.image.url);
    }
  }

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
          gap: 16,
          flexWrap: "wrap",
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

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <a href="/" style={{ fontWeight: 600, color: "#171717", textDecoration: "none" }}>
            ← Continue shopping
          </a>

          <Link
            href="/cart"
            style={{
              background: "#171717",
              color: "white",
              padding: "10px 16px",
              borderRadius: 6,
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            🛒 Cart ({cartCount})
          </Link>
        </div>
      </header>

      <section
        style={{
          maxWidth: 1100,
          margin: "50px auto",
          padding: "0 20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 45,
          alignItems: "start",
        }}
      >
        <div>
          {activeImageUrl ? (
            <img
              src={activeImageUrl}
              alt={product.title}
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

          {allImages.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 14,
                flexWrap: "wrap",
              }}
            >
              {allImages.map((img, idx) => (
                <button
                  key={`${img.url}-${idx}`}
                  type="button"
                  onClick={() => setActiveImageUrl(img.url)}
                  style={{
                    padding: 4,
                    border:
                      activeImageUrl === img.url
                        ? "2px solid #f26b21"
                        : "1px solid #ddd",
                    borderRadius: 8,
                    background: "#f5f3ef",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={img.url}
                    alt={img.altText ?? product.title}
                    style={{
                      width: 64,
                      height: 64,
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p style={{ color: "#f26b21", fontWeight: 700 }}>
            {product.productType || "Other"}
          </p>

          <h1 style={{ fontSize: 34, lineHeight: 1.2 }}>{product.title}</h1>

          <p style={{ color: "#666", lineHeight: 1.7 }}>
            {product.description || "Discover this product at PICKIT."}
          </p>

          <h2 style={{ fontSize: 30, margin: "16px 0" }}>
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency,
            }).format(price)}
          </h2>

          {hasMultipleVariants && (
            <div style={{ margin: "18px 0" }}>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
                Select Option:
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {product.variants.map((variant) => {
                  const isSelected = variant.id === selectedVariant?.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => handleSelectVariant(variant)}
                      style={{
                        padding: "10px 16px",
                        borderRadius: 8,
                        border: isSelected
                          ? "2px solid #f26b21"
                          : "1px solid #ddd",
                        background: isSelected ? "#fff5ef" : "#ffffff",
                        color: variant.availableForSale ? "#171717" : "#999",
                        fontWeight: isSelected ? 700 : 500,
                        cursor: "pointer",
                      }}
                    >
                      {variant.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <p
            style={{
              color: isAvailable ? "#16803c" : "#dc2626",
              fontWeight: 700,
              margin: "15px 0",
            }}
          >
            {isAvailable ? "● Available" : "● Out of Stock"}
          </p>

          {isAvailable && selectedVariant ? (
            <AddToCartButton
              product={{
                id: selectedVariant.id,
                variantId: selectedVariant.id,
                name: displayTitle,
                price,
                image: activeImageUrl,
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
