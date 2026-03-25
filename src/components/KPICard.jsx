import React from "react";

// Íconos SVG inline por clave
const ICONOS = {
  auto: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="kpi-icono-svg">
      <path d="M5 11L6.5 6.5C6.8 5.6 7.65 5 8.6 5H15.4C16.35 5 17.2 5.6 17.5 6.5L19 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="2" y="11" width="20" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="17" cy="18" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 18H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M2 14H22" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
    </svg>
  ),
};

/**
 * Tarjeta de indicador clave.
 * Props:
 *   label     — nombre corto del indicador
 *   value     — valor formateado (string)
 *   delta     — variación porcentual (número o null)
 *   color     — color de acento (hex)
 *   loading   — boolean
 *   tooltip   — texto descriptivo (opcional)
 *   icono     — clave de ícono (opcional, ej: "auto")
 */
export function KPICard({ label, value, delta, color = "#1D9E75", loading, tooltip, periodo, icono }) {
  const deltaNum = parseFloat(delta);
  const isUp = deltaNum > 0;
  const isDown = deltaNum < 0;
  const IconoEl = icono && ICONOS[icono] ? ICONOS[icono] : null;

  return (
    <div
      className="kpi-card"
      title={tooltip || ""}
      style={{ borderTop: `3px solid ${color}` }}
    >
      {IconoEl && (
        <div className="kpi-icono" style={{ color }}>
          {IconoEl}
        </div>
      )}
      <div className="kpi-label">{label}</div>

      {loading ? (
        <div className="kpi-skeleton" />
      ) : (
        <div className="kpi-value">{value ?? "—"}</div>
      )}

      {!loading && delta !== null && delta !== undefined && (
        <div className={`kpi-delta ${isUp ? "up" : isDown ? "down" : "flat"}`}>
          {isUp ? "▲" : isDown ? "▼" : "—"}{" "}
          {Math.abs(deltaNum)}% i.a.
        </div>
      )}

      {!loading && periodo && (
        <div className="kpi-periodo">{periodo}</div>
      )}
    </div>
  );
}
