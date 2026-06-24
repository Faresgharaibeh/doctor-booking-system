import React, { useEffect, useRef, useState } from "react";
import { askFaq } from "../api/aiFaq";

export default function FaqChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "أهلًا! اسألني عن الحجز، تغيير الموعد، أو حالات الموعد (pending/confirmed).",
    },
  ]);

  const listRef = useRef(null);

  // ✅ auto scroll to bottom
  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, messages.length, loading]);

  const onSend = async () => {
    const msg = input.trim();
    if (!msg || loading) return;

    setMessages((m) => [...m, { role: "user", text: msg }]);
    setInput("");
    setLoading(true);

    try {
      const data = await askFaq(msg);
      const reply = data?.data?.reply || "تمام.";
      const matches = data?.data?.matches || [];

      setMessages((m) => [
        ...m,
        { role: "bot", text: reply, matches: matches.slice(0, 3) },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "bot", text: "صار خطأ. جرّب مرة ثانية." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSuggestionClick = (q) => {
    if (loading) return;
    setInput(q);
    // optional: auto-send
    setTimeout(() => {
      // send after setting input
      // (we can send immediately using q)
      (async () => {
        setMessages((m) => [...m, { role: "user", text: q }]);
        setInput("");
        setLoading(true);
        try {
          const data = await askFaq(q);
          const reply = data?.data?.reply || "تمام.";
          const matches = data?.data?.matches || [];
          setMessages((m) => [
            ...m,
            { role: "bot", text: reply, matches: matches.slice(0, 3) },
          ]);
        } catch (e) {
          setMessages((m) => [
            ...m,
            { role: "bot", text: "صار خطأ. جرّب مرة ثانية." },
          ]);
        } finally {
          setLoading(false);
        }
      })();
    }, 0);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        style={styles.fab}
        title="FAQ Assistant"
        aria-label="Open FAQ Assistant"
      >
        <span style={styles.fabIcon}>💬</span>
      </button>

      {/* Panel */}
      {open && (
        <div style={styles.overlay} onMouseDown={() => setOpen(false)}>
          <div
            style={styles.panel}
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div style={styles.header}>
              <div style={styles.headerLeft}>
                <div style={styles.botAvatar}>🤖</div>
                <div>
                  <div style={styles.title}>FAQ Assistant</div>
                  <div style={styles.subtitle}>
                    ردود سريعة من قاعدة المعرفة
                  </div>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                style={styles.closeBtn}
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={styles.body} ref={listRef}>
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    ...styles.row,
                    justifyContent:
                      m.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      ...styles.bubble,
                      ...(m.role === "user"
                        ? styles.userBubble
                        : styles.botBubble),
                    }}
                  >
                    <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.45 }}>
                      {m.text}
                    </div>

                    {/* Suggestions */}
                    {m.role === "bot" && Array.isArray(m.matches) && m.matches.length > 0 && (
                      <div style={styles.suggestionsWrap}>
                        <div style={styles.suggestionsLabel}>اقتراحات:</div>
                        <div style={styles.suggestions}>
                          {m.matches.map((x) => (
                            <button
                              key={x.id}
                              style={styles.suggestionBtn}
                              onClick={() => onSuggestionClick(x.question)}
                            >
                              {x.question}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ ...styles.row, justifyContent: "flex-start" }}>
                  <div style={{ ...styles.bubble, ...styles.botBubble }}>
                    <TypingDots />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={styles.footer}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSend()}
                placeholder="اكتب سؤالك..."
                style={styles.input}
                maxLength={500}
              />

              <button
                onClick={onSend}
                style={{
                  ...styles.sendBtn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                disabled={loading}
              >
                إرسال
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TypingDots() {
  return (
    <div style={styles.dotsWrap}>
      <span style={{ ...styles.dot, animationDelay: "0ms" }} />
      <span style={{ ...styles.dot, animationDelay: "150ms" }} />
      <span style={{ ...styles.dot, animationDelay: "300ms" }} />
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: .45; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  fab: {
    position: "fixed",
    right: 18,
    bottom: 18,
    width: 54,
    height: 54,
    borderRadius: 18,
    border: "1px solid #99f6e4",
    background: "linear-gradient(135deg, #0ea5a4, #22c55e)",
    color: "#fff",
    boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 80,
    cursor: "pointer",
  },
  fabIcon: { fontSize: 20 },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.35)",
    backdropFilter: "blur(4px)",
    zIndex: 90,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    padding: 16,
  },

  panel: {
    width: "min(420px, 100%)",
    height: "min(560px, 85vh)",
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(148, 163, 184, 0.35)",
    borderRadius: 20,
    boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },

  header: {
    padding: "14px 14px",
    borderBottom: "1px solid rgba(226,232,240,0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    background: "linear-gradient(180deg, rgba(240,253,250,0.8), rgba(255,255,255,0.9))",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },

  botAvatar: {
    width: 38,
    height: 38,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ccfbf1",
    border: "1px solid #99f6e4",
    flexShrink: 0,
  },

  title: { fontWeight: 900, color: "#0f172a", fontSize: 14 },
  subtitle: { fontSize: 12, color: "#64748b", fontWeight: 700 },

  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 900,
    color: "#0f172a",
  },

  body: {
    padding: 14,
    overflow: "auto",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    background:
      "radial-gradient(1200px 500px at 80% 0%, rgba(20,184,166,0.10), transparent 60%), radial-gradient(900px 380px at 10% 20%, rgba(34,197,94,0.08), transparent 55%)",
  },

  row: {
    display: "flex",
    width: "100%",
  },

  bubble: {
    maxWidth: "85%",
    padding: "10px 12px",
    borderRadius: 16,
    fontSize: 13,
    fontWeight: 700,
  },

  userBubble: {
    background: "#0f172a",
    color: "#fff",
    borderTopRightRadius: 6,
    boxShadow: "0 10px 22px rgba(2,6,23,0.18)",
  },

  botBubble: {
    background: "#ffffff",
    color: "#0f172a",
    border: "1px solid rgba(226,232,240,0.9)",
    borderTopLeftRadius: 6,
    boxShadow: "0 10px 22px rgba(15,23,42,0.06)",
  },

  suggestionsWrap: { marginTop: 10 },
  suggestionsLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: 900,
    marginBottom: 6,
  },
  suggestions: { display: "flex", flexWrap: "wrap", gap: 8 },
  suggestionBtn: {
    border: "1px solid #99f6e4",
    background: "#f0fdfa",
    color: "#0f766e",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
  },

  footer: {
    padding: 12,
    borderTop: "1px solid rgba(226,232,240,0.9)",
    display: "flex",
    gap: 10,
    background: "#fff",
  },

  input: {
    flex: 1,
    border: "1px solid #cbd5e1",
    borderRadius: 14,
    padding: "10px 12px",
    outline: "none",
    fontSize: 13,
    fontWeight: 800,
  },

  sendBtn: {
    padding: "10px 14px",
    borderRadius: 14,
    background: "#0ea5a4",
    color: "#fff",
    border: "1px solid #0ea5a4",
    fontWeight: 900,
  },

  dotsWrap: { display: "flex", gap: 6, alignItems: "center", height: 18 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    background: "#0ea5a4",
    display: "inline-block",
    animation: "bounce 900ms infinite ease-in-out",
  },
};