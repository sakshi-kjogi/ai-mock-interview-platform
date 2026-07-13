import AppLayout from "../components/AppLayout";
import Button from "../components/ui/Button";
import useIsMobile from "../hooks/useIsMobile";
import useNotifications from "../hooks/useNotifications";

const TYPE_ICON = {
  interview_completed: { icon: "✅", color: "#4ade80" },
  resume_parsed:       { icon: "📄", color: "#22d3ee" },
  recommendation:      { icon: "💡", color: "#fbbf24" },
  weekly_report:       { icon: "📊", color: "#818cf8" },
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationsPage() {
  const isMobile = useIsMobile();
  const { notifications, unreadCount, connected, markRead, markAllRead } = useNotifications();

  return (
    <AppLayout>
      <div className="page-enter" style={{ padding: isMobile ? "20px 16px" : "28px 32px", maxWidth: 640, boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 12 : 0, marginBottom: 8 }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, margin: "0 0 4px" }}>
              Notifications {unreadCount > 0 && (
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: "#6366f1", borderRadius: 999, padding: "2px 8px", marginLeft: 6, verticalAlign: "middle" }}>
                  {unreadCount}
                </span>
              )}
            </h1>
            <p style={{ color: "#6b7280", fontSize: 13, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: connected ? "#4ade80" : "#6b7280", display: "inline-block" }} />
              {connected ? "Live" : "Reconnecting..."}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={markAllRead} fullWidth={isMobile}>
              Mark all as read
            </Button>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
          {notifications.length === 0 ? (
            <div style={{ border: "1px dashed #374151", borderRadius: 14, padding: isMobile ? 28 : 40, textAlign: "center" }}>
              <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>No notifications yet. You'll see updates here as things happen.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const meta = TYPE_ICON[n.type] || { icon: "🔔", color: "#818cf8" };
              return (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markRead(n.id)}
                  style={{
                    background: n.is_read ? "#1f2937" : "#232f42",
                    border: `1px solid ${n.is_read ? "#374151" : "rgba(99,102,241,0.4)"}`,
                    borderRadius: 12, padding: isMobile ? "12px 14px" : "14px 18px",
                    display: "flex", gap: isMobile ? 10 : 14, alignItems: "flex-start",
                    cursor: n.is_read ? "default" : "pointer",
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${meta.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                    {meta.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 4, gap: 4 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>{n.title}</p>
                      <span style={{ color: "#6b7280", fontSize: 12, flexShrink: 0, marginLeft: 12 }}>{timeAgo(n.created_at)}</span>
                    </div>
                    <p style={{ color: "#6b7280", fontSize: 13, margin: 0, lineHeight: 1.5 }}>{n.description}</p>
                  </div>
                  {!n.is_read && (
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366f1", flexShrink: 0, marginTop: 6 }} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
