import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("Error capturado:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: "2rem",
          fontFamily: "monospace",
          background: "#fff1f0",
          border: "2px solid #e6322e",
          borderRadius: "8px",
          margin: "2rem",
          color: "#111"
        }}>
          <h2 style={{ color: "#e6322e", marginBottom: "1rem" }}>
            ⚠️ Error al cargar la aplicación
          </h2>
          <p style={{ marginBottom: "0.5rem" }}>
            <strong>Mensaje:</strong> {this.state.error?.message}
          </p>
          <details>
            <summary style={{ cursor: "pointer", marginTop: "1rem" }}>
              Ver detalles técnicos
            </summary>
            <pre style={{
              marginTop: "0.5rem",
              whiteSpace: "pre-wrap",
              fontSize: "12px",
              background: "#fff",
              padding: "1rem",
              borderRadius: "4px"
            }}>
              {this.state.error?.stack}
            </pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
