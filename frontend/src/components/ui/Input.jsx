import { useState } from "react";
import { colors, radius, transition } from "../../styles/tokens";

function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

export function Input({ label, error, style = {}, type = "text", ...props }) {
  const [focused,  setFocused]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const isPassword = type === "password";
  const inputType  = isPassword ? (showPass ? "text" : "password") : type;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ color: colors.text.secondary, fontSize: 13, fontWeight: 500 }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <input
          {...props}
          type={inputType}
          onFocus={e => { setFocused(true);  props.onFocus?.(e); }}
          onBlur={e =>  { setFocused(false); props.onBlur?.(e); }}
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
            aria-label={showPass ? "Hide password" : "Show password"}
            tabIndex={-1}
            style={{
              position: "absolute", right: 12, top: "50%",
              transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              color: colors.text.muted, padding: 2,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: transition.fast,
            }}
            onMouseEnter={e => e.currentTarget.style.color = colors.text.secondary}
            onMouseLeave={e => e.currentTarget.style.color = colors.text.muted}
          >
            <EyeIcon open={showPass} />
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
      {label && (
        <label style={{ color: colors.text.secondary, fontSize: 13, fontWeight: 500 }}>
          {label}
        </label>
      )}
      <textarea
        {...props}
        rows={rows}
        onFocus={e => { setFocused(true);  props.onFocus?.(e); }}
        onBlur={e =>  { setFocused(false); props.onBlur?.(e); }}
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