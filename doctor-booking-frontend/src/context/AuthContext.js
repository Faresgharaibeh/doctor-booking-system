import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // =============================
  // Logout (Central)
  // =============================
  const clearSession = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const logout = async () => {
    try {
      // ✅ optional: notify backend (won't break if it fails)
      await api.post("/auth/logout");
    } catch (_) {
      // ignore
    } finally {
      clearSession();
      setInitialized(true);
    }
  };

  // =============================
  // Refresh User
  // =============================
  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/me");

      const raw =
        res.data?.user ??
        res.data?.data?.user ??
        res.data?.data ??
        res.data;

      const normalized = {
        id: raw?.id ?? raw?._id ?? raw?.user_id ?? null,
        name:
          raw?.name ??
          raw?.full_name ??
          raw?.username ??
          raw?.patient_name ??
          "",
        email:
          raw?.email ??
          raw?.mail ??
          raw?.patient_email ??
          "",
        role: raw?.role ?? raw?.type ?? "patient",
        _raw: raw,
      };

      setUser(normalized);
      return true;
    } catch (error) {
      const status = error?.response?.status;

      if (status === 401) {
        // ✅ token invalid/expired
        clearSession();
        setInitialized(true);
        return false;
      }

      // non-auth errors: keep app usable but no user
      setUser(null);
      return true;
    } finally {
      setInitialized(true);
    }
  };

  // =============================
  // Init + Token changes
  // =============================
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (!token) {
        if (!cancelled) {
          setUser(null);
          setInitialized(true);
        }
        return;
      }

      if (!cancelled) setInitialized(false);
      await refreshUser();
    };

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // =============================
  // Login
  // =============================
  const login = async (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);

    const ok = await refreshUser();
    return ok;
  };

  const value = useMemo(
    () => ({
      token,
      user,
      initialized,
      login,
      logout,
      refreshUser,
    }),
    [token, user, initialized]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);