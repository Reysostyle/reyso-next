export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "var(--color-bg)",
        color: "var(--color-text)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: "72px",
            fontWeight: 300,
            letterSpacing: "8px",
          }}
        >
          REYSO
        </h1>

        <p
          style={{
            marginTop: "16px",
            opacity: 0.6,
            letterSpacing: "4px",
          }}
        >
          Luxury Fashion Experience
        </p>
      </div>
    </main>
  );
}