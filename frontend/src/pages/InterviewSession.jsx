import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInterview } from "../api/interviews";
import { generateQuestions, listQuestions } from "../api/questions";
import AppLayout from "../components/AppLayout";
import Button from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import useIsMobile from "../hooks/useIsMobile";

const TYPE_LABELS = { technical: "Technical", behavioral: "Behavioral", system_design: "System Design" };
const CATEGORY_COLORS = {
  algorithms:          { bg: "rgba(59,130,246,0.15)",  color: "#60a5fa" },
  "data structures":   { bg: "rgba(139,92,246,0.15)",  color: "#a78bfa" },
  "system design":     { bg: "rgba(249,115,22,0.15)",  color: "#fb923c" },
  "language-specific": { bg: "rgba(34,197,94,0.15)",   color: "#4ade80" },
  "problem solving":   { bg: "rgba(234,179,8,0.15)",   color: "#fbbf24" },
  leadership:          { bg: "rgba(239,68,68,0.15)",   color: "#f87171" },
  teamwork:            { bg: "rgba(20,184,166,0.15)",  color: "#2dd4bf" },
  scalability:         { bg: "rgba(236,72,153,0.15)",  color: "#f472b6" },
};
const catStyle = (cat) => CATEGORY_COLORS[cat?.toLowerCase()] || { bg: "rgba(99,102,241,0.15)", color: "#818cf8" };

export default function InterviewSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [session,     setSession]     = useState(null);
  const [questions,   setQuestions]   = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [generating,  setGenerating]  = useState(false);
  const [error,       setError]       = useState("");

  useEffect(() => {
    Promise.all([getInterview(id), listQuestions(id)])
      .then(([s, qs]) => { setSession(s); setQuestions(qs); })
      .catch(() => setError("Session not found"))
      .finally(() => setPageLoading(false));
  }, [id]);

  const handleGenerate = async () => {
    setGenerating(true); setError("");
    try { setQuestions(await generateQuestions(id)); }
    catch (err) { setError(err.response?.data?.detail || "Failed to generate questions"); }
    finally { setGenerating(false); }
  };

  if (pageLoading) return (
    <AppLayout>
      <div style={{ padding: isMobile ? "20px 16px" : "28px 32px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 700, boxSizing: "border-box" }}>
        <Skeleton height={24} width="40%" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={80} style={{ borderRadius: 12 }} />)}
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="page-enter" style={{ padding: isMobile ? "20px 16px" : "28px 32px", boxSizing: "border-box" }}>
        <button onClick={() => navigate("/dashboard")}
          style={{ color: "#6b7280", background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: "0 0 20px" }}
          onMouseEnter={e => e.currentTarget.style.color = "#f9fafb"}
          onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}>
          ← Dashboard
        </button>

        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 12 : 0, marginBottom: 24 }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, margin: "0 0 4px" }}>{session?.role_title} Interview</h1>
            <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>{TYPE_LABELS[session?.interview_type]} · {questions.length} questions</p>
          </div>
          {questions.length > 0 && (
            <Button variant="secondary" size="sm" loading={generating} onClick={handleGenerate} fullWidth={isMobile}>
              ↺ Regenerate
            </Button>
          )}
        </div>

        {questions.length === 0 ? (
          <div style={{ textAlign: "center", padding: isMobile ? "40px 16px" : "60px 32px" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32 }}>🤖</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>Ready to generate questions</h2>
            <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 24px" }}>
              Gemini AI will create tailored questions for <strong style={{ color: "#f9fafb" }}>{session?.role_title}</strong>.
            </p>
            {error && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 16 }}>{error}</p>}
            <Button loading={generating} onClick={handleGenerate} size="lg" fullWidth={isMobile}>
              ✨ Generate Questions
            </Button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28, maxWidth: 700 }}>
              {questions.map((q, i) => {
                const cs = catStyle(q.category);
                return (
                  <div key={q.id} style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 12, padding: isMobile ? 14 : 18 }}>
                    <div style={{ display: "flex", gap: isMobile ? 10 : 14, alignItems: "flex-start" }}>
                      <span style={{ color: "#6366f1", fontWeight: 700, fontSize: 14, minWidth: 26, flexShrink: 0 }}>Q{i + 1}.</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 10px" }}>{q.question_text}</p>
                        {q.category && (
                          <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: cs.bg, color: cs.color, fontWeight: 500 }}>
                            {q.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button size="lg" onClick={() => navigate(`/interview/${id}/rules`)} fullWidth={isMobile}>
              Begin Answering →
            </Button>
          </>
        )}
      </div>
    </AppLayout>
  );
}