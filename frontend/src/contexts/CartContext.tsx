import { createContext, useState, useEffect, type ReactNode } from "react";
import type { CartItem } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import * as cartApi from "@/api/cart";

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  loading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await cartApi.getCart();
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart when authentication status changes to true
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setItems([]);
      setTotal(0);
    }
  }, [isAuthenticated]);

  const addItem = async (productId: string, quantity: number = 1) => {
    if (!isAuthenticated) return;
    try {
      const res = await cartApi.addCartItem(productId, quantity);
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Failed to add item to cart:", err);
      throw err;
    }
  };

  const removeItem = async (itemId: string) => {
    if (!isAuthenticated) return;
    try {
      const res = await cartApi.removeCartItem(itemId);
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Failed to remove item from cart:", err);
      throw err;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!isAuthenticated) return;
    try {
      const res = await cartApi.updateCartItem(itemId, quantity);
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Failed to update item quantity:", err);
      throw err;
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    try {
      await cartApi.clearCart();
      setItems([]);
      setTotal(0);
    } catch (err) {
      console.error("Failed to clear cart:", err);
      throw err;
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
        total,
        loading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
