import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosInstance";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import PasswordStrength from "../components/ui/PasswordStrength";

export default function Register() {
  const [form,     setForm]     = useState({ full_name: "", email: "", password: "" });
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleKeyDown = (e) => setCapsLock(e.getModifierState?.("CapsLock") ?? false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/v1/auth/register", form);
      navigate("/login");
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        setError("Too many registration attempts. Please wait a minute and try again.");
      } else {
        setError(err.response?.data?.detail || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#111827" }}>
      {/* Left panel */}
      <div style={{
        width: 420, flexShrink: 0,
        background: "linear-gradient(135deg, #1e1b4b 0%, #111827 100%)",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "48px 40px", borderRight: "1px solid #1f2937",
      }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎯</div>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#f9fafb" }}>AI Mock Interview</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#f9fafb", margin: "0 0 12px" }}>
            Start your<br />interview prep today.
          </h1>
          <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
            Join and practice with AI-generated questions tailored to your role, with voice support and detailed feedback.
          </p>
        </div>
        <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 12, padding: 20 }}>
          <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 12px" }}>What you get:</p>
          {["Unlimited mock interviews", "AI-powered question generation", "Voice answer support", "Detailed feedback & scoring", "Resume-based tailored questions", "Performance analytics dashboard"].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ color: "#4ade80", fontSize: 14 }}>✓</span>
              <span style={{ color: "#d1d5db", fontSize: 13 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32, overflowY: "auto" }}>
        <div className="page-enter" style={{ width: "100%", maxWidth: 380, padding: "24px 0" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 6px" }}>Create an account</h2>
          <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 28px" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#818cf8", textDecoration: "none", fontWeight: 500 }}>Sign in</Link>
          </p>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
              <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input
              name="full_name" label="Full Name"
              placeholder="Jane Smith"
              value={form.full_name} onChange={handleChange} required
            />
            <Input
              name="email" type="email" label="Email"
              placeholder="you@example.com"
              value={form.email} onChange={handleChange} required
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Input
                name="password" type="password" label="Password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                required
              />
              {capsLock && (
                <p style={{ color: "#f59e0b", fontSize: 12, margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
                  ⚠ Caps Lock is on
                </p>
              )}
              <PasswordStrength password={form.password} />
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg" style={{ marginTop: 4 }}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p style={{ color: "#4b5563", fontSize: 12, marginTop: 20, textAlign: "center", lineHeight: 1.6 }}>
            By creating an account you agree to practice answering technical and behavioural interview questions with AI.
          </p>
        </div>
      </div>
    </div>
  );
}