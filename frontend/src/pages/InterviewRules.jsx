import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listQuestions } from "../api/questions";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";

const RULES = [
  { icon: "🖥️", title: "Fullscreen is required", desc: "The interview runs in fullscreen mode. Exiting counts as a violation.", severity: "high" },
  { icon: "👁️", title: "Tab switching is monitored", desc: "Switching tabs, minimizing, or losing window focus is detected and logged.", severity: "high" },
  { icon: "📋", title: "Copy & paste are disabled", desc: "Copy, cut, paste, and right-click are blocked during the interview.", severity: "medium" },
  { icon: "⚠️", title: "Violations are limited to 3", desc: "After 3 violations the interview automatically ends and progress is saved.", severity: "high" },
];

export default function InterviewRules() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [acknowledged, setAcknowledged] = useState(false);
  const [starting,     setStarting]     = useState(false);
  const [error,        setError]        = useState("");

  const handleBegin = async () => {
    setError("");
    setStarting(true);
    try {
      await document.documentElement.requestFullscreen();
      const qs = await listQuestions(id);
      if (qs.length === 0) { setError("No questions found for this session."); setStarting(false); return; }
      navigate(`/interview/${id}/answer/${qs[0].id}`);
    } catch {
      setError("Fullscreen permission is required to begin. Please allow fullscreen and try again.");
      setStarting(false);
    }
  };

  return (
    <div className="page-enter" style={{ minHeight: "100vh", background: "#111827", color: "#f9fafb" }}>
      <PageHeader
        left={
          <button onClick={() => navigate(`/interview/${id}`)}
            style={{ color: "#6b7280", background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = "#f9fafb"}
            onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}>
            ← Back
          </button>
        }
        center={<span style={{ fontSize: 14, fontWeight: 600, color: "#9ca3af" }}>Interview Rules</span>}
      />

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>📋</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Before You Begin</h1>
          <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
            This is a monitored interview session. Please read and acknowledge the rules below.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {RULES.map(({ icon, title, desc, severity }) => (
            <div key={title} style={{
              display: "flex", gap: 14, padding: "16px",
              background: "#1f2937", border: `1px solid ${severity === "high" ? "rgba(99,102,241,0.3)" : "#374151"}`,
              borderRadius: 10, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 3px" }}>{title}</p>
                <p style={{ color: "#6b7280", fontSize: 13, margin: 0, lineHeight: 1.5 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 10, padding: 14, marginBottom: 24 }}>
          <p style={{ color: "#6b7280", fontSize: 12, margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: "#9ca3af" }}>Note:</strong> OS-level shortcuts like Alt+Tab cannot be intercepted by a browser for security reasons. We detect their effect — tab and window changes — rather than the keypress itself.
          </p>
        </div>

        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20, cursor: "pointer" }}>
          <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} style={{ marginTop: 2, accentColor: "#6366f1" }} />
          <span style={{ fontSize: 14, color: "#d1d5db", lineHeight: 1.5 }}>
            I have read and understood the interview rules. I agree to proceed under these conditions.
          </span>
        </label>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
            <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>
          </div>
        )}

        <Button fullWidth size="lg" disabled={!acknowledged} loading={starting} onClick={handleBegin}>
          {starting ? "Entering fullscreen..." : "🖥️ Enter Fullscreen & Begin"}
        </Button>
      </div>
    </div>
  );
}