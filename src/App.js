import React, { useState, useEffect } from "react";
import { Section } from "./components/Section";
import { CONFIG } from "./data/config";
import "./styles.css";

// ── DATOS INICIALES ──────────────────────────────────────────────
const STORAGE_KEY = "synergia_contenidos";

const CONTENIDOS_INICIALES = [
  {
    id: 1,
    titulo: "Exportaciones provinciales 2025",
    bajada: "Un análisis de la evolución de las exportaciones de Catamarca durante el último año, con foco en el sector minero y agroindustrial.",
    fecha: "2026-03-01",
    texto: "Las exportaciones de la provincia de Catamarca mostraron un comportamiento destacado durante 2025, impulsadas principalmente por el sector minero. La producción de litio y cobre continuó siendo el motor principal de las ventas externas, representando más del 80% del total exportado.\n\nEn términos de destinos, Asia concentró la mayor parte de las exportaciones mineras, mientras que los mercados de América del Norte y Europa absorbieron la producción agroindustrial.\n\nEl contexto macroeconómico nacional, con un tipo de cambio más estable en el segundo semestre, favoreció la planificación de largo plazo en los proyectos de inversión.",
    imagen: "",
    link: "",
    linkLabel: "",
    embed: "",
  },
];

function cargarContenidos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : CONTENIDOS_INICIALES;
  } catch { return CONTENIDOS_INICIALES; }
}

function guardarContenidos(items) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
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

// ── INICIO ───────────────────────────────────────────────────────
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

// ── MONITOR ──────────────────────────────────────────────────────
function Monitor({ seccionInicial }) {
  const [seccionActiva, setSeccionActiva] = useState(seccionInicial || CONFIG.secciones[0].id);
  useEffect(() => { if (seccionInicial) setSeccionActiva(seccionInicial); }, [seccionInicial]);

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

// ── LISTADO DE CONTENIDOS ────────────────────────────────────────
function Contenidos({ items, onVerArticulo }) {
  return (
    <div className="contenidos-page">
      <div className="contenidos-header">
        <h2 className="contenidos-titulo">Contenidos</h2>
      </div>

      {items.length === 0 && (
        <p className="informes-empty">No hay publicaciones aún.</p>
      )}

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
  );
}

// ── VISTA DE ARTÍCULO ────────────────────────────────────────────
function Articulo({ item, onVolver }) {
  if (!item) return null;

  const parrafos = (item.texto || "").split("\n\n").filter(Boolean);

  return (
    <div className="articulo-page">
      <button className="articulo-volver" onClick={onVolver}>← Volver</button>

      {item.imagen && (
        <div className="articulo-portada">
          <img src={item.imagen} alt={item.titulo} />
        </div>
      )}

      <div className="articulo-inner">
        <div className="articulo-meta">
          <span className="articulo-fecha">{formatFecha(item.fecha)}</span>
          <span className="articulo-lectura">{tiempoLectura(item.texto)}</span>
        </div>

        <h1 className="articulo-titulo">{item.titulo}</h1>

        {item.bajada && <p className="articulo-bajada">{item.bajada}</p>}

        <div className="articulo-separador" />

        <div className="articulo-cuerpo">
          {parrafos.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {item.embed && (
          <div className="articulo-viz">
            <div dangerouslySetInnerHTML={{ __html: item.embed }} />
          </div>
        )}

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
  const [vista, setVista] = useState("lista"); // lista | form
  const [form, setForm] = useState(formVacio());

  function formVacio() {
    return { id: null, titulo: "", bajada: "", fecha: new Date().toISOString().slice(0, 10), texto: "", imagen: "", link: "", linkLabel: "", embed: "" };
  }

  function login() {
    if (adminPass === PASSWORD) { setAutenticado(true); setErrorPass(false); }
    else { setErrorPass(true); }
  }

  function nuevoItem() { setForm(formVacio()); setVista("form"); }
  function editarItem(item) { setForm({ ...item }); setVista("form"); }

  function guardar() {
    if (!form.titulo.trim()) return;
    let nuevos;
    if (form.id) { nuevos = items.map((i) => (i.id === form.id ? { ...form } : i)); }
    else { nuevos = [{ ...form, id: Date.now() }, ...items]; }
    setItems(nuevos);
    guardarContenidos(nuevos);
    setVista("lista");
  }

  function eliminar(id) {
    if (window.confirm("¿Eliminar esta publicación?")) {
      const nuevos = items.filter((i) => i.id !== id);
      setItems(nuevos);
      guardarContenidos(nuevos);
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
            <input className="admin-input" placeholder="https://..." value={form.imagen} onChange={(e) => setForm({ ...form, imagen: e.target.value })} />

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

  // vista === "lista"
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
  const [pagina, setPagina] = useState("inicio");
  const [seccionMonitor, setSeccionMonitor] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [articuloId, setArticuloId] = useState(null);
  const [items, setItems] = useState(cargarContenidos);

  // Detectar ruta /admin
  useEffect(() => {
    if (window.location.pathname === "/admin") setPagina("admin");
  }, []);

  function navegarA(pag, seccion) {
    setPagina(pag);
    if (seccion) setSeccionMonitor(seccion);
    setMenuAbierto(false);
    setArticuloId(null);
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
              <button className={"nav-btn " + (pagina === "inicio" ? "active" : "")} onClick={() => navegarA("inicio")}>Inicio</button>
              <button className={"nav-btn " + (pagina === "monitor" ? "active" : "")} onClick={() => navegarA("monitor")}>Monitor</button>
              <button className={"nav-btn " + (["contenidos","articulo"].includes(pagina) ? "active" : "")} onClick={() => navegarA("contenidos")}>Contenidos</button>
            </nav>
            <button className="hamburger" onClick={() => setMenuAbierto(!menuAbierto)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </header>
      )}

      <main className="main">
        {pagina === "inicio"     && <Inicio onNavigate={navegarA} />}
        {pagina === "monitor"    && <Monitor seccionInicial={seccionMonitor} />}
        {pagina === "contenidos" && (
          <div className="main-inner">
            <Contenidos items={items} onVerArticulo={verArticulo} />
          </div>
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


