
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  removeFromCart: (id: string) => void;
  cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved cart when website opens
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("pickit-cart");

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      }
    } catch {
      localStorage.removeItem("pickit-cart");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("pickit-cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  // Add product to cart
  function addToCart(item: Omit<CartItem, "quantity">) {
    setCart((currentCart) => {
      const existing = currentCart.find(
        (product) => product.id === item.id
      );

      if (existing) {
        return currentCart.map((product) =>
          product.id === item.id
            ? { ...product, quantity: product.quantity + 1 }
            : product
        );
      }

      return [...currentCart, { ...item, quantity: 1 }];
    });
  }

  // Increase product quantity
  function increaseQuantity(id: string) {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  // Decrease product quantity
  function decreaseQuantity(id: string) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  // Remove product completely
  function removeFromCart(id: string) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );
  }

  // Calculate total cart quantity
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
