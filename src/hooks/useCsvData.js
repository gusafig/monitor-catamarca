import { useState, useEffect } from "react";
import Papa from "papaparse";

/**
 * Carga y parsea un CSV desde /data/{filename}
 * Retorna { data, loading, error }
 * data es un array de objetos con las columnas como keys.
 */
export function useCsvData(filename) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!filename) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    fetch(`${process.env.PUBLIC_URL}/data/${filename}`)
      .then((res) => {
        if (!res.ok) throw new Error(`No se pudo cargar ${filename}`);
        return res.text();
      })
      .then((text) => {
        const result = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
        });
        setData(result.data);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [filename]);

  return { data, loading, error };
}

/**
 * Devuelve el último valor de un array de datos CSV.
 * Útil para los KPI cards.
 */
export function lastValue(data, campo = "valor") {
  if (!data || data.length === 0) return null;
  const last = data[data.length - 1];
  return last[campo] ?? null;
}

/**
 * Calcula la variación porcentual entre el último y el anteúltimo valor
 * (variación mensual / respecto al período anterior).
 */
export function deltaPercent(data, campo = "valor") {
  if (!data || data.length < 2) return null;
  const prev = data[data.length - 2][campo];
  const curr = data[data.length - 1][campo];
  if (!prev || prev === 0) return null;
  return (((curr - prev) / Math.abs(prev)) * 100).toFixed(1);
}

/**
 * Calcula la variación porcentual interanual:
 * compara el último valor con el valor de hace 12 períodos.
 */
export function deltaPercentAnual(data, campo = "valor") {
  if (!data || data.length < 13) return null;
  const prev = data[data.length - 13][campo];
  const curr = data[data.length - 1][campo];
  if (!prev || prev === 0) return null;
  return (((curr - prev) / Math.abs(prev)) * 100).toFixed(1);
}

/**
 * Agrupa datos diarios en promedios mensuales.
 * Útil para CSVs con una fila por día (ej: litio).
 * Espera filas con formato de período: "YYYY-M-D"
 */
export function agruparPorMes(data, campo = "valor") {
  if (!data || data.length === 0) return [];
  const mapa = {};
  data.forEach((row) => {
    const periodoRaw = String(
      row.periodo || row.fecha || row.date || ""
    ).trim();
    const partes = periodoRaw.split("-");
    if (partes.length >= 2) {
      const ym = `${partes[0]}-${parseInt(partes[1], 10)}`;
      if (!mapa[ym]) mapa[ym] = [];
      const v = parseFloat(row[campo]);
      if (!isNaN(v)) mapa[ym].push(v);
    }
  });

  return Object.entries(mapa)
    .sort(([a], [b]) => {
      const [ay, am] = a.split("-").map(Number);
      const [by, bm] = b.split("-").map(Number);
      return ay !== by ? ay - by : am - bm;
    })
    .map(([periodo, vals]) => ({
      periodo,
      valor: vals.reduce((s, v) => s + v, 0) / vals.length,
    }));
}
