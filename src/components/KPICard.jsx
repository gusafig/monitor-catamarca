import React from "react";

/**
 * Tarjeta de indicador clave.
 * Props:
 *   label     — nombre corto del indicador
 *   value     — valor formateado (string)
 *   delta     — variación porcentual (número o null)
 *   color     — color de acento (hex)
 *   loading   — boolean
 *   tooltip   — texto descriptivo (opcional)
 */
export function KPICard({ label, value, delta, color = "#1D9E75", loading, tooltip, periodo }) {
  const deltaNum = parseFloat(delta);
  const isUp = deltaNum > 0;
  const isDown = deltaNum < 0;

  return (
    <div
      className="kpi-card"
      title={tooltip || ""}
      style={{ borderTop: `3px solid ${color}` }}
    >
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
