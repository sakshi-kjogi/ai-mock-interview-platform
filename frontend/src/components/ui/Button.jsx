import { colors, radius, transition } from "../../styles/tokens";

const variants = {
  primary: {
    background: colors.accent.primary,
    color: "#fff",
    border: "none",
    hoverBg: colors.accent.hover,
  },
  secondary: {
    background: "transparent",
    color: colors.text.primary,
    border: `1px solid ${colors.border.light}`,
    hoverBg: colors.bg.secondary,
  },
  danger: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    hoverBg: "#b91c1c",
  },
  ghost: {
    background: "transparent",
    color: colors.text.secondary,
    border: "none",
    hoverBg: colors.bg.secondary,
  },
};

const sizes = {
  sm: { padding: "6px 12px", fontSize: 12, height: 30 },
  md: { padding: "9px 18px", fontSize: 14, height: 38 },
  lg: { padding: "11px 24px", fontSize: 15, height: 44 },
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  style = {},
  ...props
}) {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: s.padding,
        height: s.height,
        fontSize: s.fontSize,
        fontWeight: 600,
        borderRadius: radius.md,
        border: v.border,
        background: (disabled || loading) ? colors.bg.tertiary : v.background,
        color: (disabled || loading) ? colors.text.muted : v.color,
        cursor: (disabled || loading) ? "not-allowed" : "pointer",
        transition: transition.fast,
        width: fullWidth ? "100%" : "auto",
        opacity: (disabled || loading) ? 0.7 : 1,
        whiteSpace: "nowrap",
        ...style,
      }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.background = v.hoverBg; }}
      onMouseLeave={e => { if (!disabled && !loading) e.currentTarget.style.background = (disabled || loading) ? colors.bg.tertiary : v.background; }}
    >
      {loading && (
        <span style={{
          width: 14, height: 14, borderRadius: "50%",
          border: "2px solid currentColor",
          borderTopColor: "transparent",
          display: "inline-block",
          animation: "spin 0.7s linear infinite",
        }} />
      )}
      {children}
    </button>
  );
}