// ============================================================================
// GuionVisual — Servidor
// ----------------------------------------------------------------------------
// Sirve la app web estática y hace de proxy a la API de Pexels para que la
// clave nunca salga al navegador. Si no hay clave configurada, el frontend
// entra en "modo demo" con placeholders locales.
// ============================================================================

import express from 'express';
import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;
const PEXELS_KEY = (process.env.PEXELS_API_KEY || '').trim();

app.use(express.static(path.join(__dirname, 'public')));
// El frontend importa el motor como módulo ESM.
app.use('/src', express.static(path.join(__dirname, 'src')));

// Le dice al frontend si hay clave (modo real) o no (modo demo).
app.get('/api/config', (_req, res) => {
  res.json({ hasKey: Boolean(PEXELS_KEY) });
});

// Proxy de búsqueda de stock (fotos o vídeos) hacia Pexels.
app.get('/api/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  const perPage = Math.min(Math.max(Number(req.query.perPage) || 8, 1), 30);
  const type = req.query.type === 'video' ? 'video' : 'photo';

  if (!q) return res.status(400).json({ error: 'missing_query' });
  if (!PEXELS_KEY) return res.status(503).json({ error: 'no_api_key' });

  const url =
    type === 'video'
      ? `https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&per_page=${perPage}&orientation=landscape`
      : `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=${perPage}&orientation=landscape`;

  try {
    const r = await fetch(url, { headers: { Authorization: PEXELS_KEY } });
    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      return res.status(r.status).json({ error: 'pexels_error', status: r.status, detail });
    }
    const data = await r.json();
    const results =
      type === 'video'
        ? (data.videos || []).map((v) => ({
            id: v.id,
            thumb: v.image,
            full: pickVideoFile(v.video_files),
            url: v.url,
            author: v.user?.name || 'Pexels',
            type: 'video',
          }))
        : (data.photos || []).map((p) => ({
            id: p.id,
            thumb: p.src?.medium,
            full: p.src?.large2x || p.src?.large,
            url: p.url,
            author: p.photographer || 'Pexels',
            type: 'photo',
          }));
    res.json({ results });
  } catch (err) {
    res.status(502).json({ error: 'fetch_failed', detail: String(err) });
  }
});

function pickVideoFile(files = []) {
  const hd = files.find((f) => f.quality === 'hd');
  const sd = files.find((f) => f.quality === 'sd');
  return (hd || sd || files[0])?.link || null;
}

app.listen(PORT, () => {
  console.log(`\n  GuionVisual → http://localhost:${PORT}`);
  console.log(`  Modo: ${PEXELS_KEY ? 'stock real (Pexels)' : 'DEMO (sin clave — placeholders locales)'}\n`);
});
