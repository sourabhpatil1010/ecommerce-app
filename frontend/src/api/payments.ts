import { apiClient } from "./client";

/** POST /payments/create-intent */
export const createPaymentIntent = (orderId: string) =>
  apiClient.post("/payments/create-intent", { order_id: orderId });

/** GET /payments/:orderId/status */
export const getPaymentStatus = (orderId: string) =>
  apiClient.get(`/payments/${orderId}/status`);

/** POST /payments/:orderId/simulate-webhook */
export const simulatePaymentWebhook = (orderId: string, success: boolean = true) =>
  apiClient.post(`/payments/${orderId}/simulate-webhook?success=${success}`);
