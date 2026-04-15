/**
 * Vercel Edge Function — Proxy para la API cambiaria del BCRA
 * Ruta: /api/bcra-cambiaria/[moneda]
 *
 * Ejemplo de uso desde el frontend:
 *   GET /api/bcra-cambiaria/USD?fechadesde=2024-01-01&fechahasta=2025-04-14&limit=1000
 *
 * Por qué existe este proxy:
 *   La API https://api.bcra.gob.ar/estadisticascambiarias/v1.0 no envía
 *   headers CORS, por lo que el navegador bloquea las llamadas directas.
 *   Esta función corre en el servidor de Vercel y retransmite la respuesta
 *   agregando los headers necesarios.
 */

export const config = {
  runtime: "edge",
};

const BCRA_CAMBIARIAS_BASE =
  "https://api.bcra.gob.ar/estadisticascambiarias/v1.0/Cotizaciones";

export default async function handler(req) {
  const url = new URL(req.url);

  // Extraer el código de moneda del path: /api/bcra-cambiaria/USD → "USD"
  const pathParts = url.pathname.split("/");
  const moneda = pathParts[pathParts.length - 1]?.toUpperCase();

  if (!moneda) {
    return new Response(JSON.stringify({ error: "Moneda no especificada" }), {
      status: 400,
      headers: corsHeaders("application/json"),
    });
  }

  // Reenviar los query params tal como vienen (fechadesde, fechahasta, limit)
  const params = url.searchParams.toString();
  const bcraUrl = `${BCRA_CAMBIARIAS_BASE}/${moneda}${params ? "?" + params : ""}`;

  try {
    const bcraRes = await fetch(bcraUrl, {
      headers: {
        Accept: "application/json",
        // El BCRA a veces requiere un User-Agent de navegador
        "User-Agent":
          "Mozilla/5.0 (compatible; MonitorCatamarca/1.0; +https://synergiaconsultores.vercel.app)",
      },
    });

    if (!bcraRes.ok) {
      return new Response(
        JSON.stringify({ error: `BCRA respondió HTTP ${bcraRes.status}` }),
        { status: bcraRes.status, headers: corsHeaders("application/json") }
      );
    }

    const data = await bcraRes.text();

    return new Response(data, {
      status: 200,
      headers: corsHeaders("application/json"),
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Error al contactar la API del BCRA", detail: err.message }),
      { status: 502, headers: corsHeaders("application/json") }
    );
  }
}

function corsHeaders(contentType) {
  return {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    // Cache de 15 minutos — los tipos de cambio no cambian al segundo
    "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
  };
}
