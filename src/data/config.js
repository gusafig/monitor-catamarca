// ============================================================
//  DASHBOARD — CONFIGURACIÓN DE VARIABLES
//  Editá este archivo para renombrar variables y asignar CSVs.
//  Cada variable apunta a un CSV en /public/data/
// ============================================================

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
      descripcion: "Despachos de naftas a la Provincia de Catamarca. Fuente: Ministerio de Economía.",
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
      descripcion: "Despachos de gas oil a la Provincia de Catamarca. Fuente: Ministerio de Economía.",
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
      unidad: "millones de pesos de febrero 2026",
      archivo: "ingresostribnac.csv",
      tipo: "linea",
      kpi: true,
      formato: (v) => Number(v).toLocaleString('es-AR', { maximumFractionDigits: 2 }),
      periodo: "mes",
      descripcion: "Ingresos tributarios de origen nacional por coparticipaciòn y leyes especiales deflactados por IPC NOA. Fuentes: Ministerio de Economía e INDEC.",
    },
    {
      id: "variable5",
      seccion: "finanzas",
      nombre: "Ingresos corrientes del gobierno provincial a precios constantes",
      unidad: "millones de pesos de febrero 2026",
      archivo: "ingcorrientes.csv",
      tipo: "linea",
      kpi: true,
      formato: (v) => Number(v).toLocaleString('es-AR', { maximumFractionDigits: 2 }),
      periodo: "mes",
      descripcion: "Ingresos corrientes del gobierno provincial deflactados por IPC NOA. Fuentes: Contaduría General de la Provincia e INDEC.",
    },
    {
      id: "variable6",
      seccion: "finanzas",
      nombre: "Gastos corrientes del gobierno provincial a precios constantes",
      unidad: "millones de pesos de febrero 2026",
      archivo: "gtoscorrientes.csv",
      tipo: "area",
      kpi: true,
      formato: (v) => Number(v).toLocaleString('es-AR', { maximumFractionDigits: 2 }),
      periodo: "mes",
      descripcion: "Gastos corrientes del gobierno provincial deflactados por IPC NOA. Fuentes: Contaduría General de la Provincia e INDEC..",
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
      id: "variable7",
      seccion: "cotizaciones",
      nombre: "Cotización del cobre refinado",
      unidad: "dólares por tonelada",
      archivo: "cobre.csv",
      tipo: "linea",
      kpi: true,
      formato: (v) => Number(v).toLocaleString('es-AR', { maximumFractionDigits: 2 }),
      periodo: "mes",
      descripcion: "Cotización promedio mensual del cátodo de cobre grado A. Fuente: Westmetall.",
    },
    {
      id: "variable8",
      seccion: "cotizaciones",
      nombre: "Variable 8",
      unidad: "unidad",
      archivo: "variable8.csv",
      tipo: "barra",
      kpi: true,
      formato: (v) => Number(v).toLocaleString('es-AR', { maximumFractionDigits: 2 }),
      periodo: "mes",
      descripcion: "Descripción de la variable 8.",
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
