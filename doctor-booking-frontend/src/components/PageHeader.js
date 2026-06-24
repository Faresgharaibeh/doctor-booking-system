function PageHeader({ title, subtitle, left, right }) {
  return (
    <div style={wrap}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {left}
            <h2 style={{ margin: 0 }}>{title}</h2>
          </div>

          {subtitle ? (
            <p style={{ margin: 0, opacity: 0.75, lineHeight: 1.4 }}>{subtitle}</p>
          ) : null}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {right}
        </div>
      </div>
    </div>
  );
}

const wrap = {
  marginBottom: 16,
  paddingBottom: 12,
  borderBottom: "1px solid #eee",
};

export default PageHeader;
