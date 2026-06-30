import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInterview } from "../api/interviews";
import { listQuestions } from "../api/questions";
import { listAnswers } from "../api/answers";
import { getIntegritySummary } from "../api/violations";

const TYPE_LABELS = { technical: "Technical", behavioral: "Behavioral", system_design: "System Design" };

const VIOLATION_ROWS = [
  ["fullscreen_exits",       "Fullscreen exits"],
  ["tab_switches",           "Tab / window switches"],
  ["window_blurs",           "Window focus lost"],
  ["copy_attempts",          "Copy attempts"],
  ["cut_attempts",           "Cut attempts"],
  ["paste_attempts",         "Paste attempts"],
  ["context_menu_attempts",  "Right-click attempts"],
];

const formatTime = (s) => {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
};

export default function InterviewComplete() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session,   setSession]   = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers,   setAnswers]   = useState([]);
  const [integrity, setIntegrity] = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      getInterview(sessionId),
      listQuestions(sessionId),
      listAnswers(sessionId),
      getIntegritySummary(sessionId),
    ])
      .then(([sess, qs, as, integ]) => {
        setSession(sess);
        setQuestions(qs);
        setAnswers(as);
        setIntegrity(integ);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sessionId]);

  const getAnswer = (questionId) => answers.find((a) => a.question_id === questionId);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
      Loading results...
    </div>
  );

  const isTerminated = session?.status === "terminated";

  return (
    <div style={{ minHeight: "100vh", background: "#111827", color: "#fff" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1f2937", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate("/dashboard")} style={{ color: "#9ca3af", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>
          ← Dashboard
        </button>
        <span style={{ color: isTerminated ? "#f87171" : "#4ade80", fontSize: 14, fontWeight: 500 }}>
          {isTerminated ? "⚠ Interview Terminated" : "✓ Interview Complete"}
        </span>
      </div>

      <div style={{ maxWidth: 768, margin: "0 auto", padding: "40px 32px" }}>

        {isTerminated && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid #ef4444", borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <p style={{ color: "#f87171", fontSize: 14, margin: 0 }}>
              This interview was automatically ended after repeated integrity violations.
              {" "}{answers.length} of {questions.length} questions were answered before termination.
            </p>
          </div>
        )}

        {/* Summary Card */}
        <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 16, padding: 24, marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{session?.role_title}</h1>
            <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 4 }}>
              {TYPE_LABELS[session?.interview_type]} · {questions.length} questions · {new Date(session?.created_at).toLocaleDateString()}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ color: "#9ca3af", fontSize: 13 }}>Total time</p>
            <p style={{ fontFamily: "monospace", fontSize: 16, margin: 0 }}>
              {formatTime(answers.reduce((sum, a) => sum + (a.time_taken_seconds || 0), 0))}
            </p>
          </div>
        </div>

        {/* Integrity Report */}
        {integrity && (
          <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Integrity Report</h2>
              <span style={{
                fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 999,
                background: integrity.status === "passed" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                color: integrity.status === "passed" ? "#4ade80" : "#f87171",
              }}>
                {integrity.status === "passed" ? "Passed" : "Violations Detected"}
              </span>
            </div>

            {integrity.total_violations === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: 13 }}>
                No fullscreen exits, tab switches, or copy/paste attempts were detected during this interview.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {VIOLATION_ROWS.filter(([key]) => integrity[key] > 0).map(([key, label]) => (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#9ca3af" }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>{integrity[key]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Q&A List */}
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#d1d5db", marginBottom: 16 }}>Your Answers</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 32 }}>
          {questions.map((q, i) => {
            const ans = getAnswer(q.id);
            return (
              <div key={q.id} style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 12, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ color: "#818cf8", fontWeight: 700 }}>Q{i + 1}.</span>
                  {ans && <span style={{ color: "#6b7280", fontSize: 12, fontFamily: "monospace" }}>{formatTime(ans.time_taken_seconds)}</span>}
                </div>
                <p style={{ color: "#e5e7eb", marginBottom: 12 }}>{q.question_text}</p>
                <div style={{ borderTop: "1px solid #374151", paddingTop: 12 }}>
                  <p style={{ color: "#6b7280", fontSize: 12, marginBottom: 4 }}>Your answer</p>
                  <p style={{ color: "#d1d5db", fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {ans?.answer_text || <span style={{ color: "#6b7280", fontStyle: "italic" }}>No answer submitted</span>}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center" }}>
          <button onClick={() => navigate(`/interview/${sessionId}/feedback`)}
            style={{ background: "#4f46e5", border: "none", color: "#fff", padding: "12px 32px", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            Get AI Feedback →
          </button>
          <p style={{ color: "#6b7280", fontSize: 12, marginTop: 8 }}>Powered by Gemini AI</p>
        </div>
      </div>
    </div>
  );
}