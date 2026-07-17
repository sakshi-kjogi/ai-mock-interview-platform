import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosInstance";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import PasswordStrength from "../components/ui/PasswordStrength";
import useIsMobile from "../hooks/useIsMobile";

function GoogleIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>;
}
function GitHubIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>;
}

export default function Register() {
  const [form,    setForm]    = useState({ full_name: "", email: "", password: "", confirm_password: "" });
  const [agreed,  setAgreed]  = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [capsLock,setCapsLock]= useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleChange  = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleKeyDown = (e) => setCapsLock(e.getModifierState?.("CapsLock") ?? false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) { setError("Passwords do not match"); return; }
    if (!agreed) { setError("Please agree to the Terms of Service"); return; }
    setError(""); setLoading(true);
    try {
      await api.post("/api/v1/auth/register", { full_name: form.full_name, email: form.email, password: form.password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: isMobile ? "column" : "row", background: "#0f172a", overflowX: "hidden", width: "100%", maxWidth: "100vw", boxSizing: "border-box" }}>
      {/* Left panel - hidden on mobile to save space */}
      {!isMobile && (
        <div style={{ width: 420, flexShrink: 0, background: "linear-gradient(160deg,#1e1b4b 0%,#0f172a 60%)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 40px", borderRight: "1px solid #1e293b" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎯</div>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc" }}>InterviewIQ</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#f8fafc", lineHeight: 1.2, margin: "0 0 12px" }}>Start your journey<br/>towards success</h1>
          <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>Create your account and unlock the power of AI mock interviews.</p>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
            {["Unlimited mock interviews","AI question generation","Voice answer support","Detailed feedback & scoring","Resume-based questions","Analytics dashboard"].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ color: "#4ade80", fontSize: 13 }}>✓</span>
                <span style={{ color: "#64748b", fontSize: 13 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile compact header */}
      {isMobile && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "24px 20px 0" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🎯</div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc" }}>InterviewIQ</span>
        </div>
      )}

      {/* Right form panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "20px" : 40, overflowY: "auto", width: "100%", boxSizing: "border-box" }}>
        <div className="page-enter" style={{ width: "100%", maxWidth: 400, padding: isMobile ? "12px 0" : "20px 0" }}>
          <h2 style={{ fontSize: isMobile ? 21 : 24, fontWeight: 700, color: "#f8fafc", margin: "0 0 6px" }}>Create your account</h2>
          <p style={{ color: "#475569", fontSize: 14, margin: "0 0 24px" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#6366f1", textDecoration: "none", fontWeight: 500 }}>Sign in</Link>
          </p>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
              <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input name="full_name" label="Full Name" placeholder="Arjun Sharma" value={form.full_name} onChange={handleChange} required />
            <Input name="email" type="email" label="Email" placeholder="arjun@example.com" value={form.email} onChange={handleChange} required />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Input name="password" type="password" label="Password" placeholder="Create a strong password" value={form.password} onChange={handleChange} onKeyDown={handleKeyDown} required />
              {capsLock && <p style={{ color: "#f59e0b", fontSize: 12, margin: 0 }}>⚠ Caps Lock is on</p>}
              <PasswordStrength password={form.password} />
            </div>
            <Input name="confirm_password" type="password" label="Confirm Password" placeholder="Repeat your password" value={form.confirm_password} onChange={handleChange} onKeyDown={handleKeyDown} required />

            <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 3, accentColor: "#6366f1", flexShrink: 0 }} />
              <span style={{ color: "#475569", fontSize: 12, lineHeight: 1.5 }}>
                I agree to the <a href="#" style={{ color: "#6366f1", textDecoration: "none" }}>Terms of Service</a> and <a href="#" style={{ color: "#6366f1", textDecoration: "none" }}>Privacy Policy</a>
              </span>
            </label>

            <Button type="submit" fullWidth loading={loading} size="lg">
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#1e293b" }} />
            <span style={{ color: "#334155", fontSize: 12 }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: "#1e293b" }} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {[["Google", <GoogleIcon />], ["GitHub", <GitHubIcon />]].map(([label, icon]) => (
              <button key={label} onClick={() => {
                const provider = label.toLowerCase();
                window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/auth/${provider}/login`;
              }}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#94a3b8", fontSize: 14, cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.color = "#f8fafc"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.color = "#94a3b8"; }}>
                {icon} {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}