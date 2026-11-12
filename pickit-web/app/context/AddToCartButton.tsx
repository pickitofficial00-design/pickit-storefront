
"use client";

import { useCart } from "./CartContext";

type Props = {
  product: {
    id: string;
    variantId?: string;
    name: string;
    price: number;
    image: string;
  };
};

export default function AddToCartButton({ product }: Props) {
  const { cart, addToCart, removeFromCart } = useCart();

  const isInCart = cart.some((item) => item.id === product.id);

  function handleClick() {
    if (isInCart) {
      removeFromCart(product.id);
    } else {
      addToCart(product);
    }
  }

  return (
    <button
      onClick={handleClick}
      style={{
        width: "100%",
        padding: 16,
        background: isInCart ? "#238636" : "#f26b21",
        color: "white",
        border: 0,
        borderRadius: 8,
        fontWeight: 700,
        fontSize: 16,
        cursor: "pointer",
      }}
    >
      {isInCart ? "Added to Cart ✓" : "Add to Cart"}
    </button>
  );
}
