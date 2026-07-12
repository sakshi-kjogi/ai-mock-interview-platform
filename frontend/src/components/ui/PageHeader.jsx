import { colors } from "../../styles/tokens";
import useIsMobile from "../../hooks/useIsMobile";

export default function PageHeader({ left, center, right }) {
  const isMobile = useIsMobile();

  return (
    <div style={{
      borderBottom: `1px solid ${colors.border.default}`,
      padding: isMobile ? "0 16px" : "0 32px",
      height: 56,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: colors.bg.primary,
      position: "sticky",
      top: 0,
      zIndex: 10,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>{left}</div>
      {center && <div style={{ flex: 1, display: "flex", justifyContent: "center", minWidth: 0 }}>{center}</div>}
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", minWidth: 0 }}>{right}</div>
    </div>
  );
}