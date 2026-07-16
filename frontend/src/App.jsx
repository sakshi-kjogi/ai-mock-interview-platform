import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OAuthCallback from "./pages/OAuthCallback";
import Dashboard from "./pages/Dashboard";
import InterviewsPage from "./pages/InterviewsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import PracticePage from "./pages/PracticePage";
import BookmarksPage from "./pages/BookmarksPage";
import ProfilePage from "./pages/ProfilePage";
import InterviewSetup from "./pages/InterviewSetup";
import InterviewSession from "./pages/InterviewSession";
import AnswerQuestion from "./pages/AnswerQuestion";
import InterviewComplete from "./pages/InterviewComplete";
import FeedbackPage from "./pages/FeedbackPage";
import InterviewRules from "./pages/InterviewRules";
import ResumePage from "./pages/ResumePage";
import NotificationsPage from "./pages/NotificationsPage";
import NotFound from "./pages/NotFound";

const PAGE_TITLES = {
  "/":                 "InterviewIQ — Practice. Improve. Get Hired.",
  "/login":            "Sign In",
  "/register":         "Create Account",
  "/forgot-password":  "Forgot Password",
  "/reset-password":   "Reset Password",
  "/dashboard":        "Dashboard",
  "/interviews":       "Interviews",
  "/analytics":        "Analytics",
  "/practice":         "Practice",
  "/bookmarks":        "Bookmarks",
  "/resume":           "Resume",
  "/profile":          "Profile Settings",
  "/notifications":    "Notifications",
  "/interview/setup":  "New Interview",
};

function TitleManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    const base  = "InterviewIQ";
    const exact = PAGE_TITLES[pathname];
    if (exact) { document.title = pathname === "/" ? exact : `${exact} — ${base}`; return; }
    const prefix = Object.entries(PAGE_TITLES).find(([p]) => p !== "/" && pathname.startsWith(p));
    document.title = prefix ? `${prefix[1]} — ${base}` : base;
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TitleManager />
        <Routes>
          {/* Public */}
          <Route path="/"               element={<LandingPage />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/forgot-password"element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />

          {/* Protected — with sidebar (AppLayout inside each page) */}
          <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/interviews"    element={<ProtectedRoute><InterviewsPage /></ProtectedRoute>} />
          <Route path="/analytics"     element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/practice"      element={<ProtectedRoute><PracticePage /></ProtectedRoute>} />
          <Route path="/bookmarks"     element={<ProtectedRoute><BookmarksPage /></ProtectedRoute>} />
          <Route path="/profile"       element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/resume"        element={<ProtectedRoute><ResumePage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/interview/setup"  element={<ProtectedRoute><InterviewSetup /></ProtectedRoute>} />
          <Route path="/interview/:id"    element={<ProtectedRoute><InterviewSession /></ProtectedRoute>} />
          <Route path="/interview/:sessionId/complete" element={<ProtectedRoute><InterviewComplete /></ProtectedRoute>} />
          <Route path="/interview/:sessionId/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />

          {/* Protected — NO sidebar (fullscreen interview flow) */}
          <Route path="/interview/:id/rules"                        element={<ProtectedRoute><InterviewRules /></ProtectedRoute>} />
          <Route path="/interview/:sessionId/answer/:questionId"    element={<ProtectedRoute><AnswerQuestion /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*"    element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
