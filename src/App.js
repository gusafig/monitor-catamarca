import React, { useState } from "react";
import { Section } from "./components/Section";
import { CONFIG } from "./data/config";
import "./styles.css";

export default function App() {
  const [seccionActiva, setSeccionActiva] = useState(CONFIG.secciones[0].id);

  return (
    <div className="app">
      {/* ── HEADER ── */}
      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="header-eyebrow">Monitor de indicadores</span>
            <h1 className="header-title">
              {CONFIG.titulo.split(" en ")[0]}{" "}
              <span className="accent">en {CONFIG.titulo.split(" en ")[1]}</span>
            </h1>
          </div>
          <div className="header-meta">
            <span className="header-updated">Actualizado: {CONFIG.actualizacion}</span>
            <span className="header-fuente">{CONFIG.fuente}</span>
          </div>
        </div>
      </header>

      {/* ── TABS ── */}
      <nav className="tabs">
        <div className="tabs-inner">
          {CONFIG.secciones.map((s) => (
            <button
              key={s.id}
              className={`tab-btn ${seccionActiva === s.id ? "active" : ""}`}
              style={seccionActiva === s.id ? { "--tab-color": s.color } : {}}
              onClick={() => setSeccionActiva(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── CONTENIDO ── */}
      <main className="main">
        <div className="main-inner">
          <Section seccionId={seccionActiva} />
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <span>{CONFIG.fuente}</span>
          <span>Monitor Catamarca © {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
