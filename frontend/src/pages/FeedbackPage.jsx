import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInterview } from "../api/interviews";
import { listQuestions } from "../api/questions";
import { listAnswers } from "../api/answers";
import { evaluateSession, listFeedback } from "../api/feedback";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import { Skeleton } from "../components/ui/Skeleton";

const TYPE_LABELS = { technical: "Technical", behavioral: "Behavioral", system_design: "System Design" };

const scoreStyle = (score) => {
  if (score >= 70) return { bar: "#22c55e", badge: "success", color: "#22c55e", label: "Strong" };
  if (score >= 40) return { bar: "#f59e0b", badge: "warning", color: "#f59e0b", label: "Adequate" };
  return { bar: "#ef4444", badge: "danger", color: "#ef4444", label: "Needs Work" };
};

function ScoreRing({ score }) {
  const { color } = scoreStyle(score);
  const r = 15.9;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: 100, height: 100 }}>
      <svg width="100" height="100" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx="18" cy="18" r={r} fill="none" stroke="#374151" strokeWidth="3" />
        <circle cx="18" cy="18" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 9, color: "#6b7280", marginTop: 2 }}>/ 100</span>
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session,   setSession]   = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers,   setAnswers]   = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [evaluating,setEvaluating]= useState(false);
  const [error,     setError]     = useState("");

  useEffect(() => {
    Promise.all([getInterview(sessionId), listQuestions(sessionId), listAnswers(sessionId), listFeedback(sessionId)])
      .then(([sess, qs, as, fs]) => { setSession(sess); setQuestions(qs); setAnswers(as); setFeedbacks(fs); })
      .catch(() => setError("Failed to load feedback"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleEvaluate = async () => {
    setEvaluating(true);
    setError("");
    try { setFeedbacks(await evaluateSession(sessionId)); }
    catch (err) { setError(err.response?.data?.detail || "Evaluation failed"); }
    finally { setEvaluating(false); }
  };

  const getAnswer   = (qid) => answers.find((a) => a.question_id === qid);
  const getFeedback = (qid) => { const a = getAnswer(qid); return a ? feedbacks.find((f) => f.answer_id === a.id) : null; };
  const avgScore    = feedbacks.length > 0 ? Math.round(feedbacks.reduce((s, f) => s + f.score, 0) / feedbacks.length) : null;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#111827" }}>
      <div style={{ borderBottom: "1px solid #1f2937", height: 56 }} />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
        <Skeleton height={100} style={{ borderRadius: 16 }} />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={160} style={{ borderRadius: 12 }} />)}
      </div>
    </div>
  );

  return (
    <div className="page-enter" style={{ minHeight: "100vh", background: "#111827", color: "#f9fafb" }}>
      <PageHeader
        left={
          <button onClick={() => navigate(`/interview/${sessionId}/complete`)}
            style={{ color: "#6b7280", background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = "#f9fafb"}
            onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}>
            ← Summary
          </button>
        }
        right={
          <div style={{ textAlign: "right" }}>
            <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>{session?.role_title}</p>
            <p style={{ color: "#6b7280", fontSize: 12, margin: 0 }}>{TYPE_LABELS[session?.interview_type]} Interview</p>
          </div>
        }
      />

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "36px 32px" }}>
        {/* Score Card */}
        {avgScore !== null ? (
          <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 16, padding: 28, marginBottom: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
            <ScoreRing score={avgScore} />
            <div>
              <p style={{ color: "#6b7280", fontSize: 12, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Overall Score</p>
              <p style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>
                {avgScore >= 70 ? "Strong Performance 🎉" : avgScore >= 40 ? "Good Effort 👍" : "Keep Practicing 💪"}
              </p>
              <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>
                Based on {feedbacks.length} evaluated answer{feedbacks.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ background: "#1f2937", border: "1px dashed #374151", borderRadius: 16, padding: 40, marginBottom: 24, textAlign: "center" }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>🤖</p>
            <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 6px" }}>No feedback generated yet</p>
            <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 20 }}>Click below to have AI evaluate all your answers.</p>
            {error && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <Button loading={evaluating} onClick={handleEvaluate} size="lg">
              {evaluating ? "Evaluating answers..." : "✨ Generate AI Feedback"}
            </Button>
          </div>
        )}

        {/* Per-question Feedback */}
        {questions.length > 0 && feedbacks.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#d1d5db", margin: 0 }}>Question Breakdown</h2>
              <Button variant="secondary" size="sm" loading={evaluating} onClick={handleEvaluate}>
                {evaluating ? "Re-evaluating..." : "↺ Re-evaluate"}
              </Button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {questions.map((q, i) => {
                const ans = getAnswer(q.id);
                const fb  = getFeedback(q.id);
                const st  = fb ? scoreStyle(fb.score) : null;

                return (
                  <div key={q.id} style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 12, overflow: "hidden" }}>
                    {/* Header */}
                    <div style={{ padding: "16px 18px 12px", display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ color: "#6366f1", fontWeight: 700, fontSize: 12, marginRight: 8 }}>Q{i + 1}</span>
                        <span style={{ color: "#e5e7eb", fontSize: 14, lineHeight: 1.6 }}>{q.question_text}</span>
                      </div>
                      {fb && (
                        <div style={{ flexShrink: 0, textAlign: "center" }}>
                          <Badge variant={st.badge} style={{ fontSize: 14, padding: "4px 12px" }}>{fb.score}</Badge>
                          <p style={{ color: st.color, fontSize: 11, margin: "4px 0 0", fontWeight: 500 }}>{st.label}</p>
                        </div>
                      )}
                    </div>

                    {/* Score bar */}
                    {fb && (
                      <div style={{ padding: "0 18px 12px" }}>
                        <div style={{ height: 3, background: "#374151", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${fb.score}%`, height: "100%", background: st.bar, borderRadius: 2, transition: "width 0.8s ease" }} />
                        </div>
                      </div>
                    )}

                    {/* Answer */}
                    {ans && (
                      <div style={{ margin: "0 18px 12px", padding: 12, background: "#111827", borderRadius: 8 }}>
                        <p style={{ color: "#6b7280", fontSize: 11, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Your answer</p>
                        <p style={{ color: "#d1d5db", fontSize: 13, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{ans.answer_text}</p>
                      </div>
                    )}

                    {/* Feedback */}
                    {fb && (
                      <div style={{ padding: "0 18px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{ borderLeft: "3px solid #22c55e", paddingLeft: 12 }}>
                          <p style={{ color: "#4ade80", fontSize: 11, fontWeight: 600, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>✓ Strengths</p>
                          <p style={{ color: "#d1d5db", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{fb.strengths}</p>
                        </div>
                        <div style={{ borderLeft: "3px solid #f59e0b", paddingLeft: 12 }}>
                          <p style={{ color: "#fbbf24", fontSize: 11, fontWeight: 600, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>↗ Areas to Improve</p>
                          <p style={{ color: "#d1d5db", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{fb.improvements}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Button variant="secondary" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          <Button onClick={() => navigate("/interview/setup")}>Practice Again →</Button>
        </div>
      </div>
    </div>
  );
}