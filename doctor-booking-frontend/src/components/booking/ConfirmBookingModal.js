import { useMemo, useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

const styles = {
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(2,6,23,0.08)",
    background: "rgba(2,6,23,0.02)",
  },
  label: { fontSize: 12, fontWeight: 800, color: "#64748b" },
  value: { fontSize: 13, fontWeight: 900, color: "#0f172a" },
  hint: { marginTop: 10, fontSize: 12, color: "#64748b", lineHeight: 1.5 },
  error: {
    marginTop: 10,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(239,68,68,0.25)",
    background: "rgba(239,68,68,0.06)",
    color: "#991b1b",
    fontSize: 12,
    fontWeight: 800,
  },
};

function getSpecialtyName(doctor) {
  const s = doctor?.specialty;
  if (!s) return doctor?.specialty_name || "—";
  if (typeof s === "string") return s;
  return s?.name ?? doctor?.specialty_name ?? "—";
}

export default function ConfirmBookingModal({
  open,
  onClose,
  doctor,
  date,
  time,
  onConfirm, // async
}) {
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  const summary = useMemo(() => {
    return {
      name: doctor?.name ?? "Doctor",
      specialty: getSpecialtyName(doctor),
      city: doctor?.city ?? "—",
    };
  }, [doctor]);

  const canConfirm = Boolean(open && doctor && date && time);

  const handleConfirm = async () => {
    if (!canConfirm || submitting) return;
    setLocalError("");
    setSubmitting(true);
    try {
      await onConfirm?.();
    } catch (e) {
      setLocalError("Could not confirm booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Confirm Booking"
      onClose={submitting ? undefined : onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            loading={submitting}
            disabled={!canConfirm}
          >
            Confirm
          </Button>
        </>
      }
      maxWidth={560}
    >
      <div style={{ display: "grid", gap: 10 }}>
        <div style={styles.row}>
          <div style={styles.label}>Doctor</div>
          <div style={styles.value}>{summary.name}</div>
        </div>

        <div style={styles.row}>
          <div style={styles.label}>Specialty</div>
          <div style={styles.value}>{summary.specialty}</div>
        </div>

        <div style={styles.row}>
          <div style={styles.label}>City</div>
          <div style={styles.value}>{summary.city}</div>
        </div>

        <div style={styles.row}>
          <div style={styles.label}>Date</div>
          <div style={styles.value}>{date || "—"}</div>
        </div>

        <div style={styles.row}>
          <div style={styles.label}>Time</div>
          <div style={styles.value}>{time || "—"}</div>
        </div>

        <div style={styles.hint}>
          You can manage your appointment later from <strong>My Appointments</strong>.
        </div>

        {localError ? <div style={styles.error}>{localError}</div> : null}
      </div>
    </Modal>
  );
}
