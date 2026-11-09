"use client";

import { useState } from "react";

const products = [
  { id: 1, name: "Wireless Headphones", price: 29.99, category: "Electronics", emoji: "🎧" },
  { id: 2, name: "Smart Watch", price: 39.99, category: "Electronics", emoji: "⌚" },
  { id: 3, name: "Everyday Backpack", price: 34.99, category: "Fashion", emoji: "🎒" },
  { id: 4, name: "Portable Speaker", price: 24.99, category: "Electronics", emoji: "🔊" },
  { id: 5, name: "Stylish Sunglasses", price: 19.99, category: "Fashion", emoji: "🕶️" },
  { id: 6, name: "Modern Desk Lamp", price: 27.99, category: "Home", emoji: "💡" },
  { id: 7, name: "Travel Bottle", price: 14.99, category: "Home", emoji: "🥤" },
  { id: 8, name: "Gaming Controller", price: 44.99, category: "Electronics", emoji: "🎮" },
];

const categories = ["All", "Electronics", "Fashion", "Home"];

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState(0);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (category === "All" || p.category === category)
  );

  return (
    <main>
      <div className="announcement">WELCOME TO PICKIT · DISCOVER SOMETHING NEW</div>

      <header className="header">
        <a className="logo" href="#">PICK<span>IT.</span></a>
        <input
          className="search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="cart" onClick={() => alert(`Demo cart: ${cart} items`)}>
          🛒 Cart ({cart})
        </button>
      </header>

      <nav className="nav">
        {categories.map((c) => (
          <button
            key={c}
            className={category === c ? "selected" : ""}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </nav>

      <section className="hero">
        <div>
          <p className="eyebrow">THE WORLD OF PICKIT</p>
          <h1>Find it.<br />Love it.<br /><span>PICKIT.</span></h1>
          <p className="hero-description">
            Discover trending finds, useful gadgets and everyday essentials.
            Your next favourite product is waiting.
          </p>
          <button className="explore" onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}>
            EXPLORE PRODUCTS →
          </button>
        </div>
        <div className="hero-art">
          <div className="big-p">P</div>
          <p>DISCOVER MORE</p>
        </div>
      </section>

      <section className="benefits">
        <span>✦ Interesting discoveries</span>
        <span>✦ Everyday essentials</span>
        <span>✦ Trending products</span>
      </section>

      <section className="products" id="products">
        <p className="eyebrow">THE PICKIT COLLECTION</p>
        <h2>Explore products<span>.</span></h2>
        <p className="subtitle">Discover something worth picking.</p>

        <div className="filters">
          {categories.map((c) => (
            <button
              key={c}
              className={category === c ? "selected" : ""}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid">
          {filtered.map((p) => (
            <article className="product" key={p.id}>
              <div className="product-art">{p.emoji}</div>
              <div className="product-info">
                <small>{p.category}</small>
                <h3>{p.name}</h3>
                <div className="product-bottom">
                  <strong>${p.price.toFixed(2)}</strong>
                  <button onClick={() => setCart(cart + 1)}>+ Add</button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {filtered.length === 0 && <p>No products found.</p>}
      </section>

      <footer>
        <a className="logo" href="#">PICK<span>IT.</span></a>
        <p>Discover more. Choose better.</p>
        <small>© 2026 PICKIT. All rights reserved.</small>
      </footer>

      <style jsx global>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; color: #171717; font-family: Arial, sans-serif; }
        button { cursor: pointer; font: inherit; }
        .announcement { background: #171717; color: white; text-align: center; padding: 11px; font-size: 11px; letter-spacing: 2px; }
        .header { max-width: 1250px; margin: auto; padding: 22px 25px; display: flex; align-items: center; justify-content: space-between; gap: 25px; }
        .logo { font-size: 31px; font-weight: 900; letter-spacing: -2px; color: #171717; text-decoration: none; }
        .logo span, .hero h1 span, h2 span { color: #f26b21; }
        .search { background: #f4f4f4; border: 0; border-radius: 7px; padding: 15px; max-width: 500px; width: 100%; outline: none; }
        .cart { background: white; border: 1px solid #ddd; padding: 12px 16px; border-radius: 6px; white-space: nowrap; }
        .nav { border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 13px 25px; display: flex; justify-content: center; gap: 35px; }
        .nav button, .filters button { border: 0; background: transparent; padding: 8px 12px; color: #555; }
        .nav button.selected, .filters button.selected { color: #f26b21; font-weight: bold; }
        .hero { background: #f5f3ef; padding: 65px max(calc((100% - 1150px)/2), 35px); display: flex; align-items: center; justify-content: space-between; gap: 35px; min-height: 440px; }
        .eyebrow { color: #f26b21; font-size: 11px; font-weight: bold; letter-spacing: 2px; }
        .hero h1 { font-size: clamp(48px, 7vw, 78px); line-height: .99; letter-spacing: -4px; margin: 20px 0; }
        .hero-description { max-width: 410px; line-height: 1.7; color: #666; }
        .explore { margin-top: 15px; background: #f26b21; color: white; border: 0; padding: 16px 23px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .hero-art { width: 280px; height: 280px; border-radius: 50%; background: #171717; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
        .big-p { color: #f26b21; font-size: 155px; font-weight: 900; line-height: 1; }
        .hero-art p { font-size: 10px; letter-spacing: 3px; }
        .benefits { display: flex; justify-content: space-around; gap: 15px; padding: 25px; border-bottom: 1px solid #eee; color: #555; font-size: 13px; }
        .products { max-width: 1200px; margin: auto; padding: 65px 25px; }
        h2 { font-size: 37px; margin: 10px 0; letter-spacing: -1px; }
        .subtitle { color: #777; font-size: 14px; }
        .filters { display: flex; gap: 10px; margin: 25px 0; flex-wrap: wrap; }
        .filters button { border: 1px solid #eee; border-radius: 30px; padding: 10px 18px; }
        .filters button.selected { border-color: #f26b21; }
        .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; }
        .product { border: 1px solid #eee; border-radius: 8px; overflow: hidden; transition: transform .2s; }
        .product:hover { transform: translateY(-4px); }
        .product-art { height: 190px; background: #f4f3f0; display: flex; align-items: center; justify-content: center; font-size: 75px; }
        .product-info { padding: 17px; }
        .product-info small { color: #888; }
        .product-info h3 { font-size: 15px; min-height: 36px; }
        .product-bottom { display: flex; justify-content: space-between; align-items: center; }
        .product-bottom strong { font-size: 16px; }
        .product-bottom button { background: #171717; color: white; border: 0; padding: 9px 13px; border-radius: 4px; }
        footer { background: #171717; color: white; text-align: center; padding: 40px 20px; }
        footer .logo { color: white; }
        footer p { color: #bbb; }
        footer small { color: #888; }
        @media(max-width: 750px) {
          .header { flex-wrap: wrap; padding: 18px; gap: 13px; }
          .search { order: 3; max-width: none; }
          .nav { gap: 8px; flex-wrap: wrap; }
          .hero { padding: 45px 25px; }
          .hero-art { width: 130px; height: 130px; }
          .big-p { font-size: 75px; }
          .hero-art p { font-size: 7px; }
          .benefits { flex-direction: column; padding: 20px 30px; }
          .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
          .product-art { height: 140px; font-size: 55px; }
          .products { padding: 45px 15px; }
        }
        @media(max-width: 390px) {
          .hero-art { display: none; }
          .product-info { padding: 11px; }
        }
      `}</style>
    </main>
  );
}