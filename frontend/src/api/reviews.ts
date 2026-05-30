import { apiClient } from "./client";

export const createReview = async (productId: string, data: { rating: number; review_text?: string }) => {
  return apiClient.post(`/reviews/?product_id=${productId}`, data);
};

export const getProductReviews = async (productId: string, skip = 0, limit = 100) => {
  return apiClient.get(`/reviews/product/${productId}?skip=${skip}&limit=${limit}`);
};

export const getProductReviewStats = async (productId: string) => {
  return apiClient.get(`/reviews/product/${productId}/stats`);
};

export const deleteReview = async (reviewId: string) => {
  return apiClient.delete(`/reviews/${reviewId}`);
};
