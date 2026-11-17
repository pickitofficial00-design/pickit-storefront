import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Product } from "../services/storeApi";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  date: string;
  status: "Order Confirmed" | "Processing" | "Shipped";
  items: CartItem[];
  total: number;
}

interface CartContextType {
  items: CartItem[];
  orders: OrderRecord[];
  wishlist: Product[];
  totalCount: number;
  subtotal: number;
  addToCart: (product: Product, qty?: number) => void;
  updateQuantity: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  recordCompletedOrder: () => void;
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
}

const CART_KEY = "@pickit_cart_v1";
const ORDERS_KEY = "@pickit_orders_v1";
const WISHLIST_KEY = "@pickit_wishlist_v1";

const CartContext = createContext<CartContextType>({
  items: [],
  orders: [],
  wishlist: [],
  totalCount: 0,
  subtotal: 0,
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  recordCompletedOrder: () => {},
  toggleWishlist: () => {},
  isWishlisted: () => false,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [savedCart, savedOrders, savedWish] = await Promise.all([
          AsyncStorage.getItem(CART_KEY),
          AsyncStorage.getItem(ORDERS_KEY),
          AsyncStorage.getItem(WISHLIST_KEY),
        ]);
        if (savedCart) setItems(JSON.parse(savedCart));
        if (savedOrders) setOrders(JSON.parse(savedOrders));
        if (savedWish) setWishlist(JSON.parse(savedWish));
      } catch {}
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(CART_KEY, JSON.stringify(items)).catch(() => {});
  }, [items, hydrated]);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders)).catch(() => {});
  }, [orders, hydrated]);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist)).catch(() => {});
  }, [wishlist, hydrated]);

  const addToCart = (product: Product, qty = 1) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i))
    );
  };

  const removeFromCart = (productId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => setItems([]);

  const recordCompletedOrder = () => {
    if (items.length === 0) return;
    const sub = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const shipping = sub >= 35 ? 0 : 5.99;
    const newOrder: OrderRecord = {
      id: `ord_${Date.now()}`,
      orderNumber: `PK-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: "Order Confirmed",
      items: [...items],
      total: sub + shipping,
    };
    setOrders((prev) => [newOrder, ...prev]);
    setItems([]);
  };

  const toggleWishlist = (product: Product) => {
    Haptics.selectionAsync();
    setWishlist((prev) =>
      prev.some((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [product, ...prev]
    );
  };

  const isWishlisted = (productId: string) => wishlist.some((p) => p.id === productId);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        orders,
        wishlist,
        totalCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        recordCompletedOrder,
        toggleWishlist,
        isWishlisted,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
