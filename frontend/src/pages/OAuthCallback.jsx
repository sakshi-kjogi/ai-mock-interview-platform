import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("Missing authentication token. Please try signing in again.");
      return;
    }
    loginWithToken(token)
      .then(() => navigate("/dashboard"))
      .catch(() => setError("Failed to complete sign-in. Please try again."));
  }, []); // eslint-disable-line

  return (
    <div style={{ minHeight: "100vh", background: "#111827", color: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ textAlign: "center" }}>
        {error ? (
          <>
            <p style={{ fontSize: 32, marginBottom: 12 }}>⚠️</p>
            <p style={{ color: "#f87171", fontSize: 14, marginBottom: 20 }}>{error}</p>
            <button onClick={() => navigate("/login")}
              style={{ background: "#6366f1", border: "none", color: "#fff", padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Back to Login
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: 32, marginBottom: 12 }}>🎯</p>
            <p style={{ color: "#6b7280", fontSize: 14 }}>Signing you in...</p>
          </>
        )}
      </div>
    </div>
  );
}