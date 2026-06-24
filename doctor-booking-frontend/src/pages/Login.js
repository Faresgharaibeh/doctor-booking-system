import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim() && password && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const token =
        res?.data?.token ||
        res?.data?.access_token ||
        res?.data?.data?.token ||
        res?.data?.data?.access_token ||
        null;

      if (!token) {
        showToast("Login failed: token not returned from API.", "error");
        console.log("FULL LOGIN RESPONSE:", res?.data);
        return;
      }

      localStorage.setItem("token", token);

      const ok = await login(token);

      if (!ok) {
        showToast("Login failed. Please try again.", "error");
        return;
      }

      showToast("Welcome back 👋", "success");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      console.log("LOGIN ERROR:", status, data || err);

      if (!err.response) {
        showToast("Network error. Please try again.", "error");
      } else if (status === 422 && data?.errors) {
        const msg = Object.values(data.errors).flat().join(" | ");
        showToast(msg, "error");
      } else if (status === 401) {
        showToast(data?.message || "Invalid email or password.", "error");
      } else if (data?.message) {
        showToast(data.message, "error");
      } else {
        showToast(`Login failed (${status}).`, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome</h1>
          <p style={styles.subtitle}>Login to manage your appointments</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form} autoComplete="on">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            autoComplete="username"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              ...styles.button,
              opacity: !canSubmit ? 0.7 : 1,
              cursor: !canSubmit ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={styles.footer}>
          <span style={{ color: "#6b7280" }}>Don’t have an account?</span>
          <span onClick={() => navigate("/register")} style={styles.link}>
            Register
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;

const styles = {
  wrapper: {
    minHeight: "calc(100vh - 60px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#eff6ff",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#ffffff",
    padding: 40,
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(37, 99, 235, 0.08)",
  },
  header: { marginBottom: 30, textAlign: "center" },
  title: { margin: 0, fontSize: 26, fontWeight: 700, color: "#111827" },
  subtitle: { marginTop: 8, fontSize: 14, color: "#6b7280" },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  input: {
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    fontSize: 14,
    outline: "none",
  },
  button: {
    padding: "12px",
    borderRadius: 8,
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: 14,
  },
  footer: {
    marginTop: 20,
    display: "flex",
    justifyContent: "center",
    gap: 6,
    fontSize: 14,
  },
  link: { color: "#2563eb", cursor: "pointer", fontWeight: 600 },
};