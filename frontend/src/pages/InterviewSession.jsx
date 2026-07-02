import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInterview } from "../api/interviews";
import { generateQuestions, listQuestions } from "../api/questions";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import { Skeleton } from "../components/ui/Skeleton";

const TYPE_LABELS = { technical: "Technical", behavioral: "Behavioral", system_design: "System Design" };
const CATEGORY_COLORS = {
  algorithms:        { bg: "rgba(59,130,246,0.15)",  color: "#60a5fa" },
  "data structures": { bg: "rgba(139,92,246,0.15)", color: "#a78bfa" },
  "system design":   { bg: "rgba(249,115,22,0.15)", color: "#fb923c" },
  "language-specific":{ bg: "rgba(34,197,94,0.15)", color: "#4ade80" },
  "problem solving": { bg: "rgba(234,179,8,0.15)",  color: "#fbbf24" },
  leadership:        { bg: "rgba(239,68,68,0.15)",  color: "#f87171" },
  teamwork:          { bg: "rgba(20,184,166,0.15)", color: "#2dd4bf" },
  scalability:       { bg: "rgba(236,72,153,0.15)", color: "#f472b6" },
};
const categoryStyle = (cat) => CATEGORY_COLORS[cat?.toLowerCase()] || { bg: "rgba(99,102,241,0.15)", color: "#818cf8" };

export default function InterviewSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session,     setSession]     = useState(null);
  const [questions,   setQuestions]   = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [generating,  setGenerating]  = useState(false);
  const [error,       setError]       = useState("");

  useEffect(() => {
    Promise.all([getInterview(id), listQuestions(id)])
      .then(([sess, qs]) => { setSession(sess); setQuestions(qs); })
      .catch(() => setError("Session not found"))
      .finally(() => setPageLoading(false));
  }, [id]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      const qs = await generateQuestions(id);
      setQuestions(qs);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate questions");
    } finally {
      setGenerating(false);
    }
  };

  if (pageLoading) return (
    <div style={{ minHeight: "100vh", background: "#111827" }}>
      <div style={{ borderBottom: "1px solid #1f2937", height: 56 }} />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
        <Skeleton height={24} width="40%" />
        <Skeleton height={14} width="25%" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={80} style={{ borderRadius: 12 }} />)}
      </div>
    </div>
  );

  if (error && !session) return (
    <div style={{ minHeight: "100vh", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexDirection: "column", gap: 12 }}>
      <p style={{ color: "#f87171" }}>{error}</p>
      <Button variant="ghost" onClick={() => navigate("/dashboard")}>← Dashboard</Button>
    </div>
  );

  return (
    <div className="page-enter" style={{ minHeight: "100vh", background: "#111827", color: "#f9fafb" }}>
      <PageHeader
        left={
          <button onClick={() => navigate("/dashboard")}
            style={{ color: "#6b7280", background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = "#f9fafb"}
            onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}>
            ← Dashboard
          </button>
        }
        right={
          <div style={{ textAlign: "right" }}>
            <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>{session?.role_title}</p>
            <p style={{ color: "#6b7280", fontSize: 12, margin: 0 }}>{TYPE_LABELS[session?.interview_type]} Interview</p>
          </div>
        }
      />

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 32px" }}>
        {questions.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 48 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32 }}>🤖</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>Ready to generate questions</h2>
            <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 28, maxWidth: 360, margin: "0 auto 28px" }}>
              Gemini AI will create 5 tailored {TYPE_LABELS[session?.interview_type]?.toLowerCase()} interview questions for the <strong style={{ color: "#f9fafb" }}>{session?.role_title}</strong> role.
            </p>
            {error && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 16 }}>{error}</p>}
            <Button loading={generating} onClick={handleGenerate} size="lg">
              {generating ? "Generating questions..." : "✨ Generate Questions"}
            </Button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Interview Questions</h2>
                <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>{questions.length} questions · {TYPE_LABELS[session?.interview_type]}</p>
              </div>
              <Button variant="secondary" size="sm" loading={generating} onClick={handleGenerate}>
                {generating ? "Regenerating..." : "↺ Regenerate"}
              </Button>
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {questions.map((q, i) => {
                const cs = categoryStyle(q.category);
                return (
                  <div key={q.id} style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 12, padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                      <span style={{ color: "#6366f1", fontWeight: 700, fontSize: 15, minWidth: 28, flexShrink: 0 }}>{i + 1}.</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: "#f9fafb", fontSize: 14, lineHeight: 1.6, margin: "0 0 10px" }}>{q.question_text}</p>
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

            <Button fullWidth size="lg" onClick={() => navigate(`/interview/${id}/rules`)}>
              Begin Answering →
            </Button>
          </>
        )}
      </div>
    </div>
  );
}