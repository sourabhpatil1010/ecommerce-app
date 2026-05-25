import { apiClient } from "./client";
import type { UserRegister, AdminUserRegister, AuthToken, User } from "@/types";

/** POST /auth/register — create a new account */
export const register = (data: UserRegister) =>
  apiClient.post<User>("/auth/register", data);

/** POST /auth/admin-register — create a new admin account */
export const adminRegister = (data: AdminUserRegister) =>
  apiClient.post<User>("/auth/admin-register", data);

/** POST /auth/token — JSON-body login, returns JWT */
export const login = (email: string, password: string) =>
  apiClient.post<AuthToken>("/auth/token", { email, password });

/** GET /auth/me — fetch the currently authenticated user */
export const getMe = () =>
  apiClient.get<User>("/auth/me");
