import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import api from "../services/api";
import { useToast } from "../context/ToastContext";

import ButtonLink from "../components/ui/ButtonLink";
import PageHeader from "../components/PageHeader";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";

import DoctorDetailsSkeleton from "../components/skeletons/DoctorDetailsSkeleton";
import ConfirmBookingModal from "../components/booking/ConfirmBookingModal";

function getInitials(name = "") {
  const parts = String(name).trim().split(" ").filter(Boolean);
  const a = parts[0]?.[0] ?? "D";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

function getSpecialtyName(doctor) {
  const s = doctor?.specialty;
  if (!s) return doctor?.specialty_name || "—";
  if (typeof s === "string") return s;
  return s?.name ?? doctor?.specialty_name ?? "—";
}

function resolveDoctor(resData) {
  const data = resData?.data ?? resData;
  return data?.item || data?.doctor || data || null;
}

// ✅ normalize for /doctors/{id}/slots response
function normalizePublicSlots(resData) {
  // expected: { data: { items: [...], meta: {...} } }
  const data = resData?.data ?? resData;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data)) return data;
  return [];
}

function slotLabel(slot) {
  // show time range
  const start = slot?.start_time ?? "";
  const end = slot?.end_time ?? "";
  if (!start && !end) return "—";
  if (start && end) return `${start} - ${end}`;
  return start || end;
}

export default function DoctorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [doctor, setDoctor] = useState(null);

  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);

  // ✅ selection now uses slot object (id + time range)
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // booking submit loading
  const [booking, setBooking] = useState(false);

  // ✅ modal state
  const [confirmOpen, setConfirmOpen] = useState(false);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const fetchDoctor = async () => {
    setLoadingDoctor(true);
    try {
      const res = await api.get(`/doctors/${id}`);
      setDoctor(resolveDoctor(res.data));
    } catch (err) {
      console.log("Doctor details error:", err.response?.data || err);
      setDoctor(null);
    } finally {
      setLoadingDoctor(false);
    }
  };

  // ✅ NEW: fetch slots from /doctors/{id}/slots
  const fetchSlots = async (pickedDate) => {
    if (!pickedDate) return;

    setLoadingSlots(true);
    try {
      const res = await api.get(`/doctors/${id}/slots`, {
        params: { date: pickedDate, page: 1 },
      });

      const items = normalizePublicSlots(res.data?.data ?? res.data);
      setSlots(items);
    } catch (err) {
      console.log("Slots error:", err.response?.data || err);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // ✅ actual submit called from modal
  const submitBooking = async () => {
    if (!selectedSlot?.id) {
      showToast("Please select a slot", "info");
      throw new Error("No slot selected");
    }

    setBooking(true);
    try {
      const res = await api.post("/appointments/book", {
        slot_id: selectedSlot.id,
      });

      showToast(res.data?.message || "Appointment booked successfully", "success");
      setConfirmOpen(false);
      navigate("/appointments");
    } catch (err) {
      console.log("Booking error:", err.response?.data || err);
      showToast(err.response?.data?.message || "Booking failed. Please try again.", "error");
      throw err;
    } finally {
      setBooking(false);
    }
  };

  useEffect(() => {
    fetchDoctor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const name = doctor?.name ?? "Doctor";
  const initials = getInitials(name);
  const specialtyName = getSpecialtyName(doctor);
  const city = doctor?.city ?? "—";

  return (
    <div>
      <PageHeader
        title="Doctor Details"
        subtitle="Pick a date, choose a slot, then confirm your booking."
        left={<ButtonLink to="/doctors">← Back</ButtonLink>}
      />

      {loadingDoctor ? (
        <DoctorDetailsSkeleton />
      ) : !doctor ? (
        <EmptyState
          title="Doctor not found"
          description="This doctor may have been removed or the link is incorrect."
          actionLabel="Back to Doctors"
          onAction={() => navigate("/doctors")}
        />
      ) : (
        <div
          className="doctor-details-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: 14,
            alignItems: "start",
          }}
        >
          {/* LEFT: Doctor info */}
          <Card
            style={{
              padding: 16,
              border: "1px solid rgba(13,148,136,0.18)",
              boxShadow: "0 10px 28px rgba(2,6,23,0.06)",
              borderRadius: 16,
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 18,
                  background:
                    "linear-gradient(180deg, rgba(13,148,136,0.18), rgba(13,148,136,0.10))",
                  border: "1px solid rgba(13,148,136,0.22)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  color: "#0f766e",
                  letterSpacing: 0.6,
                  flexShrink: 0,
                }}
                aria-hidden
                title={name}
              >
                {initials}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 18,
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

                <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: "#0f766e",
                      background: "rgba(13,148,136,0.10)",
                      border: "1px solid rgba(13,148,136,0.18)",
                      padding: "6px 10px",
                      borderRadius: 999,
                    }}
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
                      padding: "6px 10px",
                      borderRadius: 999,
                    }}
                  >
                    {city}
                  </span>

                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: "#0f172a",
                      background: "rgba(2,6,23,0.04)",
                      border: "1px solid rgba(2,6,23,0.08)",
                      padding: "6px 10px",
                      borderRadius: 999,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                    title="Availability indicator"
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

                <div style={{ marginTop: 14, color: "#475569", fontSize: 13, lineHeight: 1.6 }}>
                  Book your visit with <strong>{name}</strong>. Select a date, then choose an
                  available slot.
                </div>
              </div>
            </div>
          </Card>

          {/* RIGHT: Booking */}
          <Card
            style={{
              padding: 16,
              border: "1px solid rgba(13,148,136,0.18)",
              boxShadow: "0 10px 28px rgba(2,6,23,0.06)",
              borderRadius: 16,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 900, color: "#0f172a" }}>
              Book Appointment
            </div>

            {/* Date */}
            <div style={{ marginTop: 12 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#334155",
                }}
              >
                Date
              </label>

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ minWidth: 220, flex: 1 }}>
                  <Input
                    type="date"
                    min={today}
                    value={date}
                    disabled={booking}
                    onChange={(e) => {
                      const d = e.target.value;
                      setDate(d);
                      setSelectedSlot(null);
                      fetchSlots(d); // ✅ fetch slots
                    }}
                  />
                </div>

                <Button
                  variant="secondary"
                  disabled={!date || loadingSlots || booking}
                  onClick={() => fetchSlots(date)}
                >
                  Refresh
                </Button>
              </div>
            </div>

            {/* Slots */}
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#0f172a" }}>
                  Available Slots
                </div>
                {date ? <span style={{ fontSize: 12, color: "#64748b" }}>{date}</span> : null}
              </div>

              <div style={{ marginTop: 10 }}>
                {loadingSlots ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <Skeleton key={i} height={34} width="110px" />
                    ))}
                  </div>
                ) : !date ? (
                  <div style={{ fontSize: 13, color: "#64748b" }}>Pick a date to see slots.</div>
                ) : slots.length === 0 ? (
                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    No available slots for this date. Try another day.
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {slots.map((slot) => {
                        const label = slotLabel(slot);
                        const isActive = selectedSlot?.id === slot?.id;

                        return (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlot(slot)}
                            disabled={booking || loadingSlots}
                            style={{
                              padding: "8px 10px",
                              borderRadius: 10,
                              border: isActive
                                ? "1px solid rgba(13,148,136,0.55)"
                                : "1px solid rgba(148,163,184,0.35)",
                              background: isActive ? "rgba(13,148,136,0.12)" : "#fff",
                              color: "#0f172a",
                              fontWeight: 800,
                              cursor: booking || loadingSlots ? "not-allowed" : "pointer",
                              opacity: booking || loadingSlots ? 0.6 : 1,
                            }}
                            title={label}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ marginTop: 10, fontSize: 13, color: "#475569" }}>
                      {selectedSlot ? (
                        <>
                          Selected:{" "}
                          <strong style={{ color: "#0f172a" }}>
                            {slotLabel(selectedSlot)}
                          </strong>
                        </>
                      ) : (
                        "Select a slot."
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Confirm */}
            <div style={{ marginTop: 14 }}>
              <Button
                onClick={() => {
                  if (!date || !selectedSlot) {
                    showToast("Please select date and slot", "info");
                    return;
                  }
                  setConfirmOpen(true);
                }}
                variant="primary"
                loading={booking}
                disabled={!date || !selectedSlot || loadingSlots}
                style={{ width: "100%" }}
              >
                Confirm Booking
              </Button>
            </div>
          </Card>

          {/* ✅ Modal mount */}
          <ConfirmBookingModal
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            doctor={doctor}
            date={date}
            // ✅ keep modal compatible: pass time as label (range)
            time={selectedSlot ? slotLabel(selectedSlot) : ""}
            onConfirm={submitBooking}
          />
        </div>
      )}

      {/* ✅ Responsive fix */}
      <style>{`
        @media (max-width: 900px) {
          .doctor-details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
