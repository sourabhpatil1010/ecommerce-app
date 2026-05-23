import { apiClient } from "./client";
import type { UserLogin, UserRegister } from "@/types";

/** POST /auth/register */
export const register = (data: UserRegister) =>
  apiClient.post("/auth/register", data);

/** POST /auth/login */
export const login = (data: UserLogin) =>
  apiClient.post("/auth/login", data);

/** POST /auth/refresh */
export const refreshToken = () =>
  apiClient.post("/auth/refresh");
