import { useState } from "react";
import { colors, radius, transition } from "../../styles/tokens";

export function Input({ label, error, style = {}, type = "text", ...props }) {
  const [focused,  setFocused]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const isPassword = type === "password";
  const inputType  = isPassword ? (showPass ? "text" : "password") : type;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={{ color: colors.text.secondary, fontSize: 13, fontWeight: 500 }}>{label}</label>}
      <div style={{ position: "relative" }}>
        <input
          {...props}
          type={inputType}
          onFocus={e => { setFocused(true); props.onFocus?.(e); }}
          onBlur={e => { setFocused(false); props.onBlur?.(e); }}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: isPassword ? "10px 40px 10px 14px" : "10px 14px",
            background: colors.bg.secondary,
            border: `1px solid ${focused ? colors.border.focus : error ? "#ef4444" : colors.border.default}`,
            borderRadius: radius.md,
            color: colors.text.primary,
            fontSize: 14,
            outline: "none",
            transition: transition.fast,
            ...style,
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              color: colors.text.muted, fontSize: 16, padding: 2,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: transition.fast,
            }}
            onMouseEnter={e => e.currentTarget.style.color = colors.text.secondary}
            onMouseLeave={e => e.currentTarget.style.color = colors.text.muted}
            tabIndex={-1}
            title={showPass ? "Hide password" : "Show password"}
          >
            {showPass ? "🙈" : "👁"}
          </button>
        )}
      </div>
      {error && <p style={{ color: "#f87171", fontSize: 12, margin: 0 }}>{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, rows = 8, style = {}, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={{ color: colors.text.secondary, fontSize: 13, fontWeight: 500 }}>{label}</label>}
      <textarea
        {...props}
        rows={rows}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "12px 14px",
          background: colors.bg.secondary,
          border: `1px solid ${focused ? colors.border.focus : error ? "#ef4444" : colors.border.default}`,
          borderRadius: radius.md,
          color: colors.text.primary,
          fontSize: 14,
          lineHeight: 1.6,
          outline: "none",
          resize: "none",
          transition: transition.fast,
          fontFamily: "inherit",
          ...style,
        }}
      />
      {error && <p style={{ color: "#f87171", fontSize: 12, margin: 0 }}>{error}</p>}
    </div>
  );
}