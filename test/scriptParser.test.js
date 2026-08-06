import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeScript,
  extractKeywords,
  buildQuery,
  normalizeText,
  countWords,
  formatTime,
} from '../src/scriptParser.js';

test('normalizeText unifica "..." en "…" y colapsa espacios', () => {
  assert.equal(normalizeText('hola...   mundo'), 'hola… mundo');
});

test('countWords ignora puntuación', () => {
  assert.equal(countWords('Hola, mundo cruel.'), 3);
});

test('extractKeywords descarta stopwords y prioriza nombres propios', () => {
  const kws = extractKeywords('El astronauta viajó a Marte con valentía');
  assert.ok(kws.includes('marte'), 'debería incluir el nombre propio Marte');
  assert.ok(!kws.includes('el'), 'no debería incluir stopwords');
});

test('buildQuery cae en fallback cuando no hay keywords', () => {
  assert.equal(buildQuery('y de la a el'), 'fondo cinematográfico abstracto');
});

test('analyzeScript devuelve un slot por frase corta', () => {
  const { slots, sentenceCount } = analyzeScript('Un gato negro.');
  assert.equal(sentenceCount, 1);
  assert.equal(slots.length, 1);
  assert.equal(slots[0].start, 0);
});

test('frases largas se dividen en varias imágenes (retención)', () => {
  const largo =
    'El explorador caminó por la selva densa, cruzó ríos turbulentos, escaló montañas altas, ' +
    'atravesó cuevas oscuras y finalmente descubrió un templo antiguo escondido entre la maleza tropical.';
  const { slots } = analyzeScript(largo, { wpm: 150, maxSecondsPerImage: 2 });
  assert.ok(slots.length >= 2, 'una frase larga debe generar varias imágenes');
  // Ninguna imagen supera el máximo (con un pequeño margen por reparto).
  for (const s of slots) assert.ok(s.duration <= 2.6, `slot demasiado largo: ${s.duration}`);
});

test('los tiempos son contiguos: end[i] === start[i+1]', () => {
  const { slots } = analyzeScript(
    'Primera frase de prueba. Segunda frase un poco más larga que la anterior, con una coma.'
  );
  for (let i = 1; i < slots.length; i++) {
    assert.equal(slots[i].start, slots[i - 1].end);
  }
});

test('los puntos suspensivos marcan pauseType "ellipsis"', () => {
  const { slots } = analyzeScript('Y entonces… todo cambió.');
  const tipos = slots.map((s) => s.pauseType);
  assert.ok(tipos.includes('ellipsis'), 'debe detectar la pausa de suspensivos');
});

test('los suspensivos añaden más duración que un punto normal', () => {
  const conSusp = analyzeScript('Espera un momento…', { maxSecondsPerImage: 99 });
  const conPunto = analyzeScript('Espera un momento.', { maxSecondsPerImage: 99 });
  assert.ok(conSusp.totalDuration > conPunto.totalDuration);
});

test('duración total crece cuando baja la velocidad (wpm)', () => {
  const texto = 'Una frase de ejemplo con varias palabras para medir el tiempo total.';
  const rapido = analyzeScript(texto, { wpm: 200 });
  const lento = analyzeScript(texto, { wpm: 100 });
  assert.ok(lento.totalDuration > rapido.totalDuration);
});

test('cada slot trae una query no vacía', () => {
  const { slots } = analyzeScript('El bosque encantado brillaba bajo la luna llena.');
  for (const s of slots) assert.ok(s.query && s.query.length > 0);
});

test('texto vacío devuelve storyboard vacío', () => {
  const r = analyzeScript('   \n  ');
  assert.equal(r.slots.length, 0);
  assert.equal(r.totalDuration, 0);
});

test('formatTime formatea mm:ss.d', () => {
  assert.equal(formatTime(0), '00:00.0');
  assert.equal(formatTime(65.4), '01:05.4');
});
