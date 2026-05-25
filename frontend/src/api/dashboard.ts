import { apiClient } from "./client";

/** GET /dashboard/stats */
export const getDashboardStats = () => apiClient.get("/dashboard/stats");
