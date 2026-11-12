
"use client";

import { useCart } from "./context/CartContext";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

const categories = ["All"];

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

  const { cartCount } = useCart();

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

      const url = cursor
        ? `/api/shopify-test?cursor=${encodeURIComponent(cursor)}`
        : "/api/shopify-test";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Could not load Shopify products.");
      }

      const data = await response.json();

      if (!Array.isArray(data.products)) {
        throw new Error("Invalid product data received.");
      }

      setProducts((current) =>
        isFirstPage ? data.products : [...current, ...data.products]
      );

      setHasNextPage(Boolean(data.hasNextPage));
      setNextCursor(data.nextCursor ?? null);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while loading products.";

      if (isFirstPage) {
        setError(message);
      } else {
        setLoadMoreError(message);
      }
    } finally {
      if (isFirstPage) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const availableCategories = useMemo(
    () => [
      ...categories,
      ...new Set(
        products
          .map((product) => product.category)
          .filter((item) => item && item !== "All")
      ),
    ],
    [products]
  );

  const availableBrands = useMemo(
    () => [...new Set(products.map((product) => product.brand).filter(Boolean))],
    [products]
  );

  const invalidPriceRange =
    minPrice !== "" &&
    maxPrice !== "" &&
    Number(minPrice) > Number(maxPrice);

  const filtered = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || product.category === category;

      const matchesMinPrice =
        minPrice === "" || product.price >= Number(minPrice);

      const matchesMaxPrice =
        maxPrice === "" || product.price <= Number(maxPrice);

      const matchesRating = product.rating >= Number(minRating);
      const matchesDiscount = product.discount >= Number(minDiscount);

      const matchesBrand =
        selectedBrand === "All" || product.brand === selectedBrand;

      const matchesAvailability =
        availability === "all" ||
        (availability === "in-stock" && product.inStock) ||
        (availability === "out-of-stock" && !product.inStock);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesRating &&
        matchesDiscount &&
        matchesBrand &&
        matchesAvailability
      );
    });

    if (sort === "low-high") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "high-low") {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [
    products,
    search,
    category,
    sort,
    minPrice,
    maxPrice,
    minRating,
    minDiscount,
    selectedBrand,
    availability,
  ]);

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

  return (
    <main>
      <div className="announcement">
        DISCOVER MORE. CHOOSE BETTER. SHOP PICKIT.
      </div>

      <header className="header">
        <a className="logo" href="/">
          PICK<span>IT.</span>
        </a>

        <input
          className="search"
          placeholder="Search products..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <Link className="cart" href="/cart">
          🛒 Cart ({cartCount})
        </Link>

        <Link className="cart" href="/account">
          👤 Account
        </Link>
      </header>

      <nav className="nav">
        {availableCategories.map((item) => (
          <button
            key={item}
            className={category === item ? "selected" : ""}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </nav>

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">WELCOME TO PICKIT</p>

          <h1>
            Find it.
            <br />
            Love it.
            <br />
            <span>PICKIT.</span>
          </h1>

          <p className="hero-description">
            Discover trending gadgets, useful products and
            everyday essentials. Find something worth picking.
          </p>

          <button
            className="explore"
            onClick={() =>
              document
                .getElementById("products")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            EXPLORE PRODUCTS →
          </button>
        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000"
            alt="Modern shopping collection"
          />
        </div>
      </section>

      <section className="benefits">
        <span>✦ Discover interesting products</span>
        <span>✦ Explore everyday essentials</span>
        <span>✦ Find your next favourite</span>
      </section>

      <section className="products" id="products">
        <p className="eyebrow">THE PICKIT COLLECTION</p>

        <h2>
          Explore products<span>.</span>
        </h2>

        <p className="subtitle">
          Discover something worth picking.
        </p>

        <div className="filters">
          {availableCategories.map((item) => (
            <button
              key={item}
              className={category === item ? "selected" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <button className="clear-filters" onClick={clearFilters}>
          Clear All Filters
        </button>

        <div className="price-filter">
          <label>Price range:</label>

          <input
            type="number"
            placeholder="Min $"
            min="0"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
          />

          <input
            type="number"
            placeholder="Max $"
            min="0"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          />
        </div>

        <div className="rating-filter">
          <label htmlFor="min-rating">Customer rating:</label>

          <select
            id="min-rating"
            value={minRating}
            onChange={(event) => setMinRating(event.target.value)}
          >
            <option value="0">All ratings</option>
            <option value="4">4 stars &amp; above</option>
            <option value="3">3 stars &amp; above</option>
            <option value="2">2 stars &amp; above</option>
          </select>
        </div>

        <div className="brand-filter">
          <label htmlFor="brand-select">Brand:</label>

          <select
            id="brand-select"
            value={selectedBrand}
            onChange={(event) => setSelectedBrand(event.target.value)}
          >
            <option value="All">All Brands</option>

            {availableBrands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        <div className="availability-filter">
          <label htmlFor="availability">Availability:</label>

          <select
            id="availability"
            value={availability}
            onChange={(event) => setAvailability(event.target.value)}
          >
            <option value="all">All products</option>
            <option value="in-stock">In stock</option>
            <option value="out-of-stock">Out of stock</option>
          </select>
        </div>

        <div className="discount-filter">
          <label>Discount</label>

          <select
            value={minDiscount}
            onChange={(event) => setMinDiscount(event.target.value)}
          >
            <option value="0">All Discounts</option>
            <option value="10">10% or more</option>
            <option value="20">20% or more</option>
            <option value="30">30% or more</option>
          </select>
        </div>

        {invalidPriceRange && (
          <p className="price-error">
            Minimum price cannot be greater than maximum price.
          </p>
        )}

        <div className="sort-row">
          <label htmlFor="sort-products">Sort by:</label>

          <select
            id="sort-products"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>

        {loading ? (
          <p className="empty">Loading products from Shopify...</p>
        ) : error ? (
          <p className="price-error">{error}</p>
        ) : (
          <>
            <p className="product-count">
              Showing {filtered.length} products
            </p>

            <div className="grid">
              {filtered.map((product) => (
                <article className="product" key={product.id}>
                  <Link href={`/product/${product.handle}`}>
                    <div className="product-image">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.imageAlt || product.name}
                        />
                      ) : (
                        <span className="no-image">No image available</span>
                      )}
                    </div>
                  </Link>

                  <div className="product-info">
                    <small>{product.category}</small>

                    <Link href={`/product/${product.handle}`}>
                      <h3>{product.name}</h3>
                    </Link>

                    <p className="product-price">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: product.currency || "USD",
                      }).format(product.price)}
                    </p>

                    <p className={product.inStock ? "stock" : "out-stock"}>
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="empty">
                No products found. Try another search.
              </p>
            )}

            {hasNextPage && (
              <div className="load-more-container">
                <button
                  className="load-more"
                  onClick={() => {
                    if (nextCursor && !loadingMore) {
                      loadProducts(nextCursor);
                    }
                  }}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Load More Products"}
                </button>

                {loadMoreError && (
                  <p className="price-error">{loadMoreError}</p>
                )}
              </div>
            )}
          </>
        )}
      </section>

      <footer>
        <a className="logo footer-logo" href="/">
          PICK<span>IT.</span>
        </a>

        <p>Discover more. Choose better.</p>

        <small>© 2026 PICKIT. All rights reserved.</small>
      </footer>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          color: #171717;
          font-family: Arial, Helvetica, sans-serif;
        }

        button {
          cursor: pointer;
          font: inherit;
        }

        .announcement {
          background: #171717;
          color: white;
          text-align: center;
          padding: 11px;
          font-size: 11px;
          letter-spacing: 2px;
        }

        .header {
          max-width: 1250px;
          margin: auto;
          padding: 22px 25px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
        }

        .logo {
          font-size: 31px;
          font-weight: 900;
          letter-spacing: -2px;
          color: #171717;
          text-decoration: none;
        }

        .logo span,
        .hero h1 span,
        h2 span {
          color: #f26b21;
        }

        .search {
          background: #f4f4f4;
          border: 1px solid #eee;
          border-radius: 7px;
          padding: 15px;
          max-width: 500px;
          width: 100%;
          outline: none;
        }

        .search:focus {
          border-color: #f26b21;
        }

        .cart {
          background: white;
          border: 1px solid #ddd;
          padding: 12px 16px;
          border-radius: 6px;
          white-space: nowrap;
          text-decoration: none;
          color: #171717;
        }

        .nav {
          border-top: 1px solid #eee;
          border-bottom: 1px solid #eee;
          padding: 13px 25px;
          display: flex;
          justify-content: center;
          gap: 35px;
        }

        .nav button,
        .filters button {
          border: 0;
          background: transparent;
          padding: 8px 12px;
          color: #555;
        }

        .nav button.selected,
        .filters button.selected {
          color: #f26b21;
          font-weight: bold;
        }

        .hero {
          background: #f5f3ef;
          padding: 55px max(calc((100% - 1150px) / 2), 35px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
          min-height: 440px;
        }

        .hero-content {
          flex: 1;
        }

        .eyebrow {
          color: #f26b21;
          font-size: 11px;
          font-weight: bold;
          letter-spacing: 2px;
        }

        .hero h1 {
          font-size: clamp(48px, 7vw, 78px);
          line-height: 0.99;
          letter-spacing: -4px;
          margin: 20px 0;
        }

        .hero-description {
          max-width: 410px;
          line-height: 1.7;
          color: #666;
        }

        .explore {
          margin-top: 15px;
          background: #f26b21;
          color: white;
          border: 0;
          padding: 16px 23px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }

        .hero-image {
          width: 42%;
          height: 310px;
          border-radius: 10px;
          overflow: hidden;
          background: #ddd;
        }

        .hero-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .benefits {
          display: flex;
          justify-content: space-around;
          gap: 15px;
          padding: 25px;
          border-bottom: 1px solid #eee;
          color: #555;
          font-size: 13px;
        }

        .products {
          max-width: 1200px;
          margin: auto;
          padding: 65px 25px;
        }

        h2 {
          font-size: 37px;
          margin: 10px 0;
          letter-spacing: -1px;
        }

        .subtitle {
          color: #777;
          font-size: 14px;
        }

        .filters {
          display: flex;
          gap: 10px;
          margin: 25px 0;
          flex-wrap: wrap;
        }

        .filters button {
          border: 1px solid #eee;
          border-radius: 30px;
          padding: 10px 18px;
        }

        .filters button.selected {
          border-color: #f26b21;
        }

        .clear-filters {
          padding: 10px 16px;
          border: 1px solid #222;
          border-radius: 6px;
          background: white;
          color: #222;
          font-size: 14px;
          cursor: pointer;
          transition: 0.2s;
        }

        .clear-filters:hover {
          background: #222;
          color: white;
        }

        .price-filter,
        .rating-filter,
        .brand-filter,
        .availability-filter {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 15px 0;
        }

        .price-filter label,
        .rating-filter label,
        .brand-filter label,
        .availability-filter label,
        .discount-filter label,
        .sort-row label {
          font-size: 14px;
          color: #555;
        }

        .price-filter input,
        .rating-filter select,
        .brand-filter select,
        .availability-filter select,
        .discount-filter select,
        .sort-row select {
          padding: 10px 14px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
          color: #222;
        }

        .price-filter input {
          width: 110px;
        }

        .discount-filter {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-width: 220px;
        }

        .price-error {
          color: #d93025;
          font-size: 13px;
          margin: 8px 0;
        }

        .sort-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          margin: 20px 0;
        }

        .product-count {
          font-size: 14px;
          color: #666;
          margin: 15px 0;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }

        .product {
          border: 1px solid #eee;
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.2s;
        }

        .product:hover {
          transform: translateY(-4px);
        }

        .product-image {
          height: 210px;
          background: #f4f3f0;
          overflow: hidden;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .product:hover .product-image img {
          transform: scale(1.04);
        }

        .product-info {
          padding: 17px;
        }

        .product-info small {
          color: #888;
        }

        .product-info h3 {
          font-size: 15px;
          min-height: 36px;
          color: #171717;
        }

        .product-info a {
          text-decoration: none;
        }

        .product-price {
          font-weight: 700;
          margin: 10px 0;
        }

        .stock {
          color: #16803c;
          font-size: 13px;
        }

        .out-stock {
          color: #dc2626;
          font-size: 13px;
        }

        .no-image {
          display: grid;
          place-items: center;
          height: 100%;
          color: #777;
          font-size: 13px;
        }

        .empty {
          color: #777;
          padding: 30px 0;
        }

        .load-more-container {
          text-align: center;
          margin-top: 35px;
        }

        .load-more {
          background: #f26b21;
          color: white;
          border: 0;
          border-radius: 6px;
          padding: 15px 28px;
          font-weight: bold;
        }

        .load-more:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        footer {
          background: #171717;
          color: white;
          text-align: center;
          padding: 40px 20px;
        }

        footer .logo {
          color: white;
        }

        footer p {
          color: #bbb;
        }

        footer small {
          color: #888;
        }

        @media (max-width: 750px) {
          .header {
            flex-wrap: wrap;
            padding: 18px;
            gap: 13px;
          }

          .search {
            order: 3;
            max-width: none;
          }

          .nav {
            gap: 8px;
            flex-wrap: wrap;
          }

          .hero {
            padding: 40px 25px;
            flex-direction: column;
            align-items: stretch;
          }

          .hero-image {
            width: 100%;
            height: 220px;
          }

          .benefits {
            flex-direction: column;
            padding: 20px 30px;
          }

          .grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .product-image {
            height: 150px;
          }

          .products {
            padding: 45px 15px;
          }
        }

        @media (max-width: 390px) {
          .product-info {
            padding: 11px;
          }

          .price-filter {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </main>
  );
}
