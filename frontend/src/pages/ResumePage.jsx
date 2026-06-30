import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  uploadResume, listResumes, analyzeResume,
  getResumeFeedback, startResumeInterview,
} from "../api/resumes";

const PRIORITY_STYLE = {
  high:   { color: "#f87171", bg: "rgba(239,68,68,0.1)",   label: "High" },
  medium: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  label: "Medium" },
  low:    { color: "#6b7280", bg: "rgba(107,114,128,0.1)", label: "Low" },
};

const ACTION_STYLE = {
  add:      { color: "#4ade80", icon: "+" },
  remove:   { color: "#f87171", icon: "−" },
  rephrase: { color: "#818cf8", icon: "↺" },
};

const INTERVIEW_TYPES = [
  { value: "technical",     label: "Technical" },
  { value: "behavioral",    label: "Behavioral" },
  { value: "system_design", label: "System Design" },
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
    setUploading(true);
    setError("");
    try {
      const resume = await uploadResume(file);
      setResumes((prev) => [resume, ...prev]);
      setSelected(resume);
      setFeedback([]);
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selected) return;
    setAnalyzing(true);
    setError("");
    try {
      const fb = await analyzeResume(selected.id);
      setFeedback(fb);
    } catch (err) {
      setError(err.response?.data?.detail || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStart = async () => {
    if (!roleTitle.trim()) { setError("Please enter a role title"); return; }
    setStarting(true);
    setError("");
    try {
      const result = await startResumeInterview(selected.id, {
        role_title: roleTitle.trim(),
        interview_type: iType,
      });
      navigate(`/interview/${result.session_id}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to start interview");
    } finally {
      setStarting(false);
    }
  };

  const skills = selected?.parsed_skills || {};

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
      Loading...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#111827", color: "#fff" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1f2937", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate("/dashboard")}
          style={{ color: "#9ca3af", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>
          ← Dashboard
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Resume</h1>
        <button onClick={() => fileRef.current?.click()}
          style={{ background: "#4f46e5", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
          {uploading ? "Uploading..." : "Upload PDF"}
        </button>
        <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={handleUpload} />
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 32px" }}>
        {error && <p style={{ color: "#f87171", fontSize: 14, marginBottom: 16 }}>{error}</p>}

        {/* No resume yet */}
        {resumes.length === 0 && (
          <div style={{ border: "2px dashed #374151", borderRadius: 16, padding: 60, textAlign: "center" }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>📄</p>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No resume uploaded yet</p>
            <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>
              Upload a PDF resume to get AI-powered improvement suggestions and tailored interview questions.
            </p>
            <button onClick={() => fileRef.current?.click()}
              style={{ background: "#4f46e5", border: "none", color: "#fff", padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              {uploading ? "Uploading..." : "Upload Your Resume"}
            </button>
          </div>
        )}

        {/* Resume loaded */}
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Resume info card */}
            <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 16, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 28 }}>📄</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 16, margin: 0 }}>
                      {selected.file_url.split(":")[1] || "Resume"}
                    </p>
                    <p style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>
                      Uploaded {new Date(selected.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", fontSize: 12, padding: "4px 12px", borderRadius: 999 }}>
                  Parsed ✓
                </span>
              </div>

              {(skills.technical?.length > 0 || skills.soft?.length > 0) && (
                <>
                  <p style={{ color: "#9ca3af", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                    Detected Skills
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {skills.technical?.map((s) => (
                      <span key={s} style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8", fontSize: 12, padding: "4px 10px", borderRadius: 6 }}>
                        {s}
                      </span>
                    ))}
                    {skills.soft?.map((s) => (
                      <span key={s} style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80", fontSize: 12, padding: "4px 10px", borderRadius: 6 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                  <p style={{ color: "#6b7280", fontSize: 11, marginTop: 8 }}>
                    Purple = technical · Green = soft skills
                  </p>
                </>
              )}

              {!skills.technical?.length && !skills.soft?.length && (
                <p style={{ color: "#6b7280", fontSize: 13 }}>
                  No common skills detected. The PDF may use non-standard formatting.
                </p>
              )}
            </div>

            {/* Resume Analysis */}
            <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 16, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Resume Improvement Suggestions</h2>
                <button onClick={handleAnalyze} disabled={analyzing}
                  style={{ background: analyzing ? "#312e81" : "#4f46e5", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 600, opacity: analyzing ? 0.7 : 1 }}>
                  {analyzing ? "Analysing..." : feedback.length > 0 ? "↺ Re-analyse" : "✨ Analyse Resume"}
                </button>
              </div>

              {feedback.length === 0 ? (
                <p style={{ color: "#6b7280", fontSize: 13 }}>
                  Click "Analyse Resume" to get AI-powered suggestions to improve your resume.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {feedback.map((f) => {
                    const p = PRIORITY_STYLE[f.priority]   || PRIORITY_STYLE.low;
                    const a = ACTION_STYLE[f.action_type]  || ACTION_STYLE.rephrase;
                    return (
                      <div key={f.id} style={{ background: "#111827", border: "1px solid #374151", borderRadius: 10, padding: 16, display: "flex", gap: 14, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: a.color, flexShrink: 0, width: 24, textAlign: "center" }}>
                          {a.icon}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(99,102,241,0.15)", color: "#818cf8" }}>
                              {f.category}
                            </span>
                            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: p.bg, color: p.color }}>
                              {p.label} priority
                            </span>
                          </div>
                          <p style={{ color: "#d1d5db", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                            {f.suggestion_text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Start Interview */}
            <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Start Resume-Based Interview</h2>
              <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 20 }}>
                Questions will be tailored to your resume content and work experience.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ color: "#9ca3af", fontSize: 12, display: "block", marginBottom: 6 }}>Target Role</label>
                  <input type="text" value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="e.g. Senior Backend Developer"
                    style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", background: "#111827", border: "1px solid #374151", borderRadius: 8, color: "#fff", fontSize: 14, outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ color: "#9ca3af", fontSize: 12, display: "block", marginBottom: 6 }}>Interview Type</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    {INTERVIEW_TYPES.map((t) => (
                      <button key={t.value} onClick={() => setIType(t.value)}
                        style={{ flex: 1, padding: "10px 0", borderRadius: 8, fontSize: 13, cursor: "pointer", border: iType === t.value ? "1px solid #6366f1" : "1px solid #374151", background: iType === t.value ? "rgba(99,102,241,0.15)" : "#111827", color: iType === t.value ? "#818cf8" : "#9ca3af", fontWeight: iType === t.value ? 600 : 400 }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={handleStart} disabled={starting}
                  style={{ background: starting ? "#312e81" : "#4f46e5", border: "none", color: "#fff", padding: "12px 0", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", opacity: starting ? 0.7 : 1 }}>
                  {starting ? "Starting interview..." : "Start Resume Interview →"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}