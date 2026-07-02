import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createInterview } from "../api/interviews";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import PageHeader from "../components/ui/PageHeader";

const INTERVIEW_TYPES = [
  { value: "technical",     label: "Technical",     icon: "💻", desc: "Data structures, algorithms, coding problems" },
  { value: "behavioral",    label: "Behavioral",    icon: "🤝", desc: "Situational questions using the STAR method" },
  { value: "system_design", label: "System Design", icon: "🏗️", desc: "Architecture, scalability, trade-offs" },
];

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [roleTitle,     setRoleTitle]     = useState("");
  const [interviewType, setInterviewType] = useState("technical");
  const [error,         setError]         = useState("");
  const [loading,       setLoading]       = useState(false);

  const handleSubmit = async () => {
    if (!roleTitle.trim()) { setError("Please enter a role title"); return; }
    setError("");
    setLoading(true);
    try {
      const session = await createInterview({ role_title: roleTitle.trim(), interview_type: interviewType });
      navigate(`/interview/${session.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{ minHeight: "100vh", background: "#111827", color: "#f9fafb" }}>
      <PageHeader
        left={
          <button onClick={() => navigate("/dashboard")}
            style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b7280", background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 0, transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#f9fafb"}
            onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}>
            ← Dashboard
          </button>
        }
        center={<span style={{ fontSize: 14, fontWeight: 600, color: "#9ca3af" }}>New Interview</span>}
      />

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 32px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 6px" }}>Set Up Your Interview</h1>
          <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
            Choose your role and interview style. AI will generate tailored questions.
          </p>
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
            <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Input
            label="Role Title"
            placeholder="e.g. Backend Developer, Product Manager, Data Scientist"
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
          />

          <div>
            <label style={{ color: "#9ca3af", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 10 }}>
              Interview Type
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {INTERVIEW_TYPES.map((t) => (
                <div key={t.value} onClick={() => setInterviewType(t.value)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px", borderRadius: 10, cursor: "pointer",
                    border: `1px solid ${interviewType === t.value ? "#6366f1" : "#374151"}`,
                    background: interviewType === t.value ? "rgba(99,102,241,0.1)" : "#1f2937",
                    transition: "all 0.15s ease",
                  }}>
                  <span style={{ fontSize: 22 }}>{t.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, margin: 0, color: interviewType === t.value ? "#818cf8" : "#f9fafb" }}>{t.label}</p>
                    <p style={{ color: "#6b7280", fontSize: 12, margin: "2px 0 0" }}>{t.desc}</p>
                  </div>
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    border: `2px solid ${interviewType === t.value ? "#6366f1" : "#374151"}`,
                    background: interviewType === t.value ? "#6366f1" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "all 0.15s ease",
                  }}>
                    {interviewType === t.value && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button fullWidth size="lg" loading={loading} onClick={handleSubmit} style={{ marginTop: 8 }}>
            {loading ? "Creating session..." : "Create Interview Session →"}
          </Button>
        </div>
      </div>
    </div>
  );
}