import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword } from "../api/auth";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import useIsMobile from "../hooks/useIsMobile";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [email,     setEmail]     = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{ minHeight: "100vh", background: "#111827", color: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? 20 : 32, boxSizing: "border-box" }}>
      <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
        {submitted ? (
          <>
            <p style={{ fontSize: 40, marginBottom: 16 }}>📬</p>
            <h1 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, margin: "0 0 8px" }}>Check your email</h1>
            <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7, margin: "0 0 24px" }}>
              If an account exists for <strong style={{ color: "#e5e7eb" }}>{email}</strong>, we've sent a password
              reset link. It expires in 30 minutes.
            </p>
            <Button fullWidth onClick={() => navigate("/login")}>← Back to Login</Button>
          </>
        ) : (
          <>
            <p style={{ fontSize: 40, marginBottom: 16 }}>🔒</p>
            <h1 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, margin: "0 0 8px" }}>Forgot your password?</h1>
            <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7, margin: "0 0 24px" }}>
              Enter your email and we'll send you a link to reset your password.
            </p>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 20, textAlign: "left" }}>
                <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
              <div style={{ marginBottom: 20 }}>
                <Input
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="arjun@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" fullWidth loading={loading} size="lg">
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            <p style={{ color: "#334155", fontSize: 13, textAlign: "center", marginTop: 20 }}>
              Remembered your password?{" "}
              <Link to="/login" style={{ color: "#6366f1", textDecoration: "none", fontWeight: 500 }}>Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}