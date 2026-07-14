import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { resetPassword } from "../api/auth";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import PasswordStrength from "../components/ui/PasswordStrength";
import useIsMobile from "../hooks/useIsMobile";

export default function ResetPassword() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [form,      setForm]      = useState({ new_password: "", confirm_password: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) { setError("This reset link is missing its token. Please request a new one."); return; }
    if (form.new_password !== form.confirm_password) { setError("Passwords do not match"); return; }
    setError("");
    setLoading(true);
    try {
      await resetPassword({ token, ...form });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.detail || "This reset link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{ minHeight: "100vh", background: "#111827", color: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? 20 : 32, boxSizing: "border-box" }}>
      <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
        {submitted ? (
          <>
            <p style={{ fontSize: 40, marginBottom: 16 }}>✅</p>
            <h1 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, margin: "0 0 8px" }}>Password reset</h1>
            <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7, margin: "0 0 24px" }}>
              Your password has been updated. You can now sign in with your new password.
            </p>
            <Button fullWidth onClick={() => navigate("/login")}>Go to Login</Button>
          </>
        ) : !token ? (
          <>
            <p style={{ fontSize: 40, marginBottom: 16 }}>⚠️</p>
            <h1 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, margin: "0 0 8px" }}>Invalid reset link</h1>
            <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7, margin: "0 0 24px" }}>
              This link is missing its reset token. Please request a new password reset.
            </p>
            <Button fullWidth onClick={() => navigate("/forgot-password")}>Request New Link</Button>
          </>
        ) : (
          <>
            <p style={{ fontSize: 40, marginBottom: 16 }}>🔑</p>
            <h1 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, margin: "0 0 8px" }}>Set a new password</h1>
            <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7, margin: "0 0 24px" }}>
              Choose a strong new password for your account.
            </p>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 20, textAlign: "left" }}>
                <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <Input
                  name="new_password"
                  type="password"
                  label="New Password"
                  placeholder="Choose a strong password"
                  value={form.new_password}
                  onChange={handleChange}
                  required
                />
                <PasswordStrength password={form.new_password} />
              </div>
              <Input
                name="confirm_password"
                type="password"
                label="Confirm New Password"
                placeholder="Repeat your new password"
                value={form.confirm_password}
                onChange={handleChange}
                required
              />
              <Button type="submit" fullWidth loading={loading} size="lg">
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>

            <p style={{ color: "#334155", fontSize: 13, textAlign: "center", marginTop: 20 }}>
              <Link to="/login" style={{ color: "#6366f1", textDecoration: "none", fontWeight: 500 }}>← Back to Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}