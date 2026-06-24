import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";

export default function DoctorDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const safeNormalizeStats = (payload) => {
    // ApiResponse => { message, data: {...} }
    const d = payload?.data ?? payload ?? {};
    return {
      total: d.total ?? 0,
      pending: d.pending ?? 0,
      confirmed: d.confirmed ?? 0,
      cancelled: d.cancelled ?? 0,
      completed: d.completed ?? 0,
    };
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const res = await api.get("/doctor/stats");

      const normalized = safeNormalizeStats(res?.data);
      setStats(normalized);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      console.log("DOCTOR STATS ERROR:", status, data || err);

      // لا تكسر الصفحة — اعرض اصفار + رسالة
      setStats({ total: 0, pending: 0, confirmed: 0, cancelled: 0, completed: 0 });

      if (!err?.response) {
        setErrorMsg("Network error. Please check the backend server.");
        return;
      }

      if (status === 401) {
        setErrorMsg("Session expired. Please login again.");
        // اختياري: رجّع المستخدم للّوجين
        navigate("/login", { replace: true });
        return;
      }

      if (status === 404) {
        setErrorMsg(
          "Doctor stats endpoint not found (404). Check backend route: GET /api/doctor/stats"
        );
        return;
      }

      setErrorMsg(data?.message || `Failed to load stats (${status}).`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = useMemo(() => {
    const s = stats || {};
    return [
      { key: "total", title: "Total", value: s.total ?? 0, icon: "📅", tone: "neutral", hint: "All appointments" },
      { key: "pending", title: "Pending", value: s.pending ?? 0, icon: "⏳", tone: "warning", hint: "Waiting confirmation" },
      { key: "confirmed", title: "Confirmed", value: s.confirmed ?? 0, icon: "✅", tone: "success", hint: "Approved appointments" },
      { key: "cancelled", title: "Cancelled", value: s.cancelled ?? 0, icon: "🛑", tone: "danger", hint: "Cancelled bookings" },
      { key: "completed", title: "Completed", value: s.completed ?? 0, icon: "🏁", tone: "info", hint: "Finished visits" },
    ];
  }, [stats]);

  const openAppointments = (key) => {
    if (!key || key === "total") {
      navigate("/doctor/appointments");
      return;
    }
    navigate(`/doctor/appointments?status=${encodeURIComponent(key)}`);
  };

  return (
    <div style={{ padding: 26 }}>
      <PageHeader
        title="Doctor Dashboard"
        subtitle="Quick overview of your appointments & workflow."
      />

      {/* Top Bar */}
      <div
        style={{
          marginTop: 14,
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/doctor/appointments" style={styles.primaryLink}>
            View Appointments →
          </Link>
          <Link to="/doctor/slots" style={styles.secondaryLink}>
            Manage Slots
          </Link>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          style={{
            ...styles.refreshBtn,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Error Banner */}
      {!!errorMsg && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(239,68,68,0.35)",
            background: "rgba(254,242,242,0.9)",
            color: "#991b1b",
            fontWeight: 800,
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Stats Grid */}
      <div
        className="dash-grid"
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        {loading ? (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </>
        ) : (
          cards.map((c) => (
            <StatCard
              key={c.key}
              title={c.title}
              value={c.value}
              icon={c.icon}
              hint={c.hint}
              tone={c.tone}
              clickable
              onClick={() => openAppointments(c.key)}
            />
          ))
        )}
      </div>

      {/* Dynamic Insight */}
      <div style={{ marginTop: 14 }}>
        <InsightPanel stats={stats} loading={loading} />
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 1100px) {
          .dash-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 720px) {
          .dash-grid { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
        }
      `}</style>
    </div>
  );
}

function StatCard({ title, value, icon, hint, tone, clickable, onClick }) {
  const t = toneStyles[tone] || toneStyles.neutral;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      aria-label={`Open ${title} appointments`}
      style={{
        ...styles.card,
        border: `1px solid ${t.border}`,
        background: t.bg,
        cursor: clickable ? "pointer" : "default",
      }}
      onMouseEnter={(e) => {
        if (!clickable) return;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 18px 55px rgba(2,6,23,0.10)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow = "0 14px 40px rgba(2,6,23,0.06)";
      }}
      onMouseDown={(e) => {
        if (!clickable) return;
        e.currentTarget.style.transform = "translateY(0px)";
      }}
      onFocus={(e) => {
        if (!clickable) return;
        e.currentTarget.style.outline = "3px solid rgba(59,130,246,0.35)";
        e.currentTarget.style.outlineOffset = "2px";
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = "none";
        e.currentTarget.style.outlineOffset = "0px";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ ...styles.icon, background: t.iconBg }}>{icon}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#0f172a" }}>{title}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{hint}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "flex", alignItems: "baseline", gap: 8 }}>
        <div style={{ fontSize: 30, fontWeight: 1000, color: "#0f172a", letterSpacing: -0.5 }}>
          {value}
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 900,
            color: t.badgeText,
            background: t.badgeBg,
            padding: "4px 8px",
            borderRadius: 999,
          }}
        >
          {title.toUpperCase()}
        </div>
      </div>
    </button>
  );
}

function SkeletonCard() {
  return (
    <div style={{ ...styles.card, border: "1px solid #e2e8f0", background: "#fff" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: "#f1f5f9" }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 10, width: "60%", background: "#f1f5f9", borderRadius: 8 }} />
          <div style={{ marginTop: 8, height: 10, width: "80%", background: "#f1f5f9", borderRadius: 8 }} />
        </div>
      </div>
      <div style={{ marginTop: 16, height: 30, width: "45%", background: "#f1f5f9", borderRadius: 10 }} />
    </div>
  );
}

function InsightPanel({ stats, loading }) {
  if (loading) {
    return (
      <div style={styles.insight}>
        <div style={{ fontWeight: 900 }}>Insights</div>
        <div style={{ marginTop: 8, color: "#64748b" }}>
          <Loader />
        </div>
      </div>
    );
  }

  const s = stats || {};
  const pending = s.pending ?? 0;
  const confirmed = s.confirmed ?? 0;

  let msg = "All good. Keep your schedule updated.";
  let badge = { text: "HEALTHY", bg: "#ecfeff", color: "#0e7490", border: "#bae6fd" };

  if (pending > 0) {
    msg = `You have ${pending} pending appointment(s). Consider confirming or cancelling to keep things clear.`;
    badge = { text: "ACTION NEEDED", bg: "#fff7ed", color: "#9a3412", border: "#fed7aa" };
  } else if (confirmed > 0) {
    msg = `You have ${confirmed} confirmed appointment(s). Stay ready and keep your slots clean.`;
    badge = { text: "ON TRACK", bg: "#f0fdfa", color: "#0f766e", border: "#99f6e4" };
  }

  return (
    <div style={styles.insight}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 1000, color: "#0f172a" }}>Insights</div>
          <div style={{ marginTop: 6, color: "#475569", fontSize: 13, lineHeight: 1.6 }}>
            {msg}
          </div>
        </div>

        <div
          style={{
            alignSelf: "flex-start",
            padding: "6px 10px",
            borderRadius: 999,
            fontWeight: 1000,
            fontSize: 12,
            background: badge.bg,
            color: badge.color,
            border: `1px solid ${badge.border}`,
            whiteSpace: "nowrap",
          }}
        >
          {badge.text}
        </div>
      </div>
    </div>
  );
}

const toneStyles = {
  neutral: { bg: "linear-gradient(180deg, rgba(2,6,23,0.02), rgba(2,6,23,0.00))", border: "rgba(148,163,184,0.35)", iconBg: "rgba(148,163,184,0.18)", badgeBg: "rgba(2,6,23,0.06)", badgeText: "#0f172a" },
  warning: { bg: "linear-gradient(180deg, rgba(251,146,60,0.10), rgba(255,255,255,0))", border: "rgba(251,146,60,0.25)", iconBg: "rgba(251,146,60,0.16)", badgeBg: "rgba(251,146,60,0.16)", badgeText: "#9a3412" },
  success: { bg: "linear-gradient(180deg, rgba(16,185,129,0.10), rgba(255,255,255,0))", border: "rgba(16,185,129,0.25)", iconBg: "rgba(16,185,129,0.16)", badgeBg: "rgba(16,185,129,0.16)", badgeText: "#065f46" },
  danger: { bg: "linear-gradient(180deg, rgba(244,63,94,0.10), rgba(255,255,255,0))", border: "rgba(244,63,94,0.25)", iconBg: "rgba(244,63,94,0.14)", badgeBg: "rgba(244,63,94,0.14)", badgeText: "#9f1239" },
  info: { bg: "linear-gradient(180deg, rgba(59,130,246,0.10), rgba(255,255,255,0))", border: "rgba(59,130,246,0.25)", iconBg: "rgba(59,130,246,0.14)", badgeBg: "rgba(59,130,246,0.14)", badgeText: "#1d4ed8" },
};

const styles = {
  card: { width: "100%", textAlign: "left", padding: 16, borderRadius: 16, background: "#fff", boxShadow: "0 14px 40px rgba(2,6,23,0.06)", transition: "transform 140ms ease, box-shadow 140ms ease", border: "none", outline: "none" },
  icon: { width: 38, height: 38, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 },
  insight: { borderRadius: 16, border: "1px solid rgba(148,163,184,0.30)", background: "rgba(255,255,255,0.9)", boxShadow: "0 14px 40px rgba(2,6,23,0.05)", padding: 16 },
  primaryLink: { textDecoration: "none", padding: "10px 14px", borderRadius: 12, background: "#0ea5a4", color: "#fff", fontWeight: 1000, border: "1px solid rgba(13,148,136,0.35)" },
  secondaryLink: { textDecoration: "none", padding: "10px 14px", borderRadius: 12, background: "#ffffff", color: "#0f172a", fontWeight: 1000, border: "1px solid rgba(148,163,184,0.45)" },
  refreshBtn: { padding: "10px 12px", borderRadius: 12, background: "#fff", border: "1px solid rgba(148,163,184,0.45)", fontWeight: 1000, color: "#0f172a" },
};