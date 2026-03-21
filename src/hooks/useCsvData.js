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
 * Calcula la variación porcentual entre el último y el anteúltimo valor.
 */
export function deltaPercent(data, campo = "valor") {
  if (!data || data.length < 2) return null;
  const prev = data[data.length - 2][campo];
  const curr = data[data.length - 1][campo];
  if (!prev || prev === 0) return null;
  return (((curr - prev) / Math.abs(prev)) * 100).toFixed(1);
}
