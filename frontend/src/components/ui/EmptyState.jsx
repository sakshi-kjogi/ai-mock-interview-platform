import { colors } from "../../styles/tokens";

export default function EmptyState({ icon = "📭", title, description, action }) {
  return (
    <div style={{
      border: `1px dashed ${colors.border.default}`,
      borderRadius: 16,
      padding: "48px 32px",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
    }}>
      <span style={{ fontSize: 40 }}>{icon}</span>
      <p style={{ color: colors.text.primary, fontSize: 16, fontWeight: 600, margin: 0 }}>{title}</p>
      {description && <p style={{ color: colors.text.muted, fontSize: 13, margin: 0, maxWidth: 320 }}>{description}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}