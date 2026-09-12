#!/usr/bin/env node
/*
 * timing_from_srt.js — hoja de montaje con los cortes anclados al audio REAL.
 *
 * Sustituye a timing_sheet.js siempre que ya exista el .srt alineado.
 *
 * Por qué: timing_sheet.js reparte la duración total entre los planos en
 * proporción al número de caracteres de cada escena. Eso da por hecho que el
 * narrador habla a velocidad constante, y no lo hace: hay pausas, énfasis y
 * silencios entre párrafos. El error se acumula y a mitad de video la imagen
 * puede ir veinte segundos por delante de la voz. Medido en el video 2:
 * desfase medio de 10,6s y máximo de 19,7s.
 *
 * El .srt que produce srt_align.js sí está anclado: sus tiempos vienen de las
 * pausas medidas en la onda del MP3. Así que aquí no se estima nada — se usa
 * ese .srt como regla:
 *
 *   1. Concatenar el texto de los subtítulos: da una correspondencia entre
 *      posición de carácter y tiempo real.
 *   2. Concatenar el texto de las escenas: da la posición donde empieza cada
 *      plano.
 *   3. Cada corte de plano se coloca en el tiempo en que esa posición se
 *      pronuncia de verdad.
 *
 * Los dos textos salen del mismo guión, así que deben coincidir carácter a
 * carácter una vez normalizados; si no, el guión y el audio no son la misma
 * versión y el script se detiene en vez de producir una hoja desfasada.
 *
 * Uso:  node timing_from_srt.js segments.json subtitulos.srt <duracion_s> [salida]
 */
const fs = require('fs');
const path = require('path');

const [segPath, srtPath, durArg, outBase = 'hoja-montaje'] = process.argv.slice(2);
if (!segPath || !srtPath || !durArg) {
  console.error('uso: node timing_from_srt.js segments.json subtitulos.srt <duracion_s> [salida]');
  process.exit(1);
}
const DUR = parseFloat(durArg);

const segments = JSON.parse(fs.readFileSync(segPath, 'utf8')).segments;

// ---- subtítulos ----
const t2s = t => {
  const [h, m, rest] = t.trim().split(':');
  const [s, ms] = rest.split(',');
  return +h * 3600 + +m * 60 + +s + +ms / 1000;
};
const cues = fs.readFileSync(srtPath, 'utf8').trim().split(/\r?\n\s*\r?\n/).map(b => {
  const lines = b.trim().split(/\r?\n/);
  const tl = lines.find(l => l.includes('-->'));
  if (!tl) return null;
  const [a, z] = tl.split('-->');
  return { start: t2s(a), end: t2s(z), text: lines.slice(lines.indexOf(tl) + 1).join(' ') };
}).filter(Boolean);

// ---- comprobación: el mismo guión en ambos lados ----
const norm = s => s.replace(/\s+/g, '').toLowerCase();
const textoSrt = norm(cues.map(c => c.text).join(''));
const textoSeg = norm(segments.map(s => s.text).join(''));
if (textoSrt !== textoSeg) {
  let i = 0;
  while (i < textoSrt.length && textoSrt[i] === textoSeg[i]) i++;
  console.error('El texto de los subtítulos y el de las escenas no coinciden.');
  console.error(`Divergen en el carácter ${i}:`);
  console.error('  srt: …' + textoSrt.slice(Math.max(0, i - 40), i + 40));
  console.error('  seg: …' + textoSeg.slice(Math.max(0, i - 40), i + 40));
  process.exit(1);
}

// ---- posición de carácter -> tiempo real ----
const tramos = [];
let pos = 0;
for (const c of cues) {
  const n = norm(c.text).length;
  tramos.push({ desde: pos, hasta: pos + n, t0: c.start, t1: c.end });
  pos += n;
}
function tiempoEn(p) {
  if (p <= 0) return 0;
  for (const tr of tramos) {
    if (p < tr.hasta) return tr.t0 + (tr.t1 - tr.t0) * ((p - tr.desde) / Math.max(1, tr.hasta - tr.desde));
  }
  return DUR;
}

// ---- cortes ----
const cortes = [];
let acum = 0;
for (const s of segments) {
  cortes.push(tiempoEn(acum));
  acum += norm(s.text).length;
}
cortes.push(DUR);

// Monotonía: dos escenas muy cortas dentro de un mismo subtítulo podrían
// dar el mismo instante. Se separan lo justo para que ningún plano quede a cero.
const MIN = 0.5;
for (let i = 1; i < cortes.length; i++) {
  if (cortes[i] < cortes[i - 1] + MIN) cortes[i] = cortes[i - 1] + MIN;
}
if (cortes[cortes.length - 1] > DUR) {          // reescalar si el ajuste se pasó
  const f = DUR / cortes[cortes.length - 1];
  for (let i = 1; i < cortes.length; i++) cortes[i] *= f;
}

const mmss = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const planos = segments.map((s, i) => ({
  n: s.id,
  bloque: s.block,
  entra: cortes[i],
  sale: cortes[i + 1],
  dur: cortes[i + 1] - cortes[i],
  escena: s.cue,
}));

// ---- salida ----
const dir = path.dirname(path.resolve(outBase));
const base = path.basename(outBase);
const csv = ['﻿Plano;Bloque;Entra;Sale;Duracion (s);Escena']
  .concat(planos.map(p => [p.n, p.bloque, mmss(p.entra), mmss(p.sale), Math.round(p.dur), p.escena].join(';')))
  .join('\n') + '\n';
fs.writeFileSync(path.join(dir, base + '.csv'), csv);

const txt = planos.map(p =>
  `${String(p.n).padStart(2, '0')}  ${mmss(p.entra)}–${mmss(p.sale)}  ${p.dur.toFixed(1)}s  [${p.bloque}]  ${p.escena}`
).join('\n') + '\n';
fs.writeFileSync(path.join(dir, base + '.txt'), txt);

const durs = planos.map(p => p.dur);
const cortos = planos.filter(p => p.dur < 3);
const largos = planos.filter(p => p.dur > 8);
console.log(`${planos.length} planos anclados al audio real · total ${mmss(DUR)}`);
console.log(`duración: min ${Math.min(...durs).toFixed(1)}s · media ${(durs.reduce((a, b) => a + b, 0) / durs.length).toFixed(1)}s · max ${Math.max(...durs).toFixed(1)}s`);
if (cortos.length) console.log(`planos por debajo de 3s: ${cortos.map(p => p.n).join(', ')}`);
if (largos.length) console.log(`planos por encima de 8s: ${largos.map(p => p.n).join(', ')}`);
console.log(`[archivos] ${base}.csv y ${base}.txt`);
