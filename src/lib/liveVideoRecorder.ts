import type { BrushSettings } from "../types";
import { FONT_WEB_INFO } from "./videoExport";

const MIN_POINT_DISTANCE_SQ = 9;
const DEFAULT_STICKER_SIZE = 110;
const DOUBLE_TAP_MS = 320;
const DOUBLE_TAP_DIST_SQ = 40 * 40;

/**
 * Builds a self-contained HTML page that IS the live "record video with the
 * effect baked in" camera: it opens the device camera and mic directly via
 * getUserMedia (no native camera/video library involved — the same
 * no-native-deps approach already used for chroma-key video export), draws
 * the camera feed plus live Text Brush strokes and draggable stickers onto
 * a canvas every frame, and records that composited canvas with the
 * browser's own MediaRecorder. React Native only sends it settings/sticker/
 * start-stop commands and receives the finished video back as base64 —
 * everything visual happens inside this WebView.
 */
export function buildLiveRecorderHtml(
  initialSettings: BrushSettings,
  initialFacing: "front" | "back",
  canvasSize: { width: number; height: number }
): string {
  const fontLinks = Object.values(FONT_WEB_INFO)
    .filter((f) => f.googleFontsParam)
    .map((f) => `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${f.googleFontsParam}&display=swap">`)
    .join("\n");

  const width = Math.round(canvasSize.width);
  const height = Math.round(canvasSize.height);

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
${fontLinks}
<style>
  html,body{margin:0;padding:0;background:#000;overflow:hidden;touch-action:none;}
  canvas{display:block;}
</style>
</head>
<body>
<canvas id="c" width="${width}" height="${height}"></canvas>
<video id="v" autoplay playsinline muted style="display:none"></video>
<script>
(function () {
  var W = ${width}, H = ${height};
  var FONT_WEB_INFO = ${JSON.stringify(FONT_WEB_INFO)};
  var settings = ${JSON.stringify(initialSettings)};
  var facing = ${JSON.stringify(initialFacing)};

  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var videoEl = document.getElementById('v');

  var stream = null;
  var strokes = [];        // committed { points, elements }
  var currentPoints = null;
  var strokeStartTime = 0;
  var strokeCounter = 0;

  var stickers = [];       // { id, uri, x, y, size, img }
  var draggingSticker = null;
  var dragOffset = { x: 0, y: 0 };
  var lastTap = { t: 0, x: 0, y: 0 };

  var recorder = null;
  var chunks = [];
  var recordedMimeType = '';

  function post(msg) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  }
  function fail(message) { post({ type: 'error', message: message }); }

  // ---------- Text Brush math (ported from src/lib/strokeMath.ts) ----------
  function dist(a, b) { return Math.hypot(b.x - a.x, b.y - a.y); }
  function angleBetween(a, b) { return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI; }
  function distSq(a, b) { var dx = b.x - a.x, dy = b.y - a.y; return dx * dx + dy * dy; }

  function buildStamped(points, s) {
    var phrase = (s.phrase || '').trim();
    if (points.length < 2 || !phrase) return [];
    var spacing = Math.max(s.spacing, 2);
    var elements = [];
    function makeEl(x, y, rot, t) {
      return { x: x, y: y, rotation: rot, color: s.color, fontSize: s.fontSize, fontId: s.fontId, opacity: s.opacity, text: phrase };
    }
    var firstAngle = angleBetween(points[0], points[1]);
    elements.push(makeEl(points[0].x, points[0].y, firstAngle, points[0].t || 0));
    var carry = spacing;
    for (var i = 1; i < points.length; i++) {
      var prev = points[i - 1], curr = points[i];
      var segLen = dist(prev, curr);
      if (segLen === 0) continue;
      var angle = angleBetween(prev, curr);
      var consumed = 0;
      while (consumed + carry <= segLen) {
        consumed += carry;
        var frac = consumed / segLen;
        var x = prev.x + (curr.x - prev.x) * frac;
        var y = prev.y + (curr.y - prev.y) * frac;
        elements.push(makeEl(x, y, angle, 0));
        carry = spacing;
      }
      carry -= segLen - consumed;
    }
    return elements;
  }

  // ---------- Drawing ----------
  function drawCameraFrame() {
    if (!videoEl || videoEl.readyState < 2 || !videoEl.videoWidth) {
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, W, H);
      return;
    }
    var vw = videoEl.videoWidth, vh = videoEl.videoHeight;
    var scale = Math.max(W / vw, H / vh);
    var sw = W / scale, sh = H / scale;
    var sx = (vw - sw) / 2, sy = (vh - sh) / 2;
    ctx.save();
    if (facing === 'front') {
      ctx.translate(W, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(videoEl, sx, sy, sw, sh, 0, 0, W, H);
    ctx.restore();
  }

  function drawElement(el) {
    var fontInfo = FONT_WEB_INFO[el.fontId] || FONT_WEB_INFO.system;
    ctx.save();
    ctx.translate(el.x, el.y);
    ctx.rotate((el.rotation * Math.PI) / 180);
    ctx.globalAlpha = el.opacity;
    ctx.fillStyle = el.color;
    ctx.font = fontInfo.weight + ' ' + el.fontSize + 'px ' + fontInfo.cssFamily + ', sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 6;
    ctx.fillText(el.text, 0, 0);
    ctx.restore();
  }

  function drawStickers() {
    for (var i = 0; i < stickers.length; i++) {
      var s = stickers[i];
      if (!s.img.complete || s.img.naturalWidth === 0) continue;
      ctx.drawImage(s.img, s.x - s.size / 2, s.y - s.size / 2, s.size, s.size);
    }
  }

  function drawFrame() {
    drawCameraFrame();
    for (var i = 0; i < strokes.length; i++) {
      var elements = strokes[i].elements;
      for (var j = 0; j < elements.length; j++) drawElement(elements[j]);
    }
    if (currentPoints) {
      var live = buildStamped(currentPoints, settings);
      for (var k = 0; k < live.length; k++) drawElement(live[k]);
    }
    drawStickers();
  }

  // ---------- Pointer handling: draw a stroke, or drag/delete a sticker ----------
  function hitSticker(x, y) {
    for (var i = stickers.length - 1; i >= 0; i--) {
      var s = stickers[i];
      var r = s.size / 2;
      if (Math.abs(x - s.x) <= r && Math.abs(y - s.y) <= r) return s;
    }
    return null;
  }

  function toCanvasPoint(e) {
    var rect = canvas.getBoundingClientRect();
    var t = e.touches && e.touches.length ? e.touches[0] : e;
    return { x: ((t.clientX - rect.left) / rect.width) * W, y: ((t.clientY - rect.top) / rect.height) * H };
  }

  function onPointerDown(e) {
    e.preventDefault();
    var p = toCanvasPoint(e);
    var now = Date.now();
    var hit = hitSticker(p.x, p.y);

    if (hit && now - lastTap.t < ${DOUBLE_TAP_MS} && distSq(p, lastTap) < ${DOUBLE_TAP_DIST_SQ}) {
      stickers = stickers.filter(function (s) { return s.id !== hit.id; });
      lastTap = { t: 0, x: 0, y: 0 };
      return;
    }
    lastTap = { t: now, x: p.x, y: p.y };

    if (hit) {
      draggingSticker = hit;
      dragOffset = { x: p.x - hit.x, y: p.y - hit.y };
      return;
    }

    strokeStartTime = now;
    currentPoints = [{ x: p.x, y: p.y, t: 0 }];
  }

  function onPointerMove(e) {
    e.preventDefault();
    var p = toCanvasPoint(e);
    if (draggingSticker) {
      draggingSticker.x = p.x - dragOffset.x;
      draggingSticker.y = p.y - dragOffset.y;
      return;
    }
    if (currentPoints) {
      var last = currentPoints[currentPoints.length - 1];
      var point = { x: p.x, y: p.y, t: Date.now() - strokeStartTime };
      if (distSq(last, point) < ${MIN_POINT_DISTANCE_SQ}) return;
      currentPoints.push(point);
    }
  }

  function onPointerUp(e) {
    e.preventDefault();
    if (draggingSticker) {
      draggingSticker = null;
      return;
    }
    if (currentPoints) {
      if (currentPoints.length >= 2) {
        var elements = buildStamped(currentPoints, settings);
        if (elements.length > 0) {
          strokeCounter++;
          strokes.push({ points: currentPoints, elements: elements });
        }
      }
      currentPoints = null;
    }
  }

  canvas.addEventListener('mousedown', onPointerDown);
  canvas.addEventListener('mousemove', onPointerMove);
  canvas.addEventListener('mouseup', onPointerUp);
  canvas.addEventListener('touchstart', onPointerDown, { passive: false });
  canvas.addEventListener('touchmove', onPointerMove, { passive: false });
  canvas.addEventListener('touchend', onPointerUp, { passive: false });

  // ---------- Commands from React Native ----------
  function addStickerFromUri(id, uri) {
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      stickers.push({ id: id, uri: uri, x: W / 2, y: H / 2, size: ${DEFAULT_STICKER_SIZE}, img: img });
    };
    img.onerror = function () {
      fail('No se pudo cargar el sticker.');
    };
    img.src = uri;
  }

  async function startCamera() {
    try {
      if (stream) {
        stream.getTracks().forEach(function (t) { t.stop(); });
      }
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing === 'front' ? 'user' : 'environment' },
        audio: true,
      });
      videoEl.srcObject = stream;
      await videoEl.play().catch(function () {});
      post({ type: 'ready' });
    } catch (e) {
      fail('No se pudo acceder a la cámara: ' + String(e));
    }
  }

  function startRecording() {
    if (recorder) return;
    if (!canvas.captureStream || !window.MediaRecorder) {
      fail('Este dispositivo no soporta grabación de video en vivo.');
      return;
    }
    var canvasStream = canvas.captureStream(30);
    var combinedTracks = canvasStream.getVideoTracks().slice();
    if (stream) {
      var audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) combinedTracks.push(audioTracks[0]);
    }
    var combined = new MediaStream(combinedTracks);

    var candidates = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    var mimeType = '';
    for (var i = 0; i < candidates.length; i++) {
      if (MediaRecorder.isTypeSupported(candidates[i])) { mimeType = candidates[i]; break; }
    }
    if (!mimeType) { fail('No se encontró un formato de video soportado.'); return; }
    recordedMimeType = mimeType;

    try {
      recorder = new MediaRecorder(combined, { mimeType: mimeType, videoBitsPerSecond: 6000000 });
    } catch (e) {
      fail('No se pudo iniciar el grabador: ' + String(e));
      return;
    }
    chunks = [];
    recorder.ondataavailable = function (e) { if (e.data && e.data.size > 0) chunks.push(e.data); };
    recorder.onerror = function (e) { fail('Error durante la grabación: ' + String(e)); };
    recorder.onstop = function () {
      var blob = new Blob(chunks, { type: recordedMimeType });
      var reader = new FileReader();
      reader.onloadend = function () {
        var result = String(reader.result || '');
        // The mimeType itself can contain a comma (e.g. "vp9,opus"), so only
        // the LAST comma in the data URL reliably marks the base64 payload —
        // base64's alphabet never contains one.
        var base64 = result.substring(result.lastIndexOf(',') + 1);
        post({ type: 'recording-stopped', base64: base64, mimeType: recordedMimeType });
      };
      reader.onerror = function () { fail('No se pudo leer el video grabado.'); };
      reader.readAsDataURL(blob);
      recorder = null;
    };
    recorder.start();
    post({ type: 'recording-started' });
  }

  function stopRecording() {
    if (recorder && recorder.state !== 'inactive') recorder.stop();
  }

  function handleMessage(raw) {
    var msg;
    try { msg = JSON.parse(raw); } catch (e) { return; }
    if (msg.type === 'settings') settings = msg.settings;
    else if (msg.type === 'addSticker') addStickerFromUri(msg.id, msg.uri);
    else if (msg.type === 'switchCamera') { facing = msg.facing; startCamera(); }
    else if (msg.type === 'start') startRecording();
    else if (msg.type === 'stop') stopRecording();
  }
  document.addEventListener('message', function (e) { handleMessage(e.data); });
  window.addEventListener('message', function (e) { handleMessage(e.data); });

  function loop() {
    drawFrame();
    requestAnimationFrame(loop);
  }

  (async function init() {
    try {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
    } catch (e) {}
    await startCamera();
    requestAnimationFrame(loop);
  })();
})();
</script>
</body>
</html>`;
}
