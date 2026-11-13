"use client";

import "./home.css";
import { useCart } from "./context/CartContext";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const HERO_SLIDES = [
  {
    tag: "NEW DROP",
    title: "Everyday Streetwear.",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1400&q=85",
  },
  {
    tag: "TRENDING IN USA",
    title: "Smart Tech & Gear.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1400&q=85",
  },
  {
    tag: "BESTSELLER",
    title: "Clean Daily Staples.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1400&q=85",
  },
  {
    tag: "ACTIVE STYLE",
    title: "Built For Movement.",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1400&q=85",
  },
  {
    tag: "STUDIO EDIT",
    title: "Minimalist Essentials.",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1400&q=85",
  },
  {
    tag: "USA FAVORITE",
    title: "Next-Gen Upgrades.",
    image: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=1400&q=85",
  },
];

type Product = {
  id: string;
  handle: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  variantId: string | null;
  rating: number;
  brand: string;
  inStock: boolean;
  discount: number;
  category: string;
  image: string;
  imageAlt: string;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("0");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [availability, setAvailability] = useState("all");
  const [minDiscount, setMinDiscount] = useState("0");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [heroIdx, setHeroIdx] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const { addToCart, cartCount } = useCart();

  useEffect(() => {
    const id = setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  async function loadProducts(cursor?: string) {
    const isFirstPage = !cursor;
    try {
      if (isFirstPage) {
        setLoading(true);
        setError("");
      } else {
        setLoadingMore(true);
        setLoadMoreError("");
      }
      const url = cursor ? `/api/shopify-test?cursor=${encodeURIComponent(cursor)}` : "/api/shopify-test";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Could not load Shopify products.");
      const data = await response.json();
      if (!Array.isArray(data.products)) throw new Error("Invalid product data received.");
      setProducts((current) => (isFirstPage ? data.products : [...current, ...data.products]));
      setHasNextPage(Boolean(data.hasNextPage));
      setNextCursor(data.nextCursor ?? null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong while loading products.";
      if (isFirstPage) setError(message);
      else setLoadMoreError(message);
    } finally {
      if (isFirstPage) setLoading(false);
      else setLoadingMore(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const availableCategories = useMemo(
    () => ["All", ...new Set(products.map((p) => p.category).filter((item) => item && item !== "All"))],
    [products]
  );

  const availableBrands = useMemo(
    () => [...new Set(products.map((p) => p.brand).filter(Boolean))],
    [products]
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (minPrice !== "") count++;
    if (maxPrice !== "") count++;
    if (minRating !== "0") count++;
    if (selectedBrand !== "All") count++;
    if (availability !== "all") count++;
    if (minDiscount !== "0") count++;
    return count;
  }, [minPrice, maxPrice, minRating, selectedBrand, availability, minDiscount]);

  const invalidPriceRange = minPrice !== "" && maxPrice !== "" && Number(minPrice) > Number(maxPrice);

  const filtered = useMemo(() => {
    const result = products.filter((product) => {
      const searchTerm = search.toLowerCase().trim();
      const matchesSearch =
        !searchTerm ||
        [product.name, product.brand, product.description, product.category].join(" ").toLowerCase().includes(searchTerm);
      const matchesCategory = category === "All" || product.category === category;
      const matchesMinPrice = minPrice === "" || product.price >= Number(minPrice);
      const matchesMaxPrice = maxPrice === "" || product.price <= Number(maxPrice);
      const matchesRating = product.rating >= Number(minRating);
      const matchesDiscount = product.discount >= Number(minDiscount);
      const matchesBrand = selectedBrand === "All" || product.brand === selectedBrand;
      const matchesAvailability =
        availability === "all" ||
        (availability === "in-stock" && product.inStock) ||
        (availability === "out-of-stock" && !product.inStock);
      return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesRating && matchesDiscount && matchesBrand && matchesAvailability;
    });

    if (sort === "low-high") result.sort((a, b) => a.price - b.price);
    else if (sort === "high-low") result.sort((a, b) => b.price - a.price);
    else if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [products, search, category, sort, minPrice, maxPrice, minRating, minDiscount, selectedBrand, availability]);

  function clearFilters() {
    setSearch("");
    setCategory("All");
    setSort("featured");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("0");
    setSelectedBrand("All");
    setAvailability("all");
    setMinDiscount("0");
  }

  function handleQuickAdd(product: Product) {
    if (!product.inStock) return;
    addToCart({
      id: product.id,
      variantId: product.variantId ?? undefined,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId((prev) => (prev === product.id ? null : prev)), 1400);
  }

  return (
    <div className="pk-shell">
      <div className="pk-announcement">
        <span>FREE TRACKED SHIPPING ON ORDERS $35+</span>
        <span className="pk-dot">•</span>
        <span>30-DAY EASY RETURNS</span>
      </div>

      <header className="pk-header">
        <div className="pk-header-inner">
          <Link className="pk-logo" href="/">PICK<span>IT.</span></Link>

          <div className="pk-search-wrap">
            <svg className="pk-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              className="pk-search"
              placeholder="Search gadgets, essentials, fashion..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" className="pk-search-clear" onClick={() => setSearch("")} aria-label="Clear search">✕</button>
            )}
          </div>

          <div className="pk-actions">
            <Link className="pk-icon-btn" href="/account" aria-label="Account">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="pk-btn-label">Account</span>
            </Link>

            <Link className="pk-icon-btn pk-cart-btn" href="/cart" aria-label="Cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="pk-btn-label">Cart</span>
              <span className="pk-badge">{cartCount}</span>
            </Link>
          </div>
        </div>

        <nav className="pk-cat-bar" aria-label="Product categories">
          <div className="pk-cat-inner">
            {availableCategories.map((item) => (
              <button
                key={item}
                type="button"
                className={`pk-cat-pill ${category === item ? "active" : ""}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main>
        <section className="pk-hero-wrap">
          <div
            className="pk-carousel"
            onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchStartX === null) return;
              const diff = touchStartX - e.changedTouches[0].clientX;
              if (Math.abs(diff) > 40) {
                setHeroIdx((prev) =>
                  diff > 0
                    ? (prev + 1) % HERO_SLIDES.length
                    : (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
                );
              }
              setTouchStartX(null);
            }}
          >
            <div
              className="pk-carousel-track"
              style={{ transform: `translateX(-${heroIdx * 100}%)` }}
            >
              {HERO_SLIDES.map((slide, i) => (
                <div className="pk-slide" key={i}>
                  <img src={slide.image} alt={slide.title} />
                  <div className="pk-slide-overlay" />
                  <div className="pk-slide-content">
                    <span className="pk-slide-tag">{slide.tag}</span>
                    <h2>{slide.title}</h2>
                    <button
                      type="button"
                      className="pk-slide-cta"
                      onClick={() =>
                        document
                          .getElementById("products")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                    >
                      Shop Now →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="pk-arrow pk-prev"
              aria-label="Previous slide"
              onClick={() =>
                setHeroIdx((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
              }
            >
              ‹
            </button>
            <button
              type="button"
              className="pk-arrow pk-next"
              aria-label="Next slide"
              onClick={() => setHeroIdx((prev) => (prev + 1) % HERO_SLIDES.length)}
            >
              ›
            </button>

            <div className="pk-dots">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Slide ${i + 1}`}
                  className={`pk-dot-btn ${i === heroIdx ? "active" : ""}`}
                  onClick={() => setHeroIdx(i)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="pk-trust">
          <div className="pk-trust-grid">
            <div className="pk-trust-item">
              <span className="pk-trust-icon">🚚</span>
              <div><strong>Tracked Shipping</strong><p>6–12 business days US delivery</p></div>
            </div>
            <div className="pk-trust-item">
              <span className="pk-trust-icon">↩️</span>
              <div><strong>30-Day Returns</strong><p>Easy refunds &amp; replacements</p></div>
            </div>
            <div className="pk-trust-item">
              <span className="pk-trust-icon">🔒</span>
              <div><strong>Secure Checkout</strong><p>256-bit SSL encrypted payments</p></div>
            </div>
            <div className="pk-trust-item">
              <span className="pk-trust-icon">✨</span>
              <div><strong>AI Shopping Help</strong><p>Instant answers 24/7 via AI orb</p></div>
            </div>
          </div>
        </section>

        <section className="pk-catalog" id="products">
          <div className="pk-catalog-head">
            <div>
              <span className="pk-eyebrow">THE PICKIT COLLECTION</span>
              <h2>Explore Products<span>.</span></h2>
            </div>

            <div className="pk-toolbar">
              <button
                type="button"
                className={`pk-filter-toggle ${filtersOpen || activeFilterCount > 0 ? "active" : ""}`}
                onClick={() => setFiltersOpen((prev) => !prev)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="7" y1="12" x2="17" y2="12" />
                  <line x1="10" y1="18" x2="14" y2="18" />
                </svg>
                <span>Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}</span>
              </button>

              <select aria-label="Sort products" className="pk-sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="featured">Sort: Featured</option>
                <option value="low-high">Price: Low → High</option>
                <option value="high-low">Price: High → Low</option>
                <option value="name">Name: A → Z</option>
              </select>
            </div>
          </div>

          {filtersOpen && (
            <div className="pk-filter-drawer">
              <div className="pk-filter-grid">
                <div className="pk-field">
                  <label>Price Range ($)</label>
                  <div className="pk-price-pair">
                    <input type="number" placeholder="Min" min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                    <span>–</span>
                    <input type="number" placeholder="Max" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                  </div>
                </div>

                <div className="pk-field">
                  <label htmlFor="pk-availability">Availability</label>
                  <select id="pk-availability" value={availability} onChange={(e) => setAvailability(e.target.value)}>
                    <option value="all">All items</option>
                    <option value="in-stock">In stock only</option>
                    <option value="out-of-stock">Out of stock</option>
                  </select>
                </div>

                <div className="pk-field">
                  <label htmlFor="pk-brand">Brand</label>
                  <select id="pk-brand" value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
                    <option value="All">All Brands</option>
                    {availableBrands.map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div className="pk-field">
                  <label htmlFor="pk-rating">Minimum Rating</label>
                  <select id="pk-rating" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
                    <option value="0">All ratings</option>
                    <option value="4">4★ &amp; up</option>
                    <option value="3">3★ &amp; up</option>
                  </select>
                </div>

                <div className="pk-field">
                  <label htmlFor="pk-discount">Discount</label>
                  <select id="pk-discount" value={minDiscount} onChange={(e) => setMinDiscount(e.target.value)}>
                    <option value="0">Any discount</option>
                    <option value="10">10% off or more</option>
                    <option value="20">20% off or more</option>
                    <option value="30">30% off or more</option>
                  </select>
                </div>
              </div>

              {invalidPriceRange && <p className="pk-error">Minimum price cannot exceed maximum price.</p>}

              <div className="pk-filter-footer">
                <button type="button" className="pk-reset-btn" onClick={clearFilters}>Reset All</button>
                <button type="button" className="pk-apply-btn" onClick={() => setFiltersOpen(false)}>Show {filtered.length} Results</button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="pk-grid">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="pk-skeleton-card">
                  <div className="pk-skeleton-img" />
                  <div className="pk-skeleton-line short" />
                  <div className="pk-skeleton-line" />
                  <div className="pk-skeleton-line price" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="pk-empty-box">
              <p className="pk-error">{error}</p>
              <button type="button" className="pk-btn-primary" onClick={() => loadProducts()}>Try Again</button>
            </div>
          ) : (
            <>
              <div className="pk-count-row">
                <span>Showing <strong>{filtered.length}</strong> {filtered.length === 1 ? "product" : "products"}</span>
                {(search || category !== "All" || activeFilterCount > 0) && (
                  <button type="button" className="pk-inline-clear" onClick={clearFilters}>Clear filters</button>
                )}
              </div>

              <div className="pk-grid">
                {filtered.map((product) => {
                  const isAdded = addedId === product.id;
                  return (
                    <article className="pk-card" key={product.id}>
                      <Link href={`/product/${product.handle}`} className="pk-card-media">
                        {product.discount > 0 && <span className="pk-tag-sale">-{product.discount}%</span>}
                        {!product.inStock && <span className="pk-tag-soldout">Sold Out</span>}
                        {product.image ? (
                          <img src={product.image} alt={product.imageAlt || product.name} loading="lazy" />
                        ) : (
                          <span className="pk-no-img">No image</span>
                        )}
                      </Link>

                      <div className="pk-card-body">
                        <span className="pk-card-cat">{product.category || "Featured"}</span>

                        <Link href={`/product/${product.handle}`} className="pk-card-title">
                          <h3>{product.name}</h3>
                        </Link>

                        <div className="pk-card-meta">
                          <span className="pk-card-price">
                            {new Intl.NumberFormat("en-US", { style: "currency", currency: product.currency || "USD" }).format(product.price)}
                          </span>
                          <span className={product.inStock ? "pk-stock-pill" : "pk-out-pill"}>
                            {product.inStock ? "In Stock" : "Out"}
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={!product.inStock}
                          onClick={() => handleQuickAdd(product)}
                          className={`pk-quick-add ${isAdded ? "added" : ""}`}
                        >
                          {!product.inStock ? "Unavailable" : isAdded ? "✓ Added to Cart" : "+ Add to Cart"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {filtered.length === 0 && (
                <div className="pk-empty-box">
                  <p>No products matched your filters.</p>
                  <button type="button" className="pk-btn-primary" onClick={clearFilters}>Reset Filters</button>
                </div>
              )}

              {hasNextPage && (
                <div className="pk-load-more">
                  <button
                    type="button"
                    className="pk-btn-primary"
                    onClick={() => { if (nextCursor && !loadingMore) loadProducts(nextCursor); }}
                    disabled={loadingMore}
                  >
                    {loadingMore ? "Loading..." : "Load More Products"}
                  </button>
                  {loadMoreError && <p className="pk-error">{loadMoreError}</p>}
                </div>
              )}
            </>
          )}
        </section>

        
      </main>

      <footer className="pk-footer">
        <div className="pk-footer-inner">
          <div className="pk-footer-brand">
            <Link className="pk-logo pk-footer-logo" href="/">PICK<span>IT.</span></Link>
            <p>Discover more. Choose better. Curated gadgets, useful tech, and everyday essentials delivered with tracked shipping.</p>
            <a href="mailto:pickitofficial00@gmail.com" className="pk-footer-mail">pickitofficial00@gmail.com</a>
          </div>

          <div className="pk-footer-col">
            <h4>Shop</h4>
            <Link href="/#products">All Products</Link>
            <Link href="/cart">Your Cart ({cartCount})</Link>
            <Link href="/account">Account</Link>
            <Link href="/account/orders">Track Your Order</Link>
          </div>

          <div className="pk-footer-col">
            <h4>Policies &amp; Help</h4>
            <Link href="/policies/shipping">Shipping Policy</Link>
            <Link href="/policies/refund">Refund &amp; Return Policy</Link>
            <Link href="/policies/privacy">Privacy Policy</Link>
            <Link href="/policies/terms">Terms of Service</Link>
            <Link href="/contact">Contact Us</Link>
          </div>
        </div>

        <div className="pk-footer-bottom">
          <small>© 2026 PICKIT. All rights reserved.</small>
        </div>
      </footer>
    </div>
  );
}
