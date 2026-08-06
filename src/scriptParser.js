// ============================================================================
// GuionVisual — Motor de interpretación de guiones
// ----------------------------------------------------------------------------
// Toma el texto de un guión narrado y lo convierte en una lista de "slots" de
// imágenes con tiempos. La idea:
//
//   1. Segmentar el guión por frases, usando los signos de puntuación como
//      marcas de pausa (. ! ? … ; : , y saltos de línea).
//   2. Estimar la duración de cada frase según la velocidad de narración
//      (palabras por minuto) + el tiempo extra que añaden las pausas.
//   3. Para mantener la RETENCIÓN, dividir las frases largas en varias
//      imágenes, de forma que ninguna imagen se quede en pantalla demasiado
//      tiempo (maxSecondsPerImage). Los cortes intentan caer en las comas.
//   4. Extraer palabras clave de cada trozo para poder buscar la imagen de
//      stock que corresponde.
//
// Este módulo es ESM puro y no depende del navegador ni de Node, así que se
// usa tal cual en el frontend y en los tests.
// ============================================================================

export const DEFAULTS = {
  // Velocidad de narración en palabras por minuto. Una locución tranquila en
  // español ronda las 140-160 wpm.
  wpm: 150,
  // Ninguna imagen debería quedarse más de este tiempo en pantalla.
  maxSecondsPerImage: 3.5,
  // Ni menos de esto (evita cortes epilépticos).
  minSecondsPerImage: 1.2,
  // Segundos extra que añade cada signo de puntuación (silencios de la
  // locución que NO son palabras pero sí ocupan tiempo).
  pause: {
    comma: 0.25,
    semicolon: 0.4,
    colon: 0.4,
    period: 0.5,
    ellipsis: 1.2, // los puntos suspensivos crean un silencio dramático largo
    paragraph: 0.8, // cambio de escena / respiración entre líneas
  },
};

// Palabras vacías (stopwords) en español e inglés. Se descartan al buscar
// keywords porque no aportan nada visual.
const STOPWORDS = new Set([
  // Español
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'lo', 'al', 'del',
  'y', 'e', 'o', 'u', 'ni', 'que', 'qué', 'como', 'cómo', 'cuando', 'cuándo',
  'donde', 'dónde', 'quien', 'quién', 'cual', 'cuál', 'cuales', 'porque',
  'pero', 'sino', 'aunque', 'si', 'sí', 'no', 'ya', 'muy', 'más', 'mas',
  'menos', 'tan', 'tanto', 'poco', 'mucho', 'algo', 'nada', 'todo', 'todos',
  'toda', 'todas', 'otro', 'otra', 'otros', 'otras', 'mismo', 'misma',
  'de', 'en', 'a', 'ante', 'bajo', 'con', 'contra', 'desde', 'entre', 'hacia',
  'hasta', 'para', 'por', 'según', 'sin', 'sobre', 'tras', 'durante',
  'mediante', 'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas',
  'aquel', 'aquella', 'esto', 'eso', 'aquello', 'mi', 'mis', 'tu', 'tus', 'su',
  'sus', 'nuestro', 'nuestra', 'vuestro', 'me', 'te', 'se', 'nos', 'os', 'le',
  'les', 'yo', 'tú', 'él', 'ella', 'ellos', 'ellas', 'nosotros', 'vosotros',
  'usted', 'ustedes', 'es', 'son', 'era', 'eran', 'fue', 'fueron', 'ser',
  'estar', 'está', 'están', 'estaba', 'hay', 'ha', 'han', 'he', 'has', 'había',
  'hacer', 'hace', 'hacen', 'puede', 'pueden', 'debe', 'deben', 'va', 'van',
  'ir', 'este', 'esa', 'les', 'les', 'nuestros', 'nuestras', 'les',
  // Inglés
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'else', 'of', 'to',
  'in', 'on', 'at', 'by', 'for', 'with', 'about', 'as', 'is', 'are', 'was',
  'were', 'be', 'been', 'being', 'this', 'that', 'these', 'those', 'it', 'its',
  'he', 'she', 'they', 'we', 'you', 'i', 'me', 'my', 'your', 'his', 'her',
  'their', 'our', 'not', 'no', 'yes', 'so', 'than', 'too', 'very', 'can',
  'will', 'just', 'from', 'up', 'down', 'out', 'off', 'over', 'under',
]);

const FALLBACK_QUERY = 'fondo cinematográfico abstracto';

// ---------------------------------------------------------------------------
// Utilidades de texto
// ---------------------------------------------------------------------------

/** Normaliza saltos de línea, colapsa espacios y unifica "..." -> "…". */
export function normalizeText(text) {
  return String(text || '')
    .replace(/\r\n?/g, '\n')
    .replace(/\.\.\.+/g, '…')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const WORD_RE = /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu;

/** Cuenta palabras "de verdad" (letras/números), ignorando la puntuación. */
export function countWords(s) {
  const m = String(s).match(WORD_RE);
  return m ? m.length : 0;
}

// ---------------------------------------------------------------------------
// Keywords
// ---------------------------------------------------------------------------

/**
 * Extrae hasta `max` palabras clave visuales de un texto.
 * Prioriza: nombres propios (mayúscula a mitad de frase) > palabras largas >
 * frecuencia. Descarta stopwords y palabras muy cortas.
 */
export function extractKeywords(text, max = 3) {
  const tokens = String(text).match(WORD_RE) || [];
  const scored = new Map();
  tokens.forEach((word, i) => {
    const lw = word.toLowerCase();
    if (lw.length < 3) return;
    if (STOPWORDS.has(lw)) return;
    if (!/\p{L}/u.test(lw)) return; // ignora cifras sueltas (13.800, 2024…)
    let score = Math.min(lw.length, 10); // palabras largas suelen ser concretas
    // Nombre propio: mayúscula inicial pero NO al principio de la frase.
    if (i > 0 && /^\p{Lu}/u.test(word)) score += 6;
    scored.set(lw, (scored.get(lw) || 0) + score);
  });
  return [...scored.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([w]) => w);
}

/** Construye la query de búsqueda de stock para un texto dado. */
export function buildQuery(text) {
  const kws = extractKeywords(text, 3);
  return kws.length ? kws.join(' ') : FALLBACK_QUERY;
}

// ---------------------------------------------------------------------------
// Segmentación en frases
// ---------------------------------------------------------------------------

// Cada match es una frase: todo lo que no sea terminador, seguido de sus
// terminadores (. ! ? …). El último trozo puede no tener terminador.
const SENTENCE_RE = /[^.!?…]+[.!?…]*/gu;

function pauseTypeOfTerminator(term) {
  if (!term) return 'period';
  if (term.includes('…')) return 'ellipsis';
  return 'period';
}

/**
 * Parte un párrafo en frases con su duración estimada.
 * Devuelve objetos { text, terminator, pauseType, duration }.
 */
function splitSentences(paragraph, opts) {
  const out = [];
  const matches = paragraph.match(SENTENCE_RE) || [];
  for (const raw of matches) {
    const text = raw.trim();
    if (!text || !countWords(text)) continue;

    const termMatch = text.match(/[.!?…]+$/u);
    const terminator = termMatch ? termMatch[0] : '';
    const pauseType = pauseTypeOfTerminator(terminator);

    const words = countWords(text);
    let duration = (words / opts.wpm) * 60;

    // Pausas internas por puntuación.
    duration += (text.match(/,/g) || []).length * opts.pause.comma;
    duration += (text.match(/;/g) || []).length * opts.pause.semicolon;
    duration += (text.match(/:/g) || []).length * opts.pause.colon;

    // Pausa del terminador.
    duration += pauseType === 'ellipsis' ? opts.pause.ellipsis : opts.pause.period;

    out.push({ text, terminator, pauseType, duration });
  }
  return out;
}

// ---------------------------------------------------------------------------
// División para retención
// ---------------------------------------------------------------------------

/**
 * Divide un texto en `n` trozos equilibrados por número de palabras,
 * intentando que los cortes caigan justo después de una coma.
 */
function splitTextIntoChunks(text, n) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (n <= 1 || words.length <= n) return [text.trim()];

  const target = words.length / n;
  const chunks = [];
  let start = 0;

  for (let i = 1; i < n; i++) {
    let cut = Math.round(i * target);
    cut = Math.max(start + 1, Math.min(cut, words.length - (n - i)));
    // Buscar una coma cercana (±2 palabras) para cortar de forma natural.
    const snapped = snapToComma(words, cut, start + 1, words.length - (n - i));
    cut = snapped;
    chunks.push(words.slice(start, cut).join(' '));
    start = cut;
  }
  chunks.push(words.slice(start).join(' '));
  return chunks.map((c) => c.trim()).filter(Boolean);
}

/** Ajusta el índice de corte a la palabra que termina en coma más cercana. */
function snapToComma(words, ideal, lo, hi) {
  for (let d = 0; d <= 2; d++) {
    for (const idx of [ideal - d, ideal + d]) {
      if (idx > lo && idx < hi && /[,;:]$/.test(words[idx - 1])) return idx;
    }
  }
  return ideal;
}

/**
 * A partir de una frase, decide cuántas imágenes necesita y reparte el texto y
 * la duración entre ellas. Devuelve una lista de slots (sin start/end todavía).
 */
function splitForRetention(sentence, opts) {
  const total = sentence.duration;
  const words = countWords(sentence.text);
  let n = Math.max(1, Math.ceil(total / opts.maxSecondsPerImage));
  // No crear trozos por debajo del mínimo.
  while (n > 1 && total / n < opts.minSecondsPerImage) n--;

  if (n === 1) {
    return [makeSlot(sentence.text, total, sentence.pauseType)];
  }

  // El reparto es proporcional a las palabras, así que un trozo con muchas
  // palabras podría pasarse del máximo. Subimos n hasta que todos entren
  // (sin bajar de min y sin partir por debajo de una palabra por imagen).
  let chunks = splitTextIntoChunks(sentence.text, n);
  while (n < words && maxChunkDuration(chunks, total) > opts.maxSecondsPerImage) {
    if (total / (n + 1) < opts.minSecondsPerImage) break;
    n++;
    chunks = splitTextIntoChunks(sentence.text, n);
  }

  const totalWords = chunks.reduce((s, c) => s + Math.max(1, countWords(c)), 0);
  return chunks.map((chunk, i) => {
    const w = Math.max(1, countWords(chunk));
    const dur = (w / totalWords) * total;
    // Solo el último trozo hereda la pausa del terminador; el resto "fluyen".
    const pauseType = i === chunks.length - 1 ? sentence.pauseType : 'flow';
    return makeSlot(chunk, dur, pauseType);
  });
}

/** Duración del trozo más pesado, según su proporción de palabras. */
function maxChunkDuration(chunks, total) {
  const totalWords = chunks.reduce((s, c) => s + Math.max(1, countWords(c)), 0);
  let maxW = 0;
  for (const c of chunks) maxW = Math.max(maxW, Math.max(1, countWords(c)));
  return (maxW / totalWords) * total;
}

function makeSlot(text, duration, pauseType) {
  const clean = text.trim();
  return {
    text: clean,
    duration,
    keywords: extractKeywords(clean, 3),
    query: buildQuery(clean),
    pauseType,
  };
}

// ---------------------------------------------------------------------------
// API principal
// ---------------------------------------------------------------------------

/**
 * Analiza un guión completo y devuelve el storyboard.
 *
 * @param {string} text  El guión.
 * @param {object} options  Sobrescribe DEFAULTS (wpm, maxSecondsPerImage, ...).
 * @returns {{
 *   slots: Array<{index,start,end,duration,text,query,keywords,pauseType}>,
 *   totalDuration: number,
 *   sentenceCount: number,
 *   imageCount: number,
 *   wordCount: number
 * }}
 */
export function analyzeScript(text, options = {}) {
  const opts = {
    ...DEFAULTS,
    ...options,
    pause: { ...DEFAULTS.pause, ...(options.pause || {}) },
  };

  const norm = normalizeText(text);
  const empty = { slots: [], totalDuration: 0, sentenceCount: 0, imageCount: 0, wordCount: 0 };
  if (!norm) return empty;

  // Cada línea se trata como un "beat" / cambio de escena.
  const lines = norm.split('\n').map((l) => l.trim()).filter(Boolean);

  const slots = [];
  let clock = 0;
  let sentenceCount = 0;

  for (const line of lines) {
    const sentences = splitSentences(line, opts);
    sentences.forEach((sentence, sIdx) => {
      sentenceCount++;
      // La última frase de la línea añade la respiración de cambio de escena.
      if (sIdx === sentences.length - 1) sentence.duration += opts.pause.paragraph;

      const subSlots = splitForRetention(sentence, opts);
      for (const slot of subSlots) {
        slot.index = slots.length;
        slot.start = round2(clock);
        clock += slot.duration;
        slot.end = round2(clock);
        slot.duration = round2(slot.duration);
        slots.push(slot);
      }
    });
  }

  return {
    slots,
    totalDuration: round2(clock),
    sentenceCount,
    imageCount: slots.length,
    wordCount: countWords(norm),
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

/** Formatea segundos como mm:ss.d (útil para la UI y los exports). */
export function formatTime(seconds) {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const rem = s - m * 60;
  return `${String(m).padStart(2, '0')}:${rem.toFixed(1).padStart(4, '0')}`;
}
