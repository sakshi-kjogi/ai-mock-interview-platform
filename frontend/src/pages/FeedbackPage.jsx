import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInterview } from "../api/interviews";
import { listQuestions } from "../api/questions";
import { listAnswers } from "../api/answers";
import { evaluateSession, listFeedback } from "../api/feedback";

const TYPE_LABELS = {
  technical: "Technical",
  behavioral: "Behavioral",
  system_design: "System Design",
};

const scoreStyle = (score) => {
  if (score >= 70) return { bar: "bg-green-500", badge: "bg-green-500/20 text-green-400", label: "Strong", color: "#22c55e" };
  if (score >= 40) return { bar: "bg-yellow-500", badge: "bg-yellow-500/20 text-yellow-400", label: "Adequate", color: "#eab308" };
  return { bar: "bg-red-500", badge: "bg-red-500/20 text-red-400", label: "Needs Work", color: "#ef4444" };
};

function ScoreRing({ score }) {
  const { color } = scoreStyle(score);
  const r = 15.9;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;

  return (
    <div style={{ position: "relative", width: 120, height: 120 }}>
      <svg width="120" height="120" viewBox="0 0 36 36"
        style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx="18" cy="18" r={r} fill="none" stroke="#374151" strokeWidth="3" />
        <circle cx="18" cy="18" r={r} fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round" />
      </svg>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>{score}</span>
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getInterview(sessionId),
      listQuestions(sessionId),
      listAnswers(sessionId),
      listFeedback(sessionId),
    ])
      .then(([sess, qs, as, fs]) => {
        setSession(sess);
        setQuestions(qs);
        setAnswers(as);
        setFeedbacks(fs);
      })
      .catch(() => setError("Failed to load feedback"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleEvaluate = async () => {
    setEvaluating(true);
    setError("");
    try {
      const fs = await evaluateSession(sessionId);
      setFeedbacks(fs);
    } catch (err) {
      setError(err.response?.data?.detail || "Evaluation failed");
    } finally {
      setEvaluating(false);
    }
  };

  const getAnswer = (qid) => answers.find((a) => a.question_id === qid);
  const getFeedback = (qid) => {
    const ans = getAnswer(qid);
    return ans ? feedbacks.find((f) => f.answer_id === ans.id) : null;
  };

  const avgScore = feedbacks.length > 0
    ? Math.round(feedbacks.reduce((s, f) => s + f.score, 0) / feedbacks.length)
    : null;

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      Loading feedback...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <button onClick={() => navigate(`/interview/${sessionId}/complete`)}
          className="text-gray-400 hover:text-white text-sm transition">
          ← Summary
        </button>
        <div className="text-right">
          <p className="font-semibold">{session?.role_title}</p>
          <p className="text-xs text-gray-400">{TYPE_LABELS[session?.interview_type]} Interview</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-10">

        {/* Overall Score Card */}
        {avgScore !== null ? (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 mb-8"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16 }}>
            <ScoreRing score={avgScore} />
            <div>
              <p className="text-gray-400 text-sm mb-1">Overall Score</p>
              <p className="text-xl font-bold">
                {avgScore >= 70 ? "Strong Performance 🎉" : avgScore >= 40 ? "Good Effort 👍" : "Keep Practicing 💪"}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Based on {feedbacks.length} evaluated answer{feedbacks.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 border border-dashed border-gray-600 rounded-2xl p-10 mb-8 text-center">
            <p className="text-lg font-semibold mb-2">No feedback generated yet</p>
            <p className="text-gray-400 text-sm mb-6">Click below to have AI evaluate all your answers</p>
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <button onClick={handleEvaluate} disabled={evaluating}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg font-semibold transition">
              {evaluating ? "Evaluating answers..." : "✨ Generate AI Feedback"}
            </button>
          </div>
        )}

        {/* Per-question Breakdown */}
        {questions.length > 0 && feedbacks.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-300">Question Breakdown</h2>
              <button onClick={handleEvaluate} disabled={evaluating}
                className="text-xs px-3 py-1 border border-gray-600 hover:border-indigo-500 rounded-lg disabled:opacity-50 transition">
                {evaluating ? "Re-evaluating..." : "↺ Re-evaluate"}
              </button>
            </div>

            <div className="space-y-6 mb-10">
              {questions.map((q, i) => {
                const ans = getAnswer(q.id);
                const fb = getFeedback(q.id);
                const style = fb ? scoreStyle(fb.score) : null;

                return (
                  <div key={q.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                    {/* Question header */}
                    <div className="px-5 pt-5 pb-3"
                      style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <span className="text-indigo-400 font-bold text-sm">Q{i + 1}.</span>
                        <p className="text-gray-200 mt-1 leading-relaxed">{q.question_text}</p>
                      </div>
                      {fb && (
                        <div style={{ flexShrink: 0, textAlign: "center" }}>
                          <span className={`text-2xl font-bold px-3 py-1 rounded-lg ${style.badge}`}>
                            {fb.score}
                          </span>
                          <p className={`text-xs mt-1 ${style.badge.split(" ")[1]}`}>{style.label}</p>
                        </div>
                      )}
                    </div>

                    {/* Score bar */}
                    {fb && (
                      <div className="px-5 pb-3">
                        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${style.bar}`}
                            style={{ width: `${fb.score}%` }} />
                        </div>
                      </div>
                    )}

                    {/* Answer */}
                    {ans && (
                      <div className="mx-5 mb-3 p-3 bg-gray-700/50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Your answer</p>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {ans.answer_text}
                        </p>
                      </div>
                    )}

                    {/* Strengths + Improvements */}
                    {fb && (
                      <div className="px-5 pb-5 space-y-3">
                        <div className="border-l-4 border-green-500 pl-3">
                          <p className="text-xs text-green-400 font-medium mb-1">✓ Strengths</p>
                          <p className="text-gray-300 text-sm leading-relaxed">{fb.strengths}</p>
                        </div>
                        <div className="border-l-4 border-orange-400 pl-3">
                          <p className="text-xs text-orange-400 font-medium mb-1">↗ Areas to Improve</p>
                          <p className="text-gray-300 text-sm leading-relaxed">{fb.improvements}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Bottom Actions */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <button onClick={() => navigate("/dashboard")}
            className="px-6 py-2 border border-gray-600 hover:border-gray-400 rounded-lg text-sm transition">
            Back to Dashboard
          </button>
          <button onClick={() => navigate("/interview/setup")}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-semibold transition">
            Practice Again →
          </button>
        </div>
      </div>
    </div>
  );
}