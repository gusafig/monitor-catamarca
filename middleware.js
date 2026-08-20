// ============================================================
//  MIDDLEWARE — Vistas previas dinámicas (WhatsApp / LinkedIn / X)
// ------------------------------------------------------------
//  Cuando un bot de red social (WhatsApp, Facebook, LinkedIn, X,
//  Telegram, Slack, Discord) pide /contenidos/:id o /monitor/:id,
//  le devolvemos un HTML mínimo con el título, imagen y
//  descripción de ESA nota/indicador puntual, en vez de los
//  metadatos genéricos de siempre.
//
//  A los usuarios reales (navegador normal) no los toca: siguen
//  recibiendo la app de React de siempre.
//
//  No requiere Next.js ni configuración extra en vercel.json:
//  Vercel detecta este archivo en la raíz automáticamente.
// ============================================================

import { CONFIG } from "./src/data/config.js";

export const config = {
  matcher: ["/contenidos/:id*", "/monitor/:id*"],
};

const SUPABASE_URL = "https://qhrmnzsuhuejvqtoemwz.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFocm1uenN1aHVlanZxdG9lbXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjU5MDYsImV4cCI6MjA4OTk0MTkwNn0.ArQLf2kiQ4Mj1NH3chmZRt2QCM77LtUyPcvGY7F33ZQ";

const DEFAULT_TITLE = "Monitor Catamarca · Indicadores económicos en tiempo real";
const DEFAULT_DESC =
  "Seguimiento sistemático de variables económicas de la provincia de Catamarca: patentamiento, finanzas públicas, cotizaciones y más.";
const DEFAULT_IMAGE = "https://synergiaconsultores.vercel.app/og-image.png";
const SITE_NAME = "Synergia Consultores";

// User-agents de bots que generan la vista previa de un link.
// (Los usuarios reales nunca mandan estos user-agents.)
const BOT_UA =
  /facebookexternalhit|WhatsApp|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot|Pinterest|redditbot|Googlebot|bingbot|SkypeUriPreview/i;

function esc(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHtml({ title, description, image, url, type = "website" }) {
  return `<!DOCTYPE html>
<html lang="es-AR">
<head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<meta property="og:type" content="${esc(type)}" />
<meta property="og:url" content="${esc(url)}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:image" content="${esc(image)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="${esc(SITE_NAME)}" />
<meta property="og:locale" content="es_AR" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${esc(image)}" />
</head>
<body>
<h1>${esc(title)}</h1>
<p>${esc(description)}</p>
<p><a href="${esc(url)}">Ver en Monitor Catamarca</a></p>
</body>
</html>`;
}

async function getContenido(id) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/contenidos?id=eq.${encodeURIComponent(
      id
    )}&select=titulo,bajada,imagen_articulo,imagen`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return rows && rows[0] ? rows[0] : null;
}

function getIndicador(id) {
  return (CONFIG.indicadores || []).find((i) => i.id === id) || null;
}

export default async function middleware(request) {
  const ua = request.headers.get("user-agent") || "";
  if (!BOT_UA.test(ua)) {
    // Usuario real: no tocamos nada, sigue el flujo normal (SPA).
    return;
  }

  const url = new URL(request.url);
  const path = url.pathname;

  let title = DEFAULT_TITLE;
  let description = DEFAULT_DESC;
  let image = DEFAULT_IMAGE;
  let type = "website";

  const contMatch = path.match(/^\/contenidos\/([^/]+)/);
  const monMatch = path.match(/^\/monitor\/([^/]+)/);

  try {
    if (contMatch) {
      const item = await getContenido(contMatch[1]);
      if (item) {
        title = `${item.titulo} · Monitor Catamarca`;
        description = item.bajada || description;
        image = item.imagen_articulo || item.imagen || image;
        type = "article";
      }
    } else if (monMatch) {
      const ind = getIndicador(monMatch[1]);
      if (ind) {
        title = `${ind.nombre} · Monitor Catamarca`;
        description = `Evolución de "${ind.nombre}" (${
          ind.unidad || "indicador económico"
        }) en la provincia de Catamarca. Datos actualizados mensualmente.`;
      }
    }
  } catch (e) {
    // Si falla la consulta, se sirven los metadatos genéricos por defecto.
  }

  return new Response(renderHtml({ title, description, image, url: url.href, type }), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
