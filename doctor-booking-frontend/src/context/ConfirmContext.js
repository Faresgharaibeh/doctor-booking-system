import { createContext, useContext, useState, useCallback } from "react";

const ConfirmContext = createContext();

export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState({
    open: false,
    title: "Confirm",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: null,
  });

  const confirm = useCallback(
    ({
      title = "Confirm",
      message = "Are you sure?",
      confirmText = "Confirm",
      cancelText = "Cancel",
    } = {}) => {
      return new Promise((resolve) => {
        setState({
          open: true,
          title,
          message,
          confirmText,
          cancelText,
          onConfirm: () => resolve(true),
        });

        // إذا المستخدم سكّر أو كبس Cancel
        // (نحلها من زر cancel)
      });
    },
    []
  );

  const close = () => {
    setState((prev) => ({ ...prev, open: false, onConfirm: null }));
  };

  const handleCancel = () => {
    close();
  };

  const handleConfirm = () => {
    const fn = state.onConfirm;
    close();
    if (fn) fn();
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {state.open && (
        <div style={overlayStyle} onClick={handleCancel}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{state.title}</h3>
            <p style={{ marginTop: 8 }}>{state.message}</p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button onClick={handleCancel} style={btnSecondary}>
                {state.cancelText}
              </button>
              <button onClick={handleConfirm} style={btnDanger}>
                {state.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => useContext(ConfirmContext);

// Styles
const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: 20,
};

const modalStyle = {
  width: "100%",
  maxWidth: 420,
  background: "#fff",
  borderRadius: 10,
  padding: 18,
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

const btnSecondary = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
};

const btnDanger = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #dc3545",
  background: "#dc3545",
  color: "#fff",
  cursor: "pointer",
};
