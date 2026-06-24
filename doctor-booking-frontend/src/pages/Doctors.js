import { useEffect, useState } from "react";

import DoctorCard from "../components/DoctorCard";
import DoctorsSkeleton from "../components/DoctorsSkeleton";
import PageHeader from "../components/PageHeader";

import EmptyState from "../components/ui/EmptyState";
import api from "../services/api";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function extractList(payload) {
    // API wrapper: { message: "OK", data: ... }
    const root = payload?.data ?? payload;

    if (Array.isArray(root)) return root;

    // common keys inside root
    if (Array.isArray(root?.doctors)) return root.doctors;
    if (Array.isArray(root?.items)) return root.items;
    if (Array.isArray(root?.results)) return root.results;

    // Laravel pagination shapes
    if (Array.isArray(root?.data)) return root.data; // { data: [...] }
    if (Array.isArray(root?.data?.data)) return root.data.data; // { data: { data: [...] } }

    return [];
  }

  async function loadDoctors() {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/doctors");

      // ✅ Console dump (ready to screenshot)
      console.log("========== DOCTORS DEBUG ==========");
      console.log("RAW res.data:", res.data);
      console.log("INNER res.data.data:", res.data?.data);

      const inner = res.data?.data;
      if (inner && typeof inner === "object") {
        console.log("INNER keys:", Object.keys(inner));

        // اطبع أي arrays موجودة داخل inner
        Object.keys(inner).forEach((k) => {
          const v = inner[k];
          if (Array.isArray(v)) {
            console.log(`INNER.${k} is ARRAY, length:`, v.length);
            console.log(`INNER.${k}[0] sample:`, v[0]);
          }
        });

        // اطبع حالات paginate الشائعة
        if (Array.isArray(inner?.data)) {
          console.log("INNER.data is ARRAY, length:", inner.data.length);
          console.log("INNER.data[0] sample:", inner.data[0]);
        }
        if (Array.isArray(inner?.data?.data)) {
          console.log("INNER.data.data is ARRAY, length:", inner.data.data.length);
          console.log("INNER.data.data[0] sample:", inner.data.data[0]);
        }
      }

      const list = extractList(res.data);
      console.log("PARSED list:", list);
      console.log("PARSED count:", list?.length);
      console.log("========== END DEBUG ==============");

      setDoctors(list);
    } catch (e) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || "Couldn’t load doctors.";
      console.log("DOCTORS ERROR:", status, e?.response?.data || e);

      setError(status ? `${msg} (${status})` : msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDoctors();
  }, []);

  return (
    <div style={{ padding: "28px 22px", maxWidth: 1180, margin: "0 auto" }}>
      <PageHeader
        title="Doctors"
        subtitle="Browse trusted doctors and schedule your next appointment.
"
      />

      <div style={{ height: 14 }} />

      {loading ? (
        <DoctorsSkeleton count={8} />
      ) : error ? (
        <EmptyState
          title="Couldn’t load doctors"
          description={error}
          actionLabel="Retry"
          onAction={loadDoctors}
        />
      ) : doctors.length === 0 ? (
        <EmptyState
          title="No doctors found"
          description="There are no doctors available at the moment."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          {doctors.map((d) => (
            <DoctorCard key={d.id} doctor={d} />
          ))}
        </div>
      )}
    </div>
  );
}
