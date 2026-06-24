import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      // ✅ endpoint الصحيح حسب Laravel routes/api.php
      const res = await api.post("/auth/register", form);

      // لو رجّع token خزّنه (حسب شكل response عندك)
      const token =
        res?.data?.token ||
        res?.data?.access_token ||
        res?.data?.data?.token ||
        res?.data?.data?.access_token ||
        null;

      if (token) localStorage.setItem("token", token);

      showToast("Account created successfully 🎉", "success");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      console.log("REGISTER ERROR:", status, data || err);

      if (!err.response) {
        showToast("Network error. Please try again.", "error");
      } else if (status === 422 && data?.errors) {
        const msg = Object.values(data.errors).flat().join(" | ");
        showToast(msg, "error");
      } else if (data?.message) {
        showToast(data.message, "error");
      } else {
        showToast(`Register failed (${status}).`, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join and start booking your appointments</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="email"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="password"
            type="password"
            placeholder="Password (min 8 characters)"
            value={form.password}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="password_confirmation"
            type="password"
            placeholder="Confirm password"
            value={form.password_confirmation}
            onChange={handleChange}
            style={styles.input}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div style={styles.footer}>
          <span style={{ color: "#6b7280" }}>Already have an account?</span>
          <span onClick={() => navigate("/")} style={styles.link}>
            Login
          </span>
        </div>
      </div>
    </div>
  );
}

export default Register;

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
    maxWidth: 440,
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
