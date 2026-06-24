import { useEffect } from "react";

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 9999,
  },
  modal: {
    width: "100%",
    maxWidth: 560,
    backgroundColor: "#fff",
    borderRadius: 14,
    boxShadow: "0 18px 60px rgba(0,0,0,0.18)",
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.06)",
  },
  header: {
    padding: "14px 16px",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    margin: 0,
    fontSize: 16,
    fontWeight: 900,
    color: "#0f172a",
  },
  closeBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 18,
    lineHeight: "18px",
    padding: 6,
    borderRadius: 10,
  },
  body: { padding: 16 },
  footer: {
    padding: 16,
    borderTop: "1px solid rgba(0,0,0,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap",
  },
};

function lockBodyScroll(lock) {
  const body = document.body;
  if (!body) return;
  if (lock) body.style.overflow = "hidden";
  else body.style.overflow = "";
}

export default function Modal({ open, title, onClose, children, footer, maxWidth = 560 }) {
  // ESC close
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // lock scroll
  useEffect(() => {
    if (!open) return;
    lockBodyScroll(true);
    return () => lockBodyScroll(false);
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={styles.overlay}
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div style={{ ...styles.modal, maxWidth }}>
        <div style={styles.header}>
          <h3 style={styles.title}>{title}</h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={styles.closeBtn}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.06)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            ✕
          </button>
        </div>

        <div style={styles.body}>{children}</div>

        {footer ? <div style={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  );
}
