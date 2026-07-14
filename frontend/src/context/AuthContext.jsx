import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axiosInstance";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, if a token exists, fetch the current user to restore session.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    api.get("/api/v1/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/api/v1/auth/login", { email, password });
    localStorage.setItem("token", data.access_token);
    const me = await api.get("/api/v1/auth/me");
    setUser(me.data);
  };

  // Used by the OAuth callback page — the backend already issued a valid
  // JWT and handed it to us via the redirect URL, so we just need to store
  // it and fetch the user, skipping the email/password exchange.
  const loginWithToken = async (token) => {
    localStorage.setItem("token", token);
    const me = await api.get("/api/v1/auth/me");
    setUser(me.data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);