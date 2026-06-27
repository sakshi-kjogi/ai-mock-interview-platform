import api from "./axiosInstance";

export const generateQuestions = (sessionId) =>
  api.post(`/api/v1/interviews/${sessionId}/generate`).then((r) => r.data);

export const listQuestions = (sessionId) =>
  api.get(`/api/v1/interviews/${sessionId}/questions`).then((r) => r.data);