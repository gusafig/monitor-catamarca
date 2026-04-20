import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { useCsvData, lastValue } from "./hooks/useCsvData";
import { Section } from "./components/Section";
import { CONFIG } from "./data/config";
import BcraEstadisticas from "./components/BcraEstadisticas";
import PulsoEconomico from "./components/PulsoEconomico";
import TimelineContenidos from "./components/TimelineContenidos";
import "./styles.css";

const SUPABASE_URL = "https://qhrmnzsuhuejvqtoemwz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFocm1uenN1aHVlanZxdG9lbXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjU5MDYsImV4cCI6MjA4OTk0MTkwNn0.ArQLf2kiQ4Mj1NH3chmZRt2QCM77LtUyPcvGY7F33ZQ";
const sbHeaders = { "Content-Type": "application/json", "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` };

async function cargarContenidos() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/contenidos?order=created_at.desc`, { headers: sbHeaders });
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

async function guardarContenido(item) {
  const headers = { ...sbHeaders, "Prefer": "return=representation" };
  if (item._isNew) {
    const { _isNew, ...data } = item;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/contenidos`, { method: "POST", headers, body: JSON.stringify(data) });
    if (!res.ok) { const err = await res.text(); throw new Error(err); }
  } else {
    const { id, ...data } = item;
    if (typeof data.bloques === "string") { try { data.bloques = JSON.parse(data.bloques); } catch {} }
    const res = await fetch(`${SUPABASE_URL}/rest/v1/contenidos?id=eq.${id}`, { method: "PATCH", headers, body: JSON.stringify(data) });
    if (!res.ok) { const err = await res.text(); throw new Error(err); }
  }
}

async function eliminarContenido(id) {
  await fetch(`${SUPABASE_URL}/rest/v1/contenidos?id=eq.${id}`, { method: "DELETE", headers: sbHeaders });
}

// REQUISITO: crear bucket "informes-pdf" en Supabase Storage (publico: ON)
async function subirPdf(file) {
  const nombre = `${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, "_")}`;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/informes-pdf/${nombre}`, {
    method: "POST",
    headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/pdf", "x-upsert": "true" },
    body: file,
  });
  if (!res.ok) { const err = await res.text(); throw new Error(err); }
  return `${SUPABASE_URL}/storage/v1/object/public/informes-pdf/${nombre}`;
}

function generarTarjetaInstagram(item) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080; canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0c3d52"; ctx.fillRect(0, 0, 1080, 1080);
  ctx.fillStyle = "#b51a17"; ctx.fillRect(0, 0, 1080, 10);
  ctx.fillStyle = "rgba(0,0,0,0.22)"; ctx.fillRect(0, 880, 1080, 200);
  ctx.fillStyle = "#36aeac"; ctx.fillRect(80, 215, 70, 5);
  ctx.fillStyle = "rgba(54,174,172,0.9)"; ctx.font = "500 28px Arial,sans-serif";
  ctx.fillText("SYNERGIA CONSULTORES", 80, 185);
  if (item.categoria) {
    const tw = ctx.measureText(item.categoria.toUpperCase()).width;
    ctx.fillStyle = "rgba(181,26,23,0.85)";
    ctx.beginPath(); ctx.roundRect(80, 238, tw + 36, 42, 4); ctx.fill();
    ctx.fillStyle = "#ffffff"; ctx.font = "600 20px Arial,sans-serif";
    ctx.fillText(item.categoria.toUpperCase(), 100, 265);
  }
  const startY = item.categoria ? 360 : 310;
  ctx.fillStyle = "#ffffff"; ctx.font = "bold 66px Georgia,serif";
  const words = (item.titulo || "").split(" ");
  let line = ""; let y = startY; const maxW = 920; const lh = 82;
  for (const w of words) {
    const t = line + w + " ";
    if (ctx.measureText(t).width > maxW && line !== "") {
      ctx.fillText(line.trim(), 80, y); line = w + " "; y += lh;
      if (y > 680) { ctx.fillText(line.trim() + "\u2026", 80, y); line = ""; break; }
    } else { line = t; }
  }
  if (line) ctx.fillText(line.trim(), 80, y);
  y += lh + 18;
  if (item.bajada && y < 760) {
    ctx.fillStyle = "rgba(255,255,255,0.62)"; ctx.font = "400 34px Arial,sans-serif";
    const bw = item.bajada.split(" "); let bl = "";
    for (const w of bw) {
      const t = bl + w + " ";
      if (ctx.measureText(t).width > 920 && bl !== "") {
        ctx.fillText(bl.trim(), 80, y); bl = w + " "; y += 48;
        if (y > 820) break;
      } else { bl = t; }
    }
    if (y <= 820 && bl) ctx.fillText(bl.trim(), 80, y);
  }
  ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.font = "400 25px Arial,sans-serif";
  ctx.fillText("synergiaconsultores.vercel.app", 80, 978);
  ctx.fillStyle = "rgba(54,174,172,0.88)"; ctx.font = "600 27px Arial,sans-serif";
  ctx.fillText("Monitor Catamarca", 80, 1028);
  if (item.fecha) {
    const fecha = new Date(item.fecha + "T12:00:00").toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" });
    ctx.fillStyle = "rgba(255,255,255,0.30)"; ctx.font = "400 23px Arial,sans-serif";
    ctx.textAlign = "right"; ctx.fillText(fecha, 1000, 978); ctx.textAlign = "left";
  }
  const slug = (item.titulo || "informe").toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 44);
  const a = document.createElement("a");
  a.download = `instagram-${slug}.png`; a.href = canvas.toDataURL("image/png"); a.click();
}

function copiarCaptionInstagram(item) {
  const lineas = [];
  if (item.titulo) lineas.push(item.titulo);
  if (item.bajada) lineas.push("", item.bajada);
  lineas.push("", "\uD83D\uDCCA Monitor Catamarca \u2014 synergiaconsultores.vercel.app");
  lineas.push("#MonitorCatamarca #Econom\xedaCatamarca #Synergia #Datos");
  navigator.clipboard.writeText(lineas.join("\n")).catch(() => {});
}

function tiempoLectura(texto) {
  if (!texto) return "1 min";
  const palabras = texto.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(palabras / 200))} min de lectura`;
}

function formatFecha(fecha) {
  if (!fecha) return "";
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" });
}

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
  return isNaN(d) ? null : d;
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
            const hs = lineas[0].split(",").map((h) => h.trim().replace(/"/g, ""));
            const ul = lineas[lineas.length - 1].split(",").map((v) => v.trim().replace(/"/g, ""));
            const obj = {}; hs.forEach((h, i) => { obj[h] = ul[i]; });
            return extraerUltimoPeriodoCsv(obj);
          }).catch(() => null)
      )
    ).then((fechas) => { if (!cancelado) setFechasCsv(fechas.filter(Boolean)); });
    return () => { cancelado = true; };
  }, []); // eslint-disable-line
  const todas = [...fechasCsv, ...items.map((i) => (i.fecha ? new Date(i.fecha + "T12:00:00") : null)).filter(Boolean)];
  if (todas.length === 0) return CONFIG.actualizacion;
  return formatFechaActualizacion(todas.reduce((a, b) => (a > b ? a : b)));
}

function ContactForm() {
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  function validate() {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Ingresá tu nombre";
    if (!form.email.trim()) e.email = "Ingresá tu email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";
    if (!form.mensaje.trim()) e.mensaje = "Escribí tu consulta";
    else if (form.mensaje.trim().length < 10) e.mensaje = "Escribí al menos 10 caracteres";
    return e;
  }
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((err) => ({ ...err, [name]: undefined }));
  }
  async function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setStatus("sending");
    try { await new Promise((r) => setTimeout(r, 1200)); setStatus("success"); setForm({ nombre: "", email: "", mensaje: "" }); }
    catch { setStatus("error"); }
  }
  if (status === "success") {
    return (
      <div className="contact-success">
        <div className="contact-success-icon">✓</div>
        <h3 className="contact-success-title">Mensaje enviado</h3>
        <p className="contact-success-desc">Nos ponemos en contacto en las próximas 24–48 horas hábiles.</p>
        <button className="contact-success-reset" onClick={() => setStatus("idle")}>Enviar otro mensaje</button>
      </div>
    );
  }
  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-field">
        <label className="contact-label" htmlFor="cf-nombre">Nombre</label>
        <input id="cf-nombre" name="nombre" type="text" className={"contact-input" + (errors.nombre ? " contact-input-error" : "")} placeholder="Tu nombre completo" value={form.nombre} onChange={handleChange} autoComplete="name" />
        {errors.nombre && <span className="contact-error">{errors.nombre}</span>}
      </div>
      <div className="contact-field">
        <label className="contact-label" htmlFor="cf-email">Email</label>
        <input id="cf-email" name="email" type="email" className={"contact-input" + (errors.email ? " contact-input-error" : "")} placeholder="tu@email.com" value={form.email} onChange={handleChange} autoComplete="email" />
        {errors.email && <span className="contact-error">{errors.email}</span>}
      </div>
      <div className="contact-field">
        <label className="contact-label" htmlFor="cf-mensaje">Consulta</label>
        <textarea id="cf-mensaje" name="mensaje" className={"contact-textarea" + (errors.mensaje ? " contact-input-error" : "")} placeholder="¿En qué podemos ayudarte?" value={form.mensaje} onChange={handleChange} rows={4} />
        {errors.mensaje && <span className="contact-error">{errors.mensaje}</span>}
      </div>
      <button type="submit" className="contact-submit" disabled={status === "sending"}>{status === "sending" ? "Enviando…" : "Enviar mensaje →"}</button>
      {status === "error" && <p className="contact-error-global">No se pudo enviar. Escribinos a <a href="mailto:synergiaconsult76@gmail.com">synergiaconsult76@gmail.com</a></p>}
    </form>
  );
}

// Cards de sectores eliminadas — queda hero + PulsoEconómico + contacto
function Inicio({ onNavigate, ultimaActualizacion }) {
  return (
    <div className="inicio-page">
      <div className="inicio-hero">
        <div className="inicio-hero-inner">
          <p className="inicio-eyebrow">Monitor de Indicadores Provinciales</p>
          <h1 className="inicio-headline">Catamarca<br /><span className="inicio-headline-accent">en datos</span></h1>
          <p className="inicio-desc">Seguimiento sistemático de variables económicas de la provincia de Catamarca. Información actualizada para la toma de decisiones públicas y privadas.</p>
          <div className="inicio-cta-row">
            <button className="inicio-cta" onClick={() => onNavigate("monitor")}>Explorar variables →</button>
            <button className="inicio-cta-secondary" onClick={() => onNavigate("informes")}>Ver informes</button>
          </div>
        </div>
        <div className="inicio-stats">
          <div className="inicio-stat"><span className="inicio-stat-num">{CONFIG.secciones.length}</span><span className="inicio-stat-label">Secciones temáticas</span></div>
          <div className="inicio-stat-divider" />
          <div className="inicio-stat"><span className="inicio-stat-num">{CONFIG.indicadores.length}</span><span className="inicio-stat-label">Indicadores activos</span></div>
          <div className="inicio-stat-divider" />
          <div className="inicio-stat"><span className="inicio-stat-num inicio-stat-fecha">{ultimaActualizacion}</span><span className="inicio-stat-label">Última actualización</span></div>
        </div>
      </div>
      <PulsoEconomico onNavigate={onNavigate} />
      <section id="contacto" className="contacto-section">
        <div className="contacto-inner">
          <div className="contacto-copy">
            <p className="contacto-eyebrow">Contacto</p>
            <h2 className="contacto-titulo">¿Necesitás análisis<br />a medida?</h2>
            <p className="contacto-desc">Trabajamos con organismos públicos, empresas y medios que necesitan datos económicos de Catamarca con contexto y metodología rigurosa.</p>
            <a href="mailto:synergiaconsult76@gmail.com" className="contacto-mail">synergiaconsult76@gmail.com</a>
          </div>
          <div className="contacto-form-wrap"><ContactForm /></div>
        </div>
      </section>
    </div>
  );
}

function DashboardCardLoader({ indicador, onVerDetalle }) {
  const { data, loading } = useCsvData(indicador.archivo);
  const val = lastValue(data, "valor");
  const formatted = !loading && val !== null && indicador.formato ? indicador.formato(val) : loading ? "…" : "—";
  const seccion = CONFIG.secciones.find((s) => s.id === indicador.seccion);
  const color = seccion?.color || "#1D9E75";
  const ultimoPeriodoRaw = data && data.length > 0 ? (data[data.length - 1].periodo || data[data.length - 1].año || CONFIG.actualizacion) : CONFIG.actualizacion;
  function formatPeriodo(valor) {
    if (!valor) return CONFIG.actualizacion;
    const str = String(valor);
    const match = str.match(/^(\d{4})-(\d{1,2})$/);
    if (match) { const m = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]; const mes = m[parseInt(match[2], 10) - 1]; return mes ? `${mes} ${match[1]}` : str; }
    return str;
  }
  const ultimoPeriodo = formatPeriodo(ultimoPeriodoRaw);
  const unidadResuelta = typeof indicador.unidad === "function" ? indicador.unidad(ultimoPeriodoRaw) : indicador.unidad;
  return (
    <button className="dash-card" style={{ "--dash-color": color }} onClick={() => onVerDetalle(indicador)} title={typeof indicador.descripcion === "function" ? indicador.descripcion(ultimoPeriodoRaw) : indicador.descripcion}>
      <div className="dash-card-top"><span className="dash-card-badge" style={{ background: color + "18", color }}>{seccion?.label}</span></div>
      <div className="dash-card-nombre">{indicador.nombre}</div>
      <div className={"dash-card-valor" + (loading ? " loading" : "")}>{formatted}</div>
      <div className="dash-card-periodo"><span className="dash-card-unidad">{unidadResuelta}</span><span className="dash-card-ref">{ultimoPeriodo}</span></div>
      <div className="dash-card-cta">Ver gráfico →</div>
    </button>
  );
}

function DetalleVariable({ indicador, onVolver }) {
  const seccion = CONFIG.secciones.find((s) => s.id === indicador.seccion);
  const color = seccion?.color || "#1D9E75";
  return (
    <div>
      <div className="monitor-header" style={{ background: "#111" }}>
        <div className="monitor-header-inner">
          <div><button className="detalle-volver" onClick={onVolver}>← Dashboard</button><h2 className="monitor-title" style={{ marginTop: "0.4rem" }}>{indicador.nombre}</h2></div>
          <div className="header-meta"><span className="header-updated" style={{ color }}>{seccion?.label}</span><span className="header-fuente">{CONFIG.fuente}</span></div>
        </div>
      </div>
      <div className="main-inner" style={{ paddingTop: "1.75rem" }}><Section seccionId={indicador.seccion} soloIndicador={indicador.id} /></div>
    </div>
  );
}

function GlosarioVariables() {
  const [abierta, setAbierta] = useState(null);
  return (
    <div className="glosario-section"><div className="main-inner">
      <div className="glosario-header"><h3 className="glosario-titulo">Glosario de variables</h3><p className="glosario-desc">Definición, unidad y periodicidad de cada indicador.</p></div>
      <div className="glosario-lista">
        {CONFIG.secciones.map((sec) => {
          const vars = CONFIG.indicadores.filter((i) => i.seccion === sec.id);
          return (
            <div key={sec.id} className="glosario-grupo">
              <div className="glosario-grupo-titulo" style={{ borderLeftColor: sec.color, color: sec.color }}>{sec.label}</div>
              {vars.map((v) => (
                <div key={v.id} className={"glosario-item" + (abierta === v.id ? " open" : "")} onClick={() => setAbierta(abierta === v.id ? null : v.id)}>
                  <div className="glosario-item-header">
                    <span className="glosario-item-nombre">{v.nombre}</span>
                    <span className="glosario-item-unidad">{typeof v.unidad === "function" ? v.unidad("") : v.unidad}</span>
                    <span className="glosario-item-toggle">{abierta === v.id ? "−" : "+"}</span>
                  </div>
                  {abierta === v.id && (
                    <div className="glosario-item-body">
                      <p className="glosario-item-desc">{v.descripcion || "Sin descripción disponible."}</p>
                      <p className="glosario-item-fuente"><span className="glosario-fuente-label">Periodicidad:</span> {v.periodo === "mes" ? "Mensual" : v.periodo === "trimestre" ? "Trimestral" : v.periodo === "año" ? "Anual" : v.periodo || "—"}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div></div>
  );
}

function Monitor({ seccionInicial, indicadorDetalleId, onVerDetalle, onVolverDashboard }) {
  if (indicadorDetalleId) {
    const indicador = CONFIG.indicadores.find((i) => i.id === indicadorDetalleId);
    if (indicador) return <DetalleVariable indicador={indicador} onVolver={onVolverDashboard} />;
  }
  return (
    <div>
      <div className="monitor-header"><div className="monitor-header-inner"><h2 className="monitor-title">Dashboard de variables <span className="accent">socioeconómicas</span></h2><div className="header-meta"><span className="header-fuente">{CONFIG.fuente}</span></div></div></div>
      <div className="main-inner" style={{ paddingTop: "1.75rem", paddingBottom: "1rem" }}><div className="dash-grid">{CONFIG.indicadores.map((ind) => (<DashboardCardLoader key={ind.id} indicador={ind} onVerDetalle={() => onVerDetalle(ind)} />))}</div></div>
      <GlosarioVariables />
    </div>
  );
}

function DatawrapperEmbed({ embed }) {
  const wrapRef = React.useRef(null);
  useEffect(() => {
    if (!wrapRef.current || !embed) return;
    const raw = embed.trim();
    const srcMatch = raw.match(/src=["']([^"']+)["']/);
    const src = srcMatch ? srcMatch[1] : (raw.startsWith("http") ? raw : null);
    if (!src) return;
    const idMatch = src.match(/dwcdn\.net\/([^/]+)/);
    const chartId = idMatch ? idMatch[1] : null;
    const iframe = document.createElement("iframe");
    iframe.src = src; iframe.setAttribute("frameborder", "0"); iframe.setAttribute("scrolling", "no"); iframe.setAttribute("title", "Datawrapper chart");
    if (chartId) iframe.setAttribute("id", `datawrapper-chart-${chartId}`);
    iframe.style.cssText = "width:100%;min-width:100%;border:none;display:block;";
    wrapRef.current.innerHTML = ""; wrapRef.current.appendChild(iframe);
    function onMessage(e) {
      if (!e.data || typeof e.data !== "object" || e.data.sentinel !== "amp") return;
      if (chartId && e.data.chartId && e.data.chartId !== chartId) return;
      if (e.data.type === "datawrapper-height" && e.data.value) iframe.style.height = e.data.value + "px";
    }
    window.addEventListener("message", onMessage);
    if (!document.getElementById("datawrapper-embed-script")) {
      const script = document.createElement("script"); script.id = "datawrapper-embed-script";
      script.src = "https://datawrapper.dwcdn.net/lib/embed.min.js"; script.async = true; document.body.appendChild(script);
    }
    return () => window.removeEventListener("message", onMessage);
  }, [embed]); // eslint-disable-line
  if (!embed) return null;
  return <div ref={wrapRef} className="datawrapper-embed-wrap" style={{ width: "100%", margin: "1.5rem 0", overflow: "hidden" }} />;
}

function normalizarBloques(item) {
  if (item.bloques && Array.isArray(item.bloques) && item.bloques.length > 0) return item.bloques;
  const bloques = [];
  if (item.texto) bloques.push({ tipo: "texto", contenido: item.texto });
  if (item.embed) bloques.push({ tipo: "embed", contenido: item.embed });
  return bloques;
}

function Articulo({ item, onVolver }) {
  const [igMsg, setIgMsg] = useState("");
  if (!item) return null;
  const bloques = normalizarBloques(item);

  function descargarPDFgenerado() {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth(); const pageH = doc.internal.pageSize.getHeight();
    const margin = 20; const maxW = pageW - margin * 2; let y = margin;
    doc.setFillColor(230, 50, 46); doc.rect(0, 0, pageW, 10, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(255, 255, 255);
    doc.text("Synergia Consultores", margin, 6.5); y = 22;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(150, 150, 150);
    doc.text(formatFecha(item.fecha), margin, y); y += 8;
    doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.setTextColor(17, 17, 17);
    const tl = doc.splitTextToSize(item.titulo, maxW); doc.text(tl, margin, y); y += tl.length * 9 + 4;
    if (item.bajada) {
      doc.setFont("helvetica", "normal"); doc.setFontSize(12); doc.setTextColor(80, 80, 80);
      const bl = doc.splitTextToSize(item.bajada, maxW); doc.text(bl, margin, y); y += bl.length * 6 + 4;
    }
    doc.setDrawColor(230, 50, 46); doc.setLineWidth(0.8); doc.line(margin, y, margin + 20, y); y += 8;
    bloques.forEach((bloque) => {
      if (bloque.tipo === "texto") {
        doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(34, 34, 34);
        (bloque.contenido || "").split("\n\n").filter(Boolean).forEach((p) => {
          doc.splitTextToSize(p, maxW).forEach((line) => { if (y > pageH - margin) { doc.addPage(); y = margin; } doc.text(line, margin, y); y += 6; }); y += 4;
        });
      } else if (bloque.tipo === "embed") {
        if (y > pageH - 30) { doc.addPage(); y = margin; }
        y += 4; doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.3); doc.rect(margin, y, maxW, 18, "S");
        doc.setFont("helvetica", "italic"); doc.setFontSize(9); doc.setTextColor(120, 120, 120);
        doc.text("Visualización interactiva disponible en la versión web.", margin + 4, y + 7);
        const sm = bloque.contenido.match(/src=["']([^"']+)["']/);
        if (sm) { doc.setFont("helvetica", "normal"); doc.setTextColor(21, 96, 122); doc.text(sm[1], margin + 4, y + 13); }
        y += 24;
      }
    });
    const total = doc.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i); doc.setFillColor(245, 245, 245); doc.rect(0, pageH - 10, pageW, 10, "F");
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(150, 150, 150);
      doc.text("synergiaconsult76@gmail.com", margin, pageH - 4);
      doc.text(`${i} / ${total}`, pageW - margin, pageH - 4, { align: "right" });
    }
    doc.save(`${item.titulo.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/ +/g, "-").slice(0, 50)}.pdf`);
  }

  function handleIG() {
    generarTarjetaInstagram(item); copiarCaptionInstagram(item);
    setIgMsg("Tarjeta descargada · Caption copiado al portapapeles");
    setTimeout(() => setIgMsg(""), 4500);
  }

  return (
    <div className="articulo-page">
      <button className="articulo-volver" onClick={onVolver}>← Volver a Informes</button>
      {(item.imagen_articulo || item.imagen) && (<div className="articulo-portada"><img src={item.imagen_articulo || item.imagen} alt={item.titulo} /></div>)}
      <div className="articulo-inner">
        <div className="articulo-meta">
          <span className="articulo-fecha">{formatFecha(item.fecha)}</span>
          <span className="articulo-lectura">{tiempoLectura(item.texto)}</span>
          {item.pdf_url
            ? <a className="articulo-pdf-btn" href={item.pdf_url} target="_blank" rel="noopener noreferrer">↓ Descargar PDF</a>
            : <button className="articulo-pdf-btn" onClick={descargarPDFgenerado}>↓ Descargar PDF</button>
          }
          <button className="articulo-ig-btn" onClick={handleIG} title="Generar tarjeta para Instagram">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline",verticalAlign:"middle",marginRight:"4px"}}><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
            Tarjeta IG
          </button>
        </div>
        {igMsg && <div className="articulo-ig-msg">{igMsg}</div>}
        <h1 className="articulo-titulo">{item.titulo}</h1>
        {item.bajada && <p className="articulo-bajada">{item.bajada}</p>}
        <div className="articulo-separador" />
        <div className="articulo-bloques">
          {bloques.map((bloque, i) => {
            if (bloque.tipo === "texto") return (<div key={i} className="articulo-cuerpo">{bloque.contenido.split("\n\n").filter(Boolean).map((p, j) => (<p key={j}>{p}</p>))}</div>);
            if (bloque.tipo === "embed") return (<div key={i} className="articulo-viz"><DatawrapperEmbed embed={bloque.contenido} /></div>);
            return null;
          })}
        </div>
        {item.link && (<div className="articulo-link-wrap"><a href={item.link} target="_blank" rel="noopener noreferrer" className="articulo-link">{item.linkLabel || "Ver más →"}</a></div>)}
      </div>
    </div>
  );
}

const PASSWORD = "synergia2026";

function Admin({ items, setItems, onSalir }) {
  const [autenticado, setAutenticado] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [errorPass, setErrorPass] = useState(false);
  const [vista, setVista] = useState("lista");
  const [form, setForm] = useState(formVacio());
  const [pdfSubiendo, setPdfSubiendo] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [igMsg, setIgMsg] = useState("");

  function formVacio() {
    return { id: null, titulo: "", bajada: "", fecha: new Date().toISOString().slice(0, 10), categoria: "", bloques: [{ tipo: "texto", contenido: "" }], imagen: "", imagen_articulo: "", pdf_url: "", link: "", linkLabel: "", texto: "", embed: "" };
  }

  function login() { if (adminPass === PASSWORD) { setAutenticado(true); setErrorPass(false); } else { setErrorPass(true); } }
  function nuevoItem() { setForm(formVacio()); setPdfError(""); setVista("form"); }
  function editarItem(item) {
    const bloques = normalizarBloques(item);
    setForm({ ...item, pdf_url: item.pdf_url || "", bloques: bloques.length > 0 ? bloques : [{ tipo: "texto", contenido: "" }] });
    setPdfError(""); setVista("form");
  }

  async function manejarSubidaPdf(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { setPdfError("El archivo debe ser un PDF."); return; }
    if (file.size > 20 * 1024 * 1024) { setPdfError("El PDF no debe superar los 20 MB."); return; }
    setPdfSubiendo(true); setPdfError("");
    try { const url = await subirPdf(file); setForm((f) => ({ ...f, pdf_url: url })); }
    catch (err) { setPdfError("Error al subir el PDF. Verificá que el bucket 'informes-pdf' exista y sea público en Supabase Storage. Detalle: " + err.message); }
    finally { setPdfSubiendo(false); }
  }

  async function guardar() {
    if (!form.titulo.trim()) return;
    const esNuevo = !form.id;
    const item = esNuevo ? { ...form, id: Date.now(), _isNew: true } : { ...form };
    item.texto = ""; item.embed = "";
    try { await guardarContenido(item); const nuevos = await cargarContenidos(); setItems(nuevos); setVista("lista"); }
    catch { alert("No se pudo guardar el informe."); }
  }

  async function eliminar(id) {
    if (window.confirm("¿Eliminar esta publicación?")) { await eliminarContenido(id); const nuevos = await cargarContenidos(); setItems(nuevos); }
  }

  function agregarBloque(tipo) { setForm((f) => ({ ...f, bloques: [...f.bloques, { tipo, contenido: "" }] })); }
  function actualizarBloque(idx, contenido) { setForm((f) => ({ ...f, bloques: f.bloques.map((b, i) => i === idx ? { ...b, contenido } : b) })); }
  function eliminarBloque(idx) { setForm((f) => ({ ...f, bloques: f.bloques.filter((_, i) => i !== idx) })); }
  function moverBloque(idx, dir) {
    setForm((f) => { const bl = [...f.bloques]; const d = idx + dir; if (d < 0 || d >= bl.length) return f; [bl[idx], bl[d]] = [bl[d], bl[idx]]; return { ...f, bloques: bl }; });
  }

  function handleIG(item) {
    generarTarjetaInstagram(item); copiarCaptionInstagram(item);
    setIgMsg(item.id); setTimeout(() => setIgMsg(""), 4000);
  }

  if (!autenticado) {
    return (
      <div className="admin-page"><div className="admin-login-box">
        <h2 className="admin-login-title">Acceso administrador</h2>
        <input type="password" placeholder="Contraseña" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} className="admin-input" autoFocus />
        <button className="btn-primary" onClick={login}>Ingresar</button>
        {errorPass && <p className="admin-error">Contraseña incorrecta</p>}
        <button className="admin-link-volver" onClick={onSalir}>← Volver al sitio</button>
      </div></div>
    );
  }

  if (vista === "form") {
    return (
      <div className="admin-page"><div className="admin-form-page">
        <div className="admin-form-header">
          <h2 className="admin-form-title">{form.id ? "Editar informe" : "Nuevo informe"}</h2>
          <button className="btn-secondary" onClick={() => setVista("lista")}>Cancelar</button>
        </div>
        <div className="admin-form">
          <label className="admin-label">Título *</label>
          <input className="admin-input" placeholder="Título del informe" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />

          <label className="admin-label">Bajada / subtítulo</label>
          <textarea className="admin-textarea" placeholder="Descripción breve" value={form.bajada} onChange={(e) => setForm({ ...form, bajada: e.target.value })} style={{ minHeight: "70px" }} />

          <label className="admin-label">Fecha</label>
          <input className="admin-input" type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />

          <label className="admin-label">Categoría</label>
          <select className="admin-input" value={form.categoria || ""} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
            <option value="">— Sin categoría —</option>
            <option value="Informe mensual">Informe mensual</option>
            <option value="Análisis especial">Análisis especial</option>
            <option value="Inflación">Inflación</option>
            <option value="Empleo">Empleo</option>
            <option value="Minería">Minería</option>
            <option value="Fiscal">Fiscal</option>
            <option value="Comercio">Comercio</option>
          </select>

          {/* ── PDF ── */}
          <label className="admin-label" style={{ marginTop: "1.5rem" }}>PDF del informe</label>
          <p className="admin-hint">Subí un PDF (máx. 20 MB) o pegá una URL externa. Requiere bucket <code>informes-pdf</code> público en Supabase Storage.</p>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <label className="btn-secondary" style={{ cursor: "pointer", margin: 0 }}>
              {pdfSubiendo ? "Subiendo…" : "↑ Subir PDF"}
              <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={manejarSubidaPdf} disabled={pdfSubiendo} />
            </label>
            {form.pdf_url && (<a href={form.pdf_url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ margin: 0, fontSize: "12px" }}>Ver PDF actual ↗</a>)}
            {form.pdf_url && (<button className="btn-secondary" style={{ margin: 0, color: "#c00" }} onClick={() => setForm((f) => ({ ...f, pdf_url: "" }))}>Quitar PDF</button>)}
          </div>
          <input className="admin-input" placeholder="O pegá URL de PDF externo (https://...)" value={form.pdf_url} onChange={(e) => setForm({ ...form, pdf_url: e.target.value })} style={{ marginTop: "8px" }} />
          {pdfError && <p className="admin-error" style={{ marginTop: "6px" }}>{pdfError}</p>}

          {/* ── BLOQUES ── */}
          <label className="admin-label" style={{ marginTop: "1.5rem" }}>Contenido del informe</label>
          <p className="admin-hint">Bloques de texto y gráficos Datawrapper en el orden que quieras.</p>
          <div className="admin-bloques">
            {form.bloques.map((bloque, idx) => (
              <div key={idx} className="admin-bloque">
                <div className="admin-bloque-header">
                  <span className="admin-bloque-tipo">{bloque.tipo === "texto" ? "📝 Bloque de texto" : "📊 Gráfico Datawrapper"}</span>
                  <div className="admin-bloque-acciones">
                    <button className="admin-bloque-btn" onClick={() => moverBloque(idx, -1)} disabled={idx === 0}>↑</button>
                    <button className="admin-bloque-btn" onClick={() => moverBloque(idx, 1)} disabled={idx === form.bloques.length - 1}>↓</button>
                    <button className="admin-bloque-btn admin-bloque-btn-del" onClick={() => eliminarBloque(idx)}>✕</button>
                  </div>
                </div>
                {bloque.tipo === "texto"
                  ? <textarea className="admin-textarea" placeholder="Texto aquí. Párrafos separados por línea en blanco." value={bloque.contenido} onChange={(e) => actualizarBloque(idx, e.target.value)} style={{ minHeight: "160px" }} />
                  : <textarea className="admin-textarea" placeholder='Pegá el iframe de Datawrapper. Ej: <iframe src="https://datawrapper.dwcdn.net/...' value={bloque.contenido} onChange={(e) => actualizarBloque(idx, e.target.value)} style={{ minHeight: "90px", fontFamily: "monospace", fontSize: "12px" }} />
                }
              </div>
            ))}
          </div>
          <div className="admin-bloques-agregar">
            <span className="admin-hint" style={{ marginBottom: 0, alignSelf: "center" }}>Agregar bloque:</span>
            <button className="btn-secondary" onClick={() => agregarBloque("texto")}>+ Texto</button>
            <button className="btn-secondary" onClick={() => agregarBloque("embed")}>+ Gráfico Datawrapper</button>
          </div>

          <label className="admin-label" style={{ marginTop: "1.5rem" }}>URL imagen de portada</label>
          <p className="admin-hint">Aparece en el listado de informes.</p>
          <input className="admin-input" placeholder="https://..." value={form.imagen} onChange={(e) => setForm({ ...form, imagen: e.target.value })} />

          <label className="admin-label">URL imagen de cabecera del artículo</label>
          <input className="admin-input" placeholder="https://... (opcional)" value={form.imagen_articulo || ""} onChange={(e) => setForm({ ...form, imagen_articulo: e.target.value })} />

          <label className="admin-label">Link externo (opcional)</label>
          <input className="admin-input" placeholder="https://..." value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          <input className="admin-input" placeholder="Texto del link" value={form.linkLabel} onChange={(e) => setForm({ ...form, linkLabel: e.target.value })} />

          <div className="admin-form-btns">
            <button className="btn-primary" onClick={guardar}>Guardar informe</button>
            <button className="btn-secondary" onClick={() => setVista("lista")}>Cancelar</button>
          </div>
        </div>
      </div></div>
    );
  }

  return (
    <div className="admin-page"><div className="admin-lista-page">
      <div className="admin-lista-header">
        <div><h2 className="admin-lista-title">Informes</h2><p className="admin-lista-sub">{items.length} publicación{items.length !== 1 ? "es" : ""}</p></div>
        <div className="admin-lista-actions">
          <button className="btn-primary" onClick={nuevoItem}>+ Nuevo informe</button>
          <button className="btn-secondary" onClick={onSalir}>← Salir</button>
        </div>
      </div>
      {items.length === 0 && <p className="informes-empty">No hay publicaciones aún.</p>}
      <div className="admin-posts-list">
        {items.map((item) => (
          <div className="admin-post-row" key={item.id}>
            {item.imagen ? <img src={item.imagen} alt="" className="admin-post-thumb" /> : <div className="admin-post-thumb-placeholder" />}
            <div className="admin-post-info">
              <span className="admin-post-titulo">{item.titulo}</span>
              <span className="admin-post-meta">
                {formatFecha(item.fecha)}
                {item.pdf_url && <span style={{ marginLeft: "8px", color: "#b51a17", fontSize: "11px", fontWeight: 600 }}>PDF ✓</span>}
              </span>
              {item.bajada && <span className="admin-post-bajada">{item.bajada}</span>}
            </div>
            <div className="admin-post-btns">
              <button className="btn-edit" style={{ background: igMsg === item.id ? "#0c3d52" : undefined, color: igMsg === item.id ? "#fff" : undefined, minWidth: "40px" }} onClick={() => handleIG(item)} title="Generar tarjeta Instagram">
                {igMsg === item.id ? "✓" : "IG"}
              </button>
              <button className="btn-edit" onClick={() => editarItem(item)}>Editar</button>
              <button className="btn-delete" onClick={() => eliminar(item.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div></div>
  );
}

export default function App() {
  const [pagina, setPagina] = useState(() => {
    const path = window.location.pathname;
    if (path === "/admin") return "admin";
    if (path.startsWith("/monitor/")) return "monitor";
    if (path === "/monitor") return "monitor";
    if (path.startsWith("/informes/") || path.startsWith("/contenidos/")) return "articulo";
    if (path === "/informes" || path === "/contenidos") return "informes";
    if (path === "/bcra") return "bcra";
    return "inicio";
  });
  const [seccionMonitor, setSeccionMonitor] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [articuloId, setArticuloId] = useState(() => {
    const m1 = window.location.pathname.match(/^\/informes\/(.+)$/);
    const m2 = window.location.pathname.match(/^\/contenidos\/(.+)$/);
    return m1 ? Number(m1[1]) : m2 ? Number(m2[1]) : null;
  });
  const [indicadorDetalleId, setIndicadorDetalleId] = useState(() => {
    const match = window.location.pathname.match(/^\/monitor\/(.+)$/);
    return match ? match[1] : null;
  });
  const [items, setItems] = useState([]);

  useEffect(() => { cargarContenidos().then(setItems); }, []);
  useEffect(() => { if (window.location.pathname === "/admin") setPagina("admin"); }, []);

  useEffect(() => {
    function handlePopState() {
      const path = window.location.pathname;
      if (path === "/admin") { setPagina("admin"); return; }
      if (path.startsWith("/monitor/")) { const m = path.match(/^\/monitor\/(.+)$/); setIndicadorDetalleId(m ? m[1] : null); setPagina("monitor"); setArticuloId(null); return; }
      if (path === "/monitor") { setPagina("monitor"); setIndicadorDetalleId(null); setArticuloId(null); return; }
      if (path.startsWith("/informes/") || path.startsWith("/contenidos/")) {
        const m = path.match(/^\/(informes|contenidos)\/(.+)$/);
        if (m) { setArticuloId(Number(m[2])); setPagina("articulo"); } return;
      }
      if (path === "/informes" || path === "/contenidos") { setPagina("informes"); setArticuloId(null); return; }
      if (path === "/bcra") { setPagina("bcra"); setArticuloId(null); return; }
      setPagina("inicio"); setArticuloId(null); setIndicadorDetalleId(null);
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []); // eslint-disable-line

  const ultimaActualizacion = useUltimaActualizacion(items);

  function navegarA(pag, seccion) {
    setPagina(pag); if (seccion) setSeccionMonitor(seccion);
    setMenuAbierto(false); setArticuloId(null); setIndicadorDetalleId(null);
    window.history.pushState({}, "", pag === "inicio" ? "/" : "/" + pag);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function verArticulo(id) { setArticuloId(id); setPagina("articulo"); window.history.pushState({}, "", `/informes/${id}`); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function volverDeArticulo() { setArticuloId(null); setPagina("informes"); window.history.pushState({}, "", "/informes"); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function verDetalleIndicador(indicador) { setIndicadorDetalleId(indicador.id); setPagina("monitor"); window.history.pushState({}, "", `/monitor/${indicador.id}`); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function volverDashboard() { setIndicadorDetalleId(null); setPagina("monitor"); window.history.pushState({}, "", "/monitor"); window.scrollTo({ top: 0, behavior: "smooth" }); }

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
              <button className={"nav-pill" + (pagina === "inicio" ? " nav-pill-active" : " nav-pill-inactive")} onClick={() => navegarA("inicio")}>Inicio</button>
              <button className={"nav-pill" + (pagina === "monitor" ? " nav-pill-active" : " nav-pill-inactive")} onClick={() => navegarA("monitor")}>Monitor</button>
              <button className={"nav-pill" + (["informes","articulo"].includes(pagina) ? " nav-pill-active" : " nav-pill-inactive")} onClick={() => navegarA("informes")}>Informes</button>
              <button className={"nav-pill" + (pagina === "bcra" ? " nav-pill-active" : " nav-pill-inactive")} onClick={() => navegarA("bcra")}>Estadísticas BCRA</button>
            </nav>
            <button className="hamburger" onClick={() => setMenuAbierto(!menuAbierto)} aria-label="Menu"><span /><span /><span /></button>
          </div>
        </header>
      )}
      <main className="main">
        {pagina === "inicio"   && <Inicio onNavigate={navegarA} ultimaActualizacion={ultimaActualizacion} />}
        {pagina === "monitor"  && <Monitor seccionInicial={seccionMonitor} indicadorDetalleId={indicadorDetalleId} onVerDetalle={verDetalleIndicador} onVolverDashboard={volverDashboard} />}
        {pagina === "informes" && <TimelineContenidos items={items} onVerArticulo={verArticulo} />}
        {pagina === "articulo" && <Articulo item={articuloActual} onVolver={volverDeArticulo} />}
        {pagina === "bcra"     && <BcraEstadisticas />}
        {pagina === "admin"    && <Admin items={items} setItems={setItems} onSalir={() => { window.history.replaceState({}, "", "/"); navegarA("inicio"); }} />}
      </main>
      {!esAdmin && (
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-brand"><img src="/logo.png" alt="Synergia Consultores" className="footer-logo" /></div>
            <a href="mailto:synergiaconsult76@gmail.com" className="footer-mail">synergiaconsult76@gmail.com</a>
            <a href="https://www.instagram.com/synergiacatamarca" target="_blank" rel="noopener noreferrer" className="footer-instagram" aria-label="Instagram de Synergia Catamarca">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
              <span>@synergiacatamarca</span>
            </a>
            <div className="footer-copy">© {new Date().getFullYear()} Synergia Consultores</div>
          </div>
        </footer>
      )}
    </div>
  );
}
