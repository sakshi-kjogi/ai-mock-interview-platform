import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { listInterviews } from "../api/interviews";
import { getDashboardAnalytics } from "../api/analytics";

const TYPE_LABELS = { technical: "Technical", behavioral: "Behavioral", system_design: "System Design" };
const STATUS_COLORS = {
  in_progress: { bg: "rgba(234,179,8,0.15)",  color: "#facc15" },
  completed:   { bg: "rgba(34,197,94,0.15)",   color: "#4ade80" },
  abandoned:   { bg: "rgba(239,68,68,0.15)",   color: "#f87171" },
};
const STATUS_LABELS = { in_progress: "In Progress", completed: "Completed", abandoned: "Abandoned" };

const fmtTime = (s) => {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${Math.round(s % 60)}s` : `${Math.round(s)}s`;
};

function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 12, padding: 20, flex: 1 }}>
      <p style={{ color: "#9ca3af", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{label}</p>
      <p style={{ color: "#fff", fontSize: 28, fontWeight: 700, margin: 0 }}>{value}</p>
      {sub && <p style={{ color: "#6b7280", fontSize: 11, marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
      <p style={{ color: "#9ca3af", fontSize: 11, marginBottom: 2 }}>{label}</p>
      <p style={{ color: "#fff", fontWeight: 600 }}>{payload[0].value} pts</p>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sessions,  setSessions]  = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([listInterviews(), getDashboardAnalytics()])
      .then(([s, a]) => { setSessions(s); setAnalytics(a); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const trendData = analytics?.score_trend.map((s, i) => ({
    name: `#${i + 1}`, score: s.avg_score,
  })) ?? [];

  const categoryData = analytics?.category_breakdown.map((c) => ({
    name: c.category, score: c.avg_score,
  })) ?? [];

  return (
    <div style={{ minHeight: "100vh", background: "#111827", color: "#fff", fontFamily: "inherit" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1f2937", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: "#818cf8" }}>AI Mock Interview</span>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "#9ca3af", fontSize: 14 }}>{user?.full_name}</span>
          <button onClick={logout}
            style={{ background: "#dc2626", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
            Log Out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1024, margin: "0 auto", padding: "40px 32px" }}>

        {/* Welcome row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Welcome back, {user?.full_name} 👋</h2>
            <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 4 }}>Here's how you're progressing</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => navigate("/resume")}
              style={{ background: "transparent", border: "1px solid #4b5563", color: "#d1d5db", padding: "10px 16px", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              📄 Resume
            </button>
            <button onClick={() => navigate("/interview/setup")}
              style={{ background: "#4f46e5", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              + New Interview
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ color: "#6b7280", fontSize: 14 }}>Loading analytics...</p>
        ) : (
          <>
            {/* Stat Cards */}
            <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
              <StatCard label="Total Interviews" value={analytics?.total_sessions ?? 0} sub={`${analytics?.completed_sessions ?? 0} completed`} />
              <StatCard label="Avg Score" value={analytics?.overall_avg_score ?? "—"} sub="out of 100" />
              <StatCard label="Completion Rate" value={analytics?.total_sessions > 0 ? `${analytics.completion_rate}%` : "—"} sub="sessions finished" />
              <StatCard label="Avg Time / Answer" value={fmtTime(analytics?.avg_time_per_answer_seconds)} sub="per question" />
            </div>

            {/* Charts */}
            {trendData.length > 0 || categoryData.length > 0 ? (
              <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
                {trendData.length > 0 && (
                  <div style={{ flex: 1, background: "#1f2937", border: "1px solid #374151", borderRadius: 12, padding: 20 }}>
                    <p style={{ fontWeight: 600, fontSize: 13, color: "#d1d5db", marginBottom: 16 }}>Score Trend</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1", r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {categoryData.length > 0 && (
                  <div style={{ flex: 1, background: "#1f2937", border: "1px solid #374151", borderRadius: 12, padding: 20 }}>
                    <p style={{ fontWeight: 600, fontSize: 13, color: "#d1d5db", marginBottom: 16 }}>Category Breakdown</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={categoryData} layout="vertical" margin={{ left: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" width={100} tick={{ fill: "#9ca3af", fontSize: 10 }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="score" radius={[0, 4, 4, 0]} fill="#6366f1" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: "#1f2937", border: "1px dashed #374151", borderRadius: 12, padding: 32, textAlign: "center", marginBottom: 32 }}>
                <p style={{ color: "#6b7280", fontSize: 14 }}>Complete an interview with feedback to see your analytics charts</p>
              </div>
            )}

            {/* Past Sessions */}
            <p style={{ fontWeight: 600, fontSize: 16, color: "#d1d5db", marginBottom: 16 }}>Past Sessions</p>
            {sessions.length === 0 ? (
              <div style={{ border: "1px dashed #374151", borderRadius: 12, padding: 40, textAlign: "center", color: "#6b7280" }}>
                <p style={{ fontSize: 18, marginBottom: 8 }}>No interviews yet</p>
                <p style={{ fontSize: 13 }}>Click "+ New Interview" to get started</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {sessions.map((s) => (
                  <div key={s.id} onClick={() => navigate(`/interview/${s.id}`)}
                    style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 12, padding: "16px 24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "border-color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#6366f1"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#374151"}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>{s.role_title}</p>
                      <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 2 }}>
                        {TYPE_LABELS[s.interview_type]} · {new Date(s.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span style={{ background: STATUS_COLORS[s.status]?.bg, color: STATUS_COLORS[s.status]?.color, fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 999 }}>
                      {STATUS_LABELS[s.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}