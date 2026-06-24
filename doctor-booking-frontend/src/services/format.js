export function formatDateLabel(dateStr) {
  if (!dateStr) return "—";
  const parts = String(dateStr).split("-");
  if (parts.length !== 3) return dateStr;

  const [y, m, d] = parts.map(Number);
  if (!y || !m || !d) return dateStr;

  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function formatTimeLabel(timeStr) {
  if (!timeStr) return "—";
  const [hh, mm] = String(timeStr).split(":");
  if (hh == null || mm == null) return timeStr;

  const dt = new Date();
  dt.setHours(Number(hh), Number(mm), 0, 0);
  return dt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}
