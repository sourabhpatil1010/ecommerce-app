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

/** POST /payments/razorpay/create-order */
export const createRazorpayOrder = (orderId: string) =>
  apiClient.post("/payments/razorpay/create-order", { order_id: orderId });

/** POST /payments/razorpay/verify */
export const verifyRazorpayPayment = (payload: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}) => apiClient.post("/payments/razorpay/verify", payload);

/** POST /payments/razorpay/fail */
export const failRazorpayPayment = (payload: {
  razorpay_order_id: string;
  error_code?: string;
  error_description?: string;
}) => apiClient.post("/payments/razorpay/fail", payload);


/** POST /payments/cod/create-order */
export const createCodPayment = (orderId: string) =>
  apiClient.post("/payments/cod/create-order", { order_id: orderId });
