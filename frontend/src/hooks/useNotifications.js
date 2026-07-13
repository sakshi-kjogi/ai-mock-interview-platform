import { useEffect, useRef, useState, useCallback } from "react";
import { listNotifications, markNotificationRead, markAllNotificationsRead } from "../api/notifications";

function getWsUrl() {
  const apiUrl = import.meta.env.VITE_API_URL || "";
  const wsBase = apiUrl.replace(/^http/, "ws"); // http(s):// -> ws(s)://
  const token = localStorage.getItem("token");
  return `${wsBase}/api/v1/notifications/ws?token=${encodeURIComponent(token || "")}`;
}

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    try { await markNotificationRead(id); } catch { /* best-effort */ }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try { await markAllNotificationsRead(); } catch { /* best-effort */ }
  }, []);

  useEffect(() => {
    let cancelled = false;

    // 1. Load existing notifications first (so the list isn't empty on page load)
    listNotifications()
      .then((list) => { if (!cancelled) setNotifications(list); })
      .catch(() => {});

    // 2. Open WebSocket for real-time push
    function connect() {
      if (!localStorage.getItem("token")) return; // not logged in yet
      const ws = new WebSocket(getWsUrl());
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);

      ws.onmessage = (event) => {
        try {
          const notif = JSON.parse(event.data);
          setNotifications((prev) => [notif, ...prev]);
        } catch { /* ignore malformed messages */ }
      };

      ws.onclose = () => {
        setConnected(false);
        // Auto-reconnect after 3s (e.g. after token refresh, network blip, backend restart)
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, []);

  return { notifications, unreadCount, connected, markRead, markAllRead };
}
