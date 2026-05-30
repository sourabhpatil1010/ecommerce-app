import { apiClient } from "./client";

export const getNotifications = async (skip = 0, limit = 50) => {
  return apiClient.get(`/notifications/?skip=${skip}&limit=${limit}`);
};

export const markNotificationRead = async (id: string) => {
  return apiClient.put(`/notifications/${id}/read`);
};
