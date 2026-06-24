import Card from "./ui/Card";

function Bar({ w, h = 10 }) {
  return (
    <div
      style={{
        height: h,
        width: w,
        borderRadius: 999,
        background: "rgba(148,163,184,0.35)",
      }}
    />
  );
}

export default function DoctorsSkeleton({ count = 8 }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 14,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} style={{ padding: 16 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "rgba(148,163,184,0.35)",
              }}
            />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              <Bar w="70%" h={12} />
              <div style={{ display: "flex", gap: 8 }}>
                <Bar w={80} />
                <Bar w={60} />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <Bar w="50%" h={36} />
                <Bar w="50%" h={36} />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
