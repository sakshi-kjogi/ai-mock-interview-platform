import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createInterview } from "../api/interviews";

const INTERVIEW_TYPES = [
  { value: "technical", label: "Technical", desc: "Data structures, algorithms, coding problems" },
  { value: "behavioral", label: "Behavioral", desc: "Situational questions using the STAR method" },
  { value: "system_design", label: "System Design", desc: "Architecture, scalability, trade-offs" },
];

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [roleTitle, setRoleTitle] = useState("");
  const [interviewType, setInterviewType] = useState("technical");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!roleTitle.trim()) { setError("Please enter a role title"); return; }
    setError("");
    setLoading(true);
    try {
      const session = await createInterview({
        role_title: roleTitle.trim(),
        interview_type: interviewType,
      });
      navigate(`/interview/${session.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1 transition"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold mb-2">Set Up Your Interview</h1>
        <p className="text-gray-400 text-sm mb-8">
          Tell us the role you're practicing for and choose an interview style.
        </p>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {/* Role Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Role Title
          </label>
          <input
            type="text"
            placeholder="e.g. Backend Developer, Product Manager"
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Interview Type */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Interview Type
          </label>
          <div className="space-y-3">
            {INTERVIEW_TYPES.map((t) => (
              <div
                key={t.value}
                onClick={() => setInterviewType(t.value)}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  interviewType === t.value
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-gray-700 bg-gray-800 hover:border-gray-500"
                }`}
              >
                <p className="font-semibold">{t.label}</p>
                <p className="text-sm text-gray-400 mt-0.5">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition"
        >
          {loading ? "Creating session..." : "Start Interview →"}
        </button>
      </div>
    </div>
  );
}