import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInterview } from "../api/interviews";
import { listQuestions } from "../api/questions";
import { listAnswers } from "../api/answers";
import { getIntegritySummary } from "../api/violations";
import AppLayout from "../components/AppLayout";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import useIsMobile from "../hooks/useIsMobile";

const TYPE_LABELS = {
  technical: "Technical", behavioral: "Behavioral", system_design: "System Design",
};

const VIOLATION_ROWS = [
  ["fullscreen_exits",      "Fullscreen exits"],
  ["tab_switches",          "Tab / window switches"],
  ["window_blurs",          "Window focus lost"],
  ["copy_attempts",         "Copy attempts"],
  ["cut_attempts",          "Cut attempts"],
  ["paste_attempts",        "Paste attempts"],
  ["context_menu_attempts", "Right-click attempts"],
];

const fmtTime = (s) => {
  if (!s) return "—";
  const m = Math.floor(s / 60), sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
};

export default function InterviewComplete() {
  const { sessionId } = useParams();
  const navigate      = useNavigate();
  const isMobile      = useIsMobile();

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
        setSession(sess); setQuestions(qs); setAnswers(as); setIntegrity(integ);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sessionId]);

  const getAnswer    = (qid) => answers.find((a) => a.question_id === qid);
  const isTerminated = session?.status === "terminated";
  const totalTime    = answers.reduce((s, a) => s + (a.time_taken_seconds || 0), 0);

  if (loading) return (
    <AppLayout>
      <div style={{ padding: isMobile ? "20px 16px" : "28px 32px", maxWidth: 760, display: "flex", flexDirection: "column", gap: 16, boxSizing: "border-box" }}>
        <Skeleton height={24} width="50%" />
        <Skeleton height={100} style={{ borderRadius: 14 }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} height={110} style={{ borderRadius: 12 }} />
        ))}
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="page-enter" style={{ padding: isMobile ? "20px 16px" : "28px 32px", boxSizing: "border-box" }}>
        {/* Page header */}
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: isMobile ? 10 : 0, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, margin: "0 0 4px" }}>
              {isTerminated ? "Interview Terminated" : "Interview Complete"}
            </h1>
            <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>
              {session?.role_title} · {TYPE_LABELS[session?.interview_type]}
            </p>
          </div>
          <Badge variant={isTerminated ? "danger" : "success"}>
            {isTerminated ? "⚠ Terminated" : "✓ Complete"}
          </Badge>
        </div>

        <div style={{ maxWidth: 760 }}>
          {/* Termination warning */}
          {isTerminated && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: 14, marginBottom: 20 }}>
              <p style={{ color: "#f87171", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                This interview was automatically ended after repeated integrity violations.{" "}
                {answers.length} of {questions.length} questions were answered before termination.
              </p>
            </div>
          )}

          {/* Summary card */}
          <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 14, padding: isMobile ? 16 : 22, marginBottom: 20, display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 14 : 0, justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center" }}>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>{session?.role_title}</h2>
              <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>
                {TYPE_LABELS[session?.interview_type]} · {questions.length} questions ·{" "}
                {new Date(session?.created_at).toLocaleDateString()}
              </p>
            </div>
            <div style={{ textAlign: isMobile ? "left" : "right" }}>
              <p style={{ color: "#6b7280", fontSize: 12, margin: "0 0 2px" }}>Total time</p>
              <p style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, margin: 0 }}>
                {fmtTime(totalTime)}
              </p>
            </div>
          </div>

          {/* Integrity Report */}
          {integrity && (
            <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 14, padding: isMobile ? 16 : 20, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 10 }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>🛡️ Integrity Report</h2>
                <Badge variant={integrity.status === "passed" ? "success" : "danger"}>
                  {integrity.status === "passed" ? "Passed" : "Violations Detected"}
                </Badge>
              </div>

              {integrity.total_violations === 0 ? (
                <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>
                  No violations detected. Clean interview session ✓
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {VIOLATION_ROWS.filter(([key]) => integrity[key] > 0).map(([key, label]) => (
                    <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#9ca3af", fontSize: 13 }}>{label}</span>
                      <Badge variant="danger">{integrity[key]}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Q&A List */}
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#d1d5db", margin: "0 0 14px" }}>Your Answers</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {questions.map((q, i) => {
              const ans = getAnswer(q.id);
              return (
                <div key={q.id} style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 12, overflow: "hidden" }}>
                  {/* Question row */}
                  <div style={{ padding: isMobile ? "12px 14px 8px" : "14px 18px 10px", display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ color: "#6366f1", fontWeight: 700, fontSize: 12, marginRight: 8 }}>
                        Q{i + 1}.
                      </span>
                      <span style={{ color: "#e5e7eb", fontSize: 14, lineHeight: 1.6 }}>
                        {q.question_text}
                      </span>
                    </div>
                    {ans && (
                      <span style={{ color: "#6b7280", fontSize: 12, fontFamily: "monospace", flexShrink: 0, marginTop: 2 }}>
                        {fmtTime(ans.time_taken_seconds)}
                      </span>
                    )}
                  </div>

                  {/* Answer row */}
                  <div style={{ borderTop: "1px solid #374151", padding: isMobile ? "10px 14px" : "10px 18px" }}>
                    <p style={{ color: "#6b7280", fontSize: 11, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Your answer
                    </p>
                    {ans ? (
                      <p style={{ color: "#d1d5db", fontSize: 13, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>
                        {ans.answer_text}
                      </p>
                    ) : (
                      <p style={{ color: "#4b5563", fontSize: 13, fontStyle: "italic", margin: 0 }}>
                        No answer submitted
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12 }}>
            <Button variant="secondary" onClick={() => navigate("/dashboard")} fullWidth={isMobile}>
              Back to Dashboard
            </Button>
            <Button onClick={() => navigate(`/interview/${sessionId}/feedback`)} fullWidth={isMobile}>
              Get AI Feedback →
            </Button>
          </div>
          <p style={{ color: "#6b7280", fontSize: 12, marginTop: 8 }}>Powered by Gemini AI</p>
        </div>
      </div>
    </AppLayout>
  );
}