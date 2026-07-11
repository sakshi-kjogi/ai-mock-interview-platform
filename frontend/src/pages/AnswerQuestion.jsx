import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listQuestions } from "../api/questions";
import { listAnswers, submitAnswer } from "../api/answers";
import { updateInterviewStatus } from "../api/interviews";
import { logViolation } from "../api/violations";
import { useVoiceRecording } from "../hooks/useVoiceRecording";
import { useIntegrityMonitor } from "../hooks/useIntegrityMonitor";
import VoiceButton from "../components/VoiceButton";
import useIsMobile from "../hooks/useIsMobile";

const formatTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const VIOLATION_LABELS = {
  fullscreen_exit: "Exited fullscreen",
  tab_switch:      "Switched tabs / minimized",
  window_blur:     "Lost window focus",
  copy_attempt:    "Attempted to copy",
  cut_attempt:     "Attempted to cut",
  paste_attempt:   "Attempted to paste",
  context_menu:    "Right-click blocked",
};

export default function AnswerQuestion() {
  const { sessionId, questionId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [questions,  setQuestions]  = useState([]);
  const [answerText, setAnswerText] = useState("");
  const [time,       setTime]       = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [banner,     setBanner]     = useState(null); // { label, count }
  const timerRef  = useRef(null);
  const bannerRef = useRef(null);

  const currentIndex = questions.findIndex(
    (q) => q.id.toLowerCase().trim() === questionId.toLowerCase().trim()
  );
  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex !== -1 && currentIndex === questions.length - 1;

  // ── Voice recording ──────────────────────────────────────────────────────
  const handleTranscript = useCallback((text) => {
    setAnswerText((prev) => (prev ? `${prev} ${text}` : text));
  }, []);
  const { isRecording, isSupported, interimText, toggle, stop: stopVoice } =
    useVoiceRecording({ onTranscript: handleTranscript });

  // ── Integrity monitoring ─────────────────────────────────────────────────
  const handleViolation = useCallback((type, count) => {
    setBanner({ label: VIOLATION_LABELS[type] || type, count });
    logViolation(sessionId, { violation_type: type, question_id: questionId });

    clearTimeout(bannerRef.current);
    bannerRef.current = setTimeout(() => setBanner(null), 4000);
  }, [sessionId, questionId]);

  const handleMaxViolations = useCallback(async () => {
    clearInterval(timerRef.current);
    stopVoice();
    exitFullscreenIntentionally();
    try {
      if (answerText.trim()) {
        await submitAnswer(sessionId, questionId, {
          answer_text: answerText.trim(),
          time_taken_seconds: time,
        });
      }
      await updateInterviewStatus(sessionId, "terminated");
    } finally {
      navigate(`/interview/${sessionId}/complete`);
    }
  }, [sessionId, questionId, answerText, time, navigate]); // eslint-disable-line

  const { isFullscreen, requestFullscreen, exitFullscreenIntentionally } =
    useIntegrityMonitor({
      enabled: true,
      onViolation: handleViolation,
      onMaxViolationsReached: handleMaxViolations,
    });

  // ── Load questions + existing answer on question change ─────────────────
  useEffect(() => {
    stopVoice();
    setLoading(true);
    setTime(0);
    setAnswerText("");
    setError("");

    Promise.all([listQuestions(sessionId), listAnswers(sessionId)])
      .then(([qs, as]) => {
        setQuestions(qs);
        const existing = as.find(
          (a) => a.question_id.toLowerCase().trim() === questionId.toLowerCase().trim()
        );
        if (existing) setAnswerText(existing.answer_text);
      })
      .catch(() => setError("Failed to load question"))
      .finally(() => setLoading(false));
  }, [sessionId, questionId]); // eslint-disable-line

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [loading, questionId]);

  // ── Exit Interview (voluntary — marks abandoned, not terminated) ─────────
  const handleExit = async () => {
    clearInterval(timerRef.current);
    stopVoice();
    exitFullscreenIntentionally();
    await updateInterviewStatus(sessionId, "abandoned").catch(() => {});
    navigate("/dashboard");
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!answerText.trim()) { setError("Please write or speak an answer before submitting"); return; }
    if (currentIndex === -1) { setError("Question index error — please refresh the page"); return; }

    stopVoice();
    setError("");
    setSubmitting(true);
    clearInterval(timerRef.current);

    try {
      await submitAnswer(sessionId, questionId, {
        answer_text: answerText.trim(),
        time_taken_seconds: time,
      });

      if (isLast) {
        exitFullscreenIntentionally();
        await updateInterviewStatus(sessionId, "completed");
        navigate(`/interview/${sessionId}/complete`);
      } else {
        navigate(`/interview/${sessionId}/answer/${questions[currentIndex + 1].id}`);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit answer — check your connection");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
      Loading question...
    </div>
  );

  if (!currentQuestion) return (
    <div style={{ minHeight: "100vh", background: "#111827", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", gap: 16 }}>
      <p style={{ color: "#f87171" }}>Question not found</p>
      <button onClick={() => navigate("/dashboard")} style={{ color: "#818cf8", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>
        Back to Dashboard
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#111827", color: "#fff", display: "flex", flexDirection: "column", position: "relative", overflowX: "hidden" }}>

      {/* Violation toast */}
      {banner && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          background: "#7f1d1d", border: "1px solid #ef4444", color: "#fff",
          padding: "10px 20px", borderRadius: 10, fontSize: 13, zIndex: 100,
          display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          maxWidth: "90vw", boxSizing: "border-box",
        }}>
          <span>⚠️</span>
          <span><strong>{banner.label}</strong> — Violation {banner.count} of 3</span>
        </div>
      )}

      {/* Fullscreen gate overlay */}
      {!isFullscreen && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 90, padding: 20, boxSizing: "border-box",
        }}>
          <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 16, padding: 32, textAlign: "center", maxWidth: 360, width: "100%" }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>🖥️</p>
            <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Fullscreen Required</p>
            <p style={{ color: "#9ca3af", fontSize: 13, marginBottom: 20 }}>
              You must remain in fullscreen mode to continue this interview.
            </p>
            <button onClick={requestFullscreen}
              style={{ background: "#4f46e5", border: "none", color: "#fff", padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Resume Fullscreen
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      {isMobile ? (
        <div style={{ borderBottom: "1px solid #1f2937", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button onClick={handleExit}
              style={{ color: "#9ca3af", background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: 0 }}>
              Exit
            </button>
            <span style={{ color: "#9ca3af", fontSize: 13 }}>
              Q{currentIndex + 1} of {questions.length}
            </span>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#1f2937", padding: "5px 10px", borderRadius: 8,
              fontSize: 12, fontFamily: "monospace",
              border: isRecording ? "1px solid rgba(239,68,68,0.5)" : "1px solid transparent",
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: isRecording ? "#ef4444" : "#4ade80",
                display: "inline-block",
                animation: isRecording ? "pulse 1.2s infinite" : "none",
              }} />
              {isRecording ? "Rec" : formatTime(time)}
              <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.3)} }`}</style>
            </div>
          </div>
          {/* Compact progress bar instead of individual dots to avoid overflow */}
          <div style={{ height: 4, background: "#1f2937", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              width: `${((currentIndex + 1) / Math.max(questions.length, 1)) * 100}%`,
              height: "100%", background: "#6366f1", borderRadius: 2, transition: "width 0.3s ease",
            }} />
          </div>
        </div>
      ) : (
        <div style={{ borderBottom: "1px solid #1f2937", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={handleExit}
            style={{ color: "#9ca3af", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>
            Exit Interview
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {questions.map((q, i) => (
                <div key={q.id} style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: i === currentIndex ? "#6366f1" : i < currentIndex ? "#22c55e" : "#374151",
                }} />
              ))}
            </div>
            <span style={{ color: "#9ca3af", fontSize: 14 }}>
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#1f2937", padding: "6px 12px", borderRadius: 8,
            fontSize: 13, fontFamily: "monospace",
            border: isRecording ? "1px solid rgba(239,68,68,0.5)" : "1px solid transparent",
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: isRecording ? "#ef4444" : "#4ade80",
              display: "inline-block",
              animation: isRecording ? "pulse 1.2s infinite" : "none",
            }} />
            {isRecording ? "Recording..." : formatTime(time)}
            <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.3)} }`}</style>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, maxWidth: 768, margin: "0 auto", width: "100%", padding: isMobile ? "20px 16px" : "40px 32px", display: "flex", flexDirection: "column", gap: isMobile ? 16 : 24, boxSizing: "border-box" }}>

        {currentQuestion.category && (
          <span style={{ alignSelf: "flex-start", fontSize: 12, padding: "4px 12px", borderRadius: 999, background: "rgba(99,102,241,0.15)", color: "#818cf8" }}>
            {currentQuestion.category}
          </span>
        )}

        <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 16, padding: isMobile ? 16 : 24 }}>
          <p style={{ color: "#6b7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Question</p>
          <p style={{ fontSize: isMobile ? 15 : 17, lineHeight: 1.7, margin: 0 }}>{currentQuestion.question_text}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label style={{ color: "#9ca3af", fontSize: 13 }}>Your Answer</label>
            <VoiceButton isRecording={isRecording} isSupported={isSupported} onClick={toggle} />
          </div>

          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder={isSupported
              ? "Type your answer, or click '🎤 Speak Answer' to use your voice..."
              : "Type your answer here..."}
            rows={isMobile ? 7 : 9}
            style={{
              width: "100%", padding: isMobile ? "10px 12px" : "12px 16px", boxSizing: "border-box",
              background: "#1f2937", border: `1px solid ${isRecording ? "#6366f1" : "#374151"}`,
              borderRadius: 12, color: "#fff", fontSize: 15, lineHeight: 1.6,
              resize: "none", outline: "none", fontFamily: "inherit",
            }}
          />

          {interimText && (
            <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, padding: "8px 12px" }}>
              <p style={{ color: "#6b7280", fontSize: 11, marginBottom: 4 }}>Listening...</p>
              <p style={{ color: "#9ca3af", fontSize: 14, fontStyle: "italic", margin: 0 }}>{interimText}</p>
            </div>
          )}

          {!isSupported && (
            <p style={{ color: "#6b7280", fontSize: 12 }}>
              Voice input requires Chrome or Edge. Use the text area to type your answer.
            </p>
          )}
        </div>

        {error && <p style={{ color: "#f87171", fontSize: 14 }}>{error}</p>}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => currentIndex > 0 && navigate(`/interview/${sessionId}/answer/${questions[currentIndex - 1].id}`)}
            disabled={currentIndex === 0}
            style={{ padding: isMobile ? "10px 14px" : "10px 20px", borderRadius: 8, fontSize: 13, cursor: "pointer", border: "1px solid #4b5563", background: "transparent", color: "#fff", opacity: currentIndex === 0 ? 0.3 : 1, flexShrink: 0 }}
          >
            ← {isMobile ? "" : "Previous"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ padding: isMobile ? "10px 20px" : "10px 32px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none", background: submitting ? "#4338ca" : "#4f46e5", color: "#fff", opacity: submitting ? 0.6 : 1, flex: isMobile ? 1 : "none" }}
          >
            {submitting ? "Saving..." : isLast ? "Submit & Finish ✓" : "Submit & Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}