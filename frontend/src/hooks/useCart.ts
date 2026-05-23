import { useContext } from "react";
import { CartContext } from "@/contexts/CartContext";

/**
 * Hook to access cart state and actions.
 * Must be used within a CartProvider.
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
