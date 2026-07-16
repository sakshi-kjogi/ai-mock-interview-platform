import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createInterview, updateInterviewStatus } from "../api/interviews";
import { generateQuestions } from "../api/questions";
import { submitAnswer } from "../api/answers";
import { evaluateSession } from "../api/feedback";
import AppLayout from "../components/AppLayout";
import Button from "../components/ui/Button";
import useIsMobile from "../hooks/useIsMobile";

const TYPES = ["technical", "behavioral", "system_design"];
const TYPE_LABELS = { technical: "Technical", behavioral: "Behavioral", system_design: "System Design" };

export default function PracticePage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [stage, setStage] = useState("idle"); // idle | loading | answering | submitting | result
  const [session, setSession] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [startedAt, setStartedAt] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState("");

  const startQuickPractice = async () => {
    setError("");
    setStage("loading");
    try {
      const randomType = TYPES[Math.floor(Math.random() * TYPES.length)];
      const newSession = await createInterview({ role_title: "Quick Practice", interview_type: randomType });
      const questions = await generateQuestions(newSession.id, 1);
      setSession(newSession);
      setQuestion(questions[0]);
      setAnswerText("");
      setStartedAt(Date.now());
      setStage("answering");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to start quick practice");
      setStage("idle");
    }
  };

  const submitQuickAnswer = async () => {
    if (!answerText.trim()) { setError("Write an answer before submitting"); return; }
    setError("");
    setStage("submitting");
    try {
      const timeTaken = Math.round((Date.now() - startedAt) / 1000);
      await submitAnswer(session.id, question.id, { answer_text: answerText.trim(), time_taken_seconds: timeTaken });
      await updateInterviewStatus(session.id, "completed");
      const results = await evaluateSession(session.id);
      setFeedback(results[0]);
      setStage("result");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit answer");
      setStage("answering");
    }
  };

  const reset = () => {
    setStage("idle");
    setSession(null);
    setQuestion(null);
    setAnswerText("");
    setFeedback(null);
    setError("");
  };

  return (
    <AppLayout>
      <div className="page-enter" style={{ padding: isMobile ? "20px 16px" : "28px 32px", maxWidth: 720, boxSizing: "border-box" }}>
        <h1 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, margin: "0 0 4px" }}>Practice</h1>
        <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 24px" }}>Warm up with a quick question, or start a full mock interview</p>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
            <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Full interview option */}
        <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 14, padding: isMobile ? 18 : 24, marginBottom: 20, display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: 15, margin: "0 0 4px" }}>🎯 Full Mock Interview</p>
            <p style={{ color: "#6b7280", fontSize: 13, margin: 0, lineHeight: 1.5 }}>Complete setup, timed answers, fullscreen integrity monitoring, and detailed AI feedback.</p>
          </div>
          <Button onClick={() => navigate("/interview/setup")} fullWidth={isMobile}>Start Full Interview →</Button>
        </div>

        {/* Quick Practice option */}
        <div style={{ background: "#1f2937", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 14, padding: isMobile ? 18 : 24 }}>
          {stage === "idle" && (
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 15, margin: "0 0 4px" }}>⚡ Quick Practice</p>
                <p style={{ color: "#6b7280", fontSize: 13, margin: 0, lineHeight: 1.5 }}>One random question, right now. No setup, no timer, no fullscreen — just practice.</p>
              </div>
              <Button variant="secondary" onClick={startQuickPractice} fullWidth={isMobile}>Start Quick Practice</Button>
            </div>
          )}

          {stage === "loading" && (
            <p style={{ color: "#6b7280", fontSize: 14, textAlign: "center", padding: "20px 0" }}>Generating your question...</p>
          )}

          {(stage === "answering" || stage === "submitting") && question && (
            <div>
              <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 999, background: "rgba(99,102,241,0.15)", color: "#818cf8", fontWeight: 500 }}>
                {TYPE_LABELS[session?.interview_type]}
              </span>
              <p style={{ fontSize: 15, lineHeight: 1.7, margin: "14px 0 18px" }}>{question.question_text}</p>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Type your answer here..."
                rows={6}
                style={{ width: "100%", padding: "12px 14px", boxSizing: "border-box", background: "#111827", border: "1px solid #374151", borderRadius: 10, color: "#fff", fontSize: 14, lineHeight: 1.6, resize: "none", outline: "none", fontFamily: "inherit", marginBottom: 14 }}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <Button onClick={submitQuickAnswer} loading={stage === "submitting"} fullWidth>
                  {stage === "submitting" ? "Evaluating..." : "Submit Answer"}
                </Button>
              </div>
            </div>
          )}

          {stage === "result" && feedback && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: feedback.score >= 70 ? "#4ade80" : feedback.score >= 40 ? "#fbbf24" : "#f87171" }}>
                  {(feedback.score / 10).toFixed(1)}<span style={{ fontSize: 14, color: "#6b7280" }}>/10</span>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <p style={{ color: "#4ade80", fontSize: 12, fontWeight: 600, margin: "0 0 4px" }}>✓ Strengths</p>
                <p style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{feedback.strengths}</p>
              </div>
              <div style={{ marginBottom: 20 }}>
                <p style={{ color: "#f59e0b", fontSize: 12, fontWeight: 600, margin: "0 0 4px" }}>↗ Areas to Improve</p>
                <p style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{feedback.improvements}</p>
              </div>
              <Button onClick={reset} fullWidth>Try Another →</Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
