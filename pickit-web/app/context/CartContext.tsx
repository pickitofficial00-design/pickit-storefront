
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
        setCart(JSON.parse(savedCart));
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

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <CartContext.Provider value={{ cart, addToCart, cartCount }}>
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
