import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBookmarks, unbookmarkSession, unbookmarkQuestion } from "../api/bookmarks";
import AppLayout from "../components/AppLayout";
import Badge from "../components/ui/Badge";
import { SkeletonCard } from "../components/ui/Skeleton";
import useIsMobile from "../hooks/useIsMobile";

const TYPE_ICONS = { technical: "💻", behavioral: "🤝", system_design: "🏗️" };
const STATUS_VARIANT = { in_progress: "warning", completed: "success", abandoned: "danger", terminated: "danger" };

export default function BookmarksPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sessions, setSessions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBookmarks()
      .then((data) => { setSessions(data.sessions); setQuestions(data.questions); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const removeSessionBookmark = async (e, id) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== id));
    try { await unbookmarkSession(id); } catch { /* best-effort */ }
  };

  const removeQuestionBookmark = async (e, id) => {
    e.stopPropagation();
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    try { await unbookmarkQuestion(id); } catch { /* best-effort */ }
  };

  return (
    <AppLayout>
      <div className="page-enter" style={{ padding: isMobile ? "20px 16px" : "28px 32px", boxSizing: "border-box" }}>
        <h1 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, margin: "0 0 4px" }}>Bookmarks</h1>
        <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 24px" }}>Interviews and questions you've saved for later</p>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} lines={1} />)}
          </div>
        ) : (
          <>
            {/* Bookmarked Sessions */}
            <p style={{ fontWeight: 600, fontSize: 15, color: "#d1d5db", margin: "0 0 12px" }}>Interviews</p>
            {sessions.length === 0 ? (
              <div style={{ border: "1px dashed #374151", borderRadius: 12, padding: 24, textAlign: "center", marginBottom: 28 }}>
                <p style={{ color: "#6b7280", fontSize: 13 }}>No bookmarked interviews yet — tap the ☆ on any interview to save it here.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
                {sessions.map((s) => (
                  <div key={s.id} onClick={() => navigate(`/interview/${s.id}`)}
                    style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 12, padding: isMobile ? "12px 14px" : "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, transition: "all 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#6366f1"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#374151"}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{TYPE_ICONS[s.interview_type] || "🎯"}</span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 14, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.role_title}</p>
                        <p style={{ color: "#6b7280", fontSize: 12, margin: "2px 0 0" }}>{new Date(s.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <Badge variant={STATUS_VARIANT[s.status] || "info"}>{s.status}</Badge>
                      <button onClick={(e) => removeSessionBookmark(e, s.id)} title="Remove bookmark"
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#fbbf24" }}>★</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bookmarked Questions */}
            <p style={{ fontWeight: 600, fontSize: 15, color: "#d1d5db", margin: "0 0 12px" }}>Questions</p>
            {questions.length === 0 ? (
              <div style={{ border: "1px dashed #374151", borderRadius: 12, padding: 24, textAlign: "center" }}>
                <p style={{ color: "#6b7280", fontSize: 13 }}>No bookmarked questions yet — save tricky questions while answering to revisit them here.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {questions.map((q) => (
                  <div key={q.id} onClick={() => navigate(`/interview/${q.session_id}`)}
                    style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 12, padding: isMobile ? "12px 14px" : "14px 18px", cursor: "pointer", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, transition: "all 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#6366f1"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#374151"}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 6px" }}>{q.question_text}</p>
                      <p style={{ color: "#6b7280", fontSize: 12, margin: 0 }}>{q.role_title} {q.category ? `· ${q.category}` : ""}</p>
                    </div>
                    <button onClick={(e) => removeQuestionBookmark(e, q.id)} title="Remove bookmark"
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#fbbf24", flexShrink: 0 }}>★</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
