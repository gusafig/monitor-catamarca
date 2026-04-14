import { useState, useEffect } from "react";

const MONETARIAS_BASE = "https://api.bcra.gob.ar/estadisticas/v4.0/monetarias";
const CAMBIARIAS_BASE = "https://api.bcra.gob.ar/estadisticascambiarias/v1.0/Cotizaciones";

// ── HELPERS DE FECHA ──────────────────────────────────────────────
function fechaHace(dias) {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d.toISOString().slice(0, 10);
}

// ── HOOK: VARIABLE MONETARIA ──────────────────────────────────────
/**
 * Descarga la evolución de una variable monetaria del BCRA (API v4.0).
 * @param {number} idVariable  - ID numérico de la variable
 * @param {number} diasAtras   - cuántos días de historia traer (default 365)
 * Retorna { data: [{fecha, valor}], loading, error }
 */
export function useBcraMonetaria(idVariable, diasAtras = 365) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!idVariable) return;
    setLoading(true);
    setError(null);

    const desde = fechaHace(diasAtras);
    const hasta  = new Date().toISOString().slice(0, 10);
    const url    = `${MONETARIAS_BASE}/${idVariable}?desde=${desde}&hasta=${hasta}&limit=3000`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        // v4: results puede ser objeto con detalle, o array de objetos con detalle
        let detalle = [];
        if (json.results) {
          if (Array.isArray(json.results)) {
            detalle = json.results.flatMap((r) => r.detalle || []);
          } else if (json.results.detalle) {
            detalle = json.results.detalle;
          }
        }
        const ordenado = detalle
          .filter((r) => r.valor !== null && r.valor !== undefined)
          .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        setData(ordenado);
      })
      .catch((err) => {
        console.error("BCRA monetaria error:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [idVariable, diasAtras]); // eslint-disable-line

  return { data, loading, error };
}

// ── HOOK: EVOLUCIÓN CAMBIARIA ─────────────────────────────────────
/**
 * Descarga la evolución del tipo de cambio de una moneda ISO (API v1.0).
 * @param {string} moneda    - código ISO (ej: "USD", "EUR", "BRL", "CNY")
 * @param {number} diasAtras - cuántos días de historia traer (default 365)
 * Retorna { data: [{fecha, valor}], loading, error }
 */
export function useBcraCambiaria(moneda, diasAtras = 365) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!moneda) return;
    setLoading(true);
    setError(null);

    const desde = fechaHace(diasAtras);
    const hasta  = new Date().toISOString().slice(0, 10);
    const url    = `${CAMBIARIAS_BASE}/${moneda}?fechadesde=${desde}&fechahasta=${hasta}&limit=1000`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        // results: [{fecha, detalle:[{codigoMoneda, tipoCotizacion,...}]}]
        const filas = (json.results || [])
          .map((r) => {
            const det = (r.detalle || []).find((d) => d.codigoMoneda === moneda);
            return det && det.tipoCotizacion > 0
              ? { fecha: r.fecha, valor: det.tipoCotizacion }
              : null;
          })
          .filter(Boolean)
          .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        setData(filas);
      })
      .catch((err) => {
        console.error("BCRA cambiaria error:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [moneda, diasAtras]); // eslint-disable-line

  return { data, loading, error };
}

// ── HELPERS DE ANÁLISIS ───────────────────────────────────────────

/** Último valor de una serie */
export function bcraUltimo(data) {
  if (!data || data.length === 0) return null;
  return data[data.length - 1].valor;
}

/** Última fecha informada */
export function bcraUltimaFecha(data) {
  if (!data || data.length === 0) return null;
  return data[data.length - 1].fecha;
}

/** Variación % respecto al valor inmediatamente anterior */
export function bcraVarPeriodo(data) {
  if (!data || data.length < 2) return null;
  const prev = data[data.length - 2].valor;
  const curr = data[data.length - 1].valor;
  if (!prev || prev === 0) return null;
  return (((curr - prev) / Math.abs(prev)) * 100).toFixed(1);
}

/** Variación absoluta respecto al valor inmediatamente anterior */
export function bcraVarAbsoluta(data) {
  if (!data || data.length < 2) return null;
  const prev = data[data.length - 2].valor;
  const curr = data[data.length - 1].valor;
  if (prev === null || prev === undefined) return null;
  return curr - prev;
}

/** Variación % interanual (vs el dato más cercano a hace 365 días) */
export function bcraVarAnual(data) {
  if (!data || data.length < 2) return null;
  const ultimo   = data[data.length - 1];
  const fechaRef = new Date(ultimo.fecha);
  fechaRef.setFullYear(fechaRef.getFullYear() - 1);
  let masProximo = null;
  let menorDif   = Infinity;
  data.forEach((r) => {
    const dif = Math.abs(new Date(r.fecha) - fechaRef);
    if (dif < menorDif) { menorDif = dif; masProximo = r; }
  });
  if (!masProximo || masProximo.valor === 0) return null;
  return (((ultimo.valor - masProximo.valor) / Math.abs(masProximo.valor)) * 100).toFixed(1);
}
