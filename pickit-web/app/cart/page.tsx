
"use client";

import { useCart } from "../context/CartContext";

export default function CartPage() {
 const {
  cart,
  cartCount,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
} = useCart();
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <main style={{ padding: "30px 6%", fontFamily: "Arial" }}>
      <h1 style={{ color: "#f26b21" }}>PICKIT Cart</h1>
      <h2>Your Shopping Cart ({cartCount})</h2>

      {cart.length === 0 ? (
       <div style={{
  textAlign: "center",
  padding: "50px 20px",
  background: "#f9f9f9",
  borderRadius: 12,
  margin: "25px 0",
}}>
  <h2>Your cart is empty</h2>
  <p style={{ color: "#666", marginTop: 10 }}>
    Looks like you haven't added anything yet.
  </p>
  <a
    href="/"
    style={{
      display: "inline-block",
      marginTop: 20,
      padding: "12px 24px",
      background: "#f26b21",
      color: "white",
      textDecoration: "none",
      borderRadius: 8,
      fontWeight: 700,
    }}
  >
    Start Shopping
  </a>
</div>
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
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
  <button
  onClick={() => decreaseQuantity(item.id)}
  style={{
    width: 34,
    height: 34,
    border: "1px solid #ddd",
    borderRadius: 6,
    background: "white",
    fontSize: 20,
    cursor: "pointer",
  }}
>
  −
</button>

  <span>{item.quantity}</span>

  <button
  onClick={() => increaseQuantity(item.id)}
  style={{
    width: 34,
    height: 34,
    border: "1px solid #ddd",
    borderRadius: 6,
    background: "white",
    fontSize: 20,
    cursor: "pointer",
  }}
>
  +
</button>
</div>
              <p>
                Subtotal: $
                {(item.price * item.quantity).toFixed(2)}
              </p>
              <button
  onClick={() => removeFromCart(item.id)}
  style={{
    background: "#dc2626",
    color: "white",
    border: 0,
    padding: "8px 14px",
    borderRadius: 6,
    cursor: "pointer",
    marginTop: 10,
  }}
>
  Remove
</button>
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
