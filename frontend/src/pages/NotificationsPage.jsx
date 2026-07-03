import AppLayout from "../components/AppLayout";
import { useNavigate } from "react-router-dom";

const MOCK_NOTIFICATIONS = [
  { icon: "✅", title: "Interview completed", desc: "Your Frontend Developer interview has been evaluated. Check your feedback now.", time: "2m ago", color: "#4ade80" },
  { icon: "📊", title: "Weekly Progress Report", desc: "You practiced 3 interviews this week. Keep it up!", time: "1h ago", color: "#818cf8" },
  { icon: "💡", title: "New Recommendation", desc: "We recommend practicing System Design interviews based on your history.", time: "3h ago", color: "#fbbf24" },
  { icon: "📄", title: "Resume Parsed Successfully", desc: "Your resume has been parsed and is ready for tailored interviews.", time: "1d ago", color: "#22d3ee" },
];

export default function NotificationsPage() {
  return (
    <AppLayout>
      <div className="page-enter" style={{ padding: "28px 32px", maxWidth: 640 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>Notifications</h1>
        <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 24px" }}>Stay updated with your interview activity</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MOCK_NOTIFICATIONS.map((n, i) => (
            <div key={i} style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 12, padding: "14px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${n.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                {n.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>{n.title}</p>
                  <span style={{ color: "#6b7280", fontSize: 12, flexShrink: 0, marginLeft: 12 }}>{n.time}</span>
                </div>
                <p style={{ color: "#6b7280", fontSize: 13, margin: 0, lineHeight: 1.5 }}>{n.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p style={{ color: "#374151", fontSize: 12, textAlign: "center", marginTop: 20 }}>
          Real-time notifications will be available in a future release.
        </p>
      </div>
    </AppLayout>
  );
}