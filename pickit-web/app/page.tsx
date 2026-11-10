"use client";

import { useCart } from "./context/CartContext";
import Link from "next/link";
import { useMemo, useState } from "react";
const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 29.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700",
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 39.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700",
  },
  {
    id: 3,
    name: "Everyday Backpack",
    price: 34.99,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700",
  },
  {
    id: 4,
    name: "Portable Speaker",
    price: 24.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=700",
  },
  {
    id: 5,
    name: "Stylish Sunglasses",
    price: 19.99,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=700",
  },
  {
    id: 6,
    name: "Modern Desk Lamp",
    price: 27.99,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=700",
  },
  {
    id: 7,
    name: "Travel Bottle",
    price: 14.99,
    category: "Home",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=700",
  },
  {
    id: 8,
    name: "Gaming Controller",
    price: 44.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=700",
  },
];

const categories = ["All", "Electronics", "Fashion", "Home"];

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const { cartCount } = useCart();
  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <main>
      <div className="announcement">
        DISCOVER MORE. CHOOSE BETTER. SHOP PICKIT.
      </div>

      <header className="header">
        <a className="logo" href="#">
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
      </header>

      <nav className="nav">
        {categories.map((item) => (
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
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? "selected" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid">
          {filtered.map((product) => (
   <article className="product" key={product.id}>
  <div className="product-image">
    <img src={product.image} alt={product.name} />
  </div>

  <div className="product-info">
    <small>{product.category}</small>
    <Link href={`/product/${product.id}`}>
      <h3>{product.name}</h3>
    </Link>
  </div>
</article>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="empty">No products found. Try another search.</p>
        )}
      </section>

      <footer>
        <a className="logo footer-logo" href="#">
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
        }

        .product-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .product-bottom strong {
          font-size: 16px;
        }

        .product-bottom button {
          background: #171717;
          color: white;
          border: 0;
          padding: 9px 13px;
          border-radius: 4px;
        }

        .empty {
          color: #777;
          padding: 30px 0;
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
        }
      `}</style>
    </main>
  );
}
