import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState([]);
  const boxRef = useRef(null);

  const fetchUnread = async () => {
    try {
      const res = await api.get("/notifications/unread");
      const data = res.data?.data ?? res.data;
      setUnreadCount(data.count ?? 0);
      setItems(data.items ?? []);
    } catch {
      // ignore
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      // optimistic update
      setItems((cur) => cur.filter((n) => n.id !== id));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchUnread();
    const t = setInterval(fetchUnread, 15000); // refresh every 15s
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={boxRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          fetchUnread();
        }}
        style={styles.bellBtn}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
      </button>

      {open && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownHeader}>
            <div style={{ fontWeight: 1000 }}>Notifications</div>
            <button
              type="button"
              style={styles.smallBtn}
              onClick={fetchUnread}
            >
              Refresh
            </button>
          </div>

          {items.length === 0 ? (
            <div style={styles.empty}>No new notifications</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.slice(0, 6).map((n) => (
                <div key={n.id} style={styles.item}>
                  <div style={{ fontWeight: 1000, color: "#0f172a" }}>
                    {n.title || "Notification"}
                  </div>
                  <div style={styles.msg}>{n.message}</div>

                  <div style={styles.itemActions}>
                    {n.action_url ? (
                      <Link
                        to={n.action_url}
                        onClick={() => {
                          markAsRead(n.id);
                          setOpen(false);
                        }}
                        style={styles.link}
                      >
                        Open
                      </Link>
                    ) : (
                      <span />
                    )}

                    <button
                      type="button"
                      onClick={() => markAsRead(n.id)}
                      style={styles.linkBtn}
                    >
                      Mark read
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={styles.footer}>
            <Link to="/notifications" style={styles.footerLink}>
              View all
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  bellBtn: {
    position: "relative",
    border: "1px solid rgba(148,163,184,0.35)",
    background: "#fff",
    borderRadius: 12,
    padding: "8px 10px",
    fontWeight: 1000,
    cursor: "pointer",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    background: "rgba(244,63,94,1)",
    color: "#fff",
    borderRadius: 999,
    padding: "2px 7px",
    fontSize: 11,
    fontWeight: 1000,
    border: "2px solid #fff",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: 44,
    width: 360,
    borderRadius: 16,
    border: "1px solid rgba(148,163,184,0.30)",
    background: "#fff",
    boxShadow: "0 18px 60px rgba(2,6,23,0.12)",
    padding: 12,
    zIndex: 50,
  },
  dropdownHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottom: "1px solid rgba(148,163,184,0.18)",
    marginBottom: 10,
  },
  smallBtn: {
    padding: "6px 8px",
    borderRadius: 10,
    border: "1px solid rgba(148,163,184,0.35)",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 12,
  },
  item: {
    border: "1px solid rgba(148,163,184,0.22)",
    borderRadius: 14,
    padding: 10,
    background: "rgba(2,6,23,0.02)",
  },
  msg: { marginTop: 6, fontSize: 13, color: "#475569", lineHeight: 1.5 },
  itemActions: {
    marginTop: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  link: {
    textDecoration: "none",
    fontWeight: 1000,
    color: "#0ea5a4",
  },
  linkBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontWeight: 1000,
    color: "#334155",
  },
  empty: { padding: 12, color: "#64748b", fontWeight: 900 },
  footer: {
    marginTop: 10,
    paddingTop: 10,
    borderTop: "1px solid rgba(148,163,184,0.18)",
    display: "flex",
    justifyContent: "flex-end",
  },
  footerLink: {
    textDecoration: "none",
    fontWeight: 1000,
    color: "#0f172a",
  },
};