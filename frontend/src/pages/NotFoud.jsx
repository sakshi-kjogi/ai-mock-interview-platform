import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  const navigate = useNavigate();
  const { user }  = useAuth();

  return (
    <div style={{
      minHeight: "100vh", background: "#111827", color: "#f9fafb",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 32, textAlign: "center",
    }}>
      <div className="page-enter">
        <p style={{ fontSize: 72, fontWeight: 800, color: "#374151", margin: "0 0 8px", lineHeight: 1 }}>404</p>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>Page not found</h1>
        <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 28px", maxWidth: 320, lineHeight: 1.6 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button onClick={() => navigate(user ? "/dashboard" : "/login")}>
          {user ? "Back to Dashboard" : "Go to Login"}
        </Button>
      </div>
    </div>
  );
}