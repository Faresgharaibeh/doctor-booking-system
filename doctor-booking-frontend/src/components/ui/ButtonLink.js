import { Link } from "react-router-dom";

function ButtonLink({ to, children, variant = "secondary", style, ...props }) {
  const variantStyle =
    variant === "danger"
      ? danger
      : variant === "primary"
      ? primary
      : secondary;

  return (
    <Link
      to={to}
      {...props}
      style={{
        ...base,
        ...variantStyle,
        ...style,
      }}
    >
      {children}
    </Link>
  );
}

const base = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 12px",
  borderRadius: 8,
  fontSize: 14,
  textDecoration: "none",
  border: "1px solid transparent",
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

export default ButtonLink;
