import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInterview } from "../api/interviews";
import { listQuestions } from "../api/questions";
import { listAnswers } from "../api/answers";

const TYPE_LABELS = {
  technical: "Technical",
  behavioral: "Behavioral",
  system_design: "System Design",
};

const formatTime = (s) => {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
};

export default function InterviewComplete() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getInterview(sessionId),
      listQuestions(sessionId),
      listAnswers(sessionId),
    ])
      .then(([sess, qs, as]) => {
        setSession(sess);
        setQuestions(qs);
        setAnswers(as);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sessionId]);

  const getAnswer = (questionId) =>
    answers.find((a) => a.question_id === questionId);

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      Loading results...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <button onClick={() => navigate("/dashboard")} className="text-gray-400 hover:text-white text-sm transition">
          ← Dashboard
        </button>
        <span className="text-green-400 text-sm font-medium">✓ Interview Complete</span>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-10">
        {/* Summary Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{session?.role_title}</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {TYPE_LABELS[session?.interview_type]} · {questions.length} questions ·{" "}
              {new Date(session?.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Total time</p>
            <p className="font-mono text-lg">
              {formatTime(answers.reduce((sum, a) => sum + (a.time_taken_seconds || 0), 0))}
            </p>
          </div>
        </div>

        {/* Q&A List */}
        <h2 className="text-lg font-semibold mb-4 text-gray-300">Your Answers</h2>
        <div className="space-y-6 mb-10">
          {questions.map((q, i) => {
            const ans = getAnswer(q.id);
            return (
              <div key={q.id} className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-indigo-400 font-bold">Q{i + 1}.</span>
                  {ans && (
                    <span className="text-xs text-gray-500 font-mono">
                      {formatTime(ans.time_taken_seconds)}
                    </span>
                  )}
                </div>
                <p className="text-gray-200 mb-3">{q.question_text}</p>
                <div className="border-t border-gray-700 pt-3">
                  <p className="text-xs text-gray-500 mb-1">Your answer</p>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {ans?.answer_text || <span className="text-gray-500 italic">No answer submitted</span>}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Day 6 CTA */}
        {/* Replace the disabled button block with this */}
<div className="text-center">
  <button
    onClick={() => navigate(`/interview/${sessionId}/feedback`)}
    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition"
  >
    Get AI Feedback →
  </button>
  <p className="text-gray-500 text-xs mt-2">
    Powered by Gemini AI
  </p>
</div>
      </div>
    </div>
  );
}