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
    // Consulta REAL contra una tabla existente (contenidos).
    // Esto SÍ cuenta como "actividad de base de datos" para Supabase,
    // a diferencia de pegarle solo a /rest/v1/ (raíz) o /auth/v1/health,
    // que no tocan ninguna tabla y no evitan la pausa por inactividad.
    const pingRes = await fetch(`${url}/rest/v1/contenidos?select=id&limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
      },
    });

    const timestamp = new Date().toISOString();
    const bodyText = await pingRes.text();
    console.log(`[ping-supabase] ${timestamp} - status: ${pingRes.status} - body: ${bodyText.slice(0, 200)}`);

    if (!pingRes.ok) {
      return res.status(pingRes.status).json({
        ok: false,
        status: pingRes.status,
        error: bodyText.slice(0, 300),
        timestamp,
      });
    }

    res.status(200).json({
      ok: true,
      status: pingRes.status,
      timestamp,
    });
  } catch (err) {
    console.error(`[ping-supabase] Error: ${err.message}`);
    res.status(500).json({ ok: false, error: err.message });
  }
}
