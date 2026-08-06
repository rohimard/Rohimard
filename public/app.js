// ============================================================================
// GuionVisual — Frontend
// ----------------------------------------------------------------------------
// Une el motor de interpretación (scriptParser) con la búsqueda de stock y
// pinta el storyboard editable.
// ============================================================================

import { analyzeScript, formatTime, buildQuery } from '/src/scriptParser.js';

const EXAMPLE = `El universo tiene 13.800 millones de años. Pero durante casi todo ese tiempo... no hubo nadie para contarlo.

Entonces, en un rincón cualquiera de una galaxia cualquiera, apareció algo nuevo: la curiosidad.

Los primeros humanos miraron al cielo. No entendían las estrellas, pero sabían que significaban algo. Contaban historias, dibujaban en cuevas, señalaban la Luna.

Y esa pequeña chispa lo cambió todo. Porque una especie que se pregunta "¿por qué?"... ya no puede detenerse.`;

// Estado en memoria: cada slot recuerda los resultados de búsqueda y cuál está elegido.
let boardState = [];
let hasKey = false;
let mediaType = 'photo';

const $ = (id) => document.getElementById(id);
const scriptEl = $('script');
const boardEl = $('board');
const statsEl = $('stats');

init();

async function init() {
  try {
    const cfg = await fetch('/api/config').then((r) => r.json());
    hasKey = Boolean(cfg.hasKey);
  } catch {
    hasKey = false;
  }
  const badge = $('mode-badge');
  if (hasKey) {
    badge.textContent = '● Stock real (Pexels)';
    badge.classList.add('live');
  } else {
    badge.textContent = '● Modo demo (placeholders)';
    badge.classList.add('demo');
  }

  $('analyze').addEventListener('click', run);
  $('load-example').addEventListener('click', () => {
    scriptEl.value = EXAMPLE;
    run();
  });
  $('export-json').addEventListener('click', exportJSON);
  $('export-csv').addEventListener('click', exportCSV);
}

async function run() {
  const text = scriptEl.value.trim();
  if (!text) {
    boardEl.innerHTML = '<p class="empty">Escribe o pega un guión primero.</p>';
    return;
  }
  mediaType = $('mediaType').value;
  const wpm = Number($('wpm').value) || 150;
  const maxSecondsPerImage = Number($('maxSec').value) || 3.5;

  const analysis = analyzeScript(text, { wpm, maxSecondsPerImage });

  boardState = analysis.slots.map((slot) => ({
    ...slot,
    results: [],
    chosen: 0,
    loading: true,
  }));

  renderStats(analysis);
  renderBoard();
  $('export-actions').hidden = boardState.length === 0;

  // Buscar imágenes para cada query (con caché por query para no repetir).
  await fetchAllImages();
}

// ---------------------------------------------------------------------------
// Búsqueda de stock
// ---------------------------------------------------------------------------

async function fetchAllImages() {
  const cache = new Map();
  await Promise.all(
    boardState.map(async (slot) => {
      const key = `${mediaType}:${slot.query}`;
      let results = cache.get(key);
      if (!results) {
        results = await searchStock(slot.query);
        cache.set(key, results);
      }
      slot.results = results;
      slot.loading = false;
      updateCardThumb(slot.index);
    })
  );
}

async function searchStock(query) {
  if (!hasKey) return []; // modo demo: se usa placeholder
  try {
    const url = `/api/search?q=${encodeURIComponent(query)}&type=${mediaType}&perPage=8`;
    const data = await fetch(url).then((r) => r.json());
    return Array.isArray(data.results) ? data.results.filter((r) => r.thumb) : [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

function renderStats(a) {
  statsEl.hidden = false;
  statsEl.innerHTML = `
    <span><b>${a.imageCount}</b> imágenes</span>
    <span><b>${a.sentenceCount}</b> frases</span>
    <span><b>${a.wordCount}</b> palabras</span>
    <span>Duración total <b>${formatTime(a.totalDuration)}</b></span>
    <span>Ritmo <b>${(a.imageCount / Math.max(a.totalDuration / 60, 0.01)).toFixed(1)}</b> img/min</span>
  `;
}

function renderBoard() {
  if (!boardState.length) {
    boardEl.innerHTML = '<p class="empty">No se detectó texto analizable.</p>';
    return;
  }
  boardEl.innerHTML = '';
  for (const slot of boardState) boardEl.appendChild(renderCard(slot));
}

function renderCard(slot) {
  const card = document.createElement('article');
  card.className = `card pt-${slot.pauseType}`;
  card.dataset.index = slot.index;

  const pauseLabel = { ellipsis: 'suspensivos', period: 'punto', flow: 'continúa' }[slot.pauseType] || '';

  card.innerHTML = `
    <div class="thumb" id="thumb-${slot.index}">
      <span class="idx">${slot.index + 1}</span>
      <span class="loading">buscando…</span>
    </div>
    <div class="card-body">
      <div class="card-times">
        <span>⏱ ${formatTime(slot.start)} → ${formatTime(slot.end)}</span>
        <span class="dur">dur <input type="number" min="0.3" step="0.1" value="${slot.duration}" data-dur /> s</span>
        <span class="pause-tag ${slot.pauseType}">${pauseLabel}</span>
      </div>
      <div class="card-text">${escapeHtml(slot.text)}</div>
      <div class="card-query">
        <span class="kw">🔎</span>
        <input type="text" value="${escapeHtml(slot.query)}" data-query />
        <button class="mini" data-research>Buscar</button>
        <button class="mini" data-next>Otra</button>
      </div>
      <div class="credit" id="credit-${slot.index}"></div>
    </div>
  `;

  // Editar duración → recalcular los tiempos de todos los slots siguientes.
  card.querySelector('[data-dur]').addEventListener('change', (e) => {
    const v = Math.max(0.3, Number(e.target.value) || slot.duration);
    slot.duration = Math.round(v * 100) / 100;
    recomputeTimes();
    renderBoard();
    reattachThumbs();
  });

  // Reeditar la query y volver a buscar.
  card.querySelector('[data-query]').addEventListener('input', (e) => {
    slot.query = e.target.value;
  });
  card.querySelector('[data-research]').addEventListener('click', async () => {
    slot.results = await searchStock(slot.query);
    slot.chosen = 0;
    updateCardThumb(slot.index);
  });

  // Pasar al siguiente resultado de stock.
  card.querySelector('[data-next]').addEventListener('click', () => {
    if (slot.results.length) {
      slot.chosen = (slot.chosen + 1) % slot.results.length;
      updateCardThumb(slot.index);
    }
  });

  return card;
}

function updateCardThumb(index) {
  const slot = boardState[index];
  const el = $(`thumb-${index}`);
  if (!el) return;
  const idxTag = `<span class="idx">${index + 1}</span>`;

  if (slot.loading) {
    el.innerHTML = `${idxTag}<span class="loading">buscando…</span>`;
    return;
  }

  const chosen = slot.results[slot.chosen];
  const creditEl = $(`credit-${index}`);

  if (chosen) {
    if (chosen.type === 'video') {
      el.innerHTML = `${idxTag}<video src="${chosen.full}" poster="${chosen.thumb}" muted loop playsinline onmouseover="this.play()" onmouseout="this.pause()"></video>`;
    } else {
      el.innerHTML = `${idxTag}<img src="${chosen.thumb}" alt="${escapeHtml(slot.query)}" loading="lazy" />`;
    }
    if (creditEl) {
      creditEl.innerHTML = `Foto: <a href="${chosen.url}" target="_blank" rel="noopener">${escapeHtml(chosen.author)}</a> · Pexels`;
    }
  } else {
    // Modo demo o sin resultados: placeholder generado localmente.
    el.innerHTML = `${idxTag}${placeholderSVG(slot.query)}`;
    if (creditEl) creditEl.textContent = hasKey ? 'Sin resultados para esta búsqueda' : 'Placeholder (modo demo)';
  }
}

function reattachThumbs() {
  for (const slot of boardState) updateCardThumb(slot.index);
}

// Recalcula start/end en cadena tras editar una duración.
function recomputeTimes() {
  let clock = 0;
  for (const slot of boardState) {
    slot.start = Math.round(clock * 100) / 100;
    clock += slot.duration;
    slot.end = Math.round(clock * 100) / 100;
  }
}

// ---------------------------------------------------------------------------
// Placeholder SVG (modo demo, siempre funciona sin red)
// ---------------------------------------------------------------------------

function placeholderSVG(query) {
  const hue = hashHue(query);
  const label = escapeHtml(query.slice(0, 24));
  return `
    <svg viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g${hue}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="hsl(${hue} 55% 32%)" />
          <stop offset="1" stop-color="hsl(${(hue + 40) % 360} 55% 20%)" />
        </linearGradient>
      </defs>
      <rect width="160" height="90" fill="url(#g${hue})" />
      <text x="80" y="50" fill="rgba(255,255,255,.85)" font-size="9"
        font-family="sans-serif" text-anchor="middle">${label}</text>
    </svg>`;
}

function hashHue(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
  return h;
}

// ---------------------------------------------------------------------------
// Exportar
// ---------------------------------------------------------------------------

function exportJSON() {
  const data = boardState.map((s) => ({
    index: s.index + 1,
    start: s.start,
    end: s.end,
    duration: s.duration,
    text: s.text,
    query: s.query,
    keywords: s.keywords,
    pause: s.pauseType,
    image: s.results[s.chosen]
      ? { url: s.results[s.chosen].full, source: s.results[s.chosen].url, author: s.results[s.chosen].author }
      : null,
  }));
  download('storyboard.json', JSON.stringify(data, null, 2), 'application/json');
}

function exportCSV() {
  const rows = [['n', 'inicio', 'fin', 'duracion', 'texto', 'query', 'imagen_url', 'fuente']];
  for (const s of boardState) {
    const img = s.results[s.chosen];
    rows.push([
      s.index + 1,
      formatTime(s.start),
      formatTime(s.end),
      s.duration,
      s.text,
      s.query,
      img?.full || '',
      img?.url || '',
    ]);
  }
  const csv = rows.map((r) => r.map(csvCell).join(',')).join('\n');
  download('storyboard.csv', csv, 'text/csv');
}

function csvCell(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function download(name, content, mime) {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ---------------------------------------------------------------------------
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
