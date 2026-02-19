"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          backgroundColor: "#fafaf9",
          color: "#0f0e0d",
        }}
      >
        <div style={{ maxWidth: 480, padding: "2rem", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.75rem" }}>
            Algo salio mal
          </h2>
          <p style={{ color: "#706d66", lineHeight: 1.6, marginBottom: "1.5rem" }}>
            Ocurrio un error inesperado. Intente recargar la pagina.
          </p>
          {process.env.NODE_ENV === "development" && error?.message && (
            <pre
              style={{
                textAlign: "left",
                padding: "1rem",
                backgroundColor: "#f2f1f0",
                borderRadius: 8,
                fontSize: "0.8rem",
                overflow: "auto",
                marginBottom: "1.5rem",
              }}
            >
              {error.message}
            </pre>
          )}
          <button
            onClick={reset}
            style={{
              padding: "0.625rem 1.5rem",
              backgroundColor: "#0f0e0d",
              color: "#fafaf9",
              border: "none",
              borderRadius: 6,
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
