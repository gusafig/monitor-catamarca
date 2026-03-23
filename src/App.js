import React, { useState } from "react";
import { Section } from "./components/Section";
import { CONFIG } from "./data/config";
import "./styles.css";

const CONTENIDOS_INICIALES = [
  {
    id: 1,
    titulo: "Informe de ejemplo",
    fecha: "2026-03-01",
    texto: "Este es un informe de ejemplo. Podés editarlo o eliminarlo desde el panel de administración.",
    imagen: "",
    link: "",
    linkLabel: "",
  },
];

function Contenidos() {
  const [items, setItems] = useState(CONTENIDOS_INICIALES);
  const [adminAbierto, setAdminAbierto] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [errorPass, setErrorPass] = useState(false);
  const [form, setForm] = useState({ id: null, titulo: "", fecha: "", texto: "", imagen: "", link: "", linkLabel: "" });
  const [editando, setEditando] = useState(false);

  const PASSWORD = "synergia2026";

  function login() {
    if (adminPass === PASSWORD) { setAutenticado(true); setErrorPass(false); }
    else { setErrorPass(true); }
  }

  function nuevoItem() {
    setForm({ id: null, titulo: "", fecha: new Date().toISOString().slice(0, 10), texto: "", imagen: "", link: "", linkLabel: "" });
    setEditando(true);
  }

  function editarItem(item) { setForm({ ...item }); setEditando(true); }

  function guardar() {
    if (!form.titulo.trim()) return;
    if (form.id) { setItems(items.map((i) => (i.id === form.id ? { ...form } : i))); }
    else { setItems([{ ...form, id: Date.now() }, ...items]); }
    setEditando(false);
  }

  function eliminar(id) {
    if (window.confirm("¿Eliminar este informe?")) setItems(items.filter((i) => i.id !== id));
  }

  return (
    <div className="contenidos-page">
      <div className="contenidos-header">
        <h2 className="contenidos-titulo">Contenidos</h2>
        <button className="btn-admin" onClick={() => setAdminAbierto(!adminAbierto)}>
          {adminAbierto ? "Cerrar panel" : "⚙ Administrar"}
        </button>
      </div>

      {adminAbierto && (
        <div className="admin-panel">
          {!autenticado ? (
            <div className="admin-login">
              <p className="admin-login-label">Contraseña de acceso</p>
              <div className="admin-login-row">
                <input type="password" placeholder="Contraseña" value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && login()} className="admin-input" />
                <button className="btn-primary" onClick={login}>Ingresar</button>
              </div>
              {errorPass && <p className="admin-error">Contraseña incorrecta</p>}
            </div>
          ) : editando ? (
            <div className="admin-form">
              <p className="admin-form-title">{form.id ? "Editar informe" : "Nuevo informe"}</p>
              <input className="admin-input" placeholder="Título *" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
              <input className="admin-input" type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
              <textarea className="admin-textarea" placeholder="Texto del informe" value={form.texto} onChange={(e) => setForm({ ...form, texto: e.target.value })} />
              <input className="admin-input" placeholder="URL de imagen (opcional)" value={form.imagen} onChange={(e) => setForm({ ...form, imagen: e.target.value })} />
              <input className="admin-input" placeholder="URL de link (opcional)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
              <input className="admin-input" placeholder="Texto del link (ej: Ver informe completo)" value={form.linkLabel} onChange={(e) => setForm({ ...form, linkLabel: e.target.value })} />
              <div className="admin-form-btns">
                <button className="btn-primary" onClick={guardar}>Guardar</button>
                <button className="btn-secondary" onClick={() => setEditando(false)}>Cancelar</button>
              </div>
            </div>
          ) : (
            <div className="admin-actions">
              <p className="admin-logged">✓ Sesión iniciada</p>
              <button className="btn-primary" onClick={nuevoItem}>+ Nuevo informe</button>
            </div>
          )}
        </div>
      )}

      <div className="informes-grid">
        {items.length === 0 && <p className="informes-empty">No hay informes cargados aún.</p>}
        {items.map((item) => (
          <div className="informe-card" key={item.id}>
            {item.imagen && (
              <div className="informe-img-wrap">
                <img src={item.imagen} alt={item.titulo} className="informe-img" />
              </div>
            )}
            <div className="informe-body">
              <span className="informe-fecha">
                {item.fecha ? new Date(item.fecha + "T12:00:00").toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" }) : ""}
              </span>
              <h3 className="informe-titulo">{item.titulo}</h3>
              {item.texto && <p className="informe-texto">{item.texto}</p>}
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="informe-link">
                  {item.linkLabel || "Ver más →"}
                </a>
              )}
            </div>
            {autenticado && adminAbierto && (
              <div className="informe-admin-btns">
                <button className="btn-edit" onClick={() => editarItem(item)}>Editar</button>
                <button className="btn-delete" onClick={() => eliminar(item.id)}>Eliminar</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Contacto() {
  return (
    <div className="contacto-page">
      <h2 className="contacto-titulo">Contacto</h2>
      <div className="contacto-card">
        <p className="contacto-texto">Para consultas, propuestas o más información, escribinos a:</p>
        <a href="mailto:synergiaconsult76@gmail.com" className="contacto-mail">
          synergiaconsult76@gmail.com
        </a>
      </div>
    </div>
  );
}

function Monitor() {
  const [seccionActiva, setSeccionActiva] = useState(CONFIG.secciones[0].id);
  return (
    <div>
      <div className="monitor-header">
        <div className="monitor-header-inner">
          <div>
            <span className="header-eyebrow">Monitor de indicadores</span>
            <h2 className="monitor-title">
              {CONFIG.titulo.split(" en ")[0]}{" "}
              <span className="accent">en {CONFIG.titulo.split(" en ")[1]}</span>
            </h2>
          </div>
          <div className="header-meta">
            <span className="header-updated">Actualizado: {CONFIG.actualizacion}</span>
            <span className="header-fuente">{CONFIG.fuente}</span>
          </div>
        </div>
      </div>
      <nav className="tabs">
        <div className="tabs-inner">
          {CONFIG.secciones.map((s) => (
            <button key={s.id}
              className={"tab-btn " + (seccionActiva === s.id ? "active" : "")}
              style={seccionActiva === s.id ? { "--tab-color": s.color } : {}}
              onClick={() => setSeccionActiva(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      </nav>
      <div className="main-inner" style={{ paddingTop: "1.5rem" }}>
        <Section seccionId={seccionActiva} />
      </div>
    </div>
  );
}

export default function App() {
  const [pagina, setPagina] = useState("monitor");

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-brand" onClick={() => setPagina("monitor")} style={{ cursor: "pointer" }}>
            <span className="site-name">Synergia Consultores</span>
          </div>
          <nav className="main-nav">
            <button className={"nav-btn " + (pagina === "monitor" ? "active" : "")} onClick={() => setPagina("monitor")}>Monitor</button>
            <button className={"nav-btn " + (pagina === "contenidos" ? "active" : "")} onClick={() => setPagina("contenidos")}>Contenidos</button>
            <button className={"nav-btn " + (pagina === "contacto" ? "active" : "")} onClick={() => setPagina("contacto")}>Contacto</button>
          </nav>
        </div>
      </header>

      <main className="main">
        {pagina === "monitor" && <Monitor />}
        {pagina === "contenidos" && <div className="main-inner"><Contenidos /></div>}
        {pagina === "contacto" && <div className="main-inner"><Contacto /></div>}
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <span>synergiaconsult76@gmail.com</span>
          <div className="footer-logo-wrap">
            <img src="/logo.png" alt="Synergia Consultores" className="footer-logo" />
          </div>
        </div>
      </footer>
    </div>
  );
}
