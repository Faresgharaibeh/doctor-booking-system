import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div style={styles.wrapper}>
      <Navbar />

      <main style={styles.main}>
        <div style={styles.container}>
          {children}
        </div>
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#f8fafc",
  },

  main: {
    flex: 1,
    paddingTop: 20,
  },

  container: {
    padding: "0 24px 32px",
    maxWidth: 1200,
    margin: "0 auto",
    width: "100%",
  },
};
