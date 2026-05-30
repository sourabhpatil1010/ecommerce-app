import { apiClient } from "./client";

/** GET /products */
export const getProducts = (params?: Record<string, unknown>) =>
  apiClient.get("/products/", { params });

/** GET /products/:id */
export const getProduct = (id: string) =>
  apiClient.get(`/products/${id}`);

/** GET /products/:id/related */
export const getRelatedProducts = (id: string) =>
  apiClient.get(`/products/${id}/related`);

/** POST /products */
export const createProduct = (data: Record<string, unknown>) =>
  apiClient.post("/products/", data);

/** PUT /products/:id */
export const updateProduct = (id: string, data: Record<string, unknown>) =>
  apiClient.put(`/products/${id}`, data);

/** DELETE /products/:id */
export const deleteProduct = (id: string) =>
  apiClient.delete(`/products/${id}`);
