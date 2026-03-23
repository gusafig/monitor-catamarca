import React from "react";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import { useCsvData, lastValue, deltaPercent } from "../hooks/useCsvData";
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
  const val = lastValue(data, "valor");
  const delta = deltaPercent(data, "valor");
  const formatted = val !== null && indicador.formato ? indicador.formato(val) : val ?? "—";

  return (
    <KPICard
      label={indicador.nombre}
      value={formatted}
      delta={delta}
      color={color}
      loading={loading}
      tooltip={indicador.descripcion}
    />
  );
}

/* Carga datos y renderiza un ChartCard */
function ChartLoader({ indicador, seccionId }) {
  const { data, loading } = useCsvData(indicador.archivo);

  return (
    <ChartCard
      tipo={indicador.tipo}
      data={data}
      seccion={seccionId}
      nombre={indicador.nombre}
      unidad={indicador.unidad}
      loading={loading}
      series={indicador.series}
    />
  );
}
