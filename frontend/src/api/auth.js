import api from "./axiosInstance";

export const changePassword = (data) =>
  api.post("/api/v1/auth/change-password", data).then((r) => r.data);

export const forgotPassword = (email) =>
  api.post("/api/v1/auth/forgot-password", { email }).then((r) => r.data);

export const resetPassword = (data) =>
  api.post("/api/v1/auth/reset-password", data).then((r) => r.data);