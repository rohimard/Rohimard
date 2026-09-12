// Monta el video final a partir de segments.json (tiempos reales en segundos,
// no mm:ss) — hoja-montaje.csv redondea a segundo entero y varios planos de
// este video duran menos de 1s (mínimo real 0,70s), así que aquí se usan los
// floats directos, igual que en shorts/render_short.js de Stanford.
//
//   node render.js
//
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const dir = __dirname;
const R = p => path.resolve(dir, p);

const FPS = 25;
const W = 1920, H = 1080;
const CRF = 20;

function findFfmpeg() {
  try { return execFileSync('which', ['ffmpeg']).toString().trim(); } catch (_) {}
  throw new Error('No encuentro ffmpeg.');
}
const FFMPEG = findFfmpeg();

const planos = JSON.parse(fs.readFileSync(R('segments.json'), 'utf8'));

const ZOOM_MAX = 1.12;
function kenBurns(idx, dur) {
  const frames = Math.max(1, Math.round(dur * FPS));
  const paso = (ZOOM_MAX - 1) / frames;
  const dentro = idx % 2 === 0;
  const z = dentro
    ? `min(1+${paso.toFixed(8)}*on,${ZOOM_MAX})`
    : `max(${ZOOM_MAX}-${paso.toFixed(8)}*on,1)`;
  const lado = idx % 4 < 2 ? 1 : -1;
  const x = `iw/2-(iw/zoom/2)+${lado}*(iw*0.04)*(on/${frames})`;
  const y = `ih/2-(ih/zoom/2)`;
  return `scale=${W * 2}:-2,zoompan=z='${z}':d=1:x='${x}':y='${y}':s=${W}x${H}:fps=${FPS},setsar=1,format=yuv420p`;
}

const entradas = [];
const filtros = [];
planos.forEach((p, i) => {
  const dur = p.t_end - p.t_start;
  if (dur <= 0) return;
  const imgPath = path.join('imagenes', p.imagen);
  // -r antes de -i es obligatorio: si no coincide con el fps del zoompan,
  // cada plano se reproduce a duración*25/FPS en vez de duración real
  // (mismo fallo detectado y corregido en el render_short.js de Stanford).
  entradas.push('-r', String(FPS), '-loop', '1', '-t', dur.toFixed(3), '-i', imgPath);
  const k = entradas.filter(a => a === '-i').length - 1;
  filtros.push(`[${k}:v]${kenBurns(i, dur)}[v${k}]`);
});
const nV = filtros.length;
let cadena = filtros.join(';') + ';' +
  Array.from({ length: nV }, (_, k) => `[v${k}]`).join('') +
  `concat=n=${nV}:v=1:a=0[vcat]`;

const estilo = `FontName=DejaVu Sans,Fontsize=22,Bold=1,PrimaryColour=&H00FFFFFF,` +
  `OutlineColour=&H00000000,BorderStyle=1,Outline=2,Shadow=1,` +
  `Alignment=2,MarginV=60`;
cadena += `;[vcat]subtitles=subtitulos.srt:force_style='${estilo}'[vsub]`;

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
  'video-final.mp4',
];

console.log(`ffmpeg: ${FFMPEG}`);
console.log(`planos: ${nV}`);
console.log(`duración: ${finVideo.toFixed(2)}s · ${W}x${H} @ ${FPS}fps`);
execFileSync(FFMPEG, args, { stdio: ['ignore', 'ignore', 'inherit'], cwd: dir });

const mb = fs.statSync(R('video-final.mp4')).size / 1e6;
console.log(`\nvideo-final.mp4 — ${mb.toFixed(1)} MB`);
