"use client";

import "../storefront.css";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";

const FREE_SHIPPING_GOAL = 35;

export default function CartPage() {
  const { cart, cartCount, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const remaining = Math.max(0, FREE_SHIPPING_GOAL - total);
  const progress = Math.min(100, (total / FREE_SHIPPING_GOAL) * 100);

  async function handleCheckout() {
    try {
      setCheckingOut(true);
      setCheckoutError("");
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      });
      const data = await response.json();
      if (!response.ok || !data?.checkoutUrl) {
        throw new Error(data?.error || "Could not start Shopify checkout.");
      }
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Something went wrong while starting checkout.");
      setCheckingOut(false);
    }
  }

  return (
    <div className="sf-page">
      <header className="sf-header">
        <div className="sf-header-inner">
          <Link className="sf-logo" href="/">PICK<span>IT.</span></Link>
          <div className="sf-nav-right">
            <Link className="sf-pill-link" href="/">← Continue Shopping</Link>
            <Link className="sf-pill-link" href="/account">Account</Link>
          </div>
        </div>
      </header>

      <main className="sf-main">
        <span className="pdp-eyebrow">YOUR BAG</span>
        <h1 style={{ margin: "4px 0 18px", fontSize: 28, letterSpacing: -0.8 }}>
          Shopping Cart ({cartCount})
        </h1>

        {cart.length === 0 ? (
          <div className="ct-empty">
            <div style={{ fontSize: 38 }}>🛒</div>
            <h2 style={{ margin: "10px 0 6px" }}>Your cart is empty</h2>
            <p style={{ color: "#666", margin: "0 0 22px", fontSize: 14 }}>
              Discover trending gadgets and everyday essentials on PICKIT.
            </p>
            <Link
              href="/"
              style={{ display: "inline-block", padding: "13px 26px", background: "#f26b21", color: "#fff", textDecoration: "none", borderRadius: 12, fontWeight: 800, fontSize: 14 }}
            >
              Start Shopping →
            </Link>
          </div>
        ) : (
          <>
            <div className="ct-ship-banner">
              <p className="ct-ship-text">
                {remaining === 0
                  ? "🎉 You unlocked FREE Tracked US Shipping!"
                  : `Add $${remaining.toFixed(2)} more to unlock FREE Tracked US Shipping`}
              </p>
              <div className="ct-bar-bg">
                <div className="ct-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="ct-layout">
              <div className="ct-list">
                {cart.map((item) => (
                  <div className="ct-item" key={item.id}>
                    {item.image ? (
                      <img className="ct-item-img" src={item.image} alt={item.name} />
                    ) : (
                      <div className="ct-item-img" />
                    )}
                    <div className="ct-item-info">
                      <h3 className="ct-item-title">{item.name}</h3>
                      <p className="ct-item-price">${(item.price * item.quantity).toFixed(2)}</p>
                      <div className="ct-qty-row">
                        <div className="ct-stepper">
                          <button type="button" onClick={() => decreaseQuantity(item.id)} aria-label="Decrease quantity">−</button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => increaseQuantity(item.id)} aria-label="Increase quantity">+</button>
                        </div>
                        <button type="button" className="ct-remove" onClick={() => removeFromCart(item.id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <aside className="ct-summary">
                <h2>Order Summary</h2>
                <div className="ct-sum-row">
                  <span>Subtotal ({cartCount} items)</span>
                  <strong>${total.toFixed(2)}</strong>
                </div>
                <div className="ct-sum-row">
                  <span>US Tracked Shipping</span>
                  <span>{remaining === 0 ? "FREE" : "Calculated at checkout"}</span>
                </div>
                <div className="ct-sum-total">
                  <span>Estimated Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                {checkoutError && (
                  <p style={{ color: "#dc2626", fontWeight: 700, fontSize: 13, marginTop: 12 }}>
                    {checkoutError}
                  </p>
                )}

                <button
                  type="button"
                  className="ct-checkout-btn"
                  onClick={handleCheckout}
                  disabled={checkingOut}
                >
                  {checkingOut ? "Redirecting to Checkout..." : "Proceed to Checkout →"}
                </button>

                <p style={{ textAlign: "center", fontSize: 11, color: "#777", margin: "12px 0 0" }}>
                  🔒 256-bit SSL Encrypted • 30-Day Money-Back Guarantee
                </p>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
