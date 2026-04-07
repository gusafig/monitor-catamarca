export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;

  if (!url || !key) {
    return res.status(500).json({ ok: false, error: "Faltan variables de entorno SUPABASE_URL o SUPABASE_KEY" });
  }

  try {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    console.log(`[ping-supabase] ${new Date().toISOString()} - status: ${response.status}`);
    res.status(200).json({ ok: true, status: response.status, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error(`[ping-supabase] Error: ${err.message}`);
    res.status(500).json({ ok: false, error: err.message });
  }
}
