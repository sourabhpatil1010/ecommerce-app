import { apiClient } from "./client";

/** GET /users/me */
export const getProfile = () => apiClient.get("/users/me");

/** PUT /users/me */
export const updateProfile = (data: Record<string, unknown>) =>
  apiClient.put("/users/me", data);

/** GET /users/ */
export const getUsers = (params?: Record<string, unknown>) =>
  apiClient.get("/users/", { params });

/** PATCH /users/:id/status */
export const updateUserStatus = (id: string, isActive: boolean) =>
  apiClient.patch(`/users/${id}/status`, { is_active: isActive });
