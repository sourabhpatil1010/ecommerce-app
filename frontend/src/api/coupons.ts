import { apiClient } from "./client";

export const getCoupons = async (skip = 0, limit = 100) => {
  return apiClient.get(`/coupons/?skip=${skip}&limit=${limit}`);
};

export const createCoupon = async (data: any) => {
  return apiClient.post("/coupons/", data);
};

export const updateCoupon = async (id: string, data: any) => {
  return apiClient.put(`/coupons/${id}`, data);
};

export const validateCoupon = async (code: string) => {
  return apiClient.get(`/coupons/validate/${code}`);
};
