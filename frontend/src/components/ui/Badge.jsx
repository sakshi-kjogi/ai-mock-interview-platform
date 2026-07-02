import { colors, radius } from "../../styles/tokens";

const presets = {
  success:    colors.status.success,
  warning:    colors.status.warning,
  danger:     colors.status.danger,
  info:       colors.status.info,
  terminated: colors.status.terminated,
};

export default function Badge({ children, variant = "info", style = {} }) {
  const preset = presets[variant] || presets.info;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 10px",
      borderRadius: radius.full,
      fontSize: 12,
      fontWeight: 500,
      background: preset.bg,
      color: preset.color,
      whiteSpace: "nowrap",
      ...style,
    }}>
      {children}
    </span>
  );
}