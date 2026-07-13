import api from "./axiosInstance";

export const listNotifications = () =>
  api.get("/api/v1/notifications").then((r) => r.data);

export const getUnreadCount = () =>
  api.get("/api/v1/notifications/unread-count").then((r) => r.data.count);

export const markNotificationRead = (id) =>
  api.patch(`/api/v1/notifications/${id}/read`).then((r) => r.data);

export const markAllNotificationsRead = () =>
  api.patch("/api/v1/notifications/read-all").then((r) => r.data);
