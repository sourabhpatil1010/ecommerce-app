import { apiClient } from "./client";

/** GET /categories */
export const getCategories = () => apiClient.get("/categories");
