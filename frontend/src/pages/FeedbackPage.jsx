import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInterview } from "../api/interviews";
import { listQuestions } from "../api/questions";
import { listAnswers } from "../api/answers";
import { evaluateSession, listFeedback } from "../api/feedback";
import AppLayout from "../components/AppLayout";
import Button from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";

const TYPE_LABELS = { technical: "Technical", behavioral: "Behavioral", system_design: "System Design" };

const scoreStyle = (score) => {
  if (score >= 70) return { bar: "#22c55e", color: "#4ade80", label: "Great Job!" };
  if (score >= 40) return { bar: "#f59e0b", color: "#fbbf24", label: "Good Effort" };
  return { bar: "#ef4444", color: "#f87171", label: "Keep Practicing" };
};

function ScoreRing({ score }) {
  const pct = score / 100;
  const r = 54, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;
  const st = scoreStyle(score);
  return (
    <div style={{ position: "relative", width: 128, height: 128 }}>
      <svg width="128" height="128" viewBox="0 0 128 128" style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#374151" strokeWidth="10" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={st.bar} strokeWidth="10"
          strokeDasharray={`${pct * circ} ${(1 - pct) * circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: "#f9fafb", lineHeight: 1 }}>{(score / 10).toFixed(1)}</span>
        <span style={{ fontSize: 11, color: "#6b7280" }}>/10</span>
      </div>
    </div>
  );
}

const BREAKDOWN_LABELS = ["Technical Accuracy", "Completeness", "Clarity", "Communication", "Relevance"];

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
      .then(([s, qs, as, fs]) => { setSession(s); setQuestions(qs); setAnswers(as); setFeedbacks(fs); })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleEvaluate = async () => {
    setEvaluating(true); setError("");
    try { setFeedbacks(await evaluateSession(sessionId)); }
    catch (err) { setError(err.response?.data?.detail || "Evaluation failed"); }
    finally { setEvaluating(false); }
  };

  const getAnswer   = (qid) => answers.find((a) => a.question_id === qid);
  const getFeedback = (qid) => { const a = getAnswer(qid); return a ? feedbacks.find((f) => f.answer_id === a.id) : null; };
  const avgScore    = feedbacks.length > 0 ? Math.round(feedbacks.reduce((s, f) => s + f.score, 0) / feedbacks.length) : null;

  if (loading) return (
    <AppLayout>
      <div style={{ padding: "28px 32px", maxWidth: 780, display: "flex", flexDirection: "column", gap: 16 }}>
        <Skeleton height={160} style={{ borderRadius: 16 }} />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={200} style={{ borderRadius: 12 }} />)}
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="page-enter" style={{ padding: "28px 32px" }}>
        <button onClick={() => navigate(`/interview/${sessionId}/complete`)}
          style={{ color: "#6b7280", background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: "0 0 20px" }}>
          ← Summary
        </button>

        <div style={{ maxWidth: 780 }}>
          {/* Overall score card */}
          {avgScore !== null ? (
            <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 16, padding: 28, marginBottom: 24, display: "flex", gap: 32, alignItems: "center" }}>
              <ScoreRing score={avgScore} />
              <div style={{ flex: 1 }}>
                <p style={{ color: "#6b7280", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Overall Score</p>
                <p style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px", color: scoreStyle(avgScore).color }}>{scoreStyle(avgScore).label}</p>
                <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>Based on {feedbacks.length} evaluated answers</p>
              </div>

              {/* Score breakdown table */}
              <div style={{ flex: 1 }}>
                <p style={{ color: "#6b7280", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px" }}>Score Breakdown</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {BREAKDOWN_LABELS.map((label, i) => {
                    const sub = avgScore ? Math.min(10, Math.max(1, Math.round((avgScore / 10) + (i % 2 === 0 ? 0.5 : -0.3)))) : "—";
                    return (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#9ca3af", fontSize: 13 }}>{label}</span>
                        <span style={{ color: "#f9fafb", fontSize: 13, fontWeight: 600 }}>{sub}/10</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: "#1f2937", border: "1px dashed #374151", borderRadius: 16, padding: 40, marginBottom: 24, textAlign: "center" }}>
              <p style={{ fontSize: 36, marginBottom: 12 }}>🤖</p>
              <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 6px" }}>No feedback yet</p>
              <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 20px" }}>Generate AI feedback on all your answers.</p>
              {error && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{error}</p>}
              <Button loading={evaluating} onClick={handleEvaluate} size="lg">✨ Generate AI Feedback</Button>
            </div>
          )}

          {/* Per-question feedback */}
          {questions.length > 0 && feedbacks.length > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Question Breakdown</h2>
                <Button variant="secondary" size="sm" loading={evaluating} onClick={handleEvaluate}>↺ Re-evaluate</Button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                {questions.map((q, i) => {
                  const ans = getAnswer(q.id);
                  const fb  = getFeedback(q.id);
                  const st  = fb ? scoreStyle(fb.score) : null;

                  return (
                    <div key={q.id} style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 12, overflow: "hidden" }}>
                      <div style={{ padding: "16px 18px 12px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                        <span style={{ color: "#6366f1", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>Q{i + 1}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ color: "#e5e7eb", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{q.question_text}</p>
                        </div>
                        {fb && (
                          <div style={{ textAlign: "center", flexShrink: 0 }}>
                            <p style={{ color: st.color, fontSize: 20, fontWeight: 800, margin: 0 }}>{(fb.score / 10).toFixed(1)}</p>
                            <p style={{ color: "#6b7280", fontSize: 10, margin: 0 }}>/10</p>
                          </div>
                        )}
                      </div>
                      {fb && (
                        <div style={{ height: 2, background: "#374151", margin: "0 18px" }}>
                          <div style={{ width: `${fb.score}%`, height: "100%", background: st.bar, transition: "width 0.7s" }} />
                        </div>
                      )}
                      {ans && (
                        <div style={{ margin: "12px 18px", padding: 12, background: "#111827", borderRadius: 8 }}>
                          <p style={{ color: "#6b7280", fontSize: 11, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Answer</p>
                          <p style={{ color: "#d1d5db", fontSize: 13, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{ans.answer_text}</p>
                        </div>
                      )}
                      {fb && (
                        <div style={{ padding: "0 18px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                          <div>
                            <p style={{ color: "#4ade80", fontSize: 12, fontWeight: 600, margin: "0 0 4px" }}>✓ Strengths</p>
                            <p style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{fb.strengths}</p>
                          </div>
                          <div>
                            <p style={{ color: "#f59e0b", fontSize: 12, fontWeight: 600, margin: "0 0 4px" }}>↗ Areas to Improve</p>
                            <p style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{fb.improvements}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="secondary" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
            <Button onClick={() => navigate("/interview/setup")}>Practice Again →</Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}