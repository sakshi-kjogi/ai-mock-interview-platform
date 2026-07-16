import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getDashboardAnalytics } from "../api/analytics";
import AppLayout from "../components/AppLayout";
import { SkeletonStatCard, SkeletonCard } from "../components/ui/Skeleton";
import useIsMobile from "../hooks/useIsMobile";

function StatCard({ label, value, sub, icon }) {
  return (
    <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 14, padding: 20, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <p style={{ color: "#6b7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{label}</p>
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <p style={{ color: "#f9fafb", fontSize: 32, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ color: "#6b7280", fontSize: 12, margin: 0 }}>{sub}</p>}
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

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "technical", label: "Technical" },
  { value: "behavioral", label: "Behavioral" },
  { value: "system_design", label: "System Design" },
];

export default function AnalyticsPage() {
  const isMobile = useIsMobile();
  const [typeFilter, setTypeFilter] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getDashboardAnalytics(typeFilter || undefined)
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [typeFilter]);

  const trendData    = analytics?.score_trend.map((s, i) => ({ name: s.role_title?.slice(0, 12) || `Session ${i + 1}`, score: s.avg_score })) ?? [];
  const categoryData = analytics?.category_breakdown.map((c) => ({ name: c.category, score: c.avg_score, count: c.count })) ?? [];

  return (
    <AppLayout>
      <div className="page-enter" style={{ padding: isMobile ? "20px 16px" : "28px 32px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 14 : 0, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, margin: "0 0 4px" }}>Analytics</h1>
            <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>Deep dive into your interview performance</p>
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            style={{ background: "#1f2937", border: "1px solid #374151", color: "#e5e7eb", borderRadius: 8, padding: "9px 12px", fontSize: 13, cursor: "pointer", outline: "none", width: isMobile ? "100%" : "auto" }}>
            {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {loading ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: isMobile ? 12 : 16, marginBottom: 24 }}>
              {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
            </div>
            <SkeletonCard lines={6} />
          </>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: isMobile ? 12 : 16, marginBottom: 24 }}>
              <StatCard label="Total Sessions" value={analytics?.total_sessions ?? 0} sub={`${analytics?.completed_sessions ?? 0} completed`} icon="🎯" />
              <StatCard label="Completion Rate" value={`${analytics?.completion_rate ?? 0}%`} sub="of sessions finished" icon="✅" />
              <StatCard label="Average Score" value={analytics?.overall_avg_score ? `${analytics.overall_avg_score}%` : "—"} sub="across all answers" icon="⭐" />
              <StatCard label="Avg Time / Answer" value={analytics?.avg_time_per_answer_seconds ? `${Math.round(analytics.avg_time_per_answer_seconds)}s` : "—"} sub="per question" icon="⏱️" />
            </div>

            {trendData.length === 0 && categoryData.length === 0 ? (
              <div style={{ background: "#1f2937", border: "1px dashed #374151", borderRadius: 14, padding: 40, textAlign: "center" }}>
                <p style={{ color: "#6b7280", fontSize: 14 }}>No completed interviews with feedback yet for this filter.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 20 }}>
                {trendData.length > 0 && (
                  <div style={{ flex: isMobile ? "none" : 2, background: "#1f2937", border: "1px solid #374151", borderRadius: 14, padding: isMobile ? 16 : 20, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 20px" }}>Score Trend (last 10 sessions)</p>
                    <ResponsiveContainer width="100%" height={260}>
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
                  <div style={{ flex: isMobile ? "none" : 1, background: "#1f2937", border: "1px solid #374151", borderRadius: 14, padding: isMobile ? 16 : 20, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 20px" }}>Skill Breakdown</p>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={categoryData} layout="vertical" margin={{ left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 10 }} />
                        <YAxis type="category" dataKey="name" width={110} tick={{ fill: "#6b7280", fontSize: 10 }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="score" radius={[0, 4, 4, 0]} fill="#6366f1" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
