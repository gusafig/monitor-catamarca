import React from "react";
import {
  LineChart, Line,
  BarChart, Bar,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { COLORES } from "../data/config";

const TOOLTIP_STYLE = {
  backgroundColor: "var(--bg-primary)",
  border: "0.5px solid var(--border-color)",
  borderRadius: 8,
  fontSize: 12,
  fontFamily: "'Syne', sans-serif",
};

const AXIS_STYLE = { fontSize: 11, fill: "var(--text-secondary)", fontFamily: "'DM Mono', monospace" };
const GRID_COLOR = "rgba(136,135,128,0.18)";

/**
 * Componente universal de gráfico.
 * Props:
 *   tipo       — "linea" | "barra" | "area" | "barra_apilada" | "linea_doble" | "dona"
 *   data       — array de objetos (salida de PapaParse)
 *   seccion    — id de sección para extraer color
 *   nombre     — título del card
 *   unidad     — se muestra en el tooltip
 *   loading    — boolean
 *   series     — para gráficos multi-serie: [{ key, nombre, color }]
 */
export function ChartCard({ tipo, data, seccion, nombre, unidad, loading, series }) {
  const colores = COLORES[seccion] || COLORES.economia;

  const renderChart = () => {
    if (loading) return <div className="chart-skeleton" />;
    if (!data || data.length === 0)
      return <div className="chart-empty">Sin datos — cargá el CSV correspondiente</div>;

    // Detecta dinámicamente la columna del eje X: busca "periodo", "año" o
    // cualquier columna que no sea "valor" como fallback.
    const COLUMNAS_X = ["periodo", "año", "date", "fecha", "trimestre", "mes"];
    const primeraFila = data[0] || {};
    const xKey =
      COLUMNAS_X.find((k) => k in primeraFila) ||
      Object.keys(primeraFila).find((k) => k !== "valor") ||
      "periodo";

    const commonProps = {
      data,
      margin: { top: 4, right: 8, left: 0, bottom: 0 },
    };

    switch (tipo) {
      // ── Línea simple ─────────────────────────────────────
      case "linea":
        return (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey={xKey} tick={AXIS_STYLE} tickLine={false} />
              <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} ${unidad}`, nombre]} />
              <Line
                type="monotone" dataKey="valor"
                stroke={colores.primario} strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      // ── Área simple ──────────────────────────────────────
      case "area":
        return (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id={`grad-${seccion}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colores.primario} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={colores.primario} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey={xKey} tick={AXIS_STYLE} tickLine={false} />
              <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} ${unidad}`, nombre]} />
              <Area
                type="monotone" dataKey="valor"
                stroke={colores.primario} strokeWidth={2}
                fill={`url(#grad-${seccion})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      // ── Barra simple ─────────────────────────────────────
      case "barra":
        return (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart {...commonProps} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey={xKey} tick={AXIS_STYLE} tickLine={false} />
              <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} ${unidad}`, nombre]} />
              <Bar dataKey="valor" fill={colores.primario} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      // ── Barra apilada multi-serie ─────────────────────────
      case "barra_apilada": {
        const cols = series || [{ key: "valor", nombre: nombre, color: colores.primario }];
        return (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart {...commonProps} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey={xKey} tick={AXIS_STYLE} tickLine={false} />
              <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend
                iconType="square" iconSize={8}
                wrapperStyle={{ fontSize: 11, fontFamily: "'Syne', sans-serif" }}
              />
              {cols.map((s) => (
                <Bar key={s.key} dataKey={s.key} name={s.nombre} stackId="a"
                  fill={s.color} radius={[2, 2, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      }

      // ── Línea doble (nominal vs real) ─────────────────────
      case "linea_doble": {
        const cols = series || [
          { key: "nominal", nombre: "Nominal", color: colores.primario },
          { key: "real",    nombre: "Real",    color: colores.secundario },
        ];
        return (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey={xKey} tick={AXIS_STYLE} tickLine={false} />
              <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend iconType="square" iconSize={8}
                wrapperStyle={{ fontSize: 11, fontFamily: "'Syne', sans-serif" }} />
              {cols.map((s) => (
                <Line key={s.key} type="monotone" dataKey={s.key} name={s.nombre}
                  stroke={s.color} strokeWidth={2} dot={{ r: 2 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      }

      // ── Dona ─────────────────────────────────────────────
      case "dona": {
        const cols = series || [{ key: "valor", nombre: nombre, color: colores.primario }];
        return (
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={data} dataKey="valor" nameKey="nombre"
                cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                paddingAngle={2}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={cols[i % cols.length]?.color || colores.primario} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend iconType="square" iconSize={8}
                wrapperStyle={{ fontSize: 11, fontFamily: "'Syne', sans-serif" }} />
            </PieChart>
          </ResponsiveContainer>
        );
      }

      default:
        return <div className="chart-empty">Tipo de gráfico no reconocido: {tipo}</div>;
    }
  };

  return (
    <div className="chart-card">
      <div className="chart-title">{nombre}</div>
      {unidad && <div className="chart-unit">{unidad}</div>}
      {renderChart()}
    </div>
  );
}
