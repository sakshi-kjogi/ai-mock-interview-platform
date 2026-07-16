import api from "./axiosInstance";

export const getDashboardAnalytics = (interviewType) =>
  api
    .get("/api/v1/analytics/dashboard", {
      params: interviewType ? { interview_type: interviewType } : {},
    })
    .then((r) => r.data);
