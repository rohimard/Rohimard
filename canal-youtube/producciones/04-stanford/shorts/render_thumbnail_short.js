#!/usr/bin/env node
/*
 * render_thumbnail_short.js — miniatura vertical (9:16) para el Short.
 *
 * Hermano de ../../../kit-produccion/scripts/render_thumbnail.js: ese script
 * está fijado a 1280x720 (texto a un lado, sujeto al otro) porque asume una
 * imagen base horizontal con espacio negativo lateral. Aquí la imagen base ya
 * es el propio compuesto vertical del short (blur-pad, ver imagenes/01.jpg:
 * fondo difuminado arriba/abajo + foto nítida centrada), así que el texto no
 * va a un lado sino centrado en la franja difuminada de arriba — mismo criterio
 * de "no tapar la imagen nítida" que ya se calibró para los subtítulos del
 * video (Fontsize/posición en render_short.js).
 *
 * Uso: node render_thumbnail_short.js config.json
 * config.json: mismos campos que el kit (image, font, out, number, line1,
 * line2, accent, alarm, numberSize) — sin "side", el layout es centrado.
 */
const fs = require('fs');
const path = require('path');

const cfgPath = process.argv[2];
if (!cfgPath) { console.error('Usage: node render_thumbnail_short.js config.json'); process.exit(1); }
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const dir = path.dirname(path.resolve(cfgPath));
const rel = p => path.isAbsolute(p) ? p : path.join(dir, p);

const accent = cfg.accent || '#FFD400';
const alarm = cfg.alarm || '#E10600';
const numSize = cfg.numberSize || 150;
const imgB64 = fs.readFileSync(rel(cfg.image)).toString('base64');
const fontB64 = fs.readFileSync(rel(cfg.font)).toString('base64');
const number = cfg.number || '';
const line1 = cfg.line1 || '';
const line2 = cfg.line2 || '';

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Anton';src:url(data:font/woff2;base64,${fontB64}) format('woff2');}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:1080px;height:1920px;overflow:hidden;background:#000;}
.stage{position:relative;width:1080px;height:1920px;overflow:hidden;font-family:'Anton',sans-serif;}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;
    filter:saturate(1.12) contrast(1.06) brightness(1.02);}
.vig{position:absolute;inset:0;background:
    linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 32%, rgba(0,0,0,0) 62%);}
.txt{position:absolute;left:0;right:0;top:90px;z-index:5;text-align:center;padding:0 48px;}
.num{font-size:${numSize}px;line-height:0.92;color:${accent};
     -webkit-text-stroke:9px #000;paint-order:stroke fill;
     text-shadow:0 14px 26px rgba(0,0,0,0.85);transform:rotate(-3deg);letter-spacing:${numSize > 130 ? -4 : -1}px;}
.sub{margin-top:22px;}
.l1{font-size:56px;line-height:1.05;color:#fff;-webkit-text-stroke:6px #000;paint-order:stroke fill;
    text-shadow:0 8px 16px rgba(0,0,0,0.8);letter-spacing:1px;}
.l2{display:inline-block;margin-top:14px;background:${alarm};padding:6px 20px 10px;
    font-size:56px;line-height:1.05;color:#fff;-webkit-text-stroke:2px #000;paint-order:stroke fill;
    box-shadow:0 8px 18px rgba(0,0,0,0.6);letter-spacing:1px;}
</style></head><body>
<div class="stage">
  <img class="bg" src="data:image/jpeg;base64,${imgB64}">
  <div class="vig"></div>
  <div class="txt">
    ${number ? `<div class="num">${number}</div>` : ''}
    <div class="sub">
      ${line1 ? `<div class="l1">${line1}</div>` : ''}
      ${line2 ? `<div class="l2">${line2}</div>` : ''}
    </div>
  </div>
</div>
</body></html>`;

const htmlPath = path.join(dir, '_thumb_short.html');
fs.writeFileSync(htmlPath, html);

function findChromium() {
  const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, '/opt/pw-browsers'].filter(Boolean);
  const { execSync } = require('child_process');
  for (const r of roots) {
    try {
      const hit = execSync(`find ${r} -type f -name chrome 2>/dev/null | head -1`).toString().trim();
      if (hit) return hit;
    } catch (_) {}
  }
  return null;
}

(async () => {
  const { chromium } = require('playwright-core');
  let browser;
  try {
    browser = await chromium.launch({ args: ['--no-sandbox'] });
  } catch (e) {
    const exe = findChromium();
    if (!exe) throw new Error('No Chromium found. Set PLAYWRIGHT_BROWSERS_PATH or run: npx playwright install chromium');
    browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  }
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 2 });
  await page.goto('file://' + htmlPath);
  await page.waitForTimeout(400);
  const out = rel(cfg.out || 'miniatura-short');
  await page.screenshot({ path: out + '.png' });
  await page.screenshot({ path: out + '.jpg', type: 'jpeg', quality: 90 });
  await browser.close();
  console.log('Wrote ' + out + '.png and ' + out + '.jpg');
})().catch(e => { console.error(e.message); process.exit(3); });
