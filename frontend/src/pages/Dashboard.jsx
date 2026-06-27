import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listInterviews } from "../api/interviews";

const TYPE_LABELS = {
  technical: "Technical",
  behavioral: "Behavioral",
  system_design: "System Design",
};

const STATUS_STYLES = {
  in_progress: "bg-yellow-500/20 text-yellow-400",
  completed: "bg-green-500/20 text-green-400",
  abandoned: "bg-red-500/20 text-red-400",
};

const STATUS_LABELS = {
  in_progress: "In Progress",
  completed: "Completed",
  abandoned: "Abandoned",
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listInterviews()
      .then(setSessions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-400">AI Mock Interview</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.full_name}</span>
          <button
            onClick={logout}
            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-10">
        {/* Welcome + CTA */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold">Welcome back, {user?.full_name} 👋</h2>
            <p className="text-gray-400 mt-1 text-sm">Ready to practice?</p>
          </div>
          <button
            onClick={() => navigate("/interview/setup")}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition"
          >
            + New Interview
          </button>
        </div>

        {/* Sessions List */}
        <h3 className="text-lg font-semibold mb-4 text-gray-300">Past Sessions</h3>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <div className="border border-dashed border-gray-700 rounded-xl p-10 text-center text-gray-500">
            <p className="text-lg mb-2">No interviews yet</p>
            <p className="text-sm">Click "New Interview" to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => navigate(`/interview/${s.id}`)}
                className="bg-gray-800 border border-gray-700 rounded-xl px-6 py-4 flex items-center justify-between cursor-pointer hover:border-indigo-500 transition"
              >
                <div>
                  <p className="font-semibold">{s.role_title}</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {TYPE_LABELS[s.interview_type]} •{" "}
                    {new Date(s.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_STYLES[s.status]}`}>
                  {STATUS_LABELS[s.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}