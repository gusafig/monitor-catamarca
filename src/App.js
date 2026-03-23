import React, { useState, useEffect } from "react";
import { Section } from "./components/Section";
import { CONFIG } from "./data/config";
import "./styles.css";

function Inicio({ onNavigate }) {
  return (
    <div className="inicio-page">
      <div className="inicio-hero">
        <div className="inicio-hero-inner">
          <p className="inicio-eyebrow">Monitor de Indicadores Provinciales</p>
          <h1 className="inicio-headline">
            Catamarca<br />
            <span className="inicio-headline-accent">en datos.</span>
          </h1>
          <p className="inicio-desc">
            Seguimiento sistemático de indicadores económicos, mineros y sociales
            de la provincia de Catamarca. Información actualizada para la toma
            de decisiones.
          </p>
          <button className="inicio-cta" onClick={() => onNavigate("monitor")}>
            Explorar indicadores →
          </button>
        </div>
        <div className="inicio-stats">
          <div className="inicio-stat">
            <span className="inicio-stat-num">3</span>
            <span className="inicio-stat-label">Secciones temáticas</span>
          </div>
          <div className="inicio-stat-divider" />
          <div className="inicio-stat">
            <span className="inicio-stat-num">{CONFIG.indicadores.length}</span>
            <span className="inicio-stat-label">Indicadores activos</span>
          </div>
          <div className="inicio-stat-divider" />
          <div className="inicio-stat">
            <span className="inicio-stat-num">{CONFIG.actualizacion}</span>
            <span className="inicio-stat-label">Última actualización</span>
          </div>
        </div>
      </div>
      <div className="inicio-cards">
        {CONFIG.secciones.map((s) => {
          const indicadoresSec = CONFIG.indicadores.filter((i) => i.seccion === s.id);
          return (
            <button
              key={s.id}
              className="inicio-card"
              onClick={() => onNavigate("monitor", s.id)}
              style={{ "--card-color": s.color }}
            >
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

const CONTENIDOS_INICIALES = [
  {
    id: 1,
    titulo: "Informe de ejemplo",
    fecha: "2026-03-01",
    texto: "Este es un informe de ejemplo. Podés editarlo o eliminarlo desde el panel de administración.",
    imagen: "",
    link: "",
    linkLabel: "",
    embed: "",
  },
];

function Contenidos() {
  const [items, setItems] = useState(CONTENIDOS_INICIALES);
  const [adminAbierto, setAdminAbierto] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [errorPass, setErrorPass] = useState(false);
  const [form, setForm] = useState({ id: null, titulo: "", fecha: "", texto: "", imagen: "", link: "", linkLabel: "", embed: "" });
  const [editando, setEditando] = useState(false);
  const PASSWORD = "synergia2026";

  function login() {
    if (adminPass === PASSWORD) { setAutenticado(true); setErrorPass(false); }
    else { setErrorPass(true); }
  }
  function nuevoItem() {
    setForm({ id: null, titulo: "", fecha: new Date().toISOString().slice(0, 10), texto: "", imagen: "", link: "", linkLabel: "", embed: "" });
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
              <input className="admin-input" placeholder="Texto del link" value={form.linkLabel} onChange={(e) => setForm({ ...form, linkLabel: e.target.value })} />
              <textarea className="admin-textarea" placeholder="Código embed de Datawrapper (opcional)" value={form.embed} onChange={(e) => setForm({ ...form, embed: e.target.value })} style={{minHeight: "80px", fontFamily: "monospace", fontSize: "11px"}} />
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
            <div className="informe-viz">
              {item.embed
                ? <div dangerouslySetInnerHTML={{ __html: item.embed }} />
                : <div className="informe-viz-empty">Sin visualización</div>
              }
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

function Monitor({ seccionInicial }) {
  const [seccionActiva, setSeccionActiva] = useState(seccionInicial || CONFIG.secciones[0].id);
  useEffect(() => {
    if (seccionInicial) setSeccionActiva(seccionInicial);
  }, [seccionInicial]);

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
  const [pagina, setPagina] = useState("inicio");
  const [seccionMonitor, setSeccionMonitor] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);

  function navegarA(pag, seccion) {
    setPagina(pag);
    if (seccion) setSeccionMonitor(seccion);
    setMenuAbierto(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-brand" onClick={() => navegarA("inicio")} style={{ cursor: "pointer" }}>
            <img src="/logo.png" alt="Synergia Consultores" className="header-logo" />
          </div>
          <nav className={"main-nav" + (menuAbierto ? " open" : "")}>
            <button className={"nav-btn " + (pagina === "inicio" ? "active" : "")} onClick={() => navegarA("inicio")}>Inicio</button>
            <button className={"nav-btn " + (pagina === "monitor" ? "active" : "")} onClick={() => navegarA("monitor")}>Monitor</button>
            <button className={"nav-btn " + (pagina === "contenidos" ? "active" : "")} onClick={() => navegarA("contenidos")}>Contenidos</button>
          </nav>
          <button className="hamburger" onClick={() => setMenuAbierto(!menuAbierto)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </header>

      <main className="main">
        {pagina === "inicio"     && <Inicio onNavigate={navegarA} />}
        {pagina === "monitor"    && <Monitor seccionInicial={seccionMonitor} />}
        {pagina === "contenidos" && <div className="main-inner"><Contenidos /></div>}
      </main>

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
    </div>
  );
}

