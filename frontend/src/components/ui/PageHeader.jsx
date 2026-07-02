import { colors } from "../../styles/tokens";

export default function PageHeader({ left, center, right }) {
  return (
    <div style={{
      borderBottom: `1px solid ${colors.border.default}`,
      padding: "0 32px",
      height: 56,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: colors.bg.primary,
      position: "sticky",
      top: 0,
      zIndex: 10,
    }}>
      <div style={{ flex: 1 }}>{left}</div>
      {center && <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>{center}</div>}
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>{right}</div>
    </div>
  );
}