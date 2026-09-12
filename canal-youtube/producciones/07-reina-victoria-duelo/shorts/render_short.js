// Monta el Short 9:16 reutilizando las imágenes horizontales del video largo.
//
//   node render_short.js
//
// POR QUÉ NO SE RECORTAN LAS IMÁGENES
// Las del video son 1376x768. Recortarlas a 9:16 dejaría 432x768, o sea el 32%
// del ancho, y habría que ampliar ese recorte 2,5 veces para llenar los 1080
// del short: se perdería casi toda la composición y lo que quedara saldría
// blando. Aquí van a ancho completo (1080x603, que es una REDUCCIÓN, así que
// mantienen nitidez) sobre un fondo hecho con la propia imagen desenfocada y
// oscurecida. Nada se recorta y el color del fondo acompaña a cada plano.
//
// El hueco de abajo no es relleno: es donde van los subtítulos, y en Shorts
// además es la zona que tapa la interfaz de la app.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const dir = __dirname;
const R = p => path.resolve(dir, p);

const FPS = 30;
const W = 1080, H = 1920;
const CRF = 20;
const ALTO_IMG = 604;      // 1080 de ancho sobre origen 1376x768, par para x264
const Y_IMG = 600;         // banda de imagen en 600-1204, algo sobre el centro
const ZOOM_MAX = 1.10;

const FFMPEG = (() => {
  try { return execFileSync('which', ['ffmpeg']).toString().trim(); }
  catch (_) { throw new Error('No encuentro ffmpeg.'); }
})();

const planos = JSON.parse(fs.readFileSync(R('planos-short.json'), 'utf8'));

function kenBurns(idx, dur) {
  const frames = Math.max(1, Math.round(dur * FPS));
  const paso = (ZOOM_MAX - 1) / frames;
  const dentro = idx % 2 === 0;
  const z = dentro
    ? `min(1+${paso.toFixed(8)}*on,${ZOOM_MAX})`
    : `max(${ZOOM_MAX}-${paso.toFixed(8)}*on,1)`;
  const lado = idx % 4 < 2 ? 1 : -1;
  const x = `iw/2-(iw/zoom/2)+${lado}*(iw*0.03)*(on/${frames})`;
  return `zoompan=z='${z}':d=1:x='${x}':y='ih/2-(ih/zoom/2)'` +
         `:s=${W}x${ALTO_IMG}:fps=${FPS}`;
}

const entradas = [];
const filtros = [];
planos.forEach((p, i) => {
  const dur = p.t_end - p.t_start;
  if (dur <= 0) return;
  entradas.push('-loop', '1', '-t', dur.toFixed(3), '-i', R(p.imagen));
  const k = entradas.filter(a => a === '-i').length - 1;
  // El fondo se sobreescala y se desenfoca mucho para que no compita con la
  // imagen nítida; oscurecido y desaturado para que el ojo no se vaya ahí.
  filtros.push(
    `[${k}:v]split=2[b${k}][f${k}];` +
    `[b${k}]scale=${W}:${H}:force_original_aspect_ratio=increase,` +
    `crop=${W}:${H},boxblur=20:2,eq=brightness=-0.06:saturation=0.80,` +
    `setsar=1[bg${k}];` +
    `[f${k}]scale=${W * 2}:-2,${kenBurns(i, dur)},setsar=1[fg${k}];` +
    `[bg${k}][fg${k}]overlay=0:${Y_IMG}:format=auto,` +
    `format=yuv420p[v${k}]`
  );
});

const nV = filtros.length;
let cadena = filtros.join(';') + ';' +
  Array.from({ length: nV }, (_, k) => `[v${k}]`).join('') +
  `concat=n=${nV}:v=1:a=0[vcat]`;

// Subtítulos grandes y en el hueco de abajo. Se queman al final, sobre el
// montaje ya concatenado, para que el zoom no los deforme.
// CUIDADO con las unidades. Fontsize y MarginV NO van en pixeles de video:
// van en el lienzo interno de ASS, que para un SRT sin cabecera es de 288 de
// alto, y luego libass lo escala al alto real. Aqui el factor es 1920/288 =
// 6,67. La primera version puso MarginV=560 pensando en pixeles y mando los
// subtitulos fuera de la pantalla: no salia ni uno.
//   Fontsize 11  -> 73 px reales, y a 0,55 em por caracter caben
//                    unos 21 por linea en los 880 px utiles
//   MarginV  75   -> 500 px reales desde abajo, o sea centrados sobre y=1420,
//                    bajo la banda de imagen y encima de la interfaz de Shorts
const srt = 'subtitulos.srt';
const estilo = `FontName=DejaVu Sans,Fontsize=11,Bold=1,` +
  `PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,` +
  `Outline=2,Shadow=1,Alignment=2,MarginV=75,MarginL=15,MarginR=15`;
cadena += `;[vcat]subtitles=${srt}:force_style='${estilo}'[vsub]`;

const idxAudio = entradas.filter(a => a === '-i').length;
const fin = planos[planos.length - 1].t_end;
const args = [
  '-y', ...entradas,
  '-i', R('narracion.wav'),
  '-filter_complex', cadena,
  '-map', '[vsub]', '-map', `${idxAudio}:a`,
  '-t', fin.toFixed(3),
  '-c:v', 'libx264', '-preset', 'medium', '-crf', String(CRF),
  '-pix_fmt', 'yuv420p', '-r', String(FPS),
  '-c:a', 'aac', '-b:a', '192k',
  '-movflags', '+faststart',
  R('short-final.mp4'),
];

console.log(`ffmpeg: ${FFMPEG}`);
console.log(`planos: ${nV}  ·  ${fin.toFixed(1)}s  ·  ${W}x${H} @ ${FPS}fps`);
execFileSync(FFMPEG, args, { stdio: ['ignore', 'ignore', 'inherit'], cwd: dir });
const mb = fs.statSync(R('short-final.mp4')).size / 1e6;
console.log(`\nshort-final.mp4 — ${mb.toFixed(1)} MB`);
