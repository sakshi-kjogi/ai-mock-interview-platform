import api from "./axiosInstance";

export const submitAnswer = (sessionId, questionId, data) =>
  api
    .post(`/api/v1/interviews/${sessionId}/questions/${questionId}/answer`, data)
    .then((r) => r.data);

export const listAnswers = (sessionId) =>
  api.get(`/api/v1/interviews/${sessionId}/answers`).then((r) => r.data);