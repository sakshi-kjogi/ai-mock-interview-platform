import api from "./axiosInstance";

export const generateQuestions = (sessionId, numQuestions) =>
  api
    .post(`/api/v1/interviews/${sessionId}/generate`, null, {
      params: numQuestions ? { num_questions: numQuestions } : {},
    })
    .then((r) => r.data);

export const listQuestions = (sessionId) =>
  api.get(`/api/v1/interviews/${sessionId}/questions`).then((r) => r.data);
