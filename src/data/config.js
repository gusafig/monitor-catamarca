// ============================================================
//  DASHBOARD — CONFIGURACIÓN DE VARIABLES
//  Editá este archivo para renombrar variables y asignar CSVs.
//  Cada variable apunta a un CSV en /public/data/
// ============================================================

// ----------------------------------------------------------
//  HELPER: convierte "YYYY-M" → "mes de YYYY" en español
//  Usado por unidad y descripcion dinámicas.
// ----------------------------------------------------------
const MESES_ES = [
  "enero","febrero","marzo","abril","mayo","junio",
  "julio","agosto","septiembre","octubre","noviembre","diciembre"
];

export function periodoATexto(periodoRaw) {
  if (!periodoRaw) return "";
  const str = String(periodoRaw).trim();
  const match = str.match(/^(\d{4})-(\d{1,2})$/);
  if (match) {
    const mes = MESES_ES[parseInt(match[2], 10) - 1];
    return mes ? `${mes} de ${match[1]}` : str;
  }
  return str;
}

export const CONFIG = {
  titulo: "Catamarca en datos",
  subtitulo: "Dashboard de variables socioeconómicas",
  actualizacion: "2026",

  // ----------------------------------------------------------
  //  CATEGORÍAS
  // ----------------------------------------------------------
  secciones: [
    { id: "economia_real",    label: "Economía real",       color: "#e6322e" },
    { id: "finanzas",         label: "Finanzas Públicas",   color: "#15607a" },
    { id: "cotizaciones",     label: "Cotizaciones / Otros",  color: "#36aeac" },
  ],

  // ----------------------------------------------------------
  //  VARIABLES
  //  - seccion: debe coincidir con un id de secciones[]
  //  - archivo: nombre del CSV dentro de /public/data/
  //  - tipo: "linea" | "barra" | "area" | "barra_apilada" | "linea_doble"
  //  - kpi: true → aparece en las tarjetas del dashboard
  //  - formato: función JS para mostrar el valor
  //  - periodo: "mes" | "trimestre" | "año" (para mostrar referencia)
  //  - frecuencia: "diaria" → los datos se agrupan por promedio mensual
  //  - variacion: "interanual" → calcula variación vs 12 meses atrás
  // ----------------------------------------------------------
  indicadores: [
    // ── ECONOMÍA REAL ─────────────────────────────────────────
    {
      id: "variable1",
      seccion: "economia_real",
      nombre: "Patentamiento de automotores",
      unidad: "unidades",
      archivo: "automotores.csv",
      tipo: "linea",
      kpi: true,
      icono: "auto",
      formato: (v) => Number(v).toLocaleString('es-AR', { maximumFractionDigits: 2 }),
      periodo: "mes",
      descripcion: "Patentamiento mensual de automotores en Catamarca. Fuente: DNRPA.",
    },
    {
      id: "variable2",
      seccion: "economia_real",
      nombre: "Patentamiento de motos",
      unidad: "unidades",
      archivo: "motos.csv",
      tipo: "linea",
      kpi: true,
      formato: (v) => Number(v).toLocaleString('es-AR', { maximumFractionDigits: 2 }),
      periodo: "mes",
      descripcion: "Patentamiento mensual de motos en Catamarca. Fuente: DNRPA.",
    },
    {
      id: "variable9",
      seccion: "economia_real",
      nombre: "Despachos de naftas",
      unidad: "metros cúbicos",
      archivo: "naftas.csv",
      tipo: "linea",
      kpi: true,
      formato: (v) => Number(v).toLocaleString('es-AR', { maximumFractionDigits: 2 }),
      periodo: "mes",
      descripcion: (p) => `Despachos de naftas a la Provincia de Catamarca. Datos al ${periodoATexto(p)}. Fuente: Ministerio de Economía.`,
    },
    {
      id: "variable10",
      seccion: "economia_real",
      nombre: "Despachos de gas oil",
      unidad: "metros cúbicos",
      archivo: "gasoil.csv",
      tipo: "linea",
      kpi: true,
      formato: (v) => Number(v).toLocaleString('es-AR', { maximumFractionDigits: 2 }),
      periodo: "mes",
      descripcion: (p) => `Despachos de gas oil a la Provincia de Catamarca. Datos al ${periodoATexto(p)}. Fuente: Ministerio de Economía.`,
    },
    {
      id: "variable3",
      seccion: "economia_real",
      nombre: "Empleo registrado privado",
      unidad: "miles de trabajadores",
      archivo: "empleo.csv",
      tipo: "linea",
      kpi: true,
      formato: (v) => Number(v).toLocaleString('es-AR', { maximumFractionDigits: 2 }),
      periodo: "mes",
      descripcion: "Asalariados privados registrados en el SIPA. Fuente: Ministerio de Capital Humano.",
    },

    // ── FINANZAS PÚBLICAS ─────────────────────────────────────
    {
      id: "variable4",
      seccion: "finanzas",
      nombre: "Ingresos tributarios de origen nacional a precios constantes",
      unidad: (p) => `millones de pesos de ${periodoATexto(p)}`,
      tipo: "linea",
      kpi: true,
      formato: (v) => Number(v).toLocaleString('es-AR', { maximumFractionDigits: 2 }),
      periodo: "mes",
      descripcion: "Ingresos tributarios de origen nacional por coparticipación y leyes especiales deflactados por IPC NOA. Fuentes: Ministerio de Economía e INDEC.",
    },
    {
      id: "variable5",
      seccion: "finanzas",
      nombre: "Ingresos corrientes del gobierno provincial a precios constantes",
      unidad: (p) => `millones de pesos de ${periodoATexto(p)}`,
      archivo: "ingcorrientes.csv",
      tipo: "linea",
      kpi: true,
      formato: (v) => Number(v).toLocaleString('es-AR', { maximumFractionDigits: 2 }),
      periodo: "mes",
      descripcion: "Ingresos corrientes del gobierno provincial deflactados por IPC NOA. Fuentes: Contaduría General de la Provincia e INDEC.",
    },
    {
      // FIX: cambiado de "area" a "linea" para eliminar el relleno bajo la curva
      id: "variable6",
      seccion: "finanzas",
      nombre: "Gastos corrientes del gobierno provincial a precios constantes",
      unidad: (p) => `millones de pesos de ${periodoATexto(p)}`,
      archivo: "gtoscorrientes.csv",
      tipo: "linea",
      kpi: true,
      formato: (v) => Number(v).toLocaleString('es-AR', { maximumFractionDigits: 2 }),
      periodo: "mes",
      descripcion: "Gastos corrientes del gobierno provincial deflactados por IPC NOA. Fuentes: Contaduría General de la Provincia e INDEC.",
    },

    // ── COTIZACIONES / OTROS ──────────────────────────────────
    {
      id: "aceite_oliva",
      seccion: "cotizaciones",
      nombre: "Cotización del aceite de oliva extra virgen",
      unidad: "euros/100 kg",
      archivo: "aceite_oliva_temporadas.csv",
      tipo: "temporadas",
      kpi: false,
      formato: (v) => Number(v).toLocaleString('es-AR', { maximumFractionDigits: 2 }),
      periodo: "semana",
      descripcion: "Cotización semanal del aceite de oliva extra virgen en Jaén (España). Fuente: Comisión Europea. Nota: la temporada comprende desde octubre hasta septiembre del año siguiente.",
    },
    {
      // FIX: agregado variacion: "interanual" para calcular variación vs 12 meses atrás
      id: "variable7",
      seccion: "cotizaciones",
      nombre: "Cotización del cobre refinado",
      unidad: "dólares por tonelada",
      archivo: "cobre.csv",
      tipo: "linea",
      kpi: true,
      variacion: "interanual",
      formato: (v) => Number(v).toLocaleString('es-AR', { maximumFractionDigits: 2 }),
      periodo: "mes",
      descripcion: "Cotización promedio mensual del cátodo de cobre grado A. Fuente: Westmetall.",
    },
    {
      // FIX: configurado con datos del litio. frecuencia: "diaria" activa
      // la agregación automática por promedio mensual en Section.jsx
      id: "variable8",
      seccion: "cotizaciones",
      nombre: "Cotización del carbonato de litio",
      unidad: "dólares por kg",
      archivo: "litio.csv",
      tipo: "linea",
      kpi: true,
      frecuencia: "diaria",
      variacion: "interanual",
      formato: (v) => Number(v).toLocaleString('es-AR', { maximumFractionDigits: 2 }),
      periodo: "mes",
      descripcion: "Cotización promedio mensual del carbonato de litio (Lithium Carbonate 99.5%min FOB South America). Elaboración propia a partir de datos diarios. Fuente: Banco Central de Chile.",
    },
  ],
};

// ----------------------------------------------------------
//  COLORES POR CATEGORÍA
// ----------------------------------------------------------
export const COLORES = {
  economia_real: {
    primario:   "#e6322e",
    secundario: "#f0817f",
    fondo:      "rgba(230,50,46,0.08)",
  },
  finanzas: {
    primario:   "#15607a",
    secundario: "#5a9db5",
    fondo:      "rgba(21,96,122,0.08)",
  },
  cotizaciones: {
    primario:   "#36aeac",
    secundario: "#7dd0ce",
    fondo:      "rgba(54,174,172,0.08)",
  },
};
