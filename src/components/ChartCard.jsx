const COLUMNAS_X = ["periodo", "año", "date", "fecha", "trimestre", "mes"];
const primeraFila = data[0] || {};
const xKey =
  COLUMNAS_X.find((k) => k in primeraFila) ||
  Object.keys(primeraFila).find((k) => k !== "valor") ||
  "periodo";
