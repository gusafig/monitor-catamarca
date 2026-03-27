import React from "react";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import { SeasonChart } from "./SeasonChart";
import { useCsvData, lastValue, deltaPercent, deltaPercentAnual, agruparPorMes } from "../hooks/useCsvData";
import { CONFIG, COLORES } from "../data/config";

/**
 * Renderiza todos los indicadores de una sección:
 * primero las KPI cards, luego los gráficos en grilla.
 */
export function Section({ seccionId, soloIndicador }) {
  const seccion = CONFIG.secciones.find((s) => s.id === seccionId);
  const todos = CONFIG.indicadores.filter((i) => i.seccion === seccionId);
  const indicadores = soloIndicador ? todos.filter((i) => i.id === soloIndicador) : todos;
  const colores = COLORES[seccionId] || COLORES.economia_real;
  const kpis = indicadores.filter((i) => i.kpi);
  const graficos = indicadores; // todos tienen gráfico

  return (
    <div className="section">
      {/* KPI cards */}
      <div className="kpis-grid">
        {kpis.map((ind) => (
          <KPICardLoader key={ind.id} indicador={ind} color={seccion?.color || colores.primario} />
        ))}
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
        {graficos.map((ind) => (
          <ChartLoader key={ind.id} indicador={ind} seccionId={seccionId} />
        ))}
      </div>
    </div>
  );
}

/* Carga datos y renderiza un KPICard */
function KPICardLoader({ indicador, color }) {
  const { data, loading } = useCsvData(indicador.archivo);

  // Si los datos son diarios, agruparlos por mes antes de operar
  const dataFinal = indicador.frecuencia === "diaria" ? agruparPorMes(data) : data;

  const val = lastValue(dataFinal, "valor");

  // Usar variación interanual para cotizaciones, mensual para el resto
  const delta =
    indicador.variacion === "interanual"
      ? deltaPercentAnual(dataFinal, "valor")
      : deltaPercent(dataFinal, "valor");

  const formatted = val !== null && indicador.formato ? indicador.formato(val) : val ?? "—";

  const ultimoPeriodoRaw =
    dataFinal && dataFinal.length > 0
      ? dataFinal[dataFinal.length - 1].periodo || dataFinal[dataFinal.length - 1].año || null
      : null;

  function formatPeriodo(valor) {
    if (!valor) return null;
    const str = String(valor);
    const match = str.match(/^(\d{4})-(\d{1,2})$/);
    if (match) {
      const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
      const mes = meses[parseInt(match[2], 10) - 1];
      return mes ? `${mes} ${match[1]}` : str;
    }
    return str;
  }

  return (
    <KPICard
      label={indicador.nombre}
      value={formatted}
      delta={delta}
      color={color}
      loading={loading}
      tooltip={indicador.descripcion}
      periodo={formatPeriodo(ultimoPeriodoRaw)}
      icono={indicador.icono}
    />
  );
}

/* Carga datos y renderiza un ChartCard o SeasonChart */
function ChartLoader({ indicador, seccionId }) {
  const { data, loading } = useCsvData(indicador.archivo);

  if (indicador.tipo === "temporadas") {
    return (
      <SeasonChart
        nombre={indicador.nombre}
        unidad={indicador.unidad}
        seccion={seccionId}
      />
    );
  }

  // Si los datos son diarios, agruparlos por mes para el gráfico
  const dataFinal = indicador.frecuencia === "diaria" ? agruparPorMes(data) : data;

  return (
    <ChartCard
      tipo={indicador.tipo}
      data={dataFinal}
      seccion={seccionId}
      nombre={indicador.nombre}
      unidad={indicador.unidad}
      loading={loading}
      series={indicador.series}
    />
  );
}
