import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data.data);
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p style={{ padding: 24 }}>Loading dashboard...</p>;
  if (!stats) return <p style={{ padding: 24 }}>Failed to load dashboard</p>;

  return (
    <div style={{ padding: 30 }}>
      <h2 style={{ marginBottom: 20 }}>Admin Dashboard</h2>

      {/* Overview */}
      <div style={styles.cards}>
        <StatCard label="Users" value={stats.overview.users} />
        <StatCard label="Doctors" value={stats.overview.doctors} />
        <StatCard label="Appointments" value={stats.overview.appointments} />
      </div>

      {/* Last 7 Days Trend */}
      <div style={styles.section}>
        <h3>Appointments (Last 7 Days)</h3>
        <ul>
          {stats.trend.map((day) => (
            <li key={day.date}>
              {day.date} — {day.count}
            </li>
          ))}
        </ul>
      </div>

      {/* Status Distribution */}
      <div style={styles.section}>
        <h3>Status Distribution</h3>
        <ul>
          {stats.status_distribution.map((item, index) => (
            <li key={index}>
              {item.status} — {item.count}
            </li>
          ))}
        </ul>
      </div>

      {/* Top Doctors */}
      <div style={styles.section}>
        <h3>Top Doctors</h3>
        <ul>
          {stats.top_doctors.map((doctor) => (
            <li key={doctor.id}>
              {doctor.name} — {doctor.appointments_count} appointments
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={styles.card}>
      <p style={styles.cardLabel}>{label}</p>
      <h2 style={styles.cardValue}>{value}</h2>
    </div>
  );
}

const styles = {
  cards: {
    display: "flex",
    gap: 20,
    marginBottom: 30,
  },
  card: {
    flex: 1,
    padding: 20,
    background: "#f8fafc",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  cardLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  cardValue: {
    fontSize: 28,
    marginTop: 8,
  },
  section: {
    marginTop: 30,
    padding: 20,
    background: "#ffffff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
};
