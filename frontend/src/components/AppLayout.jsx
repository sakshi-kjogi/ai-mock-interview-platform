import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#111827" }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 220, minHeight: "100vh", color: "#f9fafb" }}>
        {children}
      </main>
    </div>
  );
}