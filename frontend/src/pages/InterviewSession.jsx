import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInterview } from "../api/interviews";

const TYPE_LABELS = {
  technical: "Technical",
  behavioral: "Behavioral",
  system_design: "System Design",
};

export default function InterviewSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getInterview(id)
      .then(setSession)
      .catch(() => setError("Session not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      Loading session...
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white flex-col gap-4">
      <p className="text-red-400">{error}</p>
      <button onClick={() => navigate("/dashboard")} className="text-indigo-400 hover:underline text-sm">
        Back to Dashboard
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-10">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">{session.role_title}</h1>
          <p className="text-gray-400 text-sm mb-6">
            {TYPE_LABELS[session.interview_type]} Interview
          </p>

          <div className="bg-gray-700/50 rounded-xl p-4 mb-8 text-sm text-gray-300">
            Session ready. AI-generated questions will appear here in the next step.
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 py-2 border border-gray-600 hover:border-gray-400 rounded-lg text-sm transition"
            >
              Back
            </button>
            <button
              disabled
              className="flex-1 py-2 bg-indigo-600 opacity-40 cursor-not-allowed rounded-lg text-sm font-semibold"
            >
              Generate Questions (Day 4)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}