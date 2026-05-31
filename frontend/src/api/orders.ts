import { apiClient } from "./client";

/** POST /orders/ */
export const createOrder = (
  shippingAddress: string,
  couponCode?: string,
  discountAmount: number = 0,
  shippingCost: number = 0,
  taxAmount: number = 0,
) =>
  apiClient.post("/orders/", {
    shipping_address: shippingAddress,
    coupon_code: couponCode,
    discount_amount: discountAmount,
    shipping_cost: shippingCost,
    tax_amount: taxAmount,
  });

/** GET /orders/ */
export const getOrders = () => apiClient.get("/orders/");

/** GET /orders/:id */
export const getOrder = (id: string) => apiClient.get(`/orders/${id}`);

/** GET /orders/all (Admin) */
export const getAllOrders = (params?: Record<string, unknown>) => {
  return apiClient.get("/orders/all", { 
    params,
    paramsSerializer: { indexes: null }
  });
};

/** PATCH /orders/:id/status (Admin) */
export const updateOrderStatus = (
  id: string,
  payload: { status: string; notes?: string; tracking_id?: string; courier?: string }
) => apiClient.patch(`/orders/${id}/status`, payload);

/** PATCH /orders/:id/cancel */
export const cancelOrder = (id: string) =>
  apiClient.patch(`/orders/${id}/cancel`);
