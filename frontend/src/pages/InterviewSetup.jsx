import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createInterview } from "../api/interviews";
import AppLayout from "../components/AppLayout";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const INTERVIEW_TYPES = [
  { value: "technical",     label: "Technical",     icon: "💻" },
  { value: "behavioral",    label: "Behavioral",    icon: "🤝" },
  { value: "system_design", label: "System Design", icon: "🏗️" },
];

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [roleTitle,     setRoleTitle]     = useState("");
  const [interviewType, setInterviewType] = useState("technical");
  const [error,         setError]         = useState("");
  const [loading,       setLoading]       = useState(false);

  const handleSubmit = async () => {
    if (!roleTitle.trim()) { setError("Please enter a role title"); return; }
    setError(""); setLoading(true);
    try {
      const session = await createInterview({ role_title: roleTitle.trim(), interview_type: interviewType });
      navigate(`/interview/${session.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create session");
    } finally { setLoading(false); }
  };

  return (
    <AppLayout>
      <div className="page-enter" style={{ padding: "28px 32px", maxWidth: 640 }}>
        <button onClick={() => navigate("/dashboard")}
          style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b7280", background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: 0, marginBottom: 24 }}
          onMouseEnter={e => e.currentTarget.style.color = "#f9fafb"}
          onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}>
          ← Back
        </button>

        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>Create New Interview</h1>
        <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 28px" }}>Configure your interview preferences</p>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
            <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Input label="Job Role" placeholder="e.g. Frontend Developer" value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} />

          <div>
            <label style={{ color: "#9ca3af", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 10 }}>Interview Type</label>
            <div style={{ display: "flex", gap: 10 }}>
              {INTERVIEW_TYPES.map((t) => (
                <button key={t.value} onClick={() => setInterviewType(t.value)}
                  style={{
                    flex: 1, padding: "12px 8px", borderRadius: 10, cursor: "pointer",
                    border: `2px solid ${interviewType === t.value ? "#6366f1" : "#374151"}`,
                    background: interviewType === t.value ? "rgba(99,102,241,0.1)" : "#1f2937",
                    color: interviewType === t.value ? "#818cf8" : "#6b7280",
                    fontWeight: interviewType === t.value ? 600 : 400,
                    fontSize: 13, transition: "all 0.15s",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  }}>
                  <span style={{ fontSize: 20 }}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <Button fullWidth size="lg" loading={loading} onClick={handleSubmit}>
            {loading ? "Creating..." : "Start Interview"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}