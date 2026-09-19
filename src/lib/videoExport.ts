import type { FontId, TextStroke } from "../types";

/** Pure, saturated green — the color most chroma-key tools default to. */
export const CHROMA_GREEN = "#00FF00";

export const FONT_WEB_INFO: Record<
  FontId,
  { cssFamily: string; weight: number; googleFontsParam: string | null }
> = {
  system: { cssFamily: "sans-serif", weight: 700, googleFontsParam: null },
  poppins: { cssFamily: "Poppins", weight: 700, googleFontsParam: "Poppins:wght@700" },
  bebasNeue: { cssFamily: "Bebas Neue", weight: 400, googleFontsParam: "Bebas+Neue" },
  pacifico: { cssFamily: "Pacifico", weight: 400, googleFontsParam: "Pacifico" },
  anton: { cssFamily: "Anton", weight: 400, googleFontsParam: "Anton" },
  caveat: { cssFamily: "Caveat", weight: 700, googleFontsParam: "Caveat:wght@700" },
};

/** True if a hex color is close enough to the chroma key that it would get keyed out too. */
export function isTooCloseToChroma(hex: string, threshold = 150): boolean {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return false;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const dist = Math.hypot(r - 0, g - 255, b - 0);
  return dist < threshold;
}

const TAIL_MS = 250;

/**
 * Builds a self-contained HTML page: draws the stroke's stamps on a <canvas>
 * over a solid chroma-key background, revealing each one at its recorded
 * timeMs (same cadence as the in-app "Reproducir" replay), records it with
 * the browser's own MediaRecorder (no native video library involved), and
 * posts the resulting webm back to React Native as base64.
 */
export function buildRecorderHtml(
  stroke: TextStroke,
  canvasSize: { width: number; height: number },
  chroma: string = CHROMA_GREEN,
  scale: number = 1
): string {
  const fontId = stroke.elements[0]?.fontId ?? "system";
  const fontInfo = FONT_WEB_INFO[fontId];
  const maxTimeMs = Math.max(0, ...stroke.elements.map((el) => el.timeMs));

  const elementsJson = JSON.stringify(
    stroke.elements.map((el) => ({
      x: el.x * scale,
      y: el.y * scale,
      rotation: el.rotation,
      color: el.color,
      fontSize: el.fontSize * scale,
      opacity: el.opacity,
      text: el.text,
      timeMs: el.timeMs,
    }))
  );

  const fontLink = fontInfo.googleFontsParam
    ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${fontInfo.googleFontsParam}&display=swap">`
    : "";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
${fontLink}
<style>html,body{margin:0;padding:0;background:#000;overflow:hidden;}</style>
</head>
<body>
<canvas id="c" width="${Math.round(canvasSize.width * scale)}" height="${Math.round(canvasSize.height * scale)}"></canvas>
<script>
(function () {
  var ELEMENTS = ${elementsJson};
  var CHROMA = ${JSON.stringify(chroma)};
  var FONT_FAMILY = ${JSON.stringify(fontInfo.cssFamily)};
  var FONT_WEIGHT = ${fontInfo.weight};
  var MAX_TIME_MS = ${maxTimeMs};
  var TAIL_MS = ${TAIL_MS};

  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');

  function post(msg) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    }
  }

  function drawFrame(elapsed) {
    ctx.fillStyle = CHROMA;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < ELEMENTS.length; i++) {
      var el = ELEMENTS[i];
      if (el.timeMs > elapsed) continue;
      ctx.save();
      ctx.translate(el.x, el.y);
      ctx.rotate((el.rotation * Math.PI) / 180);
      ctx.globalAlpha = el.opacity;
      ctx.fillStyle = el.color;
      ctx.font = FONT_WEIGHT + ' ' + el.fontSize + 'px ' + FONT_FAMILY + ', sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(el.text, 0, 0);
      ctx.restore();
    }
  }

  function fail(message) {
    post({ type: 'error', message: message });
  }

  async function start() {
    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    } catch (e) {
      // Font loading failure isn't fatal — falls back to sans-serif.
    }

    if (!canvas.captureStream || !window.MediaRecorder) {
      fail('Este dispositivo no soporta grabación de canvas.');
      return;
    }

    var stream = canvas.captureStream(30);
    var candidates = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    var mimeType = '';
    for (var i = 0; i < candidates.length; i++) {
      if (MediaRecorder.isTypeSupported(candidates[i])) {
        mimeType = candidates[i];
        break;
      }
    }
    if (!mimeType) {
      fail('No se encontró un formato de video soportado.');
      return;
    }

    var recorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType: mimeType });
    } catch (e) {
      fail('No se pudo iniciar el grabador: ' + String(e));
      return;
    }

    var chunks = [];
    recorder.ondataavailable = function (e) {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    recorder.onerror = function (e) {
      fail('Error durante la grabación: ' + String(e));
    };
    recorder.onstop = function () {
      var blob = new Blob(chunks, { type: mimeType });
      var reader = new FileReader();
      reader.onloadend = function () {
        var result = String(reader.result || '');
        // The mimeType itself can contain a comma (e.g. codec lists), so only
        // the LAST comma in the data URL reliably marks the base64 payload —
        // base64's alphabet never contains one.
        var base64 = result.substring(result.lastIndexOf(',') + 1);
        post({ type: 'done', base64: base64, mimeType: mimeType });
      };
      reader.onerror = function () {
        fail('No se pudo leer el video grabado.');
      };
      reader.readAsDataURL(blob);
    };

    drawFrame(0);
    recorder.start();

    var startTime = performance.now();
    var totalMs = MAX_TIME_MS + TAIL_MS;
    function loop() {
      var elapsed = performance.now() - startTime;
      drawFrame(elapsed);
      if (elapsed < totalMs) {
        requestAnimationFrame(loop);
      } else {
        recorder.stop();
      }
    }
    requestAnimationFrame(loop);
  }

  start();
})();
</script>
</body>
</html>`;
}
