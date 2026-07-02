export function Skeleton({ width = "100%", height = 16, radius = 6, style = {} }) {
  return (
    <div style={{
      width, height,
      borderRadius: radius,
      background: "#1f2937",
      animation: "skeletonPulse 1.5s ease-in-out infinite",
      ...style,
    }} />
  );
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
      <Skeleton height={18} width="60%" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={13} width={i === lines - 1 ? "40%" : "100%"} />
      ))}
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 12, padding: 20, flex: 1 }}>
      <Skeleton height={11} width="60%" style={{ marginBottom: 10 }} />
      <Skeleton height={32} width="40%" style={{ marginBottom: 8 }} />
      <Skeleton height={11} width="50%" />
    </div>
  );
}