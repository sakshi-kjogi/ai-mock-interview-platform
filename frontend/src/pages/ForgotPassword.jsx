import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";

export default function ForgotPassword() {
  const navigate = useNavigate();

  return (
    <div className="page-enter" style={{ minHeight: "100vh", background: "#111827", color: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
        <p style={{ fontSize: 40, marginBottom: 16 }}>📧</p>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>Forgot your password?</h1>
        <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7, margin: "0 0 24px" }}>
          Password reset via email is a planned feature. It requires connecting an email provider (SendGrid, Resend, or AWS SES) which is configured during deployment.
        </p>
        <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 12, padding: 18, marginBottom: 24, textAlign: "left" }}>
          <p style={{ color: "#9ca3af", fontSize: 13, fontWeight: 500, margin: "0 0 8px" }}>In the meantime:</p>
          <p style={{ color: "#6b7280", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
            If you have access to the deployment environment, a password can be reset directly via the API using a service account or database access. This is standard practice during the pre-email-service phase of a deployment.
          </p>
        </div>
        <Button fullWidth onClick={() => navigate("/login")}>← Back to Login</Button>
      </div>
    </div>
  );
}