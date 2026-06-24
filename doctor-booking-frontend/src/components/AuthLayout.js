function AuthLayout({ title, children }) {
  return (
    <div style={wrapper}>
      <div style={card}>
        <h2 style={{ marginTop: 0 }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

const wrapper = {
  minHeight: "70vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
};

const card = {
  width: "100%",
  maxWidth: 420,
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 20,
  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
};

export default AuthLayout;
