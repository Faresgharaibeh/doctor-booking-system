function Input(props) {
  return (
    <input
      {...props}
      style={{
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid #ddd",
        outline: "none",
        fontSize: 14,
        width: "100%",
        ...props.style,
      }}
    />
  );
}

export default Input;
