import { apiClient } from "./client";

/** POST /orders/ */
export const createOrder = (shippingAddress: string) =>
  apiClient.post("/orders/", { shipping_address: shippingAddress });

/** GET /orders/ */
export const getOrders = () => apiClient.get("/orders/");

/** GET /orders/:id */
export const getOrder = (id: string) => apiClient.get(`/orders/${id}`);

/** GET /orders/all (Admin) */
export const getAllOrders = (params?: Record<string, unknown>) =>
  apiClient.get("/orders/all", { params });

/** PATCH /orders/:id/status (Admin) */
