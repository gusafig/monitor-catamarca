import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { useCsvData, lastValue } from "./hooks/useCsvData";
import { Section } from "./components/Section";
import { CONFIG } from "./data/config";
import "./styles.css";

// ── SUPABASE ──────────────────────────────────────────────────────
const SUPABASE_URL = "https://qhrmnzsuhuejvqtoemwz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFocm1uenN1aHVlanZxdG9lbXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjU5MDYsImV4cCI6MjA4OTk0MTkwNn0.ArQLf2kiQ4Mj1NH3chmZRt2QCM77LtUyPcvGY7F33ZQ";

const sbHeaders = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
};

async function cargarContenidos() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/contenidos?order=created_at.desc`,
      { headers: sbHeaders }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

async function guardarContenido(item) {
  await fetch(`${SUPABASE_URL}/rest/v1/contenidos`, {
    method: "POST",
    headers: { ...sbHeaders, "Prefer": "resolution=merge-duplicates" },
    body: JSON.stringify(item),
  });
}

async function eliminarContenido(id) {
  await fetch(`${SUPABASE_URL}/rest/v1/contenidos?id=eq.${id}`, {
    method: "DELETE",
    headers: sbHeaders,
  });
}

function tiempoLectura(texto) {
  if (!texto) return "1 min";
  const palabras = texto.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round(palabras / 200));
  return `${mins} min de lectura`;
}

function formatFecha(fecha) {
  if (!fecha) return "";
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-AR", {
    year: "numeric", month: "long", day: "numeric"
  });
}

// ── ÚLTIMA ACTUALIZACIÓN AUTOMÁTICA ──────────────────────────────
function extraerUltimoPeriodoCsv(obj) {
  if (!obj) return null;
  const raw = obj.periodo || obj.año || obj.fecha || null;
  if (!raw) return null;
  const str = String(raw).trim();
  const matchMes = str.match(/^(\d{4})-(\d{1,2})$/);
  if (matchMes) return new Date(parseInt(matchMes[1]), parseInt(matchMes[2]) - 1, 1);
  const matchAnio = str.match(/^(\d{4})$/);
  if (matchAnio) return new Date(parseInt(matchAnio[1]), 11, 31);
  const d = new Date(str);
  if (!isNaN(d)) return d;
  return null;
}

function formatFechaActualizacion(date) {
  if (!date) return CONFIG.actualizacion;
  return date.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}

function useUltimaActualizacion(items) {
  const [fechasCsv, setFechasCsv] = useState([]);

  useEffect(() => {
    let cancelado = false;
    const archivos = CONFIG.indicadores.map((i) => i.archivo);
    Promise.all(
      archivos.map((archivo) =>
        fetch(`${process.env.PUBLIC_URL}/data/${archivo}`)
          .then((r) => (r.ok ? r.text() : ""))
          .then((text) => {
            if (!text) return null;
            const lineas = text.trim().split("\n");
            if (lineas.length < 2) return null;
            const headers = lineas[0].split(",").map((h) => h.trim().replace(/"/g, ""));
            const ultima = lineas[lineas.length - 1].split(",").map((v) => v.trim().replace(/"/g, ""));
            const obj = {};
            headers.forEach((h, i) => { obj[h] = ultima[i]; });
            return extraerUltimoPeriodoCsv(obj);
          })
          .catch(() => null)
      )
    ).then((fechas) => {
      if (!cancelado) setFechasCsv(fechas.filter(Boolean));
    });
    return () => { cancelado = true; };
  }, []); // eslint-disable-line

  const fechasContenidos = items
    .map((i) => (i.fecha ? new Date(i.fecha + "T12:00:00") : null))
    .filter(Boolean);

  const todas = [...fechasCsv, ...fechasContenidos];
  if (todas.length === 0) return CONFIG.actualizacion;
  const max = todas.reduce((a, b) => (a > b ? a : b));
  return formatFechaActualizacion(max);
}

// ── INICIO ───────────────────────────────────────────────────────
function Inicio({ onNavigate, ultimaActualizacion }) {
  return (
    <div className="inicio-page">
      <div className="inicio-hero">
        <div className="inicio-hero-inner">
          <p className="inicio-eyebrow">Monitor de Indicadores Provinciales</p>
          <h1 className="inicio-headline">
            Catamarca<br />
            <span className="inicio-headline-accent">en datos</span>
          </h1>
          <p className="inicio-desc">
            Seguimiento sistemático de variables económicas
            de la provincia de Catamarca. Información actualizada para la toma
            de decisiones.
          </p>
          <button className="inicio-cta" onClick={() => onNavigate("monitor")}>
            Explorar variables →
          </button>
        </div>
        <div className="inicio-stats">
          <div className="inicio-stat">
            <span className="inicio-stat-num">{CONFIG.secciones.length}</span>
            <span className="inicio-stat-label">Secciones temáticas</span>
          </div>
          <div className="inicio-stat-divider" />
          <div className="inicio-stat">
            <span className="inicio-stat-num">{CONFIG.indicadores.length}</span>
            <span className="inicio-stat-label">Indicadores activos</span>
          </div>
          <div className="inicio-stat-divider" />
          <div className="inicio-stat">
            <span className="inicio-stat-num inicio-stat-fecha">{ultimaActualizacion}</span>
            <span className="inicio-stat-label">Última actualización</span>
          </div>
        </div>
      </div>
      <div className="inicio-cards">
        {CONFIG.secciones.map((s) => {
          const indicadoresSec = CONFIG.indicadores.filter((i) => i.seccion === s.id);
          return (
            <button key={s.id} className="inicio-card"
              onClick={() => onNavigate("monitor", s.id)}
              style={{ "--card-color": s.color }}>
              <span className="inicio-card-dot" />
              <span className="inicio-card-name">{s.label}</span>
              <span className="inicio-card-count">{indicadoresSec.length} indicadores</span>
              <span className="inicio-card-arrow">→</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── DASHBOARD CARD CON DATOS ──────────────────────────────────────
function DashboardCardLoader({ indicador, onVerDetalle }) {
  const { data, loading } = useCsvData(indicador.archivo);
  const val = lastValue(data, "valor");
  const formatted = !loading && val !== null && indicador.formato
    ? indicador.formato(val)
    : loading ? "…" : "—";
  const seccion = CONFIG.secciones.find((s) => s.id === indicador.seccion);
  const color = seccion?.color || "#1D9E75";

  const ultimoPeriodoRaw = data && data.length > 0
    ? (data[data.length - 1].periodo || data[data.length - 1].año || CONFIG.actualizacion)
    : CONFIG.actualizacion;

  function formatPeriodo(valor) {
    if (!valor) return CONFIG.actualizacion;
    const str = String(valor);
    const match = str.match(/^(\d{4})-(\d{1,2})$/);
    if (match) {
      const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
      const mes = meses[parseInt(match[2], 10) - 1];
      return mes ? `${mes} ${match[1]}` : str;
    }
    return str;
  }

  const ultimoPeriodo = formatPeriodo(ultimoPeriodoRaw);

  return (
    <button
      className="dash-card"
      style={{ "--dash-color": color }}
      onClick={() => onVerDetalle(indicador)}
      title={indicador.descripcion}
    >
      <div className="dash-card-top">
        <span className="dash-card-badge" style={{ background: color + "18", color }}>
          {seccion?.label}
        </span>
      </div>
      <div className="dash-card-nombre">{indicador.nombre}</div>
      <div className={"dash-card-valor" + (loading ? " loading" : "")}>{formatted}</div>
      <div className="dash-card-periodo">
        <span className="dash-card-unidad">{indicador.unidad}</span>
        <span className="dash-card-ref">{ultimoPeriodo}</span>
      </div>
      <div className="dash-card-cta">Ver gráfico →</div>
    </button>
  );
}

// ── VISTA DETALLE VARIABLE ────────────────────────────────────────
function DetalleVariable({ indicador, onVolver }) {
  const seccion = CONFIG.secciones.find((s) => s.id === indicador.seccion);
  const color = seccion?.color || "#1D9E75";

  return (
    <div>
      <div className="monitor-header" style={{ background: "#111" }}>
        <div className="monitor-header-inner">
          <div>
            <button className="detalle-volver" onClick={onVolver}>← Dashboard</button>
            <h2 className="monitor-title" style={{ marginTop: "0.4rem" }}>
              {indicador.nombre}
            </h2>
          </div>
          <div className="header-meta">
            <span className="header-updated" style={{ color }}>
              {seccion?.label}
            </span>
            <span className="header-fuente">{CONFIG.fuente}</span>
          </div>
        </div>
      </div>
      <div className="main-inner" style={{ paddingTop: "1.75rem" }}>
        <Section seccionId={indicador.seccion} soloIndicador={indicador.id} />
      </div>
    </div>
  );
}

// ── GLOSARIO DE VARIABLES ─────────────────────────────────────────
function GlosarioVariables() {
  const [abierta, setAbierta] = useState(null);

  return (
    <div className="glosario-section">
      <div className="main-inner">
        <div className="glosario-header">
          <h3 className="glosario-titulo">Glosario de variables</h3>
          <p className="glosario-desc">
            Definición, unidad y periodicidad de cada indicador incluido en el monitor.
          </p>
        </div>
        <div className="glosario-lista">
          {CONFIG.secciones.map((sec) => {
            const vars = CONFIG.indicadores.filter((i) => i.seccion === sec.id);
            return (
              <div key={sec.id} className="glosario-grupo">
                <div className="glosario-grupo-titulo" style={{ borderLeftColor: sec.color, color: sec.color }}>
                  {sec.label}
                </div>
                {vars.map((v) => (
                  <div
                    key={v.id}
                    className={"glosario-item" + (abierta === v.id ? " open" : "")}
                    onClick={() => setAbierta(abierta === v.id ? null : v.id)}
                  >
                    <div className="glosario-item-header">
                      <span className="glosario-item-nombre">{v.nombre}</span>
                      <span className="glosario-item-unidad">{v.unidad}</span>
                      <span className="glosario-item-toggle">{abierta === v.id ? "−" : "+"}</span>
                    </div>
                    {abierta === v.id && (
                      <div className="glosario-item-body">
                        <p className="glosario-item-desc">{v.descripcion || "Sin descripción disponible."}</p>
                        <p className="glosario-item-fuente">
                          <span className="glosario-fuente-label">Periodicidad:</span>{" "}
                          {v.periodo === "mes" ? "Mensual" : v.periodo === "trimestre" ? "Trimestral" : v.periodo === "año" ? "Anual" : v.periodo || "—"}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── MONITOR / DASHBOARD ───────────────────────────────────────────
function Monitor({ seccionInicial }) {
  const [vista, setVista] = useState("dashboard");
  const [indicadorActivo, setIndicadorActivo] = useState(null);

  function verDetalle(indicador) {
    setIndicadorActivo(indicador);
    setVista("detalle");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function volverDashboard() {
    setVista("dashboard");
    setIndicadorActivo(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (vista === "detalle" && indicadorActivo) {
    return <DetalleVariable indicador={indicadorActivo} onVolver={volverDashboard} />;
  }

  return (
    <div>
      <div className="monitor-header">
        <div className="monitor-header-inner">
          <h2 className="monitor-title">
            Dashboard de variables <span className="accent">socioeconómicas</span>
          </h2>
          <div className="header-meta">
            <span className="header-fuente">{CONFIG.fuente}</span>
          </div>
        </div>
      </div>

      <div className="main-inner" style={{ paddingTop: "1.75rem", paddingBottom: "1rem" }}>
        <div className="dash-grid">
          {CONFIG.indicadores.map((ind) => (
            <DashboardCardLoader key={ind.id} indicador={ind} onVerDetalle={verDetalle} />
          ))}
        </div>
      </div>

      <GlosarioVariables />
    </div>
  );
}

// ── LISTADO DE CONTENIDOS ────────────────────────────────────────
function Contenidos({ items, onVerArticulo }) {
  return (
    <div className="contenidos-page">
      <div className="monitor-header">
        <div className="monitor-header-inner">
          <h2 className="monitor-title">Publicaciones</h2>
        </div>
      </div>

      {items.length === 0 && (
        <p className="informes-empty" style={{ padding: "2rem" }}>No hay publicaciones aún.</p>
      )}

      <div className="main-inner" style={{ paddingTop: "1.75rem", paddingBottom: "3rem" }}>
        <div className="posts-grid">
          {items.map((item) => (
            <article
              key={item.id}
              className="post-card"
              onClick={() => onVerArticulo(item.id)}
            >
              {item.imagen ? (
                <div className="post-card-img-wrap">
                  <img src={item.imagen} alt={item.titulo} className="post-card-img" />
                </div>
              ) : (
                <div className="post-card-img-placeholder" />
              )}
              <div className="post-card-body">
                <span className="post-card-fecha">{formatFecha(item.fecha)}</span>
                <h3 className="post-card-titulo">{item.titulo}</h3>
                {item.bajada && <p className="post-card-bajada">{item.bajada}</p>}
                <span className="post-card-lectura">{tiempoLectura(item.texto)}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── DATAWRAPPER EMBED ────────────────────────────────────────────

// ── HELPERS DE BLOQUES ────────────────────────────────────────────
// Un artículo puede tener un campo "bloques" (array) O el campo legacy
// "texto" + "embed". Esta función normaliza ambos formatos al nuevo.
function normalizarBloques(item) {
  if (item.bloques && Array.isArray(item.bloques) && item.bloques.length > 0) {
    return item.bloques;
  }
  // Compatibilidad con artículos anteriores (texto + embed al final)
  const bloques = [];
  if (item.texto) {
    bloques.push({ tipo: "texto", contenido: item.texto });
  }
  if (item.embed) {
    bloques.push({ tipo: "embed", contenido: item.embed });
  }
  return bloques;
}

// ── VISTA DE ARTÍCULO ────────────────────────────────────────────
function Articulo({ item, onVolver }) {
  if (!item) return null;

  const bloques = normalizarBloques(item);

  function descargarPDF(item) {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxW = pageW - margin * 2;
    let y = margin;

    doc.setFillColor(230, 50, 46);
    doc.rect(0, 0, pageW, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("Synergia Consultores", margin, 6.5);
    y = 22;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(formatFecha(item.fecha), margin, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(17, 17, 17);
    const tituloLines = doc.splitTextToSize(item.titulo, maxW);
    doc.text(tituloLines, margin, y);
    y += tituloLines.length * 9 + 4;

    if (item.bajada) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      const bajadaLines = doc.splitTextToSize(item.bajada, maxW);
      doc.text(bajadaLines, margin, y);
      y += bajadaLines.length * 6 + 4;
    }

    doc.setDrawColor(230, 50, 46);
    doc.setLineWidth(0.8);
    doc.line(margin, y, margin + 20, y);
    y += 8;

    bloques.forEach((bloque) => {
      if (bloque.tipo === "texto") {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(34, 34, 34);
        const parrafos = (bloque.contenido || "").split("\n\n").filter(Boolean);
        parrafos.forEach((parrafo) => {
          const lines = doc.splitTextToSize(parrafo, maxW);
          lines.forEach((line) => {
            if (y > pageH - margin) { doc.addPage(); y = margin; }
            doc.text(line, margin, y);
            y += 6;
          });
          y += 4;
        });
      } else if (bloque.tipo === "embed") {
        if (y > pageH - 30) { doc.addPage(); y = margin; }
        y += 4;
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.rect(margin, y, maxW, 18, "S");
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text("Visualización interactiva disponible en la versión web del artículo.", margin + 4, y + 7);
        const srcMatch = bloque.contenido.match(/src=["']([^"']+)["']/);
        const src = srcMatch ? srcMatch[1] : (bloque.contenido.startsWith("http") ? bloque.contenido.trim() : null);
        if (src) {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(21, 96, 122);
          doc.text(src, margin + 4, y + 13);
        }
        y += 24;
      }
    });

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFillColor(245, 245, 245);
      doc.rect(0, pageH - 10, pageW, 10, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("synergiaconsult76@gmail.com", margin, pageH - 4);
      doc.text(`${i} / ${totalPages}`, pageW - margin, pageH - 4, { align: "right" });
    }

    const nombreArchivo = item.titulo
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/ +/g, "-")
      .slice(0, 50);
    doc.save(`${nombreArchivo}.pdf`);
  }

  return (
    <div className="articulo-page">
      <button className="articulo-volver" onClick={onVolver}>← Volver</button>

      {(item.imagen_articulo || item.imagen) && (
        <div className="articulo-portada">
          <img src={item.imagen_articulo || item.imagen} alt={item.titulo} />
        </div>
      )}

      <div className="articulo-inner">
        <div className="articulo-meta">
          <span className="articulo-fecha">{formatFecha(item.fecha)}</span>
          <span className="articulo-lectura">{tiempoLectura(item.texto)}</span>
          <button className="articulo-pdf-btn" onClick={() => descargarPDF(item)}>
            ↓ Descargar PDF
          </button>
        </div>

        <h1 className="articulo-titulo">{item.titulo}</h1>

        {item.bajada && <p className="articulo-bajada">{item.bajada}</p>}

        <div className="articulo-separador" />

        {/* Renderizado de bloques en orden */}
        <div className="articulo-bloques">
          {bloques.map((bloque, i) => {
            if (bloque.tipo === "texto") {
              return (
                <div key={i} className="articulo-cuerpo">
                  {bloque.contenido.split("\n\n").filter(Boolean).map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
              );
            }
            if (bloque.tipo === "embed") {
              return (
                <div key={i} className="articulo-viz">
                  <DatawrapperEmbed embed={bloque.contenido} />
                </div>
              );
            }
            return null;
          })}
        </div>

        {item.link && (
          <div className="articulo-link-wrap">
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="articulo-link">
              {item.linkLabel || "Ver más →"}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PANEL ADMIN ───────────────────────────────────────────────────
const PASSWORD = "synergia2026";

function Admin({ items, setItems, onSalir }) {
  const [autenticado, setAutenticado] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [errorPass, setErrorPass] = useState(false);
  const [vista, setVista] = useState("lista");
  const [form, setForm] = useState(formVacio());

  function formVacio() {
    return {
      id: null,
      titulo: "",
      bajada: "",
      fecha: new Date().toISOString().slice(0, 10),
      bloques: [{ tipo: "texto", contenido: "" }],
      imagen: "",
      imagen_articulo: "",
      link: "",
      linkLabel: "",
      // campos legacy mantenidos para compatibilidad con artículos existentes
      texto: "",
      embed: "",
    };
  }

  function login() {
    if (adminPass === PASSWORD) { setAutenticado(true); setErrorPass(false); }
    else { setErrorPass(true); }
  }

  function nuevoItem() { setForm(formVacio()); setVista("form"); }

  function editarItem(item) {
    // Si el artículo es legacy (sin bloques), convertirlo al nuevo formato
    const bloques = normalizarBloques(item);
    setForm({ ...item, bloques: bloques.length > 0 ? bloques : [{ tipo: "texto", contenido: "" }] });
    setVista("form");
  }

  async function guardar() {
    if (!form.titulo.trim()) return;
    // Guardar siempre con el nuevo formato de bloques
    const item = form.id ? { ...form } : { ...form, id: Date.now() };
    // Limpiar campos legacy para no duplicar contenido
    item.texto = "";
    item.embed = "";
    await guardarContenido(item);
    const nuevos = await cargarContenidos();
    setItems(nuevos);
    setVista("lista");
  }

  async function eliminar(id) {
    if (window.confirm("¿Eliminar esta publicación?")) {
      await eliminarContenido(id);
      const nuevos = await cargarContenidos();
      setItems(nuevos);
    }
  }

  // ── Funciones para manejar bloques ──────────────────────────────
  function agregarBloque(tipo) {
    setForm((f) => ({
      ...f,
      bloques: [...f.bloques, { tipo, contenido: "" }],
    }));
  }

  function actualizarBloque(idx, contenido) {
    setForm((f) => {
      const bloques = f.bloques.map((b, i) => i === idx ? { ...b, contenido } : b);
      return { ...f, bloques };
    });
  }

  function eliminarBloque(idx) {
    setForm((f) => ({
      ...f,
      bloques: f.bloques.filter((_, i) => i !== idx),
    }));
  }

  function moverBloque(idx, direccion) {
    setForm((f) => {
      const bloques = [...f.bloques];
      const destino = idx + direccion;
      if (destino < 0 || destino >= bloques.length) return f;
      [bloques[idx], bloques[destino]] = [bloques[destino], bloques[idx]];
      return { ...f, bloques };
    });
  }

  if (!autenticado) {
    return (
      <div className="admin-page">
        <div className="admin-login-box">
          <h2 className="admin-login-title">Acceso administrador</h2>
          <input
            type="password"
            placeholder="Contraseña"
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            className="admin-input"
            autoFocus
          />
          <button className="btn-primary" onClick={login}>Ingresar</button>
          {errorPass && <p className="admin-error">Contraseña incorrecta</p>}
          <button className="admin-link-volver" onClick={onSalir}>← Volver al sitio</button>
        </div>
      </div>
    );
  }

  if (vista === "form") {
    return (
      <div className="admin-page">
        <div className="admin-form-page">
          <div className="admin-form-header">
            <h2 className="admin-form-title">{form.id ? "Editar publicación" : "Nueva publicación"}</h2>
            <button className="btn-secondary" onClick={() => setVista("lista")}>Cancelar</button>
          </div>
          <div className="admin-form">

            <label className="admin-label">Título *</label>
            <input className="admin-input" placeholder="Título del artículo" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />

            <label className="admin-label">Bajada / subtítulo</label>
            <textarea className="admin-textarea" placeholder="Descripción breve que aparece en el listado y al inicio del artículo" value={form.bajada} onChange={(e) => setForm({ ...form, bajada: e.target.value })} style={{minHeight: "70px"}} />

            <label className="admin-label">Fecha</label>
            <input className="admin-input" type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />

            {/* ── EDITOR DE BLOQUES ─────────────────────────── */}
            <label className="admin-label" style={{ marginTop: "1.5rem" }}>
              Contenido del artículo
            </label>
            <p className="admin-hint">
              Construí el artículo agregando bloques de texto y gráficos de Datawrapper en el orden que quieras.
              Usá las flechas ↑ ↓ para reordenarlos.
            </p>

            <div className="admin-bloques">
              {form.bloques.map((bloque, idx) => (
                <div key={idx} className="admin-bloque">
                  <div className="admin-bloque-header">
                    <span className="admin-bloque-tipo">
                      {bloque.tipo === "texto" ? "📝 Bloque de texto" : "📊 Gráfico Datawrapper"}
                    </span>
                    <div className="admin-bloque-acciones">
                      <button
                        className="admin-bloque-btn"
                        onClick={() => moverBloque(idx, -1)}
                        disabled={idx === 0}
                        title="Mover arriba"
                      >↑</button>
                      <button
                        className="admin-bloque-btn"
                        onClick={() => moverBloque(idx, 1)}
                        disabled={idx === form.bloques.length - 1}
                        title="Mover abajo"
                      >↓</button>
                      <button
                        className="admin-bloque-btn admin-bloque-btn-del"
                        onClick={() => eliminarBloque(idx)}
                        title="Eliminar bloque"
                      >✕</button>
                    </div>
                  </div>

                  {bloque.tipo === "texto" ? (
                    <textarea
                      className="admin-textarea"
                      placeholder="Escribí el texto aquí. Separá párrafos con una línea en blanco."
                      value={bloque.contenido}
                      onChange={(e) => actualizarBloque(idx, e.target.value)}
                      style={{ minHeight: "160px" }}
                    />
                  ) : (
                    <textarea
                      className="admin-textarea"
                      placeholder='Pegá el código iframe de Datawrapper aquí. Ej: <iframe title="..." src="https://datawrapper.dwcdn.net/..." ...'
                      value={bloque.contenido}
                      onChange={(e) => actualizarBloque(idx, e.target.value)}
                      style={{ minHeight: "90px", fontFamily: "monospace", fontSize: "12px" }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="admin-bloques-agregar">
              <span className="admin-hint" style={{ marginBottom: 0, alignSelf: "center" }}>Agregar bloque:</span>
              <button className="btn-secondary" onClick={() => agregarBloque("texto")}>
                + Texto
              </button>
              <button className="btn-secondary" onClick={() => agregarBloque("embed")}>
                + Gráfico Datawrapper
              </button>
            </div>
            {/* ── FIN EDITOR DE BLOQUES ─────────────────────── */}

            <label className="admin-label" style={{ marginTop: "1.5rem" }}>URL de imagen de portada</label>
            <p className="admin-hint">Aparece en el listado de contenidos.</p>
            <input className="admin-input" placeholder="https://..." value={form.imagen} onChange={(e) => setForm({ ...form, imagen: e.target.value })} />

            <label className="admin-label">URL de imagen de cabecera del artículo</label>
            <p className="admin-hint">Aparece dentro del artículo. Si está vacía, no se muestra ninguna imagen.</p>
            <input className="admin-input" placeholder="https://... (opcional)" value={form.imagen_articulo || ""} onChange={(e) => setForm({ ...form, imagen_articulo: e.target.value })} />

            <label className="admin-label">Link externo (opcional)</label>
            <input className="admin-input" placeholder="https://..." value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
            <input className="admin-input" placeholder="Texto del link (ej: Ver informe completo)" value={form.linkLabel} onChange={(e) => setForm({ ...form, linkLabel: e.target.value })} />

            <div className="admin-form-btns">
              <button className="btn-primary" onClick={guardar}>Guardar publicación</button>
              <button className="btn-secondary" onClick={() => setVista("lista")}>Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-lista-page">
        <div className="admin-lista-header">
          <div>
            <h2 className="admin-lista-title">Publicaciones</h2>
            <p className="admin-lista-sub">{items.length} artículo{items.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="admin-lista-actions">
            <button className="btn-primary" onClick={nuevoItem}>+ Nueva publicación</button>
            <button className="btn-secondary" onClick={onSalir}>← Salir</button>
          </div>
        </div>

        {items.length === 0 && <p className="informes-empty">No hay publicaciones aún.</p>}

        <div className="admin-posts-list">
          {items.map((item) => (
            <div className="admin-post-row" key={item.id}>
              {item.imagen
                ? <img src={item.imagen} alt="" className="admin-post-thumb" />
                : <div className="admin-post-thumb-placeholder" />
              }
              <div className="admin-post-info">
                <span className="admin-post-titulo">{item.titulo}</span>
                <span className="admin-post-meta">{formatFecha(item.fecha)} · {tiempoLectura(item.texto)}</span>
                {item.bajada && <span className="admin-post-bajada">{item.bajada}</span>}
              </div>
              <div className="admin-post-btns">
                <button className="btn-edit" onClick={() => editarItem(item)}>Editar</button>
                <button className="btn-delete" onClick={() => eliminar(item.id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ── PANEL ADMIN ───────────────────────────────────────────────────

function Admin({ items, setItems, onSalir }) {
  const [autenticado, setAutenticado] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [errorPass, setErrorPass] = useState(false);
  const [vista, setVista] = useState("lista");
  const [form, setForm] = useState(formVacio());

  function formVacio() {
    return { id: null, titulo: "", bajada: "", fecha: new Date().toISOString().slice(0, 10), texto: "", imagen: "", imagen_articulo: "", link: "", linkLabel: "", embed: "" };
  }

  function login() {
    if (adminPass === PASSWORD) { setAutenticado(true); setErrorPass(false); }
    else { setErrorPass(true); }
  }

  function nuevoItem() { setForm(formVacio()); setVista("form"); }
  function editarItem(item) { setForm({ ...item }); setVista("form"); }

  async function guardar() {
    if (!form.titulo.trim()) return;
    const item = form.id ? { ...form } : { ...form, id: Date.now() };
    await guardarContenido(item);
    const nuevos = await cargarContenidos();
    setItems(nuevos);
    setVista("lista");
  }

  async function eliminar(id) {
    if (window.confirm("¿Eliminar esta publicación?")) {
      await eliminarContenido(id);
      const nuevos = await cargarContenidos();
      setItems(nuevos);
    }
  }

  if (!autenticado) {
    return (
      <div className="admin-page">
        <div className="admin-login-box">
          <h2 className="admin-login-title">Acceso administrador</h2>
          <input
            type="password"
            placeholder="Contraseña"
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            className="admin-input"
            autoFocus
          />
          <button className="btn-primary" onClick={login}>Ingresar</button>
          {errorPass && <p className="admin-error">Contraseña incorrecta</p>}
          <button className="admin-link-volver" onClick={onSalir}>← Volver al sitio</button>
        </div>
      </div>
    );
  }

  if (vista === "form") {
    return (
      <div className="admin-page">
        <div className="admin-form-page">
          <div className="admin-form-header">
            <h2 className="admin-form-title">{form.id ? "Editar publicación" : "Nueva publicación"}</h2>
            <button className="btn-secondary" onClick={() => setVista("lista")}>Cancelar</button>
          </div>
          <div className="admin-form">
            <label className="admin-label">Título *</label>
            <input className="admin-input" placeholder="Título del artículo" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />

            <label className="admin-label">Bajada / subtítulo</label>
            <textarea className="admin-textarea" placeholder="Descripción breve que aparece en el listado y al inicio del artículo" value={form.bajada} onChange={(e) => setForm({ ...form, bajada: e.target.value })} style={{minHeight: "70px"}} />

            <label className="admin-label">Fecha</label>
            <input className="admin-input" type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />

            <label className="admin-label">Texto del artículo</label>
            <p className="admin-hint">Separar párrafos con una línea en blanco.</p>
            <textarea className="admin-textarea" placeholder="Escribí el contenido del artículo aquí..." value={form.texto} onChange={(e) => setForm({ ...form, texto: e.target.value })} style={{minHeight: "220px"}} />

            <label className="admin-label">URL de imagen de portada</label>
            <p className="admin-hint">Aparece en el listado de contenidos.</p>
            <input className="admin-input" placeholder="https://..." value={form.imagen} onChange={(e) => setForm({ ...form, imagen: e.target.value })} />

            <label className="admin-label">URL de imagen de cabecera del artículo</label>
            <p className="admin-hint">Aparece dentro del artículo. Si está vacía, no se muestra ninguna imagen en el artículo.</p>
            <input className="admin-input" placeholder="https://... (opcional, puede ser diferente a la portada)" value={form.imagen_articulo || ""} onChange={(e) => setForm({ ...form, imagen_articulo: e.target.value })} />

            <label className="admin-label">Código embed Datawrapper</label>
            <p className="admin-hint">Pegá el código iframe que genera Datawrapper al publicar.</p>
            <textarea className="admin-textarea" placeholder='<iframe title="..." ...' value={form.embed} onChange={(e) => setForm({ ...form, embed: e.target.value })} style={{minHeight: "90px", fontFamily: "monospace", fontSize: "12px"}} />

            <label className="admin-label">Link externo (opcional)</label>
            <input className="admin-input" placeholder="https://..." value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
            <input className="admin-input" placeholder="Texto del link (ej: Ver informe completo)" value={form.linkLabel} onChange={(e) => setForm({ ...form, linkLabel: e.target.value })} />

            <div className="admin-form-btns">
              <button className="btn-primary" onClick={guardar}>Guardar publicación</button>
              <button className="btn-secondary" onClick={() => setVista("lista")}>Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-lista-page">
        <div className="admin-lista-header">
          <div>
            <h2 className="admin-lista-title">Publicaciones</h2>
            <p className="admin-lista-sub">{items.length} artículo{items.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="admin-lista-actions">
            <button className="btn-primary" onClick={nuevoItem}>+ Nueva publicación</button>
            <button className="btn-secondary" onClick={onSalir}>← Salir</button>
          </div>
        </div>

        {items.length === 0 && <p className="informes-empty">No hay publicaciones aún.</p>}

        <div className="admin-posts-list">
          {items.map((item) => (
            <div className="admin-post-row" key={item.id}>
              {item.imagen
                ? <img src={item.imagen} alt="" className="admin-post-thumb" />
                : <div className="admin-post-thumb-placeholder" />
              }
              <div className="admin-post-info">
                <span className="admin-post-titulo">{item.titulo}</span>
                <span className="admin-post-meta">{formatFecha(item.fecha)} · {tiempoLectura(item.texto)}</span>
                {item.bajada && <span className="admin-post-bajada">{item.bajada}</span>}
              </div>
              <div className="admin-post-btns">
                <button className="btn-edit" onClick={() => editarItem(item)}>Editar</button>
                <button className="btn-delete" onClick={() => eliminar(item.id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── APP ──────────────────────────────────────────────────────────
export default function App() {
  const [pagina, setPagina] = useState(() => {
    const path = window.location.pathname;
    if (path === "/admin") return "admin";
    if (path === "/monitor") return "monitor";
    if (path === "/contenidos") return "contenidos";
    return "inicio";
  });
  const [seccionMonitor, setSeccionMonitor] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [articuloId, setArticuloId] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    cargarContenidos().then(setItems);
  }, []);

  useEffect(() => {
    if (window.location.pathname === "/admin") setPagina("admin");
  }, []);

  const ultimaActualizacion = useUltimaActualizacion(items);

  function navegarA(pag, seccion) {
    setPagina(pag);
    if (seccion) setSeccionMonitor(seccion);
    setMenuAbierto(false);
    setArticuloId(null);
    window.history.pushState({}, "", pag === "inicio" ? "/" : "/" + pag);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function verArticulo(id) {
    setArticuloId(id);
    setPagina("articulo");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function volverDeArticulo() {
    setArticuloId(null);
    setPagina("contenidos");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const esAdmin = pagina === "admin";
  const articuloActual = items.find((i) => i.id === articuloId);

  return (
    <div className="app">
      {!esAdmin && (
        <header className="header">
          <div className="header-inner">
            <div className="header-brand" onClick={() => navegarA("inicio")} style={{ cursor: "pointer" }}>
              <img src="/logo.png" alt="Synergia Consultores" className="header-logo" />
            </div>
            <nav className={"main-nav" + (menuAbierto ? " open" : "")}>
              <button
                className={"nav-pill" + (pagina === "inicio" ? " nav-pill-active" : " nav-pill-inactive")}
                onClick={() => navegarA("inicio")}
              >
                Inicio
              </button>
              <button
                className={"nav-pill" + (pagina === "monitor" ? " nav-pill-active" : " nav-pill-inactive")}
                onClick={() => navegarA("monitor")}
              >
                Monitor
              </button>
              <button
                className={"nav-pill" + (["contenidos","articulo"].includes(pagina) ? " nav-pill-active" : " nav-pill-inactive")}
                onClick={() => navegarA("contenidos")}
              >
                Contenidos
              </button>
            </nav>
            <button className="hamburger" onClick={() => setMenuAbierto(!menuAbierto)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </header>
      )}

      <main className="main">
        {pagina === "inicio"     && <Inicio onNavigate={navegarA} ultimaActualizacion={ultimaActualizacion} />}
        {pagina === "monitor"    && <Monitor seccionInicial={seccionMonitor} />}
        {pagina === "contenidos" && (
          <Contenidos items={items} onVerArticulo={verArticulo} />
        )}
        {pagina === "articulo"   && <Articulo item={articuloActual} onVolver={volverDeArticulo} />}
        {pagina === "admin"      && (
          <Admin
            items={items}
            setItems={setItems}
            onSalir={() => { window.history.replaceState({}, "", "/"); navegarA("inicio"); }}
          />
        )}
      </main>

      {!esAdmin && (
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <img src="/logo.png" alt="Synergia Consultores" className="footer-logo" />
            </div>
            <a href="mailto:synergiaconsult76@gmail.com" className="footer-mail">
              synergiaconsult76@gmail.com
            </a>
            <div className="footer-copy">© {new Date().getFullYear()} Synergia Consultores</div>
          </div>
        </footer>
      )}
    </div>
  );
}
