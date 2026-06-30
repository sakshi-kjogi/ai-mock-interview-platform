import api from "./axiosInstance";

// Fire-and-forget — a flaky network call to log a violation must never
// block or crash the interview itself, so errors are swallowed here.
export const logViolation = (sessionId, data) =>
  api.post(`/api/v1/interviews/${sessionId}/violations`, data)
    .then((r) => r.data)
    .catch(() => null);

export const listViolations = (sessionId) =>
  api.get(`/api/v1/interviews/${sessionId}/violations`).then((r) => r.data);

export const getIntegritySummary = (sessionId) =>
  api.get(`/api/v1/interviews/${sessionId}/integrity-summary`).then((r) => r.data);