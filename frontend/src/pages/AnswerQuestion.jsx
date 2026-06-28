import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listQuestions } from "../api/questions";
import { listAnswers, submitAnswer } from "../api/answers";
import { updateInterviewStatus } from "../api/interviews";

const formatTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export default function AnswerQuestion() {
  const { sessionId, questionId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answerText, setAnswerText] = useState("");
  const [time, setTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const timerRef = useRef(null);

  const currentIndex = questions.findIndex(
    (q) => q.id.toLowerCase().trim() === questionId.toLowerCase().trim()
  );
  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex !== -1 && currentIndex === questions.length - 1;

  // Load questions and pre-fill any existing answer when question changes
  useEffect(() => {
    setLoading(true);
    setTime(0);
    setAnswerText("");
    setError("");

    Promise.all([listQuestions(sessionId), listAnswers(sessionId)])
      .then(([qs, as]) => {
        setQuestions(qs);
        const existing = as.find(
          (a) => a.question_id.toLowerCase().trim() === questionId.toLowerCase().trim()
        );
        if (existing) setAnswerText(existing.answer_text);
      })
      .catch(() => setError("Failed to load question"))
      .finally(() => setLoading(false));
  }, [sessionId, questionId]);

  // Start timer after load, reset when question changes
  useEffect(() => {
    if (loading) return;
    timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [loading, questionId]);

  const handleSubmit = async () => {
    if (!answerText.trim()) {
      setError("Please write an answer before submitting");
      return;
    }
    if (currentIndex === -1) {
      setError("Question index error — please refresh the page");
      return;
    }

    setError("");
    setSubmitting(true);
    clearInterval(timerRef.current);

    try {
      await submitAnswer(sessionId, questionId, {
        answer_text: answerText.trim(),
        time_taken_seconds: time,
      });

      if (isLast) {
        await updateInterviewStatus(sessionId, "completed");
        navigate(`/interview/${sessionId}/complete`);
      } else {
        navigate(`/interview/${sessionId}/answer/${questions[currentIndex + 1].id}`);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit answer — check your connection");
    } finally {
      // Always reset submitting so the button never stays stuck
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      Loading question...
    </div>
  );

  if (!currentQuestion) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white gap-4">
      <p className="text-red-400">Question not found</p>
      <button
        onClick={() => navigate("/dashboard")}
        className="text-indigo-400 hover:underline text-sm"
      >
        Back to Dashboard
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Progress Header */}
      <div className="border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate(`/interview/${sessionId}`)}
          className="text-gray-400 hover:text-white text-sm transition"
        >
          ← Questions
        </button>
        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            {questions.map((q, i) => (
              <div
                key={q.id}
                className={`w-2.5 h-2.5 rounded-full transition ${
                  i === currentIndex
                    ? "bg-indigo-500"
                    : i < currentIndex
                    ? "bg-green-500"
                    : "bg-gray-600"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-400">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm font-mono bg-gray-800 px-3 py-1 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          {formatTime(time)}
        </div>
      </div>

      {/* Question + Answer */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-8 py-10 flex flex-col gap-8">
        {currentQuestion.category && (
          <span className="self-start text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400">
            {currentQuestion.category}
          </span>
        )}

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Question</p>
          <p className="text-lg leading-relaxed">{currentQuestion.question_text}</p>
        </div>

        <div className="flex flex-col flex-1 gap-2">
          <label className="text-sm text-gray-400">Your Answer</label>
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Type your answer here..."
            rows={10}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex justify-between items-center">
          <button
            onClick={() =>
              currentIndex > 0 &&
              navigate(`/interview/${sessionId}/answer/${questions[currentIndex - 1].id}`)
            }
            disabled={currentIndex === 0}
            className="px-5 py-2 border border-gray-600 hover:border-gray-400 rounded-lg text-sm disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            ← Previous
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-sm transition"
          >
            {submitting ? "Saving..." : isLast ? "Submit & Finish ✓" : "Submit & Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}