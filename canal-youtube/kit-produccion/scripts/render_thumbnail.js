#!/usr/bin/env node
/*
 * render_thumbnail.js — burns YouTube thumbnail text onto a generated base image.
 *
 * Image generators (Flow, Imagen, Midjourney) render text badly, so we generate
 * the base image clean and composite the headline here with the Anton display
 * face for a crisp, high-CTR look. Output is a 1280x720 PNG (edit-quality) and a
 * JPG (upload-ready, < 2 MB). Uses headless Chromium via playwright-core.
 *
 * Setup (once):  npm install playwright-core
 *   Chromium: the script tries playwright's own launch first; if the bundled
 *   revision mismatches, it searches PLAYWRIGHT_BROWSERS_PATH / /opt/pw-browsers
 *   for a chrome binary and uses that.
 *
 * Usage:  node render_thumbnail.js config.json
 *
 * config.json shape (all text fields optional except image/out/font):
 * {
 *   "image": "base.jpg",              // the generated base image (person on one side)
 *   "font":  "../assets/Anton-Regular.woff2",
 *   "out":   "miniatura",             // writes miniatura.png + miniatura.jpg
 *   "number": "95%",                  // the big attention word/number
 *   "line1":  "DE TU SUELDO",         // white subhead
 *   "line2":  "SE VA EN LA CASA",     // white on the alarm-color box
 *   "side":   "left",                 // which side holds the text: "left" or "right"
 *   "numberSize": 300,                // px. Drop it for a headline that is a phrase
 *                                     // rather than a number — 300 only fits ~5 chars.
 *   "accent": "#FFD400",              // number color
 *   "alarm":  "#E10600"              // box color
 * }
 */
const fs = require('fs');
const path = require('path');

const cfgPath = process.argv[2];
if (!cfgPath) { console.error('Usage: node render_thumbnail.js config.json'); process.exit(1); }
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const dir = path.dirname(path.resolve(cfgPath));
const rel = p => path.isAbsolute(p) ? p : path.join(dir, p);

const accent = cfg.accent || '#FFD400';
const alarm = cfg.alarm || '#E10600';
const side = cfg.side === 'right' ? 'right' : 'left';
// A number fits at 300px; a whole phrase does not, and silently overflows the
// frame. Let the config drop the size when the headline is words, not digits.
const numSize = cfg.numberSize || 300;
const imgB64 = fs.readFileSync(rel(cfg.image)).toString('base64');
const fontB64 = fs.readFileSync(rel(cfg.font)).toString('base64');
const number = cfg.number || '';
const line1 = cfg.line1 || '';
const line2 = cfg.line2 || '';
const align = side === 'left' ? 'left:48px;' : 'right:48px;text-align:right;';
const objPos = side === 'left' ? 'right center' : 'left center';
const gradDir = side === 'left' ? '90deg' : '270deg';

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Anton';src:url(data:font/woff2;base64,${fontB64}) format('woff2');}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:1280px;height:720px;overflow:hidden;background:#000;}
.stage{position:relative;width:1280px;height:720px;overflow:hidden;font-family:'Anton',sans-serif;}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${objPos};
    filter:saturate(1.12) contrast(1.06) brightness(1.02);}
.vig{position:absolute;inset:0;background:
    radial-gradient(120% 120% at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%),
    linear-gradient(${gradDir}, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0) 55%);}
.txt{position:absolute;${align}top:96px;z-index:5;}
.num{font-size:${numSize}px;line-height:0.92;color:${accent};
     -webkit-text-stroke:9px #000;paint-order:stroke fill;
     text-shadow:0 14px 26px rgba(0,0,0,0.85);transform:rotate(-4deg);transform-origin:${side} center;letter-spacing:${numSize > 200 ? -6 : -2}px;}
.sub{margin-top:14px;transform:rotate(-2deg);transform-origin:${side} center;}
.l1{font-size:70px;line-height:1.0;color:#fff;-webkit-text-stroke:6px #000;paint-order:stroke fill;
    text-shadow:0 8px 16px rgba(0,0,0,0.8);letter-spacing:1px;}
.l2{display:inline-block;margin-top:8px;background:${alarm};padding:4px 16px 8px;
    font-size:70px;line-height:1.0;color:#fff;-webkit-text-stroke:2px #000;paint-order:stroke fill;
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

const htmlPath = path.join(dir, '_thumb.html');
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
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
  await page.goto('file://' + htmlPath);
  await page.waitForTimeout(400);
  const out = rel(cfg.out || 'miniatura');
  await page.screenshot({ path: out + '.png' });
  await page.screenshot({ path: out + '.jpg', type: 'jpeg', quality: 90 });
  await browser.close();
  console.log('Wrote ' + out + '.png and ' + out + '.jpg');
})().catch(e => { console.error(e.message); process.exit(3); });
