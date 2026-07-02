import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../api/auth";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import PageHeader from "../components/ui/PageHeader";
import PasswordStrength from "../components/ui/PasswordStrength";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form,    setForm]    = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSuccess(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) {
      setError("New passwords do not match");
      return;
    }
    if (form.new_password.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await changePassword(form);
      setSuccess(true);
      setForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        setError("Too many attempts. Please wait a minute.");
      } else {
        setError(err.response?.data?.detail || "Failed to change password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{ minHeight: "100vh", background: "#111827", color: "#f9fafb" }}>
      <PageHeader
        left={
          <button onClick={() => navigate("/dashboard")}
            style={{ color: "#6b7280", background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = "#f9fafb"}
            onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}>
            ← Dashboard
          </button>
        }
        center={<span style={{ fontSize: 14, fontWeight: 600, color: "#9ca3af" }}>Profile Settings</span>}
      />

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 32px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Account Info */}
        <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 16px" }}>Account Information</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#6b7280", fontSize: 13 }}>Full Name</span>
              <span style={{ color: "#f9fafb", fontSize: 14, fontWeight: 500 }}>{user?.full_name}</span>
            </div>
            <div style={{ height: 1, background: "#374151" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#6b7280", fontSize: 13 }}>Email</span>
              <span style={{ color: "#f9fafb", fontSize: 14, fontWeight: 500 }}>{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>Change Password</h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 20px" }}>
            Choose a strong password with at least 8 characters.
          </p>

          {success && (
            <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#4ade80", fontSize: 16 }}>✓</span>
              <p style={{ color: "#4ade80", fontSize: 13, margin: 0 }}>
                Password changed successfully. Use your new password next time you sign in.
              </p>
            </div>
          )}

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
              <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input
              name="current_password" type="password" label="Current Password"
              placeholder="Your current password"
              value={form.current_password} onChange={handleChange} required
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Input
                name="new_password" type="password" label="New Password"
                placeholder="Choose a new password"
                value={form.new_password} onChange={handleChange} required
              />
              <PasswordStrength password={form.new_password} />
            </div>
            <Input
              name="confirm_password" type="password" label="Confirm New Password"
              placeholder="Repeat your new password"
              value={form.confirm_password} onChange={handleChange} required
            />
            <Button
              type="submit" fullWidth loading={loading}
              disabled={!form.current_password || !form.new_password || !form.confirm_password}
            >
              {loading ? "Updating password..." : "Update Password"}
            </Button>
          </form>
        </div>

        {/* Security Notes */}
        <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 14px" }}>🔒 Security Notes</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["Passwords are hashed with bcrypt", "Your password is never stored in plain text"],
              ["Sessions use signed JWTs", "Tokens expire automatically after 30 minutes of inactivity"],
              ["Rate limiting is active", "Login and registration attempts are limited per IP to prevent brute force"],
            ].map(([title, desc]) => (
              <div key={title} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: "#4ade80", fontSize: 13, flexShrink: 0 }}>✓</span>
                <div>
                  <p style={{ color: "#d1d5db", fontSize: 13, fontWeight: 500, margin: "0 0 2px" }}>{title}</p>
                  <p style={{ color: "#6b7280", fontSize: 12, margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: "12px 14px", background: "#111827", borderRadius: 8, border: "1px solid #374151" }}>
            <p style={{ color: "#6b7280", fontSize: 12, margin: 0, lineHeight: 1.6 }}>
              <strong style={{ color: "#9ca3af" }}>Planned enhancements:</strong> Two-factor authentication (TOTP), Google OAuth sign-in, email verification, and session management are planned features for the next release.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}