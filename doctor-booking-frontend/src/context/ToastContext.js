import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { registerToast } from "../services/toastBus";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "info") => {
      const id = Date.now() + Math.random(); // لتفادي تكرار id لو صار بسرعة

      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 3000);
    },
    [removeToast]
  );

  // ✅ تسجيل showToast في toastBus (حتى Axios يقدر يستخدمه)
  useEffect(() => {
    registerToast(showToast);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div style={containerStyle}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              ...toastStyle,
              ...typeStyles[toast.type],
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

// 🎨 Styles
const containerStyle = {
  position: "fixed",
  top: "20px",
  right: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  zIndex: 9999,
};

const toastStyle = {
  padding: "12px 16px",
  borderRadius: "6px",
  color: "#fff",
  minWidth: "200px",
  fontSize: "14px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
};

const typeStyles = {
  success: { backgroundColor: "#28a745" },
  error: { backgroundColor: "#dc3545" },
  info: { backgroundColor: "#007bff" },
};
