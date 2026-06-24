import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import PageHeader from "../components/PageHeader";
import Card from "../components/ui/Card";
import ButtonLink from "../components/ui/ButtonLink";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, token, initialized } = useAuth();

  // ✅ دعم أكثر من شكل للـ user object
  const u = user?.user ?? user?.data?.user ?? user?.data ?? user;
  const role = u?.role;

  const displayName =
    u?.name || u?.full_name || u?.username || u?.patient_name || "Patient";

  const displayEmail = u?.email || u?.mail || u?.patient_email || "";

  const initials = useMemo(() => {
    return (
      (displayName || "U")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("") || "U"
    );
  }, [displayName]);

  // ✅ Hook لازم يجي قبل أي return
  useEffect(() => {
    // لا تعمل redirect قبل ما auth يجهز
    if (!initialized) return;

    // إذا في token ولسه user ما وصل، استنى
    if (token && !user) return;

    // إذا ما في user (مش مسجل دخول)
    if (!user) return;

    if (role === "doctor") {
      navigate("/doctor/dashboard", { replace: true });
      return;
    }

    if (role === "admin") {
      navigate("/admin/dashboard", { replace: true }); // عدّلها لو مسار الأدمن مختلف
      return;
    }
  }, [initialized, token, user, role, navigate]);

  // ✅ returns بعد كل hooks
  if (!initialized) return <Loader />;
  if (token && !user) return <Loader />;
  if (!user) return null;

  const roleLabel =
    role === "doctor" ? "Doctor" : role === "admin" ? "Admin" : "Patient";

  return (
    <div style={styles.page}>
      <PageHeader
        title={`Welcome back, ${displayName} 👋`}
        subtitle="Your account overview"
      />

      <div style={styles.grid}>
        {/* Profile */}
        <Card>
          <div style={styles.profileRow}>
            <div style={styles.avatarWrap}>
              <div style={styles.avatar}>{initials}</div>
            </div>

            <div style={{ flex: 1 }}>
              <p style={styles.name}>{displayName}</p>
              {displayEmail ? <p style={styles.email}>{displayEmail}</p> : null}

              <div style={styles.badgeRow}>
                <span style={styles.badgeOk}>Active</span>
                <span style={styles.badgeSoft}>{roleLabel}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick actions */}
        <Card>
          <p style={styles.cardTitle}>Quick actions</p>
          <p style={styles.cardSub}>
            Jump straight to booking or managing your appointments.
          </p>

          <div style={styles.actions}>
            <ButtonLink to="/doctors">👨‍⚕️ Browse Doctors</ButtonLink>

            <ButtonLink to="/appointments" variant="secondary">
              📅 My Appointments
            </ButtonLink>
          </div>
        </Card>

        {/* Overview */}
        <Card>
          <p style={styles.cardTitle}>Overview</p>

          <div style={styles.stats}>
            <div style={styles.statBox}>
              <p style={styles.statLabel}>Appointments</p>
              <p style={styles.statValue}>—</p>
              <p style={styles.statHint}>Coming soon</p>
            </div>

            <div style={styles.statBox}>
              <p style={styles.statLabel}>Upcoming</p>
              <p style={styles.statValue}>—</p>
              <p style={styles.statHint}>Coming soon</p>
            </div>

            <div style={styles.statBox}>
              <p style={styles.statLabel}>Doctors</p>
              <p style={styles.statValue}>—</p>
              <p style={styles.statHint}>Coming soon</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

const styles = {
  page: { paddingBottom: 24 },

  grid: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 14,
  },

  profileRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },

  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    background: "#ccfbf1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background: "#0ea5a4",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
  },

  name: {
    margin: 0,
    fontSize: 16,
    fontWeight: 900,
  },

  email: {
    margin: "6px 0 0",
    fontSize: 13,
    color: "#64748b",
  },

  badgeRow: {
    display: "flex",
    gap: 8,
    marginTop: 10,
  },

  badgeOk: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "#ecfdf5",
    color: "#065f46",
    fontSize: 12,
    fontWeight: 800,
  },

  badgeSoft: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "#f0fdfa",
    color: "#0f766e",
    fontSize: 12,
    fontWeight: 800,
  },

  cardTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 900,
  },

  cardSub: {
    margin: "6px 0 0",
    fontSize: 13,
    color: "#64748b",
  },

  actions: {
    marginTop: 12,
    display: "flex",
    gap: 10,
  },

  stats: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
  },

  statBox: {
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 12,
  },

  statLabel: {
    margin: 0,
    fontSize: 12,
    color: "#64748b",
    fontWeight: 800,
  },

  statValue: {
    margin: "8px 0 0",
    fontSize: 22,
    fontWeight: 900,
  },

  statHint: {
    margin: "6px 0 0",
    fontSize: 12,
    color: "#94a3b8",
  },
};
