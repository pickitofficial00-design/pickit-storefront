"use client";

import "../../storefront.css";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import AddToCartButton from "../../context/AddToCartButton";

type ProductImage = { url: string; altText: string | null };
type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
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
  const { addToCart, cartCount } = useCart();
  const [quickAdded, setQuickAdded] = useState(false);

  const initialVariant =
    product.variants.find((v) => v.availableForSale) ?? product.variants[0] ?? null;
  const [selectedVariantId, setSelectedVariantId] = useState<string>(initialVariant?.id ?? "");
  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? initialVariant;

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
  const formattedPrice = new Intl.NumberFormat("en-US", { style: "currency", currency }).format(price);
  const isAvailable = Boolean(product.availableForSale && selectedVariant?.availableForSale);

  const hasMultipleVariants =
    product.variants.length > 1 ||
    (product.variants.length === 1 && product.variants[0].title !== "Default Title");

  const displayTitle =
    hasMultipleVariants && selectedVariant ? `${product.title} — ${selectedVariant.title}` : product.title;

  function handleSelectVariant(variant: ProductVariant) {
    setSelectedVariantId(variant.id);
    if (variant.image?.url) setActiveImageUrl(variant.image.url);
  }

  function handleMobileAdd() {
    if (!isAvailable || !selectedVariant) return;
    addToCart({
      id: selectedVariant.id,
      variantId: selectedVariant.id,
      name: displayTitle,
      price,
      image: activeImageUrl,
    });
    setQuickAdded(true);
    setTimeout(() => setQuickAdded(false), 1400);
  }

  return (
    <div className="sf-page">
      <header className="sf-header">
        <div className="sf-header-inner">
          <Link className="sf-logo" href="/">PICK<span>IT.</span></Link>
          <div className="sf-nav-right">
            <Link className="sf-pill-link" href="/">← Shop</Link>
            <Link className="sf-cart-pill" href="/cart">
              <span>Cart</span>
              <span className="sf-cart-badge">{cartCount}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="sf-main">
        <div className="pdp-grid">
          <div className="pdp-media-card">
            {activeImageUrl ? (
              <img className="pdp-main-img" src={activeImageUrl} alt={product.title} />
            ) : (
              <div className="pdp-main-img" style={{ display: "grid", placeItems: "center", color: "#888" }}>
                No product image
              </div>
            )}

            {allImages.length > 1 && (
              <div className="pdp-thumbs">
                {allImages.map((img, idx) => (
                  <button
                    key={`${img.url}-${idx}`}
                    type="button"
                    onClick={() => setActiveImageUrl(img.url)}
                    className={`pdp-thumb ${activeImageUrl === img.url ? "active" : ""}`}
                  >
                    <img src={img.url} alt={img.altText ?? product.title} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pdp-info-card">
            <span className="pdp-eyebrow">{product.productType || "PICKIT EXCLUSIVE"}</span>
            <h1 className="pdp-title">{product.title}</h1>

            <div className="pdp-price-row">
              <span className="pdp-price">{formattedPrice}</span>
              <span className={`pdp-stock ${isAvailable ? "" : "out"}`}>
                {isAvailable ? "● In Stock" : "● Out of Stock"}
              </span>
            </div>

            <p className="pdp-desc">
              {product.description || "Curated for quality, everyday utility, and fast tracked delivery."}
            </p>

            {hasMultipleVariants && (
              <div className="pdp-variants">
                <label>Select Option:</label>
                <div className="pdp-var-list">
                  {product.variants.map((variant) => {
                    const isSelected = variant.id === selectedVariant?.id;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => handleSelectVariant(variant)}
                        className={`pdp-var-btn ${isSelected ? "active" : ""}`}
                      >
                        {variant.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
                style={{ width: "100%", padding: 15, background: "#e5e5e5", color: "#888", border: 0, borderRadius: 12, fontWeight: 700 }}
              >
                Currently Unavailable
              </button>
            )}

            <div className="pdp-perks">
              <div>🚚<strong>6–12 Days</strong>US Tracked</div>
              <div>↩️<strong>30 Days</strong>Easy Returns</div>
              <div>🔒<strong>SSL Safe</strong>Checkout</div>
            </div>
          </div>
        </div>
      </main>

      {isAvailable && selectedVariant && (
        <div className="pdp-mobile-bar">
          <div>
            <div style={{ fontSize: 11, color: "#666", fontWeight: 700 }}>TOTAL</div>
            <strong>{formattedPrice}</strong>
          </div>
          <button type="button" className="pdp-mobile-add" onClick={handleMobileAdd}>
            {quickAdded ? "✓ Added to Cart" : "+ Add to Cart"}
          </button>
        </div>
      )}
    </div>
  );
}
