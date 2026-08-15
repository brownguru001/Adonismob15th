"use client";

import { createContext, useContext, useCallback, useSyncExternalStore } from "react";

export type CartItem = {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  image: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "adonismob15th_cart";
const CART_EVENT = "adonismob15th_cart_change";
const EMPTY_CART: CartItem[] = [];

// useSyncExternalStore requires getSnapshot to return a referentially stable
// value when the underlying data hasn't changed — re-parsing localStorage on
// every call would return a new array each time and loop forever. Cache the
// parsed result against the raw string it came from.
let cachedRaw: string | null = null;
let cachedItems: CartItem[] = EMPTY_CART;

function readCart(): CartItem[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY_CART;
  }
  if (raw === cachedRaw) return cachedItems;
  try {
    cachedItems = raw ? JSON.parse(raw) : EMPTY_CART;
  } catch {
    cachedItems = EMPTY_CART;
  }
  cachedRaw = raw;
  return cachedItems;
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(CART_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CART_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerSnapshot(): CartItem[] {
  return EMPTY_CART;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, readCart, getServerSnapshot);

  const addItem = useCallback((item: CartItem) => {
    const current = readCart();
    const existing = current.find((i) => i.variantId === item.variantId);
    const next = existing
      ? current.map((i) =>
          i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i
        )
      : [...current, item];
    writeCart(next);
  }, []);

  const removeItem = useCallback((variantId: string) => {
    writeCart(readCart().filter((i) => i.variantId !== variantId));
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    writeCart(readCart().map((i) => (i.variantId === variantId ? { ...i, quantity } : i)));
  }, []);

  const clear = useCallback(() => writeCart([]), []);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clear, count, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
