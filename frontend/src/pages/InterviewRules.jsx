import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listQuestions } from "../api/questions";

const RULES = [
  ["🖥️", "Fullscreen is required", "The interview runs in fullscreen mode. Exiting fullscreen counts as a violation."],
  ["🔄", "Tab switching is monitored", "Switching tabs, minimizing, or losing window focus is detected and logged."],
  ["📋", "Copy & paste are disabled", "Copy, cut, paste, and right-click are blocked during the interview."],
  ["⚠️", "Violations are limited", "After 3 violations, the interview automatically ends and your progress is saved."],
];

export default function InterviewRules() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [acknowledged, setAcknowledged] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const handleBegin = async () => {
    setError("");
    setStarting(true);
    try {
      // Must be called directly inside this click handler — browsers reject
      // requestFullscreen() calls that don't originate from a user gesture.
      await document.documentElement.requestFullscreen();

      const qs = await listQuestions(id);
      if (qs.length === 0) {
        setError("No questions found for this session.");
        setStarting(false);
        return;
      }
      navigate(`/interview/${id}/answer/${qs[0].id}`);
    } catch (e) {
      setError("Fullscreen permission is required to begin. Please allow fullscreen and try again.");
      setStarting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#111827", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ maxWidth: 560, width: "100%" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Interview Rules</h1>
        <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 24 }}>
          This is a monitored interview session. Please review the rules below before starting.
        </p>

        <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 16, padding: 24, marginBottom: 24 }}>
          {RULES.map(([icon, title, desc]) => (
            <div key={title} style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>{title}</p>
                <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 2 }}>{desc}</p>
              </div>
            </div>
          ))}
          <p style={{ color: "#6b7280", fontSize: 12, marginTop: 8, borderTop: "1px solid #374151", paddingTop: 12 }}>
            Note: OS-level shortcuts like Alt+Tab cannot be intercepted by a browser for security reasons.
            We detect their effect — tab and window changes — rather than the keypress itself.
          </p>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, cursor: "pointer" }}>
          <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} />
          <span style={{ fontSize: 14, color: "#d1d5db" }}>I understand and agree to these interview rules.</span>
        </label>

        {error && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 16 }}>{error}</p>}

        <button
          onClick={handleBegin}
          disabled={!acknowledged || starting}
          style={{
            width: "100%", padding: "12px 0", borderRadius: 8, fontSize: 15, fontWeight: 600,
            border: "none", cursor: acknowledged ? "pointer" : "not-allowed",
            background: acknowledged ? "#4f46e5" : "#374151", color: "#fff",
            opacity: starting ? 0.7 : 1,
          }}
        >
          {starting ? "Entering fullscreen..." : "Enter Fullscreen & Begin Interview"}
        </button>
      </div>
    </div>
  );
}