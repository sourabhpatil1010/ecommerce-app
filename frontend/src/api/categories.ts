import { apiClient } from "./client";

/** GET /categories */
export const getCategories = () => apiClient.get("/categories/");

/** GET /categories/:id */
export const getCategory = (id: string) => apiClient.get(`/categories/${id}`);

/** POST /categories */
export const createCategory = (data: Record<string, unknown>) =>
  apiClient.post("/categories/", data);

/** PUT /categories/:id */
export const updateCategory = (id: string, data: Record<string, unknown>) =>
  apiClient.put(`/categories/${id}`, data);

/** DELETE /categories/:id */
export const deleteCategory = (id: string) =>
  apiClient.delete(`/categories/${id}`);
