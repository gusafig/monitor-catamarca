import React, { useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  useBcraMonetaria,
  useBcraCambiaria,
  bcraUltimo,
  bcraUltimaFecha,
  bcraVarPeriodo,
  bcraVarAnual,
  bcraVarAbsoluta,
} from "../hooks/useBcraData";

// ── CATÁLOGO DE VARIABLES ─────────────────────────────────────────
// Monetarias: usan idVariable numérico (API v4.0)
// Cambiarias: usan codigoMoneda string (API v1.0)

export const VARIABLES_MONETARIAS = [
  {
    tipo: "monetaria",
    id: 1,
    nombre: "Reservas internacionales",
    unidad: "millones de USD",
    color: "#15607a",
    grafico: "linea",
    varAnual: false,
    varAbsoluta: true,
    formato: (v) => "USD " + Number(v).toLocaleString("es-AR", { maximumFractionDigits: 0 }),
    descripcion: "Stock de reservas internacionales brutas del BCRA.",
  },
  {
    tipo: "monetaria",
    id: 15,
    nombre: "Base monetaria",
    unidad: "millones de $",
    color: "#8e44ad",
    grafico: "linea",
    varAnual: false,
    formato: (v) => "$ " + Number(v).toLocaleString("es-AR", { maximumFractionDigits: 0 }),
    descripcion: "Circulación monetaria más depósitos de entidades financieras en el BCRA.",
  },
  {
    tipo: "monetaria",
    id: 27,
    nombre: "Inflación mensual (IPC)",
    unidad: "%",
    color: "#e6322e",
    grafico: "barra",
    varAnual: false,
    sinVariacion: true,
    formato: (v) => Number(v).toFixed(1) + "%",
    descripcion: "Variación mensual del Índice de Precios al Consumidor. Fuente: INDEC vía BCRA.",
  },
  {
    tipo: "monetaria",
    id: 28,
    nombre: "Inflación interanual (IPC)",
    unidad: "%",
    color: "#c0392b",
    grafico: "linea",
    varAnual: false,
    formato: (v) => Number(v).toFixed(1) + "%",
    descripcion: "Variación interanual del Índice de Precios al Consumidor. Fuente: INDEC vía BCRA.",
  },
  {
    tipo: "monetaria",
    id: 44,
    nombre: "TAMAR (bancos privados)",
    unidad: "% TNA",
    color: "#e67e22",
    grafico: "linea",
    varAnual: false,
    formato: (v) => Number(v).toFixed(2) + "%",
    descripcion: "Tasa Activa para el Mercado Regulado (TAMAR) de bancos privados, publicada diariamente por el BCRA.",
  },
 ];

export const VARIABLES_CAMBIARIAS = [
  {
    tipo: "cambiaria",
    id: "USD",
    nombre: "Dólar estadounidense",
    unidad: "$ por USD",
    color: "#2c7a2c",
    grafico: "linea",
    varAnual: false,
    formato: (v) => "$ " + Number(v).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    descripcion: "Tipo de cambio de referencia del dólar estadounidense publicado por el BCRA.",
  },
  {
    tipo: "cambiaria",
    id: "EUR",
    nombre: "Euro",
    unidad: "$ por EUR",
    color: "#2980b9",
    grafico: "linea",
    varAnual: false,
    formato: (v) => "$ " + Number(v).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    descripcion: "Tipo de cambio de referencia del euro publicado por el BCRA.",
  },
  {
    tipo: "cambiaria",
    id: "BRL",
    nombre: "Real brasileño",
    unidad: "$ por BRL",
    color: "#d4a017",
    grafico: "linea",
    varAnual: false,
    formato: (v) => "$ " + Number(v).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    descripcion: "Tipo de cambio de referencia del real brasileño publicado por el BCRA.",
  },
  {
    tipo: "cambiaria",
    id: "CNY",
    nombre: "Yuan chino",
    unidad: "$ por CNY",
    color: "#c0392b",
    grafico: "linea",
    varAnual: false,
    formato: (v) => "$ " + Number(v).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    descripcion: "Tipo de cambio de referencia del yuan chino (renminbi) publicado por el BCRA.",
  },
];

// ── HELPERS DE FORMATO ────────────────────────────────────────────
function formatFechaCorta(fechaStr) {
  if (!fechaStr) return "";
  const d = new Date(fechaStr + "T12:00:00");
  return d.toLocaleDateString("es-AR", { month: "short", year: "2-digit" });
}

function formatFechaLarga(fechaStr) {
  if (!fechaStr) return "";
  return new Date(fechaStr + "T12:00:00").toLocaleDateString("es-AR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// ── KPI CARD ──────────────────────────────────────────────────────
function BcraKpiCard({ variable, activa, onClick }) {
  const esMonetaria = variable.tipo === "monetaria";
  const { data: dataM, loading: loadM } = useBcraMonetaria(
    esMonetaria ? variable.id : null, 400
  );
  const { data: dataC, loading: loadC } = useBcraCambiaria(
    !esMonetaria ? variable.id : null, 400
  );

  const data    = esMonetaria ? dataM : dataC;
  const loading = esMonetaria ? loadM : loadC;

  const ultimo      = bcraUltimo(data);
  const ultimaFecha = bcraUltimaFecha(data);
  const varPer      = bcraVarPeriodo(data);
  const varAnio     = variable.varAnual ? bcraVarAnual(data) : null;
  const varAbs      = variable.varAbsoluta ? bcraVarAbsoluta(data) : null;

  // Solo Reservas internacionales muestra badge (varAbsoluta: true).
  // Ninguna otra variable tiene cálculo adicional.
  const tieneVarAbs = varAbs !== null && variable.varAbsoluta;

  const varColor = varAbs > 0 ? "var(--color-up)" : varAbs < 0 ? "var(--color-down)" : "var(--color-flat)";
  const varLabel = "var. día hábil previo";
  const varBadgeText = tieneVarAbs
    ? (varAbs > 0 ? "+" : "") + Number(varAbs).toLocaleString("es-AR", { maximumFractionDigits: 0 }) + " M USD"
    : null;

  return (
    <button
      className={"bcra-kpi-card" + (activa ? " bcra-kpi-card--activa" : "")}
      style={{ "--bcra-color": variable.color }}
      onClick={onClick}
      title={variable.descripcion}
    >
      <div className="bcra-kpi-top">
        <span
          className="bcra-kpi-badge"
          style={{ background: variable.color + "18", color: variable.color }}
        >
          {variable.tipo === "monetaria" ? "Monetaria" : "Cambiaria"}
        </span>
        {varBadgeText && (
          <span className="bcra-kpi-var" style={{ color: varColor }}>
            {varBadgeText}
          </span>
        )}
      </div>

      <div className="bcra-kpi-nombre">{variable.nombre}</div>

      <div className={"bcra-kpi-valor" + (loading ? " loading" : "")}>
        {loading ? "…" : ultimo !== null ? variable.formato(ultimo) : "—"}
      </div>

      <div className="bcra-kpi-footer">
        <span className="bcra-kpi-unidad">{variable.unidad}</span>
        <span className="bcra-kpi-meta">
          {varBadgeText && <span className="bcra-kpi-varlabel">{varLabel}</span>}
          {ultimaFecha && (
            <span className="bcra-kpi-fecha">{formatFechaLarga(ultimaFecha)}</span>
          )}
        </span>
      </div>
    </button>
  );
}

// ── GRÁFICO DE DETALLE ────────────────────────────────────────────
function BcraGrafico({ variable }) {
  const esMonetaria = variable.tipo === "monetaria";
  const { data: dataM, loading: loadM, error: errM } = useBcraMonetaria(
    esMonetaria ? variable.id : null, 730
  );
  const { data: dataC, loading: loadC, error: errC } = useBcraCambiaria(
    !esMonetaria ? variable.id : null, 730
  );

  const data    = esMonetaria ? dataM : dataC;
  const loading = esMonetaria ? loadM : loadC;
  const error   = esMonetaria ? errM  : errC;

  const chartData = data.map((d) => ({
    fecha: formatFechaCorta(d.fecha),
    valor: d.valor,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bcra-tooltip">
        <p className="bcra-tooltip-fecha">{label}</p>
        <p className="bcra-tooltip-valor" style={{ color: variable.color }}>
          {variable.formato(payload[0].value)}
        </p>
      </div>
    );
  };

  return (
    <div className="bcra-grafico-wrap">
      <div className="bcra-grafico-header">
        <div>
          <h3 className="bcra-grafico-titulo">{variable.nombre}</h3>
          <p className="bcra-grafico-desc">{variable.descripcion}</p>
        </div>
        <span className="bcra-grafico-unidad">{variable.unidad}</span>
      </div>

      {loading && (
        <div className="bcra-grafico-estado">Cargando datos del BCRA…</div>
      )}
      {error && (
        <div className="bcra-grafico-estado bcra-grafico-error">
          No se pudieron obtener los datos. Intentá de nuevo más tarde.
        </div>
      )}

      {!loading && !error && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          {variable.grafico === "barra" ? (
            <BarChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis
                dataKey="fecha"
                tick={{ fontSize: 11, fill: "#767676" }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#767676" }}
                tickLine={false}
                axisLine={false}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="valor" fill={variable.color} radius={[3, 3, 0, 0]} maxBarSize={30} />
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis
                dataKey="fecha"
                tick={{ fontSize: 11, fill: "#767676" }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#767676" }}
                tickLine={false}
                axisLine={false}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="valor"
                stroke={variable.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: variable.color }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      )}

      {!loading && !error && chartData.length === 0 && (
        <div className="bcra-grafico-estado">Sin datos disponibles para el período seleccionado.</div>
      )}

      <p className="bcra-fuente">
        Fuente: Banco Central de la República Argentina (BCRA) — datos en tiempo real.
      </p>
    </div>
  );
}

// ── PÁGINA PRINCIPAL ──────────────────────────────────────────────
export default function BcraEstadisticas() {
  const [tab, setTab]                       = useState("monetarias"); // "monetarias" | "cambiarias"
  const [variableActiva, setVariableActiva] = useState(VARIABLES_MONETARIAS[0]);

  function cambiarTab(nuevoTab) {
    setTab(nuevoTab);
    setVariableActiva(
      nuevoTab === "monetarias" ? VARIABLES_MONETARIAS[0] : VARIABLES_CAMBIARIAS[0]
    );
  }

  const variables = tab === "monetarias" ? VARIABLES_MONETARIAS : VARIABLES_CAMBIARIAS;

  return (
    <div className="bcra-page">

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="monitor-header">
        <div className="monitor-header-inner">
          <h2 className="monitor-title">
            Estadísticas <span className="accent">BCRA</span>
          </h2>
          <div className="header-meta">
            <span className="header-updated" style={{ color: "#36aeac" }}>
              Datos en tiempo real
            </span>
            <span className="header-fuente">Banco Central de la República Argentina</span>
          </div>
        </div>
      </div>

      <div className="main-inner" style={{ paddingTop: "1.5rem", paddingBottom: "3rem" }}>

        {/* ── TABS ───────────────────────────────────────────────── */}
        <div className="bcra-tabs">
          <button
            className={"bcra-tab" + (tab === "monetarias" ? " bcra-tab--activa" : "")}
            onClick={() => cambiarTab("monetarias")}
          >
            Variables monetarias
          </button>
          <button
            className={"bcra-tab" + (tab === "cambiarias" ? " bcra-tab--activa" : "")}
            onClick={() => cambiarTab("cambiarias")}
          >
            Variables cambiarias
          </button>
        </div>

        {/* ── GRILLA DE KPI CARDS ─────────────────────────────────── */}
        <div className="bcra-kpi-grid">
          {variables.map((v) => (
            <BcraKpiCard
              key={v.id}
              variable={v}
              activa={variableActiva?.id === v.id}
              onClick={() => setVariableActiva(v)}
            />
          ))}
        </div>

        {/* ── GRÁFICO DE LA VARIABLE SELECCIONADA ─────────────────── */}
        {variableActiva && (
          <div style={{ marginTop: "1.75rem" }}>
            <BcraGrafico variable={variableActiva} />
          </div>
        )}

        <p className="bcra-nota">
          Hacé clic en cualquier indicador para ver su evolución histórica de los últimos 2 años.
          Los datos se obtienen directamente desde la API pública del BCRA sin intermediarios.
        </p>

      </div>
    </div>
  );
}
