import { colors } from "../../styles/tokens";

const CHECKS = [
  { label: "At least 8 characters",       test: (p) => p.length >= 8 },
  { label: "Uppercase letter (A–Z)",       test: (p) => /[A-Z]/.test(p) },
  { label: "Lowercase letter (a–z)",       test: (p) => /[a-z]/.test(p) },
  { label: "Number (0–9)",                 test: (p) => /[0-9]/.test(p) },
  { label: "Special character (!@#$...)",  test: (p) => /[^a-zA-Z0-9]/.test(p) },
];

const STRENGTH_LEVELS = [
  { label: "Very weak", color: "#ef4444" },
  { label: "Weak",      color: "#f97316" },
  { label: "Fair",      color: "#f59e0b" },
  { label: "Good",      color: "#3b82f6" },
  { label: "Strong",    color: "#22c55e" },
];

export default function PasswordStrength({ password }) {
  if (!password) return null;

  const results = CHECKS.map((c) => c.test(password));
  const score   = results.filter(Boolean).length;
  const level   = STRENGTH_LEVELS[score - 1] || STRENGTH_LEVELS[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Strength bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ color: colors.text.muted, fontSize: 11 }}>Password strength</span>
          <span style={{ color: level.color, fontSize: 11, fontWeight: 600 }}>{level.label}</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {STRENGTH_LEVELS.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i < score ? level.color : colors.bg.tertiary,
              transition: "background 0.25s ease",
            }} />
          ))}
        </div>
      </div>

      {/* Requirements checklist */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {CHECKS.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 700,
              background: results[i] ? "rgba(34,197,94,0.15)" : colors.bg.tertiary,
              color: results[i] ? "#4ade80" : colors.text.muted,
              transition: "all 0.2s ease",
            }}>
              {results[i] ? "✓" : ""}
            </span>
            <span style={{
              fontSize: 12,
              color: results[i] ? colors.text.secondary : colors.text.muted,
              transition: "color 0.2s ease",
            }}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}