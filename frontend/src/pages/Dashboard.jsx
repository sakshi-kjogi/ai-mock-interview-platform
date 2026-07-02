import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../context/AuthContext";
import { listInterviews } from "../api/interviews";
import { getDashboardAnalytics } from "../api/analytics";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import { SkeletonStatCard, SkeletonCard } from "../components/ui/Skeleton";

const TYPE_LABELS = { technical: "Technical", behavioral: "Behavioral", system_design: "System Design" };
const TYPE_ICONS  = { technical: "💻", behavioral: "🤝", system_design: "🏗️" };

const STATUS_VARIANT = {
  in_progress: "warning",
  completed:   "success",
  abandoned:   "danger",
  terminated:  "terminated",
};
const STATUS_LABELS = {
  in_progress: "In Progress",
  completed:   "Completed",
  abandoned:   "Abandoned",
  terminated:  "Terminated",
};

const fmtTime = (s) => {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${Math.round(s % 60)}s` : `${Math.round(s)}s`;
};

const STAT_ICONS = ["🎯", "⭐", "✅", "⏱️"];

function StatCard({ label, value, sub, icon }) {
  return (
    <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 12, padding: "20px 20px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <p style={{ color: "#6b7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{label}</p>
        <span style={{ fontSize: 16 }}>{icon}</span>
      </div>
      <p style={{ color: "#f9fafb", fontSize: 30, fontWeight: 700, margin: 0, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ color: "#6b7280", fontSize: 12, margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, padding: "8px 12px", fontSize: 13, boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
      <p style={{ color: "#9ca3af", fontSize: 11, margin: "0 0 4px" }}>{label}</p>
      <p style={{ color: "#fff", fontWeight: 600, margin: 0 }}>{payload[0].value} pts</p>
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

  const trendData    = analytics?.score_trend.map((s, i) => ({ name: `#${i + 1}`, score: s.avg_score })) ?? [];
  const categoryData = analytics?.category_breakdown.map((c) => ({ name: c.category, score: c.avg_score })) ?? [];

  const statValues = [
    { label: "Total Interviews", value: analytics?.total_sessions ?? 0, sub: `${analytics?.completed_sessions ?? 0} completed` },
    { label: "Avg Score",        value: analytics?.overall_avg_score ?? "—", sub: "out of 100" },
    { label: "Completion Rate",  value: analytics?.total_sessions > 0 ? `${analytics.completion_rate}%` : "—", sub: "of sessions started" },
    { label: "Avg Time / Answer",value: fmtTime(analytics?.avg_time_per_answer_seconds), sub: "per question" },
  ];

  return (
    <div className="page-enter" style={{ minHeight: "100vh", background: "#111827", color: "#f9fafb" }}>
      <PageHeader
        left={<span style={{ fontSize: 16, fontWeight: 700, color: "#818cf8", letterSpacing: "-0.02em" }}>AI Mock Interview</span>}
        right={
          
<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
  <button
    onClick={() => navigate("/profile")}
    style={{
      color: "#6b7280", background: "none", border: "none",
      cursor: "pointer", fontSize: 13, padding: 0,
      transition: "color 0.15s",
    }}
    onMouseEnter={e => e.currentTarget.style.color = "#f9fafb"}
    onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}
  >
    {user?.full_name}
  </button>
  <Button variant="danger" size="sm" onClick={logout}>Log Out</Button>
</div>
        }
      />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 32px" }}>
        {/* Welcome row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>Welcome back, {user?.full_name} 👋</h2>
            <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>Here's how you're progressing</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary" onClick={() => navigate("/resume")}>📄 Resume</Button>
            <Button onClick={() => navigate("/interview/setup")}>+ New Interview</Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
            : statValues.map((s, i) => <StatCard key={s.label} {...s} icon={STAT_ICONS[i]} />)
          }
        </div>

        {/* Charts */}
        {loading ? (
          <div style={{ display: "flex", gap: 24, marginBottom: 28 }}>
            <SkeletonCard key="a" lines={4} />
            <SkeletonCard key="b" lines={4} />
          </div>
        ) : trendData.length > 0 || categoryData.length > 0 ? (
          <div style={{ display: "flex", gap: 24, marginBottom: 28 }}>
            {trendData.length > 0 && (
              <div style={{ flex: 1, background: "#1f2937", border: "1px solid #374151", borderRadius: 12, padding: 20 }}>
                <p style={{ fontWeight: 600, fontSize: 13, color: "#d1d5db", margin: "0 0 16px" }}>📈 Score Trend</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1", r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {categoryData.length > 0 && (
              <div style={{ flex: 1, background: "#1f2937", border: "1px solid #374151", borderRadius: 12, padding: 20 }}>
                <p style={{ fontWeight: 600, fontSize: 13, color: "#d1d5db", margin: "0 0 16px" }}>🏷️ Category Breakdown</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={categoryData} layout="vertical" margin={{ left: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fill: "#6b7280", fontSize: 10 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon="📊"
            title="No analytics yet"
            description="Complete an interview with AI feedback to see your performance charts here."
            style={{ marginBottom: 28 }}
          />
        )}

        {/* Past Sessions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <p style={{ fontWeight: 600, fontSize: 15, color: "#d1d5db", margin: 0 }}>Past Sessions</p>
          <span style={{ color: "#6b7280", fontSize: 13 }}>{sessions.length} total</span>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} lines={1} />)}
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon="🎯"
            title="No interviews yet"
            description="Click '+ New Interview' to start your first mock interview session."
            action={<Button onClick={() => navigate("/interview/setup")}>Start your first interview</Button>}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sessions.map((s) => (
              <div key={s.id} onClick={() => navigate(`/interview/${s.id}`)}
                style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 12, padding: "14px 20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.15s ease" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.background = "#1e2d3d"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#374151"; e.currentTarget.style.background = "#1f2937"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{TYPE_ICONS[s.interview_type] || "🎯"}</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>{s.role_title}</p>
                    <p style={{ color: "#6b7280", fontSize: 12, margin: "2px 0 0" }}>
                      {TYPE_LABELS[s.interview_type]} · {new Date(s.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant={STATUS_VARIANT[s.status] || "info"}>
                  {STATUS_LABELS[s.status] || s.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}