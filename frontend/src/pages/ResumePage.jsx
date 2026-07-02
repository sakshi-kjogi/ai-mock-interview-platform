import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadResume, listResumes, analyzeResume, getResumeFeedback, startResumeInterview } from "../api/resumes";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import { Input } from "../components/ui/Input";
import { Skeleton } from "../components/ui/Skeleton";

const PRIORITY_VARIANT = { high: "danger", medium: "warning", low: "info" };
const ACTION_STYLE = {
  add:      { color: "#4ade80", icon: "+", label: "Add" },
  remove:   { color: "#f87171", icon: "−", label: "Remove" },
  rephrase: { color: "#818cf8", icon: "↺", label: "Rephrase" },
};
const INTERVIEW_TYPES = [
  { value: "technical",     label: "Technical",     icon: "💻" },
  { value: "behavioral",    label: "Behavioral",    icon: "🤝" },
  { value: "system_design", label: "System Design", icon: "🏗️" },
];

export default function ResumePage() {
  const navigate = useNavigate();
  const fileRef  = useRef();
  const [resumes,   setResumes]   = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [feedback,  setFeedback]  = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [starting,  setStarting]  = useState(false);
  const [error,     setError]     = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [iType,     setIType]     = useState("technical");
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    listResumes()
      .then((rs) => {
        setResumes(rs);
        if (rs.length > 0) {
          setSelected(rs[0]);
          getResumeFeedback(rs[0].id).then(setFeedback).catch(() => {});
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true); setError("");
    try {
      const r = await uploadResume(file);
      setResumes((p) => [r, ...p]);
      setSelected(r); setFeedback([]);
    } catch (err) { setError(err.response?.data?.detail || "Upload failed"); }
    finally { setUploading(false); }
  };

  const handleAnalyze = async () => {
    if (!selected) return;
    setAnalyzing(true); setError("");
    try { setFeedback(await analyzeResume(selected.id)); }
    catch (err) { setError(err.response?.data?.detail || "Analysis failed"); }
    finally { setAnalyzing(false); }
  };

  const handleStart = async () => {
    if (!roleTitle.trim()) { setError("Please enter a role title"); return; }
    setStarting(true); setError("");
    try {
      const r = await startResumeInterview(selected.id, { role_title: roleTitle.trim(), interview_type: iType });
      navigate(`/interview/${r.session_id}`);
    } catch (err) { setError(err.response?.data?.detail || "Failed to start interview"); }
    finally { setStarting(false); }
  };

  const skills = selected?.parsed_skills || {};

  return (
    <div className="page-enter" style={{ minHeight: "100vh", background: "#111827", color: "#f9fafb" }}>
      <PageHeader
        left={
          <button onClick={() => navigate("/dashboard")}
            style={{ color: "#6b7280", background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = "#f9fafb"}
            onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}>
            ← Dashboard
          </button>
        }
        center={<span style={{ fontSize: 14, fontWeight: 600, color: "#9ca3af" }}>Resume</span>}
        right={
          <>
            <Button size="sm" loading={uploading} onClick={() => fileRef.current?.click()}>
              {uploading ? "Uploading..." : "Upload PDF"}
            </Button>
            <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={handleUpload} />
          </>
        }
      />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "36px 32px" }}>
        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
            <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Skeleton height={120} style={{ borderRadius: 16 }} />
            <Skeleton height={200} style={{ borderRadius: 16 }} />
          </div>
        ) : resumes.length === 0 ? (
          <EmptyState
            icon="📄"
            title="No resume uploaded yet"
            description="Upload a PDF resume to get AI-powered improvement suggestions and tailored interview questions based on your actual experience."
            action={
              <>
                <Button size="lg" loading={uploading} onClick={() => fileRef.current?.click()}>
                  Upload Your Resume
                </Button>
                <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={handleUpload} />
              </>
            }
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Resume info */}
            <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 16, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📄</div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>{selected.file_url.split(":")[1] || "Resume"}</p>
                    <p style={{ color: "#6b7280", fontSize: 12, margin: "2px 0 0" }}>Uploaded {new Date(selected.uploaded_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <Badge variant="success">Parsed ✓</Badge>
              </div>

              {(skills.technical?.length > 0 || skills.soft?.length > 0) ? (
                <>
                  <p style={{ color: "#6b7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>Detected Skills</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                    {skills.technical?.map((s) => (
                      <span key={s} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 6, background: "rgba(99,102,241,0.15)", color: "#818cf8", fontWeight: 500 }}>{s}</span>
                    ))}
                    {skills.soft?.map((s) => (
                      <span key={s} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 6, background: "rgba(34,197,94,0.1)", color: "#4ade80", fontWeight: 500 }}>{s}</span>
                    ))}
                  </div>
                  <p style={{ color: "#6b7280", fontSize: 11, margin: 0 }}>Purple = technical · Green = soft skills</p>
                </>
              ) : (
                <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>
                  No common skills detected. The PDF may use non-standard formatting.
                </p>
              )}
            </div>

            {/* Analysis */}
            <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 16, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: feedback.length > 0 ? 16 : 0 }}>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 3px" }}>Resume Improvement Suggestions</h2>
                  {feedback.length === 0 && <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>AI-powered feedback to strengthen your resume</p>}
                </div>
                <Button variant={feedback.length > 0 ? "secondary" : "primary"} size="sm" loading={analyzing} onClick={handleAnalyze}>
                  {analyzing ? "Analysing..." : feedback.length > 0 ? "↺ Re-analyse" : "✨ Analyse"}
                </Button>
              </div>

              {feedback.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {feedback.map((f) => {
                    const a = ACTION_STYLE[f.action_type] || ACTION_STYLE.rephrase;
                    return (
                      <div key={f.id} style={{ display: "flex", gap: 12, padding: 14, background: "#111827", borderRadius: 10, border: "1px solid #374151", alignItems: "flex-start" }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: `${a.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: a.color, flexShrink: 0 }}>
                          {a.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                            <Badge variant="info" style={{ fontSize: 10 }}>{f.category}</Badge>
                            <Badge variant={PRIORITY_VARIANT[f.priority] || "info"} style={{ fontSize: 10 }}>{f.priority} priority</Badge>
                          </div>
                          <p style={{ color: "#d1d5db", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{f.suggestion_text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Start Interview */}
            <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>Start Resume-Based Interview</h2>
              <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 20px" }}>
                Questions will be tailored to your resume content and work experience.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Input label="Target Role" placeholder="e.g. Senior Backend Developer" value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} />

                <div>
                  <label style={{ color: "#9ca3af", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 8 }}>Interview Type</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {INTERVIEW_TYPES.map((t) => (
                      <button key={t.value} onClick={() => setIType(t.value)}
                        style={{
                          flex: 1, padding: "10px 0", borderRadius: 8, fontSize: 13, cursor: "pointer",
                          border: `1px solid ${iType === t.value ? "#6366f1" : "#374151"}`,
                          background: iType === t.value ? "rgba(99,102,241,0.15)" : "#111827",
                          color: iType === t.value ? "#818cf8" : "#6b7280",
                          fontWeight: iType === t.value ? 600 : 400,
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                          transition: "all 0.15s ease",
                        }}>
                        <span style={{ fontSize: 18 }}>{t.icon}</span>
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button fullWidth size="lg" loading={starting} onClick={handleStart}>
                  {starting ? "Starting interview..." : "Start Resume Interview →"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}