// Monta el video final a partir de la hoja de montaje, las imágenes de escena,
// el audio de la narración y el SRT. Un plano por fila de la hoja.
//
//   node montar_video.js config.json
//
// La hoja de montaje ya está cuadrada al audio real (la genera timing_sheet.js
// a partir de la duración medida del MP3), así que los cortes caen donde caen
// las frases. Aquí no se recalcula nada: se obedece la hoja.
//
// Requiere ffmpeg. Si no está en el sistema:  npm install ffmpeg-static
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const cfgPath = process.argv[2];
if (!cfgPath) { console.error('uso: node montar_video.js config.json'); process.exit(1); }
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const dir = path.dirname(path.resolve(cfgPath));
const R = p => path.resolve(dir, p);

const FPS   = cfg.fps || 25;
const [W,H] = (cfg.resolucion || '1920x1080').split('x').map(Number);
const CRF   = cfg.crf || 20;

// ---- ffmpeg -----------------------------------------------------------------
function buscarFfmpeg() {
  if (cfg.ffmpeg) return R(cfg.ffmpeg);
  try { return execFileSync('which', ['ffmpeg']).toString().trim(); } catch (_) {}
  for (const base of [dir, process.cwd(), __dirname]) {
    try { return require(require.resolve('ffmpeg-static', { paths: [base] })); } catch (_) {}
  }
  throw new Error('No encuentro ffmpeg. Instala con: npm install ffmpeg-static');
}
const FFMPEG = buscarFfmpeg();

// ---- hoja de montaje --------------------------------------------------------
// CSV con ';' y tiempos m:ss. La duración de la hoja manda sobre todo lo demás.
const seg = t => { const [m,s] = String(t).trim().split(':').map(Number); return m*60 + s; };
const filas = fs.readFileSync(R(cfg.hoja), 'utf8')
  .replace(/^﻿/, '').trim().split(/\r?\n/).slice(1)
  .map(l => l.split(';'))
  .filter(c => c.length >= 5)
  .map(c => ({ n: Number(c[0]), bloque: c[1], entra: seg(c[2]), sale: seg(c[3]), escena: c[5] || '' }));

// ---- imágenes ---------------------------------------------------------------
// Se espera un archivo por plano nombrado con su número (01.jpg, 02.png…).
// `rellenar` cicla las que haya para poder previsualizar el montaje antes de
// tener las 78 generadas — sirve para ver el ritmo, no para publicar.
const EXT = ['.jpg', '.jpeg', '.png', '.webp'];
const imgDir = R(cfg.imagenes);
const disponibles = fs.readdirSync(imgDir)
  .filter(f => EXT.includes(path.extname(f).toLowerCase()))
  .sort();
if (!disponibles.length) throw new Error(`No hay imágenes en ${imgDir}`);

const porPlano = new Map();
for (const f of disponibles) {
  const m = path.basename(f, path.extname(f)).match(/^(\d+)/);
  if (m) porPlano.set(Number(m[1]), f);
}

let faltan = 0;
function imagenDe(plano, i) {
  const exacta = porPlano.get(plano.n);
  if (exacta) return path.join(imgDir, exacta);
  faltan++;
  if (!cfg.rellenar) throw new Error(`Falta la imagen del plano ${plano.n}. Usa "rellenar": true para previsualizar.`);
  return path.join(imgDir, disponibles[i % disponibles.length]);
}

// ---- selección de planos ----------------------------------------------------
let planos = filas;
if (cfg.hasta) planos = planos.filter(p => p.entra < cfg.hasta);
if (!planos.length) throw new Error('La selección no deja ningún plano.');
const ultimo = planos[planos.length - 1];
const finVideo = cfg.hasta ? Math.min(ultimo.sale, cfg.hasta) : ultimo.sale;

// ---- filtros ----------------------------------------------------------------
// zoompan trabaja en pasos de píxel entero: si no se sobreescala antes, el
// movimiento va a saltos. Se escala a 4K, se hace el Ken Burns y se baja a 1080.
// d=1 da un fotograma de salida por cada uno de entrada, así `on` avanza a lo
// largo de todo el plano y el zoom es un rampeo continuo.
const ZOOM_MAX = cfg.zoom || 1.12;
function kenBurns(idx, dur) {
  const frames = Math.max(1, Math.round(dur * FPS));
  const paso = (ZOOM_MAX - 1) / frames;
  const dentro = idx % 2 === 0;
  const z = dentro
    ? `min(1+${paso.toFixed(8)}*on,${ZOOM_MAX})`
    : `max(${ZOOM_MAX}-${paso.toFixed(8)}*on,1)`;
  // Deriva lateral suave, alternando el lado para que no todos los planos
  // se muevan igual.
  const lado = idx % 4 < 2 ? 1 : -1;
  const x = `iw/2-(iw/zoom/2)+${lado}*(iw*0.04)*(on/${frames})`;
  const y = `ih/2-(ih/zoom/2)`;
  return `scale=${W*2}:-2,zoompan=z='${z}':d=1:x='${x}':y='${y}':s=${W}x${H}:fps=${FPS},setsar=1,format=yuv420p`;
}

const entradas = [];
const filtros = [];
planos.forEach((p, i) => {
  const dur = (cfg.hasta ? Math.min(p.sale, cfg.hasta) : p.sale) - p.entra;
  if (dur <= 0) return;
  entradas.push('-loop', '1', '-t', dur.toFixed(3), '-i', imagenDe(p, i));
  const k = entradas.filter(a => a === '-i').length - 1;
  filtros.push(`[${k}:v]${kenBurns(i, dur)}[v${k}]`);
});
const nV = filtros.length;
let cadena = filtros.join(';') + ';' +
  Array.from({ length: nV }, (_, k) => `[v${k}]`).join('') +
  `concat=n=${nV}:v=1:a=0[vcat]`;

// Los subtítulos se queman al final, sobre el montaje ya concatenado, para que
// no los deforme el zoom.
let salidaV = '[vcat]';
if (cfg.subtitulos !== false && cfg.srt) {
  const srt = path.relative(dir, R(cfg.srt)).replace(/\\/g, '/');
  const estilo = cfg.estiloSubs ||
    `FontName=DejaVu Sans,Fontsize=22,Bold=1,PrimaryColour=&H00FFFFFF,` +
    `OutlineColour=&H00000000,BorderStyle=1,Outline=2,Shadow=1,` +
    `Alignment=2,MarginV=60`;
  cadena += `;[vcat]subtitles=${srt}:force_style='${estilo}'[vsub]`;
  salidaV = '[vsub]';
}

// ---- audio ------------------------------------------------------------------
const idxAudio = entradas.filter(a => a === '-i').length;
const args = [
  '-y', ...entradas,
  '-i', R(cfg.audio),
  '-filter_complex', cadena,
  '-map', salidaV,
  '-map', `${idxAudio}:a`,
  '-t', finVideo.toFixed(3),
  '-c:v', 'libx264', '-preset', cfg.preset || 'medium', '-crf', String(CRF),
  '-pix_fmt', 'yuv420p', '-r', String(FPS),
  '-c:a', 'aac', '-b:a', '192k',
  '-movflags', '+faststart',
  R(cfg.salida),
];

console.log(`ffmpeg: ${FFMPEG}`);
console.log(`planos: ${nV}${faltan ? `  (${faltan} sin imagen propia, rellenados)` : ''}`);
console.log(`duración: ${finVideo.toFixed(1)}s  ·  ${W}x${H} @ ${FPS}fps`);
execFileSync(FFMPEG, args, { stdio: ['ignore', 'ignore', 'inherit'], cwd: dir });

const mb = fs.statSync(R(cfg.salida)).size / 1e6;
console.log(`\n${cfg.salida} — ${mb.toFixed(1)} MB`);
