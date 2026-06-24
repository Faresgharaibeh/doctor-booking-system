import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext";

import ButtonLink from "../components/ui/ButtonLink";
import PageHeader from "../components/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import EmptyState from "../components/ui/EmptyState";
import StatusBadge from "../components/ui/StatusBadge";

import { formatDateLabel, formatTimeLabel } from "../services/format";

import AppointmentsSkeleton from "../components/skeletons/AppointmentsSkeleton";

function normalizeStatus(s) {
  return String(s || "").toLowerCase();
}

function MyAppointments() {
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchAppointments = async (opts = {}) => {
    const { pageOverride = page, statusOverride = status } = opts;

    setLoading(true);
    try {
      const res = await api.get("/appointments", {
        params: {
          page: pageOverride,
          status: statusOverride || undefined,
        },
      });

      const list = res.data?.data?.items ?? [];
      const pg = res.data?.data?.pagination ?? null;

      setItems(list);
      setPagination(pg);
    } catch (err) {
      console.log("Appointments error:", err.response?.data || err);
      setItems([]);
      setPagination(null);
      showToast("Could not load appointments. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments({ pageOverride: 1 });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line
  }, [page, status]);

  const cancelAppointment = async (id) => {
    if (deletingId) return;

    const ok = await confirm({
      title: "Cancel Appointment",
      message: "Are you sure you want to cancel this appointment?",
      confirmText: "Yes, cancel",
      cancelText: "No",
    });

    if (!ok) return;

    setDeletingId(id);

    try {
      const res = await api.delete(`/appointments/${id}`);
      showToast(res.data?.message || "Appointment cancelled", "success");
      fetchAppointments();
    } catch (err) {
      console.log("Cancel error:", err.response?.data || err);
      showToast(err.response?.data?.message || "Cancel failed. Please try again.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const currentPage = pagination?.current_page ?? pagination?.page ?? page;
  const lastPage = pagination?.last_page ?? pagination?.total_pages ?? null;

  const canPrev = currentPage > 1;
  const canNext = lastPage ? currentPage < lastPage : true;

  const statusOptions = useMemo(
    () => [
      { value: "", label: "All" },
      { value: "pending", label: "Pending" },
      { value: "confirmed", label: "Confirmed" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
    ],
    []
  );

  return (
    <>
      <PageHeader
        title="My Appointments"
        subtitle="View your appointments and manage them easily."
        left={<ButtonLink to="/dashboard">← Back</ButtonLink>}
      />

      {/* Filter Bar */}
      <Card
        style={{
          padding: 14,
          borderRadius: 16,
          border: "1px solid rgba(13,148,136,0.18)",
          boxShadow: "0 10px 28px rgba(2,6,23,0.06)",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#0f172a", minWidth: 60 }}>
              Status
            </div>

            <Select
              value={status}
              onChange={(e) => {
                const val = e.target.value;
                setStatus(val);
                setPage(1);
                fetchAppointments({ pageOverride: 1, statusOverride: val });
              }}
              style={{ minWidth: 220 }}
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          <div style={{ fontSize: 12, color: "#64748b" }}>
            {loading ? "Loading..." : `${items.length} appointment(s)`}
          </div>
        </div>
      </Card>

      {loading ? (
        <AppointmentsSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          title="No appointments yet"
          description="Book your first appointment by browsing doctors."
          actionLabel="Browse doctors"
          actionTo="/doctors"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((a) => {
            const doctorName = a.doctor?.name || a.doctor_name || `Doctor #${a.doctor_id ?? "—"}`;
            const apptDateRaw = a.date || a.appointment_date || "";
            const apptTimeRaw = a.time || a.appointment_time || "";
            const apptDate = formatDateLabel(apptDateRaw);
            const apptTime = formatTimeLabel(apptTimeRaw);

            const s = normalizeStatus(a.status);

            const isCancelled = s === "cancelled" || s === "canceled";
            const canCancel = !isCancelled && deletingId !== a.id;

            return (
              <Card
                key={a.id}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  border: "1px solid rgba(2,6,23,0.06)",
                  boxShadow: "0 10px 26px rgba(2,6,23,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ minWidth: 240, flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>
                        {doctorName}
                      </div>
                      <StatusBadge status={a.status} />
                    </div>

                    <div style={{ marginTop: 8, fontSize: 13, color: "#475569", fontWeight: 700 }}>
                      {apptDate} • {apptTime}
                    </div>

                    <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>
                      Appointment ID: <span style={{ fontWeight: 800, color: "#0f172a" }}>{a.id}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Button
                      variant="danger"
                      loading={deletingId === a.id}
                      disabled={!canCancel}
                      onClick={() => cancelAppointment(a.id)}
                      style={{ minWidth: 110 }}
                    >
                      {isCancelled ? "Cancelled" : "Cancel"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div
        style={{
          marginTop: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="secondary"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={!canPrev}
        >
          Prev
        </Button>

        <span style={{ fontSize: 13, fontWeight: 900, color: "#0f172a" }}>
          Page {currentPage}
          {lastPage ? ` of ${lastPage}` : ""}
        </span>

        <Button
          variant="secondary"
          onClick={() => setPage((p) => p + 1)}
          disabled={!canNext}
        >
          Next
        </Button>
      </div>
    </>
  );
}

export default MyAppointments;
