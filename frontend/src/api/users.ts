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

/** GET /users/admins */
export const getAdmins = (params?: Record<string, unknown>) =>
  apiClient.get("/users/admins", { params });

/** POST /users/admins */
export const createAdmin = (data: Record<string, unknown>) =>
  apiClient.post("/users/admins", data);

/** GET /users/admins/:id */
export const getAdmin = (id: string) =>
  apiClient.get(`/users/admins/${id}`);

/** PUT /users/admins/:id */
export const updateAdminRole = (id: string, data: Record<string, unknown>) =>
  apiClient.put(`/users/admins/${id}`, data);

/** PATCH /users/admins/:id/status */
export const updateAdminStatus = (id: string, isActive: boolean) =>
  apiClient.patch(`/users/admins/${id}/status`, { is_active: isActive });

/** DELETE /users/admins/:id — permanently removes the admin account */
export const deleteAdmin = (id: string) =>
  apiClient.delete(`/users/admins/${id}`);
