import { apiClient } from "./client";

export const getWishlist = async () => {
  const token = localStorage.getItem("access_token");
  return apiClient.get("/wishlist/", {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const addToWishlist = async (productId: string) => {
  const token = localStorage.getItem("access_token");
  return apiClient.post("/wishlist/", { product_id: productId }, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const removeFromWishlist = async (productId: string) => {
  const token = localStorage.getItem("access_token");
  return apiClient.delete(`/wishlist/${productId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
