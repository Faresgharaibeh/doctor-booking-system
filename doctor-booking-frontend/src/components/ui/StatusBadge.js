export default function StatusBadge({ status = "" }) {
  const s = String(status || "").toLowerCase();

  const map = {
    pending: {
      label: "Pending",
      bg: "rgba(245,158,11,0.14)",
      bd: "rgba(245,158,11,0.30)",
      tx: "#92400e",
    },
    confirmed: {
      label: "Confirmed",
      bg: "rgba(13,148,136,0.12)",
      bd: "rgba(13,148,136,0.26)",
      tx: "#0f766e",
    },
    upcoming: {
      label: "Upcoming",
      bg: "rgba(13,148,136,0.12)",
      bd: "rgba(13,148,136,0.26)",
      tx: "#0f766e",
    },
    completed: {
      label: "Completed",
      bg: "rgba(100,116,139,0.12)",
      bd: "rgba(100,116,139,0.22)",
      tx: "#334155",
    },
    cancelled: {
      label: "Cancelled",
      bg: "rgba(239,68,68,0.10)",
      bd: "rgba(239,68,68,0.24)",
      tx: "#b91c1c",
    },
    canceled: {
      label: "Cancelled",
      bg: "rgba(239,68,68,0.10)",
      bd: "rgba(239,68,68,0.24)",
      tx: "#b91c1c",
    },
  };

  const cfg =
    map[s] || {
      label: status || "—",
      bg: "rgba(2,6,23,0.06)",
      bd: "rgba(2,6,23,0.10)",
      tx: "#0f172a",
    };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 12,
        fontWeight: 900,
        padding: "6px 10px",
        borderRadius: 999,
        background: cfg.bg,
        border: `1px solid ${cfg.bd}`,
        color: cfg.tx,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
      title={cfg.label}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: cfg.tx,
          opacity: 0.8,
        }}
      />
      {cfg.label}
    </span>
  );
}
