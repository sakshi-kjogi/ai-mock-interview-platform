import { useState } from "react";
import Sidebar from "./Sidebar";
import useIsMobile from "../hooks/useIsMobile";

export default function AppLayout({ children }) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#111827", overflowX: "hidden" }}>
      <Sidebar isOpen={isMobile ? sidebarOpen : true} onClose={() => setSidebarOpen(false)} />

      {isMobile && (
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            position: "fixed", top: 14, left: 14, zIndex: 30,
            width: 40, height: 40, borderRadius: 8,
            background: "#1e293b", border: "1px solid #334155",
            display: sidebarOpen ? "none" : "flex",
            alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#e2e8f0",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      )}

      <main style={{
        flex: 1,
        marginLeft: isMobile ? 0 : 220,
        minHeight: "100vh",
        color: "#f9fafb",
        width: isMobile ? "100%" : "auto",
        maxWidth: "100vw",
        paddingTop: isMobile ? 56 : 0,
        boxSizing: "border-box",
        overflowX: "hidden",
      }}>
        {children}
      </main>
    </div>
  );
}