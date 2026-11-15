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
  variantId?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type AddToCartOptions = {
  showPopup?: boolean;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, options?: AddToCartOptions) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  removeFromCart: (id: string) => void;
  cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [addedPopup, setAddedPopup] = useState<{
    name: string;
    image: string;
    timestamp: number;
  } | null>(null);

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

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("pickit-cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  // Automatically dismiss the popup after 3.5 seconds (resets if another item is added)
  useEffect(() => {
    if (!addedPopup) return;
    const timer = setTimeout(() => {
      setAddedPopup(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [addedPopup]);

  function addToCart(
    item: Omit<CartItem, "quantity">,
    options: AddToCartOptions = { showPopup: true }
  ) {
    setCart((currentCart) => {
      const existing = currentCart.find((product) => product.id === item.id);

      if (existing) {
        return currentCart.map((product) =>
          product.id === item.id
            ? { ...product, quantity: product.quantity + 1 }
            : product
        );
      }

      return [...currentCart, { ...item, quantity: 1 }];
    });

    if (options.showPopup !== false) {
      setAddedPopup({
        name: item.name,
        image: item.image,
        timestamp: Date.now(),
      });
    }
  }

  function increaseQuantity(id: string) {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }

  function decreaseQuantity(id: string) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(id: string) {
    setCart((currentCart) => currentCart.filter((item) => item.id !== id));
  }

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

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

      {/* Auto-dismissing "Added to Cart" Toast (3.5s) */}
      {addedPopup && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 99999,
            backgroundColor: "#141414",
            color: "#ffffff",
            padding: "14px 16px",
            borderRadius: "16px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.32)",
            border: "1px solid #2e2e2e",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            maxWidth: "380px",
          }}
        >
          {addedPopup.image && (
            <img
              src={addedPopup.image}
              alt=""
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "8px",
                objectFit: "contain",
                backgroundColor: "#ffffff",
                padding: "2px",
                flexShrink: 0,
              }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#f26b21" }}>
              ✓ Added to Cart
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginTop: "2px",
              }}
            >
              {addedPopup.name}
            </div>
          </div>
          <a
            href="/cart"
            style={{
              backgroundColor: "#f26b21",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 700,
              padding: "8px 14px",
              borderRadius: "999px",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            View Cart ({cartCount})
          </a>
          <button
            type="button"
            onClick={() => setAddedPopup(null)}
            aria-label="Close notification"
            style={{
              background: "transparent",
              border: "none",
              color: "#9ca3af",
              fontSize: "16px",
              cursor: "pointer",
              padding: "4px",
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
      )}
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