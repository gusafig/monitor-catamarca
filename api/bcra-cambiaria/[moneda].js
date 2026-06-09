/**
 * Vercel Edge Function — Proxy para la API cambiaria del BCRA
 * Ruta: /api/bcra-cambiaria/[moneda]
 */

export const config = {
  runtime: "edge",
};

const BCRA_CAMBIARIAS_BASE =
  "https://api.bcra.gob.ar/estadisticascambiarias/v1.0/Cotizaciones";

export default async function handler(req) {
  const url = new URL(req.url);

  // Manejar preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const pathParts = url.pathname.split("/");
  const moneda = pathParts[pathParts.length - 1]?.toUpperCase();

  if (!moneda) {
    return new Response(JSON.stringify({ error: "Moneda no especificada" }), {
      status: 400,
      headers: corsHeaders(),
    });
  }

  const params = url.searchParams.toString();
  const bcraUrl = `${BCRA_CAMBIARIAS_BASE}/${moneda}${params ? "?" + params : ""}`;

  try {
    const bcraRes = await fetch(bcraUrl, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "es-AR,es;q=0.9",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://www.bcra.gob.ar/",
        Origin: "https://www.bcra.gob.ar",
      },
    });

    const rawText = await bcraRes.text();

    // Si el BCRA no devolvió 200, retornar info de diagnóstico
    if (!bcraRes.ok) {
      return new Response(
        JSON.stringify({
          error: `BCRA respondió HTTP ${bcraRes.status}`,
          bcraUrl,
          body: rawText.slice(0, 500),
        }),
        { status: bcraRes.status, headers: corsHeaders() }
      );
    }

    // Verificar que sea JSON válido antes de retornar
    try {
      JSON.parse(rawText);
    } catch {
      return new Response(
        JSON.stringify({
          error: "La API del BCRA no devolvió JSON válido",
          bcraStatus: bcraRes.status,
          bcraUrl,
          rawPreview: rawText.slice(0, 500),
        }),
        { status: 502, headers: corsHeaders() }
      );
    }

    return new Response(rawText, {
      status: 200,
      headers: {
        ...corsHeaders(),
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Error al contactar la API del BCRA",
        detail: err.message,
        bcraUrl,
      }),
      { status: 502, headers: corsHeaders() }
    );
  }
}

function corsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
