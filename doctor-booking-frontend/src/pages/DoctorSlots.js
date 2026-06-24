import { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "../services/toastBus";
import Loader from "../components/Loader";
import PageHeader from "../components/PageHeader";

export default function DoctorSlots() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);

  // form
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await api.get("/doctor/slots", { params: { page } });
      setItems(res.data.data.items);
      setMeta(res.data.data.meta);
    } catch (e) {
      // axios interceptor handles toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const createSlot = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      await api.post("/doctor/slots", {
        date,
        start_time: startTime,
        end_time: endTime,
      });

      toast("Slot created successfully.", "success");

      setDate("");
      setStartTime("");
      setEndTime("");

      setPage(1);
      fetchSlots();
    } finally {
      setSaving(false);
    }
  };

  const deleteSlot = async (slotId, isBooked) => {
    if (isBooked) return;

    const ok = window.confirm("Delete this slot?");
    if (!ok) return;

    // optimistic
    setItems((prev) => prev.filter((x) => x.id !== slotId));

    try {
      await api.delete(`/doctor/slots/${slotId}`);
      toast("Slot deleted.", "success");
      fetchSlots();
    } catch (e) {
      fetchSlots();
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <PageHeader title="My Slots" />

      {/* Create Slot */}
      <form
        onSubmit={createSlot}
        style={{
          border: "1px solid #e2e8f0",
          background: "#fff",
          padding: 16,
          borderRadius: 12,
          marginBottom: 18,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "end",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 800, color: "#334155" }}>
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 800, color: "#334155" }}>
            Start
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 800, color: "#334155" }}>
            End
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            ...styles.primaryBtn,
            opacity: saving ? 0.7 : 1,
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving..." : "Add Slot"}
        </button>
      </form>

      {/* List */}
      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <div style={styles.empty}>
          No slots yet. Add your first slot above.
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <table width="100%" cellPadding="12" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                <th>Date</th>
                <th>Start</th>
                <th>End</th>
                <th>Booked</th>
                <th style={{ width: 120 }} />
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                  <td>{s.date}</td>
                  <td>{s.start_time}</td>
                  <td>{s.end_time}</td>
                  <td>{s.is_booked ? "Yes" : "No"}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      onClick={() => deleteSlot(s.id, s.is_booked)}
                      disabled={s.is_booked}
                      style={{
                        ...styles.dangerBtn,
                        opacity: s.is_booked ? 0.5 : 1,
                        cursor: s.is_booked ? "not-allowed" : "pointer",
                      }}
                      title={s.is_booked ? "Booked slots cannot be deleted" : "Delete slot"}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
          <button
            disabled={!meta.prev_page}
            onClick={() => setPage((p) => p - 1)}
            style={styles.pageBtn}
          >
            Prev
          </button>

          <div style={{ fontWeight: 800, color: "#334155" }}>
            Page {meta.current_page} of {meta.last_page}
          </div>

          <button
            disabled={!meta.next_page}
            onClick={() => setPage((p) => p + 1)}
            style={styles.pageBtn}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  input: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    minWidth: 170,
    fontWeight: 700,
    color: "#0f172a",
  },
  primaryBtn: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #0ea5a4",
    background: "#0ea5a4",
    color: "#fff",
    fontWeight: 900,
  },
  dangerBtn: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #fecdd3",
    background: "#fff1f2",
    color: "#be123c",
    fontWeight: 900,
  },
  empty: {
    padding: 14,
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    background: "#fff",
    fontWeight: 700,
    color: "#475569",
  },
  tableWrap: {
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    overflow: "hidden",
    background: "#fff",
  },
  pageBtn: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
};
