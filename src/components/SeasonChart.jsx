import React, { useMemo } from "react";
import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useCsvData } from "../hooks/useCsvData";
import { COLORES } from "../data/config";

const TOOLTIP_STYLE = {
  backgroundColor: "var(--bg-primary)",
  border: "0.5px solid var(--border-color)",
  borderRadius: 8,
  fontSize: 12,
  fontFamily: "'Syne', sans-serif",
};

const AXIS_STYLE = {
  fontSize: 11,
  fill: "var(--text-secondary)",
  fontFamily: "'DM Mono', monospace",
};

const GRID_COLOR = "rgba(136,135,128,0.18)";

const fmt = (v) =>
  Number(v).toLocaleString("es-AR", { maximumFractionDigits: 2 });

// Paleta de colores para cada temporada
const SEASON_COLORS = [
  "#1D9E75", "#378ADD", "#EF9F27", "#E05C5C",
  "#9B59B6", "#2ECC71", "#E67E22", "#1ABC9C",
];

/**
 * Gráfico de líneas multi-temporada.
 * Espera un CSV con columnas: semana (número de semana), y una columna por cada temporada (ej: "2022", "2023", "2024").
 * Props:
 *   nombre   — título del card
 *   unidad   — unidad del eje Y
 *   seccion  — id de sección para extraer color base
 */
export function SeasonChart({ nombre, unidad, seccion }) {
  const { data, loading } = useCsvData("aceite_oliva_temporadas.csv");
  const colores = COLORES[seccion] || COLORES.economia_real;

  // Detecta las columnas de temporadas (todas excepto la columna de semana/periodo)
  const { xKey, temporadas } = useMemo(() => {
    if (!data || data.length === 0) return { xKey: "semana", temporadas: [] };
    const primeraFila = data[0];
    const COLUMNAS_X = ["semana", "periodo", "semana_numero", "week", "fecha"];
    const xKey =
      COLUMNAS_X.find((k) => k in primeraFila) ||
      Object.keys(primeraFila)[0];
    const temporadas = Object.keys(primeraFila).filter((k) => k !== xKey);
    return { xKey, temporadas };
  }, [data]);

  const renderContent = () => {
    if (loading) return <div className="chart-skeleton" />;
    if (!data || data.length === 0)
      return (
        <div className="chart-empty">
          Sin datos — cargá el CSV correspondiente
        </div>
      );

    return (
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis dataKey={xKey} tick={AXIS_STYLE} tickLine={false} label={{ value: "Semana", position: "insideBottom", offset: -2, style: AXIS_STYLE }} />
          <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} unit={` ${unidad || ""}`} width={70} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v, name) => [`${fmt(v)} ${unidad || ""}`, name]}
            labelFormatter={(label) => `Semana ${label}`}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, fontFamily: "'DM Mono', monospace" }}
          />
          {temporadas.map((temp, i) => (
            <Line
              key={temp}
              type="monotone"
              dataKey={temp}
              name={temp}
              stroke={SEASON_COLORS[i % SEASON_COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <span className="chart-card__title">{nombre}</span>
      </div>
      <div className="chart-card__body">{renderContent()}</div>
    </div>
  );
}
