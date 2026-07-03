import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../context/AuthContext";
import { listInterviews } from "../api/interviews";
import { getDashboardAnalytics } from "../api/analytics";
import AppLayout from "../components/AppLayout";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { SkeletonStatCard, SkeletonCard } from "../components/ui/Skeleton";

const TYPE_LABELS   = { technical: "Technical", behavioral: "Behavioral", system_design: "System Design" };
const TYPE_ICONS    = { technical: "💻", behavioral: "🤝", system_design: "🏗️" };
const STATUS_VARIANT = { in_progress: "warning", completed: "success", abandoned: "danger", terminated: "danger" };
const STATUS_LABELS  = { in_progress: "In Progress", completed: "Completed", abandoned: "Abandoned", terminated: "Terminated" };

const fmtTime = (s) => {
  if (!s) return "—";
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

function StatCard({ label, value, sub, icon, trend }) {
  return (
    <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 14, padding: 20, flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <p style={{ color: "#6b7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{label}</p>
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <p style={{ color: "#f9fafb", fontSize: 32, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ color: "#6b7280", fontSize: 12, margin: 0 }}>{sub}</p>}
      {trend && <p style={{ color: "#4ade80", fontSize: 11, margin: "6px 0 0" }}>{trend}</p>}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, padding: "8px 12px", fontSize: 13, boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
      <p style={{ color: "#6b7280", fontSize: 11, margin: "0 0 4px" }}>{label}</p>
      <p style={{ color: "#fff", fontWeight: 600, margin: 0 }}>{payload[0].value} pts</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
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

  const trendData    = analytics?.score_trend.map((s, i) => ({ name: `May ${i + 1}`, score: s.avg_score })) ?? [];
  const categoryData = analytics?.category_breakdown.map((c) => ({ name: c.category, score: c.avg_score })) ?? [];

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <AppLayout>
      <div className="page-enter" style={{ padding: "28px 32px" }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 2px" }}>{greeting}, {user?.full_name?.split(" ")[0]} 👋</h1>
            <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>Ready for your next interview?</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 8, borderRadius: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </button>
            <Button onClick={() => navigate("/interview/setup")}>+ New Interview</Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />) : [
            { label: "Total Interviews", value: analytics?.total_sessions ?? 0, sub: `${analytics?.completed_sessions ?? 0} completed`, icon: "🎯", trend: "+12% this month" },
            { label: "Average Score", value: analytics?.overall_avg_score ? `${analytics.overall_avg_score}%` : "—", sub: "across all sessions", icon: "⭐", trend: "+5% this month" },
            { label: "Strongest Skill", value: categoryData[0]?.name?.split(" ")[0] || "—", sub: `${categoryData[0]?.score || 0}% score`, icon: "🏆" },
            { label: "Total Practice Time", value: fmtTime(analytics?.avg_time_per_answer_seconds ? analytics.avg_time_per_answer_seconds * (analytics.total_sessions * 5) : 0), sub: "total time spent", icon: "⏱️" },
          ].map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Charts */}
        {loading ? (
          <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
            <SkeletonCard lines={4} /><SkeletonCard lines={4} />
          </div>
        ) : trendData.length > 0 || categoryData.length > 0 ? (
          <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
            {trendData.length > 0 && (
              <div style={{ flex: 2, background: "#1f2937", border: "1px solid #374151", borderRadius: 14, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 2px" }}>Performance Overview</p>
                    <p style={{ color: "#6b7280", fontSize: 12, margin: 0 }}>Last 30 days</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1", r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {categoryData.length > 0 && (
              <div style={{ flex: 1, background: "#1f2937", border: "1px solid #374151", borderRadius: 14, padding: 20 }}>
                <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 20px" }}>Skill Breakdown</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={categoryData} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" width={90} tick={{ fill: "#6b7280", fontSize: 10 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: "#1f2937", border: "1px dashed #374151", borderRadius: 14, padding: 28, textAlign: "center", marginBottom: 24 }}>
            <p style={{ color: "#6b7280", fontSize: 14 }}>Complete an interview with feedback to see your performance charts.</p>
          </div>
        )}

        {/* Sessions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <p style={{ fontWeight: 600, fontSize: 15, color: "#d1d5db", margin: 0 }}>Recent Interviews</p>
          <span style={{ color: "#6b7280", fontSize: 13 }}>{sessions.length} total</span>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} lines={1} />)}
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ border: "1px dashed #374151", borderRadius: 14, padding: 40, textAlign: "center" }}>
            <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 6px" }}>No interviews yet</p>
            <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 20px" }}>Start your first mock interview to track your progress.</p>
            <Button onClick={() => navigate("/interview/setup")}>Start First Interview</Button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sessions.slice(0, 8).map((s) => (
              <div key={s.id} onClick={() => navigate(`/interview/${s.id}`)}
                style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 12, padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.background = "#1e2d3d"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#374151"; e.currentTarget.style.background = "#1f2937"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 18 }}>{TYPE_ICONS[s.interview_type] || "🎯"}</span>
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
    </AppLayout>
  );
}