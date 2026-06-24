// src/components/ui/EmptyState.js
import Card from "./Card";
import Button from "./Button";

export default function EmptyState({
  title = "Nothing here",
  description = "No data to show right now.",
  actionLabel,
  onAction,
}) {
  return (
    <Card style={{ padding: 18, textAlign: "center" }}>
      <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>
        {title}
      </div>

      <div style={{ marginTop: 6, fontSize: 13, color: "#64748b" }}>
        {description}
      </div>

      {actionLabel && onAction ? (
        <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
