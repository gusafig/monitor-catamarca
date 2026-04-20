import React, { useState, useMemo } from "react";

// ── Helpers ───────────────────────────────────────────────────────

function formatFecha(fecha) {
  if (!fecha) return "";
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatAnio(fecha) {
  if (!fecha) return "";
  return new Date(fecha + "T12:00:00").getFullYear().toString();
}

function tiempoLectura(item) {
  // Combina texto de todos los bloques de tipo "texto"
  let texto = "";
  if (item.bloques && Array.isArray(item.bloques)) {
    texto = item.bloques
      .filter((b) => b.tipo === "texto")
      .map((b) => b.contenido || "")
      .join(" ");
  } else if (item.texto) {
    texto = item.texto;
  }
  if (!texto.trim()) return "1 min";
  const palabras = texto.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round(palabras / 200));
  return `${mins} min`;
}

// Agrupa publicaciones por año
function agruparPorAnio(items) {
  const grupos = {};
  items.forEach((item) => {
    const anio = item.fecha ? formatAnio(item.fecha) : "Sin fecha";
    if (!grupos[anio]) grupos[anio] = [];
    grupos[anio].push(item);
  });
  // Orden descendente por año
  return Object.entries(grupos).sort(([a], [b]) => b.localeCompare(a));
}

// ── Filtros disponibles ───────────────────────────────────────────
// Si tus artículos tienen un campo "categoria", podés filtrar por él.
// Si no existe, los filtros simplemente no hacen nada perjudicial.
const FILTROS = [
  { id: "todos", label: "Todas" },
  { id: "exportaciones", label: "Exportaciones" },
  { id: "finanzas", label: "Finanzas Públicas" },
  { id: "empleo", label: "Empleo" },
  { id: "fiscal", label: "Fiscal" },
  { id: "otros", label: "Otros" },
];

// ── Dot de la línea de tiempo ─────────────────────────────────────

function TlDot({ color, isFirst }) {
  return (
    <div
      style={{
        position: "absolute",
        left: "-26px",
        top: "6px",
        width: "11px",
        height: "11px",
        borderRadius: "50%",
        background: isFirst ? color : "rgba(0,0,0,0.18)",
        border: "2px solid #ffffff",
        boxSizing: "border-box",
        zIndex: 1,
      }}
    />
  );
}

// ── Tarjeta de publicación ────────────────────────────────────────

function TlCard({ item, isFirst, onVerArticulo }) {
  const accentColor = isFirst ? "#e6322e" : "transparent";

  return (
    <div style={{ position: "relative", marginBottom: "1.5rem" }}>
      <TlDot color="#e6322e" isFirst={isFirst} />

      <div style={styles.fecha}>{formatFecha(item.fecha)}</div>

      <article
        style={{
          ...styles.card,
          borderLeft: isFirst
            ? "3px solid #e6322e"
            : "0.5px solid rgba(0,0,0,0.09)",
          borderRadius: isFirst ? "0 10px 10px 0" : "10px",
          cursor: "pointer",
        }}
        onClick={() => onVerArticulo(item.id)}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onVerArticulo(item.id)}
        role="button"
        aria-label={`Leer: ${item.titulo}`}
      >
        <div style={styles.cardTop}>
          {item.imagen ? (
            <img
              src={item.imagen}
              alt=""
              style={styles.thumb}
              loading="lazy"
            />
          ) : (
            <div style={styles.thumbPlaceholder} aria-hidden="true" />
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={styles.titulo}>{item.titulo}</h3>
            {item.bajada && (
              <p style={styles.bajada}>{item.bajada}</p>
            )}
            <div style={styles.metaRow}>
              {item.categoria && (
                <span style={styles.tag}>{item.categoria}</span>
              )}
              <span style={styles.lectura}>{tiempoLectura(item)} de lectura</span>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────

export default function TimelineContenidos({ items, onVerArticulo }) {
  const [filtroActivo, setFiltroActivo] = useState("todos");

  const itemsFiltrados = useMemo(() => {
    if (filtroActivo === "todos") return items;
    return items.filter(
      (i) =>
        i.categoria &&
        i.categoria.toLowerCase() === filtroActivo.toLowerCase()
    );
  }, [items, filtroActivo]);

  const grupos = useMemo(
    () => agruparPorAnio(itemsFiltrados),
    [itemsFiltrados]
  );

  return (
    <div style={styles.page}>

      {/* ── Header ──────────────────────────────────── */}
      <div style={styles.pageHeader}>
        <p style={styles.eyebrow}>Synergia Consultores</p>
        <h2 style={styles.pageTitle}>Publicaciones</h2>
      </div>

      {/* ── Filtros ─────────────────────────────────── */}
      <div style={styles.filtroRow} role="group" aria-label="Filtrar por tema">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            style={{
              ...styles.filtroPill,
              background: filtroActivo === f.id ? "#e6322e" : "transparent",
              color: filtroActivo === f.id ? "#fff" : "#444",
              borderColor:
                filtroActivo === f.id ? "#e6322e" : "rgba(0,0,0,0.14)",
            }}
            onClick={() => setFiltroActivo(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Sin resultados ───────────────────────────── */}
      {itemsFiltrados.length === 0 && (
        <p style={styles.empty}>No hay publicaciones en esta categoría.</p>
      )}

      {/* ── Línea de tiempo ─────────────────────────── */}
      {grupos.map(([anio, arts]) => (
        <div key={anio}>
          <div style={styles.yearMarker}>{anio}</div>

          <div style={styles.timeline}>
            {/* Línea vertical */}
            <div style={styles.timelineLine} aria-hidden="true" />

            {arts.map((item, idx) => (
              <TlCard
                key={item.id}
                item={item}
                isFirst={idx === 0 && anio === grupos[0]?.[0]}
                onVerArticulo={onVerArticulo}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Estilos ───────────────────────────────────────────────────────

const styles = {
  page: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "2rem 2rem 4rem",
  },
  pageHeader: {
    borderBottom: "1px solid rgba(0,0,0,0.09)",
    paddingBottom: "1.25rem",
    marginBottom: "1.75rem",
  },
  eyebrow: {
    fontSize: "11px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#767676",
    marginBottom: "0.4rem",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "#111",
    lineHeight: 1.1,
  },
  filtroRow: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    marginBottom: "2rem",
  },
  filtroPill: {
    fontSize: "12px",
    fontWeight: 500,
    padding: "5px 14px",
    borderRadius: "99px",
    border: "1px solid rgba(0,0,0,0.14)",
    cursor: "pointer",
    transition: "background 0.15s, color 0.15s",
    fontFamily: "inherit",
    lineHeight: 1.4,
  },
  yearMarker: {
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#767676",
    paddingBottom: "0.75rem",
    marginBottom: "1.25rem",
    borderBottom: "0.5px solid rgba(0,0,0,0.09)",
    marginLeft: "28px",
  },
  timeline: {
    position: "relative",
    paddingLeft: "28px",
    marginBottom: "2rem",
  },
  timelineLine: {
    position: "absolute",
    left: "5px",
    top: "8px",
    bottom: "8px",
    width: "1px",
    background: "rgba(0,0,0,0.1)",
  },
  fecha: {
    fontSize: "11px",
    color: "#767676",
    letterSpacing: "0.03em",
    marginBottom: "6px",
  },
  card: {
    background: "#ffffff",
    border: "0.5px solid rgba(0,0,0,0.09)",
    borderRadius: "10px",
    padding: "1rem 1.1rem",
    transition: "border-color 0.15s",
  },
  cardTop: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },
  thumb: {
    width: "56px",
    height: "56px",
    borderRadius: "6px",
    objectFit: "cover",
    flexShrink: 0,
  },
  thumbPlaceholder: {
    width: "56px",
    height: "56px",
    borderRadius: "6px",
    background: "rgba(0,0,0,0.05)",
    flexShrink: 0,
  },
  titulo: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#111",
    lineHeight: 1.35,
    marginBottom: "4px",
  },
  bajada: {
    fontSize: "12px",
    color: "#444",
    lineHeight: 1.5,
    marginBottom: "8px",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  tag: {
    fontSize: "10px",
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: "99px",
    background: "rgba(230,50,46,0.1)",
    color: "#a32d2d",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  lectura: {
    fontSize: "11px",
    color: "#767676",
  },
  empty: {
    fontSize: "14px",
    color: "#767676",
    padding: "2rem 0",
  },
};
