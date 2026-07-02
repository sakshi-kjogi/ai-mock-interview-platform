import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InterviewSetup from "./pages/InterviewSetup";
import InterviewSession from "./pages/InterviewSession";
import AnswerQuestion from "./pages/AnswerQuestion";
import InterviewComplete from "./pages/InterviewComplete";
import FeedbackPage from "./pages/FeedbackPage";
import InterviewRules from "./pages/InterviewRules";
import ResumePage from "./pages/ResumePage";
import NotFound from "./pages/NotFound";

const PAGE_TITLES = {
  "/login":      "Sign In",
  "/register":   "Create Account",
  "/dashboard":  "Dashboard",
  "/resume":     "Resume",
  "/interview/setup": "New Interview",
};

function TitleManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    const base = "AI Mock Interview";
    const match = Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(path));
    document.title = match ? `${match[1]} — ${base}` : base;
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TitleManager />
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/resume"    element={<ProtectedRoute><ResumePage /></ProtectedRoute>} />
          <Route path="/interview/setup" element={<ProtectedRoute><InterviewSetup /></ProtectedRoute>} />
          <Route path="/interview/:id"   element={<ProtectedRoute><InterviewSession /></ProtectedRoute>} />
          <Route path="/interview/:id/rules" element={<ProtectedRoute><InterviewRules /></ProtectedRoute>} />
          <Route path="/interview/:sessionId/answer/:questionId" element={<ProtectedRoute><AnswerQuestion /></ProtectedRoute>} />
          <Route path="/interview/:sessionId/complete"  element={<ProtectedRoute><InterviewComplete /></ProtectedRoute>} />
          <Route path="/interview/:sessionId/feedback"  element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*"    element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}