function Loader({ text = "Loading..." }) {
  return (
    <div style={wrapperStyle}>
      <div style={spinnerStyle}></div>
      <p style={{ marginTop: 10 }}>{text}</p>
    </div>
  );
}

const wrapperStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px 0",
};

const spinnerStyle = {
  width: "30px",
  height: "30px",
  border: "4px solid #ddd",
  borderTop: "4px solid black",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

// نضيف animation مرة واحدة في document
const style = document.createElement("style");
style.innerHTML = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);

export default Loader;
