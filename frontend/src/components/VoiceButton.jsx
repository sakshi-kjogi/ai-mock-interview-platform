export default function VoiceButton({ isRecording, isSupported, onClick }) {
  if (!isSupported) return null;

  return (
    <button
      onClick={onClick}
      title={isRecording ? "Stop recording" : "Start voice input"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        borderRadius: 8,
        border: isRecording ? "1px solid #ef4444" : "1px solid #4b5563",
        background: isRecording ? "rgba(239,68,68,0.1)" : "transparent",
        color: isRecording ? "#f87171" : "#9ca3af",
        fontSize: 13,
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      {/* Pulsing dot when recording */}
      <span style={{
        width: 8, height: 8, borderRadius: "50%",
        background: isRecording ? "#ef4444" : "#6b7280",
        display: "inline-block",
        animation: isRecording ? "pulse 1.2s infinite" : "none",
      }} />
      {isRecording ? "Stop Recording" : "🎤 Speak Answer"}

      {/* Inject keyframe animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.3); }
        }
      `}</style>
    </button>
  );
}