import api from "./axiosInstance";

export const changePassword = (data) =>
  api.post("/api/v1/auth/change-password", data).then((r) => r.data);