'use client';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../../context/CartContext';

interface ProductImage {
  url?: string;
  altText?: string | null;
}

interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price?: {
    amount?: string;
    currencyCode?: string;
  };
  image?: ProductImage | null;
}

interface Product {
  id: string;
  title: string;
  description?: string;
  descriptionHtml?: string;
  productType?: string;
  vendor?: string;
  availableForSale: boolean;
  featuredImage?: ProductImage | null;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

interface ProductDetailsProps {
  product: Product;
}

function formatUsStandardTitle(raw?: string): string {
  if (!raw) return "PICKIT Verified Essential";
  let clean = raw
    .replace(/\b(202[0-9]\s*)+/g, "")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (clean.length > 82) {
    const cut = clean.slice(0, 82);
    const lastSpace = cut.lastIndexOf(" ");
    clean = (lastSpace > 48 ? cut.slice(0, lastSpace) : cut).replace(/[,\-\/|]+$/, "").trim();
  }
  return clean;
}

function parseWebSpecifications(html?: string, plain?: string) {
  const sourceHtml = html || "";
  const listMatches = [...sourceHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((m) =>
      m[1]
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);

  const stripped = (sourceHtml || plain || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>|<\/div>|<\/li>|<\/h[1-6]>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const lines = stripped
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  const specPairs: { label: string; value: string }[] = [];
  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 1 && colonIdx < 36 && line.length < 160) {
      const label = line.slice(0, colonIdx).replace(/^[•\-*\s]+/, "").trim();
      const value = line.slice(colonIdx + 1).trim();
      if (label && value) {
        specPairs.push({ label, value });
      }
    }
  }

  const highlights =
    listMatches.length > 0
      ? listMatches.slice(0, 8)
      : specPairs.slice(0, 5).map((s) => `${s.label}: ${s.value}`);

  return { highlights, specPairs };
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const { cart, addToCart, removeFromCart } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const variants = product?.variants || [];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    variants[0] || ({} as ProductVariant)
  );

  const rawImages: (ProductImage | null | undefined)[] = [
    product?.featuredImage,
    ...(product?.images || []),
    ...variants.map((v) => v.image),
  ];

  const allImages: ProductImage[] = [];
  const seenUrls = new Set<string>();
  for (const img of rawImages) {
    if (img?.url && !seenUrls.has(img.url)) {
      seenUrls.add(img.url);
      allImages.push(img);
    }
  }

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const startX = useRef<number | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (startX.current === null || allImages.length <= 1) return;
    const diff = startX.current - e.clientX;
    if (Math.abs(diff) > 40) {
      setIsPaused(true);
      if (diff > 0) {
        setActiveImageIndex((prev) => (prev + 1) % allImages.length);
      } else {
        setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
      }
    }
    startX.current = null;
  };

  useEffect(() => {
    if (allImages.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % allImages.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [allImages.length, isPaused]);

  const handleVariantSelect = (variant: ProductVariant) => {
    setIsPaused(true);
    setSelectedVariant(variant);
    if (variant.image?.url) {
      const matchedIdx = allImages.findIndex((img) => img.url === variant.image?.url);
      if (matchedIdx !== -1) {
        setActiveImageIndex(matchedIdx);
      }
    }
  };

  const shortSummary = product?.description
    ? product.description.slice(0, 140) + '...'
    : 'Premium build quality designed for daily reliability and seamless compatibility.';

  const currentPrice = selectedVariant?.price?.amount || variants[0]?.price?.amount || '19.99';
  const currencyCode = selectedVariant?.price?.currencyCode || variants[0]?.price?.currencyCode || 'USD';
  const currentImage = allImages[activeImageIndex]?.url || product?.featuredImage?.url || '';

  const activeVariant = selectedVariant?.id ? selectedVariant : variants[0];
  const activeVariantId = activeVariant?.id || product.id;
  const isInCart = cart.some((item) => item.id === activeVariantId);

  const handleAddToCart = () => {
    if (isInCart) {
      removeFromCart(activeVariantId);
      return;
    }

    const variantLabel =
      activeVariant?.title && activeVariant.title !== 'Default Title'
        ? `${product.title} (${activeVariant.title})`
        : product.title;

    addToCart(
      {
        id: activeVariantId,
        variantId: activeVariant?.id,
        name: formatUsStandardTitle(variantLabel),
        price: parseFloat(currentPrice) || 0,
        image: activeVariant?.image?.url || currentImage,
      },
      { showPopup: false }
    );
  };

  const handleBuyNow = async () => {
    const variantId = activeVariant?.id;

    if (!variantId) {
      setCheckoutError('Please select a valid option first.');
      return;
    }

    setIsBuying(true);
    setCheckoutError(null);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ id: variantId, variantId, quantity: 1 }],
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.checkoutUrl) {
        setCheckoutError(data?.error || 'Unable to start checkout.');
        setIsBuying(false);
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch {
      setCheckoutError('Network error starting checkout. Please try again.');
      setIsBuying(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#faf9f7',
        minHeight: '100vh',
        padding: '16px 16px 110px',
        color: '#171717',
        width: '100%',
        overflowX: 'clip',
      }}
    >
      <style>{`
        .pk-pd-grid {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 40px;
          align-items: start;
        }
        .pk-pd-col {
          min-width: 0;
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        .pk-pd-stage {
          position: relative;
          width: 100%;
          height: 440px;
          background-color: #ffffff;
          border-radius: 18px;
          border: 1px solid #eceae6;
          overflow: hidden;
          cursor: zoom-in;
          user-select: none;
          touch-action: pan-y;
        }
        .pk-pd-main-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          padding: 16px;
          pointer-events: none;
        }
        .pk-pd-title {
          font-size: 28px;
          font-weight: 800;
          color: #141414;
          margin: 0;
          line-height: 1.25;
          word-break: break-word;
        }
        .pk-mobile-sticky-bar {
          display: none;
        }
        @media (max-width: 768px) {
          .pk-pd-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 18px;
          }
          .pk-pd-stage {
            height: 290px;
            border-radius: 14px;
          }
          .pk-pd-title {
            font-size: 21px;
          }
          .pk-mobile-sticky-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 90;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(10px);
            border-top: 1px solid #e5e3de;
            padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
          }
          /* Lift floating AI chat button above sticky bottom bar on phones */
          button[aria-label*="chat" i],
          button[aria-label*="AI" i],
          .pk-chat-trigger {
            bottom: 82px !important;
          }
        }
      `}</style>

      <div className="pk-pd-grid">
        {/* LEFT: Image Gallery */}
        <div className="pk-pd-col" style={{ gap: '12px' }}>
          <div
            className="pk-pd-stage"
            onClick={() => setIsModalOpen(true)}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            {currentImage && (
              <img
                className="pk-pd-main-img"
                src={currentImage}
                alt={allImages[activeImageIndex]?.altText || product?.title || ''}
                draggable={false}
              />
            )}

            <span
              style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                backgroundColor: 'rgba(20, 20, 20, 0.75)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 500,
                padding: '4px 10px',
                borderRadius: '999px',
              }}
            >
              Swipe or Tap to Zoom 🔍
            </span>

            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPaused(true);
                    setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
                  }}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e3de',
                    color: '#141414',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPaused(true);
                    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
                  }}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e3de',
                    color: '#141414',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', width: '100%' }}>
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIsPaused(true);
                    setActiveImageIndex(idx);
                  }}
                  style={{
                    width: '62px',
                    height: '62px',
                    borderRadius: '10px',
                    border: activeImageIndex === idx ? '2px solid #f26b21' : '1px solid #e5e3de',
                    backgroundColor: '#ffffff',
                    padding: '4px',
                    flexShrink: 0,
                    cursor: 'pointer',
                    opacity: activeImageIndex === idx ? 1 : 0.72,
                  }}
                >
                  <img
                    src={img.url}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Buy Box */}
        <div className="pk-pd-col">
          <h1 className="pk-pd-title">{formatUsStandardTitle(product?.title)}</h1>

          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#141414' }}>
              {currencyCode === 'USD' ? '$' : `${currencyCode} `}
              {currentPrice}
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#16a34a',
                backgroundColor: '#dcfce7',
                padding: '3px 10px',
                borderRadius: '999px',
              }}
            >
              In Stock • Fast US Shipping
            </span>
          </div>

          <div
            style={{
              margin: '14px 0',
              padding: '12px 14px',
              backgroundColor: '#f5f3ef',
              borderRadius: '12px',
              border: '1px solid #eceae6',
              color: '#444444',
              fontSize: '14px',
              lineHeight: 1.5,
              wordBreak: 'break-word',
            }}
          >
            <strong style={{ color: '#141414' }}>Overview:</strong> {shortSummary}
          </div>

          {/* Variant Selector */}
          {variants.length > 1 && (
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#444444', marginBottom: '8px' }}>
                Select Option: <span style={{ color: '#f26b21' }}>{selectedVariant.title}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {variants.map((variant) => {
                  const isSelected = selectedVariant.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => handleVariantSelect(variant)}
                      style={{
                        padding: '9px 15px',
                        fontSize: '13px',
                        fontWeight: 600,
                        borderRadius: '999px',
                        border: isSelected ? '1.5px solid #f26b21' : '1px solid #e5e3de',
                        backgroundColor: isSelected ? '#f26b21' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#171717',
                        cursor: 'pointer',
                      }}
                    >
                      {variant.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Purchase Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px', width: '100%' }}>
            <button
              type="button"
              onClick={handleAddToCart}
              style={{
                width: '100%',
                minHeight: '50px',
                padding: '14px 24px',
                borderRadius: '999px',
                fontSize: '15px',
                fontWeight: 700,
                backgroundColor: isInCart ? '#16a34a' : '#141414',
                color: '#ffffff',
                border: isInCart ? '1.5px solid #16a34a' : '1.5px solid #141414',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isInCart ? '✓ Added to Cart' : 'Add to Cart'}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isBuying}
              style={{
                width: '100%',
                minHeight: '50px',
                padding: '14px 24px',
                borderRadius: '999px',
                fontSize: '15px',
                fontWeight: 700,
                backgroundColor: isBuying ? '#d95b17' : '#f26b21',
                color: '#ffffff',
                border: '1.5px solid #f26b21',
                cursor: isBuying ? 'wait' : 'pointer',
                boxShadow: '0 4px 14px rgba(242, 107, 33, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isBuying ? 'Starting Checkout...' : 'Buy Now'}
            </button>
          </div>

          {checkoutError && (
            <div
              style={{
                marginTop: '12px',
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: '#fef2f2',
                color: '#b91c1c',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              {checkoutError}
            </div>
          )}

          <a
            href="#full-details"
            style={{
              marginTop: '18px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#f26b21',
              textDecoration: 'none',
            }}
          >
            See full product details & specifications ↓
          </a>
        </div>
      </div>

      {/* LOWER SECTION: Full Details */}
      <div
        id="full-details"
        style={{
          maxWidth: '1200px',
          margin: '36px auto 0',
          paddingTop: '28px',
          borderTop: '1px solid #eceae6',
        }}
      >
        {(() => {
          const parsed = parseWebSpecifications(product?.descriptionHtml, product?.description);
          const brandName = product?.vendor && product.vendor !== "Unbranded" ? product.vendor : "PICKIT";
          const specRows = [
            { label: "Brand", value: brandName },
            { label: "Department", value: product?.productType || "Essentials" },
            ...(activeVariant?.title && activeVariant.title !== "Default Title"
              ? [{ label: "Selected Option", value: activeVariant.title }]
              : []),
            {
              label: "Availability",
              value: activeVariant?.availableForSale === false ? "Out of Stock" : "In Stock — Fast US Shipping",
            },
            { label: "Buyer Protection", value: "7-Day Hassle-Free Returns" },
            ...parsed.specPairs,
          ];

          return (
            <>
              {parsed.highlights.length > 0 && (
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #eceae6",
                    borderRadius: "16px",
                    padding: "20px",
                    marginBottom: "20px",
                  }}
                >
                  <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#141414", margin: "0 0 12px" }}>
                    Key Highlights
                  </h2>
                  <ul style={{ margin: 0, paddingLeft: "20px", color: "#374151", lineHeight: 1.7, fontSize: "14.5px" }}>
                    {parsed.highlights.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: "6px" }}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #eceae6",
                  borderRadius: "16px",
                  padding: "20px",
                  marginBottom: "24px",
                }}
              >
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#141414", margin: "0 0 14px" }}>
                  Product Specifications
                </h2>
                <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}>
                  {specRows.map((row, idx) => (
                    <div
                      key={`${row.label}_${idx}`}
                      style={{
                        display: "flex",
                        padding: "11px 14px",
                        backgroundColor: idx % 2 === 0 ? "#faf9f7" : "#ffffff",
                        borderBottom: idx === specRows.length - 1 ? "none" : "1px solid #e5e7eb",
                        fontSize: "14px",
                      }}
                    >
                      <span style={{ width: "36%", fontWeight: 700, color: "#4b5563", paddingRight: "12px" }}>
                        {row.label}
                      </span>
                      <span style={{ flex: 1, fontWeight: 600, color: "#111827" }}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          );
        })()}

        <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#141414', marginBottom: '14px' }}>
          Full Product Details
        </h2>

        <div
          style={{
            position: 'relative',
            maxHeight: isExpanded ? 'none' : '180px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{ color: '#444444', lineHeight: 1.65 }}
            dangerouslySetInnerHTML={{ __html: product?.descriptionHtml || '' }}
          />
          {!isExpanded && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '80px',
                background: 'linear-gradient(to top, #faf9f7, transparent)',
              }}
            />
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            marginTop: '14px',
            padding: '9px 20px',
            borderRadius: '999px',
            border: '1px solid #e5e3de',
            backgroundColor: '#ffffff',
            color: '#171717',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {isExpanded ? 'Show Less ▴' : 'See More Details ▾'}
        </button>
      </div>

      {/* STICKY MOBILE THUMB BAR */}
      <div className="pk-mobile-sticky-bar">
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>Price</div>
          <div style={{ fontSize: '17px', fontWeight: 800, color: '#141414' }}>
            {currencyCode === 'USD' ? '$' : `${currencyCode} `}
            {currentPrice}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleAddToCart}
            style={{
              padding: '11px 14px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 700,
              backgroundColor: isInCart ? '#16a34a' : '#141414',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {isInCart ? '✓ Added' : '+ Cart'}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isBuying}
            style={{
              padding: '11px 18px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 700,
              backgroundColor: '#f26b21',
              color: '#ffffff',
              border: 'none',
              cursor: isBuying ? 'wait' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {isBuying ? 'Loading...' : 'Buy Now'}
          </button>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(20, 20, 20, 0.94)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            userSelect: 'none',
            touchAction: 'pan-y',
          }}
        >
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>

          {allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
                }}
                style={{
                  position: 'absolute',
                  left: '16px',
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                }}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev + 1) % allImages.length);
                }}
                style={{
                  position: 'absolute',
                  right: '16px',
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                }}
              >
                ›
              </button>
            </>
          )}

          <img
            src={currentImage}
            alt="Zoomed product view"
            draggable={false}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '92vw',
              maxHeight: '82vh',
              objectFit: 'contain',
              borderRadius: '12px',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: '#f26b21',
              padding: '6px 16px',
              borderRadius: '999px',
            }}
          >
            {activeImageIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </div>
  );
}