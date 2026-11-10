
"use client";

import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { cart, cartCount } = useCart();

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <main style={{ padding: "30px 6%", fontFamily: "Arial" }}>
      <h1 style={{ color: "#f26b21" }}>PICKIT Cart</h1>
      <h2>Your Shopping Cart ({cartCount})</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.map((item) => (
            <div
              key={item.id}
              style={{
                padding: 20,
                marginBottom: 15,
                border: "1px solid #ddd",
                borderRadius: 10,
              }}
            >
              <img
  src={item.image}
  alt={item.name}
  style={{
    width: 120,
    height: 120,
    objectFit: "contain",
  }}
/>
              <h3>{item.name}</h3>
              <p>Price: ${item.price.toFixed(2)}</p>
              <p>Quantity: {item.quantity}</p>
              <p>
                Subtotal: $
                {(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}

          <h2>Total: ${total.toFixed(2)}</h2>
        </>
      )}

      <a href="/" style={{ color: "#f26b21", fontWeight: 700 }}>
        ← Continue Shopping
      </a>
    </main>
  );
}
