import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../api/auth";
import AppLayout from "../components/AppLayout";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import PasswordStrength from "../components/ui/PasswordStrength";

export default function ProfilePage() {
  const { user } = useAuth();
  const [form,    setForm]    = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setSuccess(false); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) { setError("New passwords do not match"); return; }
    setError(""); setLoading(true);
    try { await changePassword(form); setSuccess(true); setForm({ current_password: "", new_password: "", confirm_password: "" }); }
    catch (err) { setError(err.response?.data?.detail || "Failed to change password"); }
    finally { setLoading(false); }
  };

  return (
    <AppLayout>
      <div className="page-enter" style={{ padding: "28px 32px", maxWidth: 640 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>Profile Settings</h1>
        <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 28px" }}>Manage your personal information and account settings</p>

        {/* Account Info */}
        <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 14, padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px" }}>Account Information</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[["Full Name", user?.full_name], ["Email", user?.email]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: "1px solid #374151" }}>
                <span style={{ color: "#6b7280", fontSize: 13 }}>{k}</span>
                <span style={{ color: "#f9fafb", fontSize: 14, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Change Password */}
        <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 14, padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px" }}>Change Password</h2>

          {success && (
            <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
              <p style={{ color: "#4ade80", fontSize: 13, margin: 0 }}>✓ Password changed successfully.</p>
            </div>
          )}
          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
              <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input name="current_password" type="password" label="Current Password" placeholder="Your current password" value={form.current_password} onChange={handleChange} required />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Input name="new_password" type="password" label="New Password" placeholder="Choose a strong password" value={form.new_password} onChange={handleChange} required />
              <PasswordStrength password={form.new_password} />
            </div>
            <Input name="confirm_password" type="password" label="Confirm New Password" placeholder="Repeat your new password" value={form.confirm_password} onChange={handleChange} required />
            <Button type="submit" loading={loading} disabled={!form.current_password || !form.new_password || !form.confirm_password}>
              Update Password
            </Button>
          </form>
        </div>

        {/* Security */}
        <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 14px" }}>🔒 Security</h2>
          {[["Passwords hashed with bcrypt","Never stored in plain text"],["JWT session tokens","Expire automatically after 30 minutes"],["Rate limiting active","Brute-force protection on auth endpoints"]].map(([t, d]) => (
            <div key={t} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <span style={{ color: "#4ade80", fontSize: 13, flexShrink: 0 }}>✓</span>
              <div><p style={{ color: "#d1d5db", fontSize: 13, fontWeight: 500, margin: "0 0 1px" }}>{t}</p><p style={{ color: "#6b7280", fontSize: 12, margin: 0 }}>{d}</p></div>
            </div>
          ))}
          <div style={{ background: "#111827", borderRadius: 8, padding: "10px 14px", border: "1px solid #374151", marginTop: 8 }}>
            <p style={{ color: "#6b7280", fontSize: 12, margin: 0, lineHeight: 1.6 }}>
              <strong style={{ color: "#9ca3af" }}>Planned:</strong> Google OAuth, 2FA (TOTP), email verification, and session management.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}