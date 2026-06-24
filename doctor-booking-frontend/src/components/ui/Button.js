function Button({
  children,
  variant = "primary", // primary | secondary | danger
  loading = false,
  disabled = false,
  ...props
}) {
  const style =
    variant === "danger"
      ? danger
      : variant === "secondary"
      ? secondary
      : primary;

  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={{
        ...base,
        ...style,
        opacity: disabled || loading ? 0.6 : 1,
        cursor: disabled || loading ? "not-allowed" : "pointer",
      }}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}

const base = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid transparent",
  fontSize: 14,
};

const primary = {
  background: "#111",
  color: "#fff",
};

const secondary = {
  background: "#fff",
  color: "#111",
  border: "1px solid #ddd",
};

const danger = {
  background: "#dc3545",
  color: "#fff",
  border: "1px solid #dc3545",
};

export default Button;
