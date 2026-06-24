import Card from "./ui/Card";
import ButtonLink from "./ui/ButtonLink";

function getInitials(name = "") {
  const parts = String(name).trim().split(" ").filter(Boolean);
  const a = parts[0]?.[0] ?? "D";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

function getSpecialtyName(specialty) {
  if (!specialty) return "General";
  if (typeof specialty === "string") return specialty;
  return specialty?.name ?? "General";
}

export default function DoctorCard({ doctor }) {
  const id = doctor?.id;
  const name = doctor?.name ?? "Doctor";
  const specialtyName = getSpecialtyName(doctor?.specialty);
  const city = doctor?.city ?? "—";

  const initials = getInitials(name);

  const cardBase = {
    padding: 16,
    border: "1px solid rgba(13,148,136,0.18)",
    boxShadow: "0 10px 28px rgba(2,6,23,0.06)",
    transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
    borderRadius: 16,
    background: "#fff",
  };

  return (
    <Card
      style={cardBase}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 16px 38px rgba(2,6,23,0.10)";
        e.currentTarget.style.borderColor = "rgba(13,148,136,0.34)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow = cardBase.boxShadow;
        e.currentTarget.style.borderColor = cardBase.border;
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        {/* Avatar */}
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 16,
            background:
              "linear-gradient(180deg, rgba(13,148,136,0.18), rgba(13,148,136,0.10))",
            border: "1px solid rgba(13,148,136,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            color: "#0f766e",
            flexShrink: 0,
            letterSpacing: 0.6,
          }}
          aria-hidden
          title={name}
        >
          {initials}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          {/* Name */}
          <div
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: "#0f172a",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={name}
          >
            {name}
          </div>

          {/* Meta pills */}
          <div
            style={{
              marginTop: 6,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "#0f766e",
                background: "rgba(13,148,136,0.10)",
                border: "1px solid rgba(13,148,136,0.18)",
                padding: "5px 9px",
                borderRadius: 999,
              }}
              title={specialtyName}
            >
              {specialtyName}
            </span>

            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#475569",
                background: "rgba(148,163,184,0.14)",
                border: "1px solid rgba(148,163,184,0.25)",
                padding: "5px 9px",
                borderRadius: 999,
              }}
              title={city}
            >
              {city}
            </span>

            {/* Optional small indicator (UX polish) */}
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "#0f172a",
                background: "rgba(2,6,23,0.04)",
                border: "1px solid rgba(2,6,23,0.08)",
                padding: "5px 9px",
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
              title="Availability"
            >
              <span
                aria-hidden
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: "rgba(13,148,136,0.65)",
                  display: "inline-block",
                }}
              />
              Available
            </span>
          </div>

          {/* Actions */}
          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <ButtonLink
              to={id ? `/doctors/${id}` : "#"}
              variant="secondary"
              style={{ flex: 1 }}
              aria-disabled={!id}
              onClick={(e) => {
                if (!id) e.preventDefault();
              }}
            >
              Details
            </ButtonLink>

            <ButtonLink
              to={id ? `/doctors/${id}#book` : "#"}
              variant="primary"
              style={{ flex: 1 }}
              aria-disabled={!id}
              onClick={(e) => {
                if (!id) e.preventDefault();
              }}
            >
              Book
            </ButtonLink>
          </div>
        </div>
      </div>
    </Card>
  );
}
