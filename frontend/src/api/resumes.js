import api from "./axiosInstance";

export const uploadResume = (file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/api/v1/resumes/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};

export const listResumes    = ()       => api.get("/api/v1/resumes/").then((r) => r.data);
export const getResume      = (id)     => api.get(`/api/v1/resumes/${id}`).then((r) => r.data);
export const analyzeResume  = (id)     => api.post(`/api/v1/resumes/${id}/analyze`).then((r) => r.data);
export const getResumeFeedback = (id)  => api.get(`/api/v1/resumes/${id}/feedback`).then((r) => r.data);
export const startResumeInterview = (id, data) =>
  api.post(`/api/v1/resumes/${id}/start-interview`, data).then((r) => r.data);