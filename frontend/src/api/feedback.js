import api from "./axiosInstance";

export const evaluateSession = (sessionId) =>
  api.post(`/api/v1/interviews/${sessionId}/evaluate`).then((r) => r.data);

export const listFeedback = (sessionId) =>
  api.get(`/api/v1/interviews/${sessionId}/feedback`).then((r) => r.data);