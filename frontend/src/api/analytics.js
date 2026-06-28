import api from "./axiosInstance";

export const getDashboardAnalytics = () =>
  api.get("/api/v1/analytics/dashboard").then((r) => r.data);