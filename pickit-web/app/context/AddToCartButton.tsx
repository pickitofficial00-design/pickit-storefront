
"use client";

import { useState } from "react";
import { useCart } from "./CartContext";

type Props = {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
};

export default function AddToCartButton({ product }: Props) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    addToCart(product);
    setAdded(true);
  }

  return (
    <button
      onClick={handleAddToCart}
      style={{
        width: "100%",
        padding: 16,
        background: added ? "#238636" : "#f26b21",
        color: "white",
        border: 0,
        borderRadius: 8,
        fontWeight: 700,
        fontSize: 16,
        cursor: "pointer",
      }}
    >
      {added ? "Added to Cart ✓" : "Add to Cart"}
    </button>
  );
}
