import React, { useMemo } from "react";
import { useCsvData, agruparPorMes } from "../hooks/useCsvData";
import { CONFIG, COLORES } from "../data/config";

// ── Helpers ───────────────────────────────────────────────────────

function formatPeriodo(raw) {
  if (!raw) return "";
  const str = String(raw).trim();
  const m = str.match(/^(\d{4})-(\d{1,2})$/);
  if (!m) return str;
  const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const mes = meses[parseInt(m[2], 10) - 1];
  return mes ? `${mes} ${m[1]}` : str;
}

function lastNValues(data, n = 8) {
  if (!data || data.length === 0) return [];
  return data.slice(-n).map((r) => parseFloat(r.valor)).filter((v) => !isNaN(v));
}

// ── Sparkline SVG ─────────────────────────────────────────────────

function Sparkline({ values, color }) {
  if (!values || values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 80;
  const H = 28;
  const step = W / (values.length - 1);

  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = H - ((v - min) / range) * H;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: "block", overflow: "visible" }}
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.75"
      />
      {/* Punto final */}
      {(() => {
        const last = values.length - 1;
        const x = last * step;
        const y = H - ((values[last] - min) / range) * H;
        return <circle cx={x} cy={y} r="2.5" fill={color} />;
      })()}
    </svg>
  );
}

// ── Un solo indicador ─────────────────────────────────────────────

function PulsoCell({ indicador }) {
  const { data, loading } = useCsvData(indicador.archivo);

  const processed = useMemo(() => {
    if (!data || data.length === 0) return { values: [], last: null, periodo: "" };
    const rows = indicador.frecuencia === "diaria" ? agruparPorMes(data) : data;
    const values = lastNValues(rows, 8);
    const lastRow = rows[rows.length - 1];
    const last = lastRow ? parseFloat(lastRow.valor) : null;
    const periodo = lastRow
      ? formatPeriodo(lastRow.periodo || lastRow.año || lastRow.fecha || "")
      : "";
    return { values, last, periodo };
  }, [data, indicador.frecuencia]);

  const seccion = CONFIG.secciones.find((s) => s.id === indicador.seccion);
  const color = seccion?.color || "#e6322e";

  const formatted =
    !loading && processed.last !== null && indicador.formato
      ? indicador.formato(processed.last)
      : loading
      ? "…"
      : "—";

  return (
    <div style={styles.cell}>
      <div style={styles.cellLabel}>{indicador.nombre}</div>
      <div style={{ ...styles.cellValue, color }}>
        {loading ? <span style={styles.skeleton} /> : formatted}
      </div>
      <Sparkline values={processed.values} color={color} />
      <div style={styles.cellMeta}>
        <span style={{ ...styles.dot, background: color }} />
        {processed.periodo || "—"}
      </div>
    </div>
  );
}

// ── Ticker ────────────────────────────────────────────────────────

function TickerItem({ indicador }) {
  const { data, loading } = useCsvData(indicador.archivo);

  const { formatted, periodo } = useMemo(() => {
    if (!data || data.length === 0) return { formatted: "…", periodo: "" };
    const rows = indicador.frecuencia === "diaria" ? agruparPorMes(data) : data;
    const lastRow = rows[rows.length - 1];
    const val = lastRow ? parseFloat(lastRow.valor) : null;
    const f =
      val !== null && indicador.formato ? indicador.formato(val) : "—";
    const p = lastRow
      ? formatPeriodo(lastRow.periodo || lastRow.año || lastRow.fecha || "")
      : "";
    return { formatted: f, periodo: p };
  }, [data, indicador.frecuencia, indicador.formato]);

  const seccion = CONFIG.secciones.find((s) => s.id === indicador.seccion);
  const color = seccion?.color || "#e6322e";

  if (loading) return null;

  return (
    <span style={styles.tickerItem}>
      <span style={{ color, fontWeight: 600 }}>{indicador.nombre}</span>
      {" · "}
      {formatted}
      {periodo && (
        <span style={styles.tickerPeriodo}> ({periodo})</span>
      )}
    </span>
  );
}

function Ticker({ indicadores }) {
  // Duplicamos para loop continuo sin salto
  return (
    <div style={styles.tickerOuter} aria-label="Ticker de indicadores económicos">
      <div style={styles.tickerTrack}>
        {[...indicadores, ...indicadores].map((ind, i) => (
          <TickerItem key={`${ind.id}-${i}`} indicador={ind} />
        ))}
      </div>

      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .pulso-ticker-track {
          animation: ticker-scroll 30s linear infinite;
          white-space: nowrap;
        }
        .pulso-ticker-track:hover {
          animation-play-state: paused;
        }
        @keyframes pulso-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────

export default function PulsoEconomico({ onNavigate }) {
  // Los 4 indicadores destacados para la grilla (ajustá los ids a tu gusto)
  const KPI_IDS = ["variable1", "variable3", "variable7", "variable8"];
  const indicadoresKpi = CONFIG.indicadores.filter((i) =>
    KPI_IDS.includes(i.id)
  );

  // Todos los indicadores con kpi: true para el ticker
  const indicadoresTicker = CONFIG.indicadores.filter((i) => i.kpi !== false);

  return (
    <section style={styles.section} aria-label="Pulso económico">

      {/* ── Ticker ──────────────────────────────────── */}
      <Ticker indicadores={indicadoresTicker} />

      {/* ── Título de bloque ────────────────────────── */}
      <div style={styles.blockHeader}>
        <p style={styles.blockEyebrow}>Indicadores clave</p>
        <button
          style={styles.blockLink}
          onClick={() => onNavigate("monitor")}
        >
          Ver dashboard completo →
        </button>
      </div>

      {/* ── Grilla KPI ──────────────────────────────── */}
      <div style={styles.grid}>
        {indicadoresKpi.map((ind) => (
          <PulsoCell key={ind.id} indicador={ind} />
        ))}
      </div>

      {/* ── Nota de actualización ───────────────────── */}
      <div style={styles.nota}>
        <span
          style={styles.dot}
          className="pulso-live-dot"
        />
        Datos actualizados automáticamente desde las fuentes oficiales
      </div>

      <style>{`
        .pulso-live-dot {
          background: #1D9E75;
          animation: pulso-blink 2.5s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

// ── Estilos inline (sin dependencia externa) ──────────────────────

const styles = {
  section: {
    borderTop: "1px solid rgba(0,0,0,0.09)",
    paddingTop: "2.5rem",
    paddingBottom: "3rem",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2.5rem 2rem 3rem",
  },
  tickerOuter: {
    overflow: "hidden",
    borderTop: "1px solid rgba(0,0,0,0.09)",
    borderBottom: "1px solid rgba(0,0,0,0.09)",
    padding: "8px 0",
    marginBottom: "2.5rem",
    marginLeft: "-2rem",
    marginRight: "-2rem",
    cursor: "default",
  },
  tickerTrack: {
    display: "inline-flex",
    gap: "48px",
    paddingLeft: "2rem",
    animation: "ticker-scroll 30s linear infinite",
    whiteSpace: "nowrap",
  },
  tickerItem: {
    fontSize: "13px",
    color: "#444",
    flexShrink: 0,
    letterSpacing: "0.01em",
  },
  tickerPeriodo: {
    color: "#767676",
    fontSize: "11px",
  },
  blockHeader: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: "1.25rem",
  },
  blockEyebrow: {
    fontSize: "11px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#767676",
    fontWeight: 500,
  },
  blockLink: {
    fontSize: "13px",
    color: "#15607a",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    fontFamily: "inherit",
    fontWeight: 500,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1px",
    background: "rgba(0,0,0,0.09)",
    border: "1px solid rgba(0,0,0,0.09)",
    borderRadius: "12px",
    overflow: "hidden",
    marginBottom: "1rem",
  },
  cell: {
    background: "#ffffff",
    padding: "1.25rem 1.1rem",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  cellLabel: {
    fontSize: "11px",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#767676",
    lineHeight: 1.3,
  },
  cellValue: {
    fontSize: "22px",
    fontWeight: 700,
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "-0.02em",
  },
  cellMeta: {
    fontSize: "11px",
    color: "#767676",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    marginTop: "2px",
  },
  dot: {
    display: "inline-block",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  skeleton: {
    display: "inline-block",
    width: "80px",
    height: "22px",
    background: "rgba(0,0,0,0.07)",
    borderRadius: "4px",
    verticalAlign: "middle",
  },
  nota: {
    fontSize: "11px",
    color: "#767676",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "0.75rem",
  },
};
