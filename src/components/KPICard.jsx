import React, { useRef, useState, useEffect } from "react";

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
export function KPICard({ label, value, delta, color = "#1D9E75", loading, tooltip, periodo, icono, unidad }) {
  const deltaNum = parseFloat(delta);
  const isUp = deltaNum > 0;
  const isDown = deltaNum < 0;
  const IconoEl = icono && ICONOS[icono] ? ICONOS[icono] : null;
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); obs.disconnect(); }
    }, { threshold: 0.08 });
    obs.observe(el);
    const t = setTimeout(() => setIsVisible(true), 1000);
    return () => { obs.disconnect(); clearTimeout(t); };
  }, []);

  // ── Animación de conteo del valor numérico ──────────────────────
  // Si "value" trae un número (con separadores de miles, %, $, etc.),
  // lo anima desde 0 hasta el valor real cuando la tarjeta se vuelve
  // visible. Si no es numérico, se muestra el texto tal cual.
  const [displayValue, setDisplayValue] = useState(null);
  useEffect(() => {
    if (!isVisible || loading || value == null) return;

    const str = String(value);
    const match = str.match(/-?\d[\d.,]*\d|\d/); // primer número dentro del string
    if (!match) { setDisplayValue(str); return; }

    const numStr = match[0];
    const target = parseFloat(numStr.replace(/\./g, "").replace(",", "."));
    if (isNaN(target)) { setDisplayValue(str); return; }

    const decimales = (numStr.split(",")[1] || "").length;
    const prefix = str.slice(0, match.index);
    const suffix = str.slice(match.index + numStr.length);

    const duracion = 900;
    const inicio = performance.now();

    let frame;
    const tick = (now) => {
      const t = Math.min(1, (now - inicio) / duracion);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cúbico
      const actual = target * eased;
      const formateado = actual.toLocaleString("es-AR", {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales,
      });
      setDisplayValue(`${prefix}${formateado}${suffix}`);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isVisible, loading, value]);

  return (
    <div
      ref={ref}
      className={`kpi-card${isVisible ? " kpi-card--visible" : ""}`}
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
        <>
          <div className="kpi-skeleton" />
          <div className="kpi-skeleton kpi-skeleton--sm" />
        </>
      ) : (
        <div className="kpi-value">{displayValue ?? value ?? "—"}</div>
      )}

      {!loading && unidad && (
        <div className="kpi-unidad">{unidad}</div>
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
