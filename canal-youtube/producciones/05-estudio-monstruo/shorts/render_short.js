// Monta el YouTube Short a partir de segments.json (tiempos reales en segundos,
// no mm:ss) — hoja-montaje.csv redondea a segundos enteros y varios planos de
// este short duran menos de 2s, así que aquí se usan los floats directos.
//
//   node render_short.js
//
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const dir = __dirname;
const R = p => path.resolve(dir, p);

const FPS = 30;
const W = 1080, H = 1920;
const CRF = 20;

function findFfmpeg() {
  try { return execFileSync('which', ['ffmpeg']).toString().trim(); } catch (_) {}
  throw new Error('No encuentro ffmpeg.');
}
const FFMPEG = findFfmpeg();

const planos = JSON.parse(fs.readFileSync(R('segments.json'), 'utf8'));

const ZOOM_MAX = 1.10;
function kenBurns(idx, dur) {
  const frames = Math.max(1, Math.round(dur * FPS));
  const paso = (ZOOM_MAX - 1) / frames;
  const dentro = idx % 2 === 0;
  const z = dentro
    ? `min(1+${paso.toFixed(8)}*on,${ZOOM_MAX})`
    : `max(${ZOOM_MAX}-${paso.toFixed(8)}*on,1)`;
  const y = `ih/2-(ih/zoom/2)`;
  const x = `iw/2-(iw/zoom/2)`;
  return `scale=${W}:${H},zoompan=z='${z}':d=1:x='${x}':y='${y}':s=${W}x${H}:fps=${FPS},setsar=1,format=yuv420p`;
}

const entradas = [];
const filtros = [];
planos.forEach((p, i) => {
  const dur = p.t_end - p.t_start;
  if (dur <= 0) return;
  const imgPath = path.join('imagenes', p.imagen);
  // -r antes de -i es obligatorio: el demuxer image2 decodifica a 25fps por
  // defecto, y si no coincide con el fps del zoompan de abajo, cada plano
  // se reproduce a duración*25/FPS en vez de duración real (mismo fallo
  // detectado y corregido en el short de Stanford).
  entradas.push('-r', String(FPS), '-loop', '1', '-t', dur.toFixed(3), '-i', imgPath);
  const k = entradas.filter(a => a === '-i').length - 1;
  filtros.push(`[${k}:v]${kenBurns(i, dur)}[v${k}]`);
});
const nV = filtros.length;
let cadena = filtros.join(';') + ';' +
  Array.from({ length: nV }, (_, k) => `[v${k}]`).join('') +
  `concat=n=${nV}:v=1:a=0[vcat]`;

// original_size es obligatorio: sin él, el filtro subtitles asume una
// resolución mucho más chica para el Fontsize y con captions largos el
// bloque se sale del cuadro (mismo fallo que en el short de Stanford).
const estilo = `FontName=Anton,Fontsize=14,Bold=1,PrimaryColour=&H00FFFFFF,` +
  `OutlineColour=&H00000000,BorderStyle=1,Outline=2,Shadow=1,` +
  `Alignment=6,MarginV=85,MarginL=64,MarginR=64`;
cadena += `;[vcat]subtitles=subtitulos.srt:original_size=${W}x${H}:force_style='${estilo}'[vsub]`;

const finVideo = planos[planos.length - 1].t_end;
const idxAudio = entradas.filter(a => a === '-i').length;
const args = [
  '-y', ...entradas,
  '-i', 'audio.mp3',
  '-filter_complex', cadena,
  '-map', '[vsub]',
  '-map', `${idxAudio}:a`,
  '-t', finVideo.toFixed(3),
  '-c:v', 'libx264', '-preset', 'medium', '-crf', String(CRF),
  '-pix_fmt', 'yuv420p', '-r', String(FPS),
  '-c:a', 'aac', '-b:a', '192k',
  '-movflags', '+faststart',
  'short-final.mp4',
];

console.log(`ffmpeg: ${FFMPEG}`);
console.log(`planos: ${nV}`);
console.log(`duración: ${finVideo.toFixed(2)}s · ${W}x${H} @ ${FPS}fps`);
execFileSync(FFMPEG, args, { stdio: ['ignore', 'ignore', 'inherit'], cwd: dir });

const mb = fs.statSync(R('short-final.mp4')).size / 1e6;
console.log(`\nshort-final.mp4 — ${mb.toFixed(1)} MB`);
