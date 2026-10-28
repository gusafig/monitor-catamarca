import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function PdfViewer({ url, descargaUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState(false);
  const [ancho, setAncho] = useState(600);
  const wrapRef = useRef(null);

  useEffect(() => {
    function medir() {
      if (wrapRef.current) setAncho(wrapRef.current.clientWidth);
    }
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);

  useEffect(() => { setPagina(1); setNumPages(null); setError(false); }, [url]);

  const ir = (d) => setPagina((p) => Math.min(Math.max(1, p + d), numPages || 1));

  return (
    <div className="pdf-viewer">
      <div className="pdf-toolbar">
        <div className="pdf-toolbar-grupo">
          <button onClick={() => ir(-1)} disabled={pagina <= 1} aria-label="Página anterior">←</button>
          <span>{numPages ? `${pagina} / ${numPages}` : "…"}</span>
          <button onClick={() => ir(1)} disabled={!numPages || pagina >= numPages} aria-label="Página siguiente">→</button>
        </div>
        <div className="pdf-toolbar-grupo">
          <button onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.2).toFixed(1)))} aria-label="Alejar">−</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(2.4, +(z + 0.2).toFixed(1)))} aria-label="Acercar">+</button>
        </div>
        <a href={descargaUrl || url} target="_blank" rel="noopener noreferrer" className="pdf-toolbar-descarga">↓ Descargar</a>
      </div>

      <div className="pdf-canvas-wrap" ref={wrapRef}>
        {error ? (
          <p className="pdf-msg">No se pudo cargar el PDF. <a href={url} target="_blank" rel="noopener noreferrer">Abrirlo en una pestaña nueva</a>.</p>
        ) : (
          <Document
            file={url}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={() => setError(true)}
            loading={<p className="pdf-msg">Cargando PDF…</p>}
          >
            <Page pageNumber={pagina} width={Math.max(280, ancho - 2) * zoom} loading={<p className="pdf-msg">Cargando página…</p>} />
          </Document>
        )}
      </div>
    </div>
  );
}
