import api from "./axiosInstance";

export const getBookmarks = () =>
  api.get("/api/v1/bookmarks/").then((r) => r.data);

export const bookmarkSession = (sessionId) =>
  api.post(`/api/v1/bookmarks/sessions/${sessionId}`).then((r) => r.data);

export const unbookmarkSession = (sessionId) =>
  api.delete(`/api/v1/bookmarks/sessions/${sessionId}`).then((r) => r.data);

export const bookmarkQuestion = (questionId) =>
  api.post(`/api/v1/bookmarks/questions/${questionId}`).then((r) => r.data);

export const unbookmarkQuestion = (questionId) =>
  api.delete(`/api/v1/bookmarks/questions/${questionId}`).then((r) => r.data);
