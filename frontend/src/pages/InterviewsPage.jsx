import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listInterviews } from "../api/interviews";
import { getBookmarks, bookmarkSession, unbookmarkSession } from "../api/bookmarks";
import AppLayout from "../components/AppLayout";
import Badge from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { SkeletonCard } from "../components/ui/Skeleton";
import useIsMobile from "../hooks/useIsMobile";

const TYPE_LABELS   = { technical: "Technical", behavioral: "Behavioral", system_design: "System Design" };
const TYPE_ICONS    = { technical: "💻", behavioral: "🤝", system_design: "🏗️" };
const STATUS_VARIANT = { in_progress: "warning", completed: "success", abandoned: "danger", terminated: "danger" };
const STATUS_LABELS  = { in_progress: "In Progress", completed: "Completed", abandoned: "Abandoned", terminated: "Terminated" };

export default function InterviewsPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [sessions, setSessions] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    Promise.all([listInterviews(), getBookmarks()])
      .then(([sessionList, bookmarks]) => {
        setSessions(sessionList);
        setBookmarkedIds(new Set(bookmarks.sessions.map((s) => s.id)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleBookmark = async (e, sessionId) => {
    e.stopPropagation();
    const isBookmarked = bookmarkedIds.has(sessionId);
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      isBookmarked ? next.delete(sessionId) : next.add(sessionId);
      return next;
    });
    try {
      isBookmarked ? await unbookmarkSession(sessionId) : await bookmarkSession(sessionId);
    } catch {
      // revert on failure
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        isBookmarked ? next.add(sessionId) : next.delete(sessionId);
        return next;
      });
    }
  };

  const filtered = sessions.filter((s) => {
    const matchesSearch = s.role_title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const matchesType = typeFilter === "all" || s.interview_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const selectStyle = {
    background: "#1f2937", border: "1px solid #374151", color: "#e5e7eb",
    borderRadius: 8, padding: "9px 12px", fontSize: 13, cursor: "pointer", outline: "none",
  };

  return (
    <AppLayout>
      <div className="page-enter" style={{ padding: isMobile ? "20px 16px" : "28px 32px", boxSizing: "border-box" }}>
        <h1 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, margin: "0 0 4px" }}>Interviews</h1>
        <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 24px" }}>Your full interview history</p>

        {/* Search + Filters */}
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 10, marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <Input placeholder="Search by role title..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="all">All Statuses</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="abandoned">Abandoned</option>
            <option value="terminated">Terminated</option>
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={selectStyle}>
            <option value="all">All Types</option>
            <option value="technical">Technical</option>
            <option value="behavioral">Behavioral</option>
            <option value="system_design">System Design</option>
          </select>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} lines={1} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ border: "1px dashed #374151", borderRadius: 14, padding: 40, textAlign: "center" }}>
            <p style={{ color: "#6b7280", fontSize: 14 }}>
              {sessions.length === 0 ? "No interviews yet." : "No interviews match your filters."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 4px" }}>{filtered.length} of {sessions.length} interviews</p>
            {filtered.map((s) => (
              <div key={s.id} onClick={() => navigate(`/interview/${s.id}`)}
                style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 12, padding: isMobile ? "12px 14px" : "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.background = "#1e2d3d"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#374151"; e.currentTarget.style.background = "#1f2937"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{TYPE_ICONS[s.interview_type] || "🎯"}</span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.role_title}</p>
                    <p style={{ color: "#6b7280", fontSize: 12, margin: "2px 0 0" }}>
                      {TYPE_LABELS[s.interview_type]} · {new Date(s.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <Badge variant={STATUS_VARIANT[s.status] || "info"}>{STATUS_LABELS[s.status] || s.status}</Badge>
                  <button onClick={(e) => toggleBookmark(e, s.id)} title="Bookmark this interview"
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: bookmarkedIds.has(s.id) ? "#fbbf24" : "#4b5563", padding: 2 }}>
                    {bookmarkedIds.has(s.id) ? "★" : "☆"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
