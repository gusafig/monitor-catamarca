// ============================================================
//  MONITOR CATAMARCA — CONFIGURACIÓN DE INDICADORES
//  Editá este archivo para agregar/quitar variables.
//  Cada indicador apunta a un CSV en /public/data/
// ============================================================

export const CONFIG = {
  titulo: "Catamarca en datos",
  subtitulo: "Monitor de indicadores provinciales",
  fuente: "Fuente: completar con fuentes oficiales",
  actualizacion: "2025",

  // ----------------------------------------------------------
  //  SECCIONES (tabs)
  //  Cada sección agrupa indicadores relacionados.
  // ----------------------------------------------------------
  secciones: [
    {
      id: "economia",
      label: "Economía",
      color: "#1D9E75",
    },
    {
      id: "mineria",
      label: "Minería",
      color: "#378ADD",
    },
    {
      id: "social",
      label: "Social",
      color: "#EF9F27",
    },
  ],

  // ----------------------------------------------------------
  //  INDICADORES
  //  - seccion: debe coincidir con un id de secciones[]
  //  - archivo: nombre del CSV dentro de /public/data/
  //  - tipo: "linea" | "barra" | "area" | "dona"
  //  - kpi: true → aparece en las tarjetas de resumen
  //  - formato: función de JS para mostrar el valor del KPI
  //  - descripcion: tooltip explicativo (opcional)
  // ----------------------------------------------------------
  indicadores: [
    // ── ECONOMÍA ─────────────────────────────────────────────
    {
      id: "pbg",
      seccion: "economia",
      nombre: "Producto Bruto Geográfico",
      unidad: "mill. $",
      archivo: "pbg.csv",               // columnas: año, valor
      tipo: "area",
      kpi: true,
      formato: (v) => `${(v / 1000).toFixed(1)}B`,
      descripcion: "PBG a precios corrientes, en millones de pesos.",
    },
    {
      id: "exportaciones",
      seccion: "economia",
      nombre: "Exportaciones",
      unidad: "M USD",
      archivo: "exportaciones.csv",     // columnas: año, mineria, agro, otros
      tipo: "barra_apilada",
      kpi: true,
      formato: (v) => `${v.toLocaleString("es-AR")}`,
      descripcion: "Exportaciones provinciales por rubro, en millones de USD.",
    },
    {
      id: "coparticipacion",
      seccion: "economia",
      nombre: "Coparticipación recibida",
      unidad: "mill. $",
      archivo: "coparticipacion.csv",   // columnas: periodo, valor
      tipo: "linea",
      kpi: false,
      formato: (v) => `${v}`,
      descripcion: "Transferencias de coparticipación federal recibidas.",
    },
    {
      id: "inflacion",
      seccion: "economia",
      nombre: "Inflación provincial",
      unidad: "%",
      archivo: "inflacion.csv",         // columnas: periodo, valor
      tipo: "barra",
      kpi: true,
      formato: (v) => `${v}%`,
      descripcion: "Variación del IPC local (si disponible) o referencia nacional.",
    },

    // ── MINERÍA ──────────────────────────────────────────────
    {
      id: "litio",
      seccion: "mineria",
      nombre: "Producción de litio",
      unidad: "toneladas",
      archivo: "litio.csv",             // columnas: año, valor
      tipo: "barra",
      kpi: true,
      formato: (v) => `${(v / 1000).toFixed(1)}k t`,
      descripcion: "Producción anual de carbonato de litio equivalente.",
    },
    {
      id: "cobre",
      seccion: "mineria",
      nombre: "Producción de cobre",
      unidad: "toneladas",
      archivo: "cobre.csv",             // columnas: año, valor
      tipo: "barra",
      kpi: true,
      formato: (v) => `${(v / 1000).toFixed(0)}k t`,
      descripcion: "Producción anual de cobre fino.",
    },
    {
      id: "inversion_minera",
      seccion: "mineria",
      nombre: "Inversión minera",
      unidad: "M USD",
      archivo: "inversion_minera.csv",  // columnas: año, valor
      tipo: "area",
      kpi: true,
      formato: (v) => `$${v}M`,
      descripcion: "Inversión declarada en proyectos mineros.",
    },

    // ── SOCIAL ───────────────────────────────────────────────
    {
      id: "desempleo",
      seccion: "social",
      nombre: "Tasa de desocupación",
      unidad: "%",
      archivo: "desempleo.csv",         // columnas: periodo, valor
      tipo: "linea",
      kpi: true,
      formato: (v) => `${v}%`,
      descripcion: "Tasa de desocupación abierta (EPH, GBA de referencia o dato provincial).",
    },
    {
      id: "salario",
      seccion: "social",
      nombre: "Salario promedio",
      unidad: "$",
      archivo: "salario.csv",           // columnas: periodo, nominal, real
      tipo: "linea_doble",
      kpi: true,
      formato: (v) => `$${(v / 1000).toFixed(0)}k`,
      descripcion: "Salario promedio nominal y real (deflactado por IPC).",
    },
  ],
};

// ----------------------------------------------------------
//  COLORES POR SECCIÓN  (se usan en gráficos y KPI cards)
// ----------------------------------------------------------
export const COLORES = {
  economia: {
    primario: "#1D9E75",
    secundario: "#9FE1CB",
    fondo: "rgba(29,158,117,0.08)",
  },
  mineria: {
    primario: "#378ADD",
    secundario: "#85B7EB",
    fondo: "rgba(55,138,221,0.08)",
  },
  social: {
    primario: "#EF9F27",
    secundario: "#FAC775",
    fondo: "rgba(239,159,39,0.08)",
  },
};
