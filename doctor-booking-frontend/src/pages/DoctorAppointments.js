import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/ui/EmptyState";
import { toast } from "../services/toastBus";

const STATUSES = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

function badgeStyle(status) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    border: "1px solid transparent",
    whiteSpace: "nowrap",
  };

  const map = {
    confirmed: {
      color: "#065f46",
      background: "rgba(16,185,129,0.12)",
      border: "1px solid rgba(16,185,129,0.28)",
    },
    pending: {
      color: "#9a3412",
      background: "rgba(251,146,60,0.14)",
      border: "1px solid rgba(251,146,60,0.26)",
    },
    cancelled: {
      color: "#9f1239",
      background: "rgba(244,63,94,0.12)",
      border: "1px solid rgba(244,63,94,0.26)",
    },
    completed: {
      color: "#1d4ed8",
      background: "rgba(59,130,246,0.12)",
      border: "1px solid rgba(59,130,246,0.26)",
    },
  };

  return { ...base, ...(map[status] || {}) };
}

function formatTimeRange(a) {
  const s = a?.start_time?.slice(0, 5);
  const e = a?.end_time?.slice(0, 5);
  return s && e ? `${s} - ${e}` : s || "—";
}

export default function DoctorAppointments() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialStatus = searchParams.get("status") || "";
  const initialDate = searchParams.get("date") || "";

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(initialStatus);
  const [date, setDate] = useState(initialDate);

  // 🔥 مزامنة state → URL
  useEffect(() => {
    const params = {};
    if (status) params.status = status;
    if (date) params.date = date;
    setSearchParams(params);
  }, [status, date, setSearchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/doctor/appointments", {
        params: {
          page,
          status: status || undefined,
          date: date || undefined,
        },
      });

      const data = res.data?.data ?? res.data;
      setItems(data.items || []);
      setPagination(data.pagination || null);
    } catch {
      setItems([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, status, date]);

  const total = pagination?.total ?? items.length;

  const onChangeStatus = async (id, nextStatus) => {
    const prev = items;
    setItems((cur) =>
      cur.map((a) => (a.id === id ? { ...a, status: nextStatus } : a))
    );
    setSavingId(id);

    try {
      await api.patch(`/doctor/appointments/${id}/status`, {
        status: nextStatus,
      });
      toast?.("Status updated", "success");
    } catch {
      setItems(prev);
    } finally {
      setSavingId(null);
    }
  };

  const canPrev = pagination ? pagination.page > 1 : page > 1;
  const canNext = pagination ? pagination.page < pagination.last_page : false;

  const headerRight = useMemo(() => {
    return (
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span style={styles.countChip}>{total} appointment(s)</span>
        <button
          onClick={fetchData}
          disabled={loading}
          style={{
            ...styles.refreshBtn,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    );
  }, [total, loading]);

  return (
    <div style={{ padding: 26 }}>
      <PageHeader
        title="My Appointments"
        subtitle="Manage your bookings."
        right={headerRight}
      />

      {/* Filters */}
      <div style={styles.filters}>
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          style={styles.select}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => {
            setPage(1);
            setDate(e.target.value);
          }}
          style={styles.input}
        />

        <button
          onClick={() => {
            setPage(1);
            setStatus("");
            setDate("");
          }}
          style={styles.clearBtn}
        >
          Clear
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <EmptyState
          title="No appointments"
          description="No appointments match your filters."
        />
      ) : (
        <div style={{ marginTop: 14 }}>
          <table width="100%" cellPadding="12" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td>{a.patient?.name || "—"}</td>
                  <td>{a.date}</td>
                  <td>{formatTimeRange(a)}</td>
                  <td>
                    <span style={badgeStyle(a.status)}>{a.status}</span>
                  </td>
                  <td>
                    <select
                      value={a.status}
                      disabled={savingId === a.id}
                      onChange={(e) =>
                        onChangeStatus(a.id, e.target.value)
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination && pagination.last_page > 1 && (
            <div style={styles.pagination}>
              <button
                disabled={!canPrev}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </button>
              <div>
                Page {pagination.page} of {pagination.last_page}
              </div>
              <button
                disabled={!canNext}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  filters: {
    marginTop: 14,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  select: {
    padding: 10,
    borderRadius: 10,
  },
  input: {
    padding: 10,
    borderRadius: 10,
  },
  clearBtn: {
    padding: 10,
    borderRadius: 10,
  },
  pagination: {
    marginTop: 14,
    display: "flex",
    gap: 12,
    justifyContent: "center",
  },
  countChip: {
    padding: "6px 12px",
    borderRadius: 999,
    background: "#f1f5f9",
    fontWeight: 1000,
  },
  refreshBtn: {
    padding: "8px 12px",
    borderRadius: 10,
  },
};