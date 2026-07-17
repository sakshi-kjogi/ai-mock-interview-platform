import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";

const FEATURES = [
  ["🤖", "AI-Powered Questions", "Questions tailored to your role and experience level"],
  ["📊", "Real-time Feedback",   "Instant scoring on clarity, accuracy, and completeness"],
  ["🎤", "Voice Interviews",     "Answer using your voice with live transcription"],
  ["📄", "Resume-Based",         "Upload your resume for highly personalised questions"],
  ["📈", "Performance Analytics","Track improvement across sessions with charts"],
  ["🔒", "Secure & Private",     "Your data is encrypted and never shared"],
];

const COMPANIES = ["Google", "Microsoft", "Amazon", "TCS", "Infosys"];

export default function LandingPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [navOpen, setNavOpen] = useState(false);

  const sidePad = isMobile ? 20 : 64;

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#f8fafc", fontFamily: "inherit", overflowX: "hidden", maxWidth: "100vw" }}>
      {/* Navbar */}
      <nav style={{ borderBottom: "1px solid #1e293b", padding: `0 ${sidePad}px`, height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#0f172a", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🎯</div>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>InterviewIQ</span>
        </div>

        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {["Features", "How it Works", "Testimonials", "Pricing", "FAQ"].map(l => (
              <a key={l} href="#" style={{ color: "#94a3b8", fontSize: 14, textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => e.target.style.color = "#f8fafc"}
                onMouseLeave={e => e.target.style.color = "#94a3b8"}>
                {l}
              </a>
            ))}
          </div>
        )}

        {!isMobile && (
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => navigate("/login")}
              style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", padding: "8px 18px", borderRadius: 8, fontSize: 14, cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#f8fafc"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.color = "#94a3b8"; }}>
              Log In
            </button>
            <button onClick={() => navigate("/register")}
              style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)", border: "none", color: "#fff", padding: "8px 18px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Sign Up Free
            </button>
          </div>
        )}

        {isMobile && (
          <button onClick={() => setNavOpen(o => !o)}
            style={{ background: "none", border: "none", color: "#e2e8f0", cursor: "pointer", padding: 4 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {navOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        )}
      </nav>

      {/* Mobile nav dropdown */}
      {isMobile && navOpen && (
        <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {["Features", "How it Works", "Testimonials", "Pricing", "FAQ"].map(l => (
            <a key={l} href="#" style={{ color: "#94a3b8", fontSize: 15, textDecoration: "none" }}>{l}</a>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => navigate("/login")}
              style={{ flex: 1, background: "transparent", border: "1px solid #334155", color: "#94a3b8", padding: "10px 0", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>
              Log In
            </button>
            <button onClick={() => navigate("/register")}
              style={{ flex: 1, background: "linear-gradient(135deg,#6366f1,#4f46e5)", border: "none", color: "#fff", padding: "10px 0", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Sign Up Free
            </button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "40px 20px 40px" : "80px 64px 60px", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", gap: isMobile ? 32 : 60 }}>
        <div style={{ flex: 1, width: "100%" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 999, padding: "6px 14px", marginBottom: 24 }}>
            <span style={{ color: "#818cf8", fontSize: 12, fontWeight: 600 }}>✨ AI-Powered Interview Practice</span>
          </div>
          <h1 style={{ fontSize: isMobile ? 32 : 52, fontWeight: 800, lineHeight: 1.15, margin: "0 0 20px", letterSpacing: "-0.03em" }}>
            Ace Your Interviews<br />
            with <span style={{ background: "linear-gradient(135deg,#818cf8,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI Power</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: isMobile ? 15 : 17, lineHeight: 1.7, margin: "0 0 36px", maxWidth: isMobile ? "100%" : 480 }}>
            Realistic mock interviews, AI feedback, and personalised insights to help you land your dream job.
          </p>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 14, marginBottom: 48 }}>
            <button onClick={() => navigate("/register")}
              style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)", border: "none", color: "#fff", padding: "13px 28px", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              Start Free Mock Interview →
            </button>
            <button
              style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", padding: "13px 24px", borderRadius: 10, fontSize: 15, cursor: "pointer" }}>
              See How It Works
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: "10px 20px" }}>
            {["AI-Powered Questions", "Real-time Feedback", "Voice Interviews", "Resume-Based", "Performance Analytics", "Secure & Private"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#4ade80", fontSize: 13, flexShrink: 0 }}>✓</span>
                <span style={{ color: "#64748b", fontSize: 13 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Illustration - hidden on mobile to save vertical space and avoid squeeze */}
        {!isMobile && (
          <div style={{ width: 420, flexShrink: 0 }}>
            <div style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.1))", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 24, padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🤖</div>
              <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: 20, marginBottom: 12, textAlign: "left" }}>
                <p style={{ color: "#64748b", fontSize: 11, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>AI Question</p>
                <p style={{ color: "#e2e8f0", fontSize: 14, margin: 0, lineHeight: 1.5 }}>Explain how you would design a scalable REST API for a social media platform.</p>
              </div>
              <div style={{ background: "#1e293b", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 12, padding: 16, textAlign: "left" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "#818cf8", fontSize: 12, fontWeight: 600 }}>AI Score</span>
                  <span style={{ color: "#4ade80", fontSize: 14, fontWeight: 700 }}>8.5/10</span>
                </div>
                <div style={{ height: 4, background: "#334155", borderRadius: 2 }}>
                  <div style={{ width: "85%", height: "100%", background: "linear-gradient(90deg,#6366f1,#8b5cf6)", borderRadius: 2 }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Features */}
      <section style={{ background: "#0a0f1a", padding: isMobile ? "40px 20px" : "60px 64px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 700, textAlign: "center", margin: "0 0 8px", letterSpacing: "-0.02em" }}>Everything you need to prepare</h2>
          <p style={{ color: "#64748b", textAlign: "center", margin: "0 0 40px", fontSize: isMobile ? 14 : 16 }}>A complete platform for technical and behavioural interview preparation.</p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 20 }}>
            {FEATURES.map(([icon, title, desc]) => (
              <div key={title} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, padding: 24, transition: "border-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1e293b"}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 14 }}>{icon}</div>
                <p style={{ fontWeight: 600, fontSize: 15, margin: "0 0 6px" }}>{title}</p>
                <p style={{ color: "#64748b", fontSize: 13, margin: 0, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section style={{ padding: isMobile ? "32px 20px" : "48px 64px", borderTop: "1px solid #1e293b", textAlign: "center" }}>
        <p style={{ color: "#475569", fontSize: 13, margin: "0 0 24px" }}>Trusted by learners and professionals from</p>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: isMobile ? 24 : 48 }}>
          {COMPANIES.map(c => (
            <span key={c} style={{ color: "#334155", fontSize: isMobile ? 14 : 16, fontWeight: 700, letterSpacing: "0.05em" }}>{c}</span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: isMobile ? "48px 20px" : "80px 64px", textAlign: "center", background: "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.05))" }}>
        <h2 style={{ fontSize: isMobile ? 24 : 36, fontWeight: 800, margin: "0 0 12px", letterSpacing: "-0.02em" }}>Ready to land your dream job?</h2>
        <p style={{ color: "#64748b", fontSize: isMobile ? 14 : 16, margin: "0 0 32px" }}>Join thousands of developers who improved their interview skills with InterviewIQ.</p>
        <button onClick={() => navigate("/register")}
          style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)", border: "none", color: "#fff", padding: "14px 36px", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
          Get Started for Free →
        </button>
      </section>

      <footer style={{ borderTop: "1px solid #1e293b", padding: isMobile ? "20px" : "24px 64px", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: "center", gap: isMobile ? 16 : 0 }}>
        <span style={{ color: "#334155", fontSize: 13 }}>© 2026 InterviewIQ. All rights reserved.</span>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "Contact"].map(l => (
            <a key={l} href="#" style={{ color: "#334155", fontSize: 13, textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}