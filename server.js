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

// --- Generación con IA (opcional, apagada por defecto) ---
const AI_PROVIDER = (process.env.AI_PROVIDER || '').trim().toLowerCase();
const REPLICATE_TOKEN = (process.env.REPLICATE_API_TOKEN || '').trim();
const OPENAI_KEY = (process.env.OPENAI_API_KEY || '').trim();

function aiConfigured() {
  if (AI_PROVIDER === 'replicate') return Boolean(REPLICATE_TOKEN);
  if (AI_PROVIDER === 'openai') return Boolean(OPENAI_KEY);
  return false;
}

app.use(express.static(path.join(__dirname, 'public')));
// El frontend importa el motor como módulo ESM.
app.use('/src', express.static(path.join(__dirname, 'src')));

// Le dice al frontend qué fuentes están disponibles.
app.get('/api/config', (_req, res) => {
  res.json({
    hasKey: Boolean(PEXELS_KEY),
    hasAI: aiConfigured(),
    aiProvider: aiConfigured() ? AI_PROVIDER : null,
  });
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

// Generación con IA por imagen. Solo responde si hay un proveedor con clave;
// si no, devuelve 503 y el frontend explica cómo activarlo.
app.get('/api/generate', async (req, res) => {
  const prompt = String(req.query.prompt || '').trim();
  if (!prompt) return res.status(400).json({ error: 'missing_prompt' });
  if (!aiConfigured()) return res.status(503).json({ error: 'no_ai_key' });

  try {
    const image =
      AI_PROVIDER === 'replicate'
        ? await generateReplicate(prompt)
        : await generateOpenAI(prompt);
    res.json({ image });
  } catch (err) {
    res.status(502).json({ error: 'ai_failed', detail: String(err) });
  }
});

// Replicate — Flux Schnell (barato, ~$0.003/imagen). "Prefer: wait" hace que
// la petición espere el resultado en vez de tener que hacer polling.
async function generateReplicate(prompt) {
  const r = await fetch(
    'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
        Prefer: 'wait',
      },
      body: JSON.stringify({
        input: { prompt, aspect_ratio: '16:9', output_format: 'webp' },
      }),
    }
  );
  if (!r.ok) throw new Error(`replicate ${r.status}: ${await r.text().catch(() => '')}`);
  const data = await r.json();
  const out = Array.isArray(data.output) ? data.output[0] : data.output;
  if (!out) throw new Error('replicate: respuesta sin imagen');
  return { thumb: out, full: out, url: out, author: 'Flux Schnell (IA)', type: 'ai' };
}

// OpenAI — DALL·E 3. Devuelve una URL directa a la imagen.
async function generateOpenAI(prompt) {
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size: '1792x1024' }),
  });
  if (!r.ok) throw new Error(`openai ${r.status}: ${await r.text().catch(() => '')}`);
  const data = await r.json();
  const item = data.data?.[0];
  const src = item?.url || (item?.b64_json ? `data:image/png;base64,${item.b64_json}` : null);
  if (!src) throw new Error('openai: respuesta sin imagen');
  return { thumb: src, full: src, url: src, author: 'DALL·E 3 (IA)', type: 'ai' };
}

app.listen(PORT, () => {
  console.log(`\n  GuionVisual → http://localhost:${PORT}`);
  console.log(`  Stock: ${PEXELS_KEY ? 'Pexels (real)' : 'DEMO (placeholders locales)'}`);
  console.log(`  IA:    ${aiConfigured() ? `activa (${AI_PROVIDER})` : 'desactivada'}\n`);
});
