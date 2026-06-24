function Select(props) {
  return (
    <select
      {...props}
      style={{
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid #ddd",
        outline: "none",
        fontSize: 14,
        ...props.style,
      }}
    />
  );
}

export default Select;
