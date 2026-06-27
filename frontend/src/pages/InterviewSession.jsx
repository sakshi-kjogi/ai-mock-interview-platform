import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInterview } from "../api/interviews";
import { generateQuestions, listQuestions } from "../api/questions";

const TYPE_LABELS = {
  technical: "Technical",
  behavioral: "Behavioral",
  system_design: "System Design",
};

const CATEGORY_COLORS = {
  algorithms: "bg-blue-500/20 text-blue-400",
  "data structures": "bg-purple-500/20 text-purple-400",
  "system design": "bg-orange-500/20 text-orange-400",
  "language-specific": "bg-green-500/20 text-green-400",
  "problem solving": "bg-yellow-500/20 text-yellow-400",
  leadership: "bg-red-500/20 text-red-400",
  teamwork: "bg-teal-500/20 text-teal-400",
  scalability: "bg-pink-500/20 text-pink-400",
};

const categoryColor = (cat) =>
  cat ? (CATEGORY_COLORS[cat.toLowerCase()] || "bg-gray-500/20 text-gray-400") : "";

export default function InterviewSession() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getInterview(id), listQuestions(id)])
      .then(([sess, qs]) => { setSession(sess); setQuestions(qs); })
      .catch(() => setError("Session not found"))
      .finally(() => setPageLoading(false));
  }, [id]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      const qs = await generateQuestions(id);
      setQuestions(qs);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate questions");
    } finally {
      setGenerating(false);
    }
  };

  if (pageLoading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      Loading session...
    </div>
  );

  if (error && !session) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white gap-4">
      <p className="text-red-400">{error}</p>
      <button onClick={() => navigate("/dashboard")} className="text-indigo-400 hover:underline text-sm">
        Back to Dashboard
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <button onClick={() => navigate("/dashboard")} className="text-gray-400 hover:text-white text-sm transition">
          ← Dashboard
        </button>
        <div className="text-right">
          <p className="font-semibold">{session?.role_title}</p>
          <p className="text-xs text-gray-400">{TYPE_LABELS[session?.interview_type]} Interview</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-10">
        {questions.length === 0 ? (
          // No questions yet — show generate CTA
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🤖</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Ready to generate questions</h2>
            <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
              Gemini will create 5 tailored {TYPE_LABELS[session?.interview_type]?.toLowerCase()} interview
              questions for the <span className="text-white font-medium">{session?.role_title}</span> role.
            </p>
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition"
            >
              {generating ? "Generating questions..." : "✨ Generate Questions"}
            </button>
          </div>
        ) : (
          // Questions loaded
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">Interview Questions</h2>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="text-sm px-4 py-1.5 border border-gray-600 hover:border-indigo-500 rounded-lg transition disabled:opacity-50"
              >
                {generating ? "Regenerating..." : "↺ Regenerate"}
              </button>
            </div>

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            <div className="space-y-4 mb-10">
              {questions.map((q, i) => (
                <div key={q.id} className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <span className="text-indigo-400 font-bold text-lg min-w-[28px]">
                      {i + 1}.
                    </span>
                    <div className="flex-1">
                      <p className="text-white leading-relaxed">{q.question_text}</p>
                      {q.category && (
                        <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${categoryColor(q.category)}`}>
                          {q.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Day 5 placeholder */}
            <div className="text-center">
              <button
                disabled
                className="px-8 py-3 bg-indigo-600 opacity-40 cursor-not-allowed rounded-lg font-semibold"
              >
                Begin Answering (Day 5)
              </button>
              <p className="text-gray-500 text-xs mt-2">Answer submission coming in Day 5</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}