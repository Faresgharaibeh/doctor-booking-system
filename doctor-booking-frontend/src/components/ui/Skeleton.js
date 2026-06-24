function Skeleton({ height = 14, width = "100%", style }) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius: 8,
        background: "linear-gradient(90deg, #eee 25%, #f6f6f6 37%, #eee 63%)",
        backgroundSize: "400% 100%",
        animation: "skeleton 1.2s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

export default Skeleton;
