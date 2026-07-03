import { useNavigate } from "react-router-dom";

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

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#f8fafc", fontFamily: "inherit" }}>
      {/* Navbar */}
      <nav style={{ borderBottom: "1px solid #1e293b", padding: "0 64px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#0f172a", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🎯</div>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>InterviewAI</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Features", "How it Works", "Testimonials", "Pricing", "FAQ"].map(l => (
            <a key={l} href="#" style={{ color: "#94a3b8", fontSize: 14, textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => e.target.style.color = "#f8fafc"}
              onMouseLeave={e => e.target.style.color = "#94a3b8"}>
              {l}
            </a>
          ))}
        </div>

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
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 64px 60px", display: "flex", alignItems: "center", gap: 60 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 999, padding: "6px 14px", marginBottom: 24 }}>
            <span style={{ color: "#818cf8", fontSize: 12, fontWeight: 600 }}>✨ AI-Powered Interview Practice</span>
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, margin: "0 0 20px", letterSpacing: "-0.03em" }}>
            Ace Your Interviews<br />
            with <span style={{ background: "linear-gradient(135deg,#818cf8,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI Power</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: 17, lineHeight: 1.7, margin: "0 0 36px", maxWidth: 480 }}>
            Realistic mock interviews, AI feedback, and personalised insights to help you land your dream job.
          </p>
          <div style={{ display: "flex", gap: 14, marginBottom: 48 }}>
            <button onClick={() => navigate("/register")}
              style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)", border: "none", color: "#fff", padding: "13px 28px", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              Start Free Mock Interview →
            </button>
            <button
              style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", padding: "13px 24px", borderRadius: 10, fontSize: 15, cursor: "pointer" }}>
              See How It Works
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px 24px" }}>
            {["AI-Powered Questions", "Real-time Feedback", "Voice Interviews", "Resume-Based", "Performance Analytics", "Secure & Private"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#4ade80", fontSize: 13 }}>✓</span>
                <span style={{ color: "#64748b", fontSize: 13 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Illustration placeholder */}
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
      </section>

      {/* Features */}
      <section style={{ background: "#0a0f1a", padding: "60px 64px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: "center", margin: "0 0 8px", letterSpacing: "-0.02em" }}>Everything you need to prepare</h2>
          <p style={{ color: "#64748b", textAlign: "center", margin: "0 0 48px" }}>A complete platform for technical and behavioural interview preparation.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
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
      <section style={{ padding: "48px 64px", borderTop: "1px solid #1e293b", textAlign: "center" }}>
        <p style={{ color: "#475569", fontSize: 13, margin: "0 0 24px" }}>Trusted by learners and professionals from</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 48 }}>
          {COMPANIES.map(c => (
            <span key={c} style={{ color: "#334155", fontSize: 16, fontWeight: 700, letterSpacing: "0.05em" }}>{c}</span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 64px", textAlign: "center", background: "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.05))" }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 12px", letterSpacing: "-0.02em" }}>Ready to land your dream job?</h2>
        <p style={{ color: "#64748b", fontSize: 16, margin: "0 0 32px" }}>Join thousands of developers who improved their interview skills with InterviewAI.</p>
        <button onClick={() => navigate("/register")}
          style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)", border: "none", color: "#fff", padding: "14px 36px", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
          Get Started for Free →
        </button>
      </section>

      <footer style={{ borderTop: "1px solid #1e293b", padding: "24px 64px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#334155", fontSize: 13 }}>© 2026 InterviewAI. All rights reserved.</span>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "Contact"].map(l => (
            <a key={l} href="#" style={{ color: "#334155", fontSize: 13, textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}