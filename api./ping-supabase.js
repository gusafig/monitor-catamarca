export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;

  if (!url || !key) {
    return res.status(500).json({
      ok: false,
      error: "Faltan variables de entorno SUPABASE_URL o SUPABASE_KEY",
    });
  }

  try {
    // Endpoint oficial de health check de Supabase (siempre disponible, no requiere tablas)
    const healthRes = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
      },
    });

    // Segundo ping al endpoint de autenticación para generar actividad adicional
    await fetch(`${url}/auth/v1/health`, {
      headers: {
        apikey: key,
      },
    });

    const timestamp = new Date().toISOString();
    console.log(`[ping-supabase] ${timestamp} - status: ${healthRes.status}`);

    res.status(200).json({
      ok: true,
      status: healthRes.status,
      timestamp,
    });
  } catch (err) {
    console.error(`[ping-supabase] Error: ${err.message}`);
    res.status(500).json({ ok: false, error: err.message });
  }
}
