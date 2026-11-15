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
  availableForSale: boolean;
  featuredImage?: ProductImage | null;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

interface ProductDetailsProps {
  product: Product;
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

  // Include featuredImage, gallery images, AND all variant images
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

  // Persistent cart check: keeps button green while item is in cart, toggles back on second click
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
        name: variantLabel,
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
    <div style={{ backgroundColor: '#faf9f7', minHeight: '100vh', padding: '32px 16px', color: '#171717' }}>
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          alignItems: 'start',
        }}
      >
        {/* LEFT: Image Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            onClick={() => setIsModalOpen(true)}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            style={{
              position: 'relative',
              width: '100%',
              height: '440px',
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #eceae6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              cursor: 'zoom-in',
              userSelect: 'none',
              touchAction: 'pan-y',
            }}
          >
            {currentImage && (
              <img
                src={currentImage}
                alt={allImages[activeImageIndex]?.altText || product?.title || ''}
                draggable={false}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  padding: '16px',
                  pointerEvents: 'none',
                }}
              />
            )}

            <span
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                backgroundColor: 'rgba(20, 20, 20, 0.75)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 500,
                padding: '5px 11px',
                borderRadius: '999px',
              }}
            >
              Swipe or Click to Zoom 🔍
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
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e3de',
                    color: '#141414',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    fontSize: '20px',
                    fontWeight: 'bold',
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
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e3de',
                    color: '#141414',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    fontSize: '20px',
                    fontWeight: 'bold',
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIsPaused(true);
                    setActiveImageIndex(idx);
                  }}
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '12px',
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
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#141414', margin: 0, lineHeight: 1.25 }}>
            {product?.title}
          </h1>

          <div style={{ fontSize: '26px', fontWeight: 800, color: '#141414', marginTop: '12px' }}>
            {currencyCode === 'USD' ? '$' : `${currencyCode} `}
            {currentPrice}
          </div>

          <div
            style={{
              margin: '16px 0',
              padding: '14px 16px',
              backgroundColor: '#f5f3ef',
              borderRadius: '12px',
              border: '1px solid #eceae6',
              color: '#444444',
              fontSize: '14px',
              lineHeight: 1.55,
            }}
          >
            <strong style={{ color: '#141414' }}>Overview:</strong> {shortSummary}
          </div>

          {/* Variant Selector */}
          {variants.length > 1 && (
            <div style={{ marginBottom: '22px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#444444', marginBottom: '10px' }}>
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
                        padding: '9px 16px',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={handleAddToCart}
              style={{
                width: '100%',
                padding: '15px 24px',
                borderRadius: '999px',
                fontSize: '15px',
                fontWeight: 700,
                backgroundColor: isInCart ? '#16a34a' : '#141414',
                color: '#ffffff',
                border: isInCart ? '1.5px solid #16a34a' : '1.5px solid #141414',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
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
                padding: '15px 24px',
                borderRadius: '999px',
                fontSize: '15px',
                fontWeight: 700,
                backgroundColor: isBuying ? '#d95b17' : '#f26b21',
                color: '#ffffff',
                border: '1.5px solid #f26b21',
                cursor: isBuying ? 'wait' : 'pointer',
                boxShadow: '0 4px 14px rgba(242, 107, 33, 0.25)',
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
              marginTop: '20px',
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
          margin: '48px auto 0',
          paddingTop: '32px',
          borderTop: '1px solid #eceae6',
        }}
      >
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#141414', marginBottom: '16px' }}>
          Product Specifications & Details
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
            marginTop: '16px',
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
                  left: '20px',
                  width: '44px',
                  height: '44px',
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
                  right: '20px',
                  width: '44px',
                  height: '44px',
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
              maxWidth: '90vw',
              maxHeight: '84vh',
              objectFit: 'contain',
              borderRadius: '12px',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: '20px',
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