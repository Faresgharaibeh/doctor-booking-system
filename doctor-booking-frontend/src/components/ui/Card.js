function Card({ children, style }) {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 10,
        padding: 14,
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        background: "#fff",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default Card;
