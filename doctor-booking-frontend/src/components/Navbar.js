import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationsBell from "./NotificationsBell";
import FaqChatWidget from "./FaqChatWidget"; // ✅ AI Chat

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ دعم أكثر من شكل للـ user object
  const u = user?.user ?? user?.data?.user ?? user?.data ?? user;
  const role = u?.role;

  const isAdmin = role === "admin";
  const isDoctor = role === "doctor";
  const isPatient = !role || role === "patient";

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // ✅ Dashboard حسب الدور
  const dashboardPath = isDoctor
    ? "/doctor/dashboard"
    : isAdmin
    ? "/admin"
    : "/dashboard";

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.inner}>
          {/* Logo */}
          <Link to={dashboardPath} style={styles.logo}>
            <span style={styles.logoIcon}>🏥</span>
            <span>DoctorBook</span>
          </Link>

          <div style={styles.right}>
            {/* Links */}
            <div style={styles.links}>
              {/* Dashboard */}
              <NavItem to={dashboardPath} active={isActive(dashboardPath)}>
                Dashboard
              </NavItem>

              {/* Patient Links */}
              {isPatient && (
                <>
                  <NavItem to="/doctors" active={isActive("/doctors")}>
                    Doctors
                  </NavItem>

                  <NavItem to="/appointments" active={isActive("/appointments")}>
                    My Appointments
                  </NavItem>
                </>
              )}

              {/* Doctor Links */}
              {isDoctor && (
                <>
                  <NavItem
                    to="/doctor/appointments"
                    active={location.pathname.startsWith("/doctor/appointments")}
                  >
                    My Appointments
                  </NavItem>

                  <NavItem
                    to="/doctor/slots"
                    active={location.pathname.startsWith("/doctor/slots")}
                  >
                    My Slots
                  </NavItem>
                </>
              )}

              {/* Admin Links */}
              {isAdmin && (
                <>
                  <NavItem to="/admin" active={isActive("/admin")}>
                    Admin
                  </NavItem>

                  <NavItem to="/admin/doctors" active={isActive("/admin/doctors")}>
                    Manage Doctors
                  </NavItem>
                </>
              )}
            </div>

            {/* Right side actions */}
            <div style={styles.actions}>
              {u ? (
                <>
                  {/* ✅ Notifications bell */}
                  <NotificationsBell />

                  <span style={styles.userChip}>
                    <span style={styles.dot} />
                    {u?.name || "User"}

                    {isAdmin && <span style={styles.adminBadge}>ADMIN</span>}
                    {isDoctor && <span style={styles.doctorBadge}>DOCTOR</span>}
                  </span>

                  <button onClick={handleLogout} style={styles.logoutBtn}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" style={styles.outlineBtn}>
                    Login
                  </Link>

                  <Link to="/register" style={styles.primaryBtn}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ✅ AI Chat يظهر فقط عند تسجيل الدخول */}
      {u && <FaqChatWidget />}
    </>
  );
}

function NavItem({ to, active, children }) {
  return (
    <Link
      to={to}
      style={{
        ...styles.link,
        ...(active ? styles.activeLink : {}),
      }}
    >
      {children}
    </Link>
  );
}

const styles = {
  nav: {
    height: 70,
    background: "rgba(255,255,255,0.95)",
    borderBottom: "1px solid #e2e8f0",
    position: "sticky",
    top: 0,
    zIndex: 50,
    backdropFilter: "blur(6px)",
  },

  inner: {
    height: "100%",
    padding: "0 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 18,
    fontWeight: 900,
    color: "#0f172a",
    textDecoration: "none",
  },

  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ccfbf1",
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },

  links: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  link: {
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 700,
    color: "#334155",
    padding: "8px 12px",
    borderRadius: 999,
  },

  activeLink: {
    background: "#f0fdfa",
    color: "#0f766e",
    border: "1px solid #99f6e4",
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  userChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    fontSize: 13,
    fontWeight: 800,
  },

  adminBadge: {
    marginLeft: 6,
    padding: "2px 6px",
    fontSize: 10,
    fontWeight: 900,
    borderRadius: 6,
    background: "#0f766e",
    color: "#fff",
  },

  doctorBadge: {
    marginLeft: 6,
    padding: "2px 6px",
    fontSize: 10,
    fontWeight: 900,
    borderRadius: 6,
    background: "#2563eb",
    color: "#fff",
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: "#10b981",
  },

  logoutBtn: {
    padding: "8px 14px",
    borderRadius: 10,
    background: "#fff1f2",
    color: "#be123c",
    border: "1px solid #fecdd3",
    cursor: "pointer",
    fontWeight: 900,
  },

  outlineBtn: {
    padding: "8px 14px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    textDecoration: "none",
    fontWeight: 800,
    color: "#0f172a",
  },

  primaryBtn: {
    padding: "8px 14px",
    borderRadius: 10,
    background: "#0ea5a4",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 900,
  },
};