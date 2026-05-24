import { apiClient } from "./client";

/** GET /cart/ */
export const getCart = () => apiClient.get("/cart/");

/** POST /cart/items */
export const addCartItem = (productId: string, quantity: number = 1) =>
  apiClient.post("/cart/items", { product_id: productId, quantity });

/** PUT /cart/items/:id */
export const updateCartItem = (itemId: string, quantity: number) =>
  apiClient.put(`/cart/items/${itemId}`, { quantity });

/** DELETE /cart/items/:id */
export const removeCartItem = (itemId: string) =>
  apiClient.delete(`/cart/items/${itemId}`);

/** DELETE /cart/ */
export const clearCart = () => apiClient.delete("/cart/");
