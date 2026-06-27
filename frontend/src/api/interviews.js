import api from "./axiosInstance";

export const createInterview = (data) =>
  api.post("/api/v1/interviews/", data).then((r) => r.data);

export const listInterviews = () =>
  api.get("/api/v1/interviews/").then((r) => r.data);

export const getInterview = (id) =>
  api.get(`/api/v1/interviews/${id}`).then((r) => r.data);

export const updateInterviewStatus = (id, status) =>
  api.patch(`/api/v1/interviews/${id}/status`, { status }).then((r) => r.data);