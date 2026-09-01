#!/usr/bin/env node
/*
 * brand_assets.js — renders a channel's logo (avatar) and banner to PNG.
 *
 * Why a script: logo and banner must share the exact palette and type of the
 * thumbnails, and they get re-rendered every time the wording changes. Doing
 * it in a design tool by hand drifts; doing it here keeps one source of truth.
 *
 * Sizes follow YouTube's specs:
 *   - avatar: 800x800 (shown as a circle, often at 24-48px — keep it bold)
 *   - banner: 2048x1152, but ONLY the centred 1235x338 is visible on phone
 *     and desktop. Everything outside that is TV-only bleed.
 *
 * Usage:  node brand_assets.js brand.json
 *
 * brand.json shape:
 * {
 *   "font": "../assets/Anton-Regular.woff2",
 *   "outDir": ".",
 *   "line1": "HISTORIA",          // banner: first word (white)
 *   "line2": "INCÓMODA",          // banner: second word (accent colour)
 *   "tagline": "LA VERSIÓN QUE NO TE CONTARON EN CLASE",
 *   "subline": "…",                // optional second line under the tagline
 *   "bannerName": "banner",        // output filename stem for the banner
 *   "monogram": "HI",             // avatar variant "mono"
 *   "accent": "#FFD400",
 *   "alarm":  "#E10600",
 *   "ink":    "#0B0B0C",
 *   "guides": true                 // also write banner-guides.png with the safe area drawn
 * }
 */
const fs = require('fs');
const path = require('path');

const cfgPath = process.argv[2];
if (!cfgPath) { console.error('Usage: node brand_assets.js brand.json'); process.exit(1); }
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const dir = path.dirname(path.resolve(cfgPath));
const rel = p => path.isAbsolute(p) ? p : path.join(dir, p);
const out = p => path.join(rel(cfg.outDir || '.'), p);

const accent = cfg.accent || '#FFD400';
const alarm = cfg.alarm || '#E10600';
const ink = cfg.ink || '#0B0B0C';
const fontB64 = fs.readFileSync(rel(cfg.font)).toString('base64');

const face = `@font-face{font-family:'Anton';src:url(data:font/woff2;base64,${fontB64}) format('woff2');}`;
const reset = `*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Anton',sans-serif;}`;
// Grain + vignette give the flat colour some depth so it doesn't read as a template.
const texture = `
  radial-gradient(120% 100% at 50% 40%, rgba(255,255,255,0.07) 0%, rgba(0,0,0,0) 60%),
  radial-gradient(140% 120% at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 100%)`;

/* ---------- avatar variants ---------- */
// Asterisk drawn as SVG rather than a glyph: full control of stroke weight so
// it still reads as one shape at 24px.
const asterisk = c => `<svg viewBox="0 0 100 100" width="440" height="440">
  <g stroke="${c}" stroke-width="15" stroke-linecap="round">
    <line x1="50" y1="14" x2="50" y2="86"/>
    <line x1="19" y1="32" x2="81" y2="68"/>
    <line x1="19" y1="68" x2="81" y2="32"/>
  </g></svg>`;

const avatarHTML = inner => `<!doctype html><meta charset="utf-8"><style>${face}${reset}
html,body{width:800px;height:800px;overflow:hidden;}
.a{width:800px;height:800px;background:${ink};background-image:${texture};
   display:flex;align-items:center;justify-content:center;}
.mono{font-size:400px;line-height:0.8;letter-spacing:-10px;}
.bar{width:300px;height:34px;background:${alarm};margin-top:26px;}
.col{display:flex;flex-direction:column;align-items:center;}
</style><div class="a">${inner}</div>`;

// Redaction mark: something was blacked out. Reads as one solid shape at 24px.
const redaction = `<div style="width:560px;height:560px;background:${accent};
   display:flex;align-items:center;justify-content:center;">
   <div style="width:400px;height:112px;background:${ink};"></div></div>`;

const avatars = {
  'logo-asterisco': avatarHTML(asterisk(accent)),
  'logo-monograma': avatarHTML(
    `<div class="col"><div class="mono" style="color:${accent}">${cfg.monogram || 'HI'}</div><div class="bar"></div></div>`),
  'logo-asterisco-rojo': avatarHTML(
    `<div class="col">${asterisk(alarm)}</div>`),
  'logo-censura': avatarHTML(redaction),
};

/* ---------- banner ---------- */
const SAFE_W = 1235, SAFE_H = 338;
const bannerHTML = (guides) => `<!doctype html><meta charset="utf-8"><style>${face}${reset}
html,body{width:2048px;height:1152px;overflow:hidden;}
.b{position:relative;width:2048px;height:1152px;background:${ink};background-image:${texture};
   overflow:hidden;}
/* Oversized mark bleeding outside the safe area: fills the desktop/TV crop so it
   doesn't read as an empty void, without competing with the wordmark. */
.bleed{position:absolute;top:50%;transform:translateY(-50%);opacity:.05;}
.bleed.l{left:110px;} .bleed.r{right:110px;}
.safe{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
      width:${SAFE_W}px;height:${SAFE_H}px;display:flex;flex-direction:column;
      align-items:center;justify-content:center;}
/* flex-shrink:0 everywhere — without it the thin rule collapses to nothing
   when the stack is taller than the safe box. */
.safe > *{flex:none;}
/* One line, not two: avoids the Ó accent colliding with the line above and
   lets the wordmark run much bigger inside the same safe area. */
/* line-height has to leave room for accented caps (Ó): Anton's accent sits
   above the em box, so a tight line-height pushes it outside the safe area. */
.word{font-size:126px;line-height:1.3;letter-spacing:2px;white-space:nowrap;}
.word .a{color:#fff;} .word .b2{color:${accent};}
.rule{width:520px;height:11px;background:${alarm};margin:22px 0 18px;}
/* With no second line the tagline carries the banner alone, so it runs bigger. */
.tag{font-size:${cfg.subline ? 29 : 40}px;color:#fff;letter-spacing:${cfg.subline ? 6 : 5}px;opacity:.95;}
.sch{margin-top:14px;font-size:22px;letter-spacing:5px;color:${accent};opacity:.85;}
.guide{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
       width:${SAFE_W}px;height:${SAFE_H}px;border:3px dashed rgba(255,0,0,.9);}
.glabel{position:absolute;left:50%;transform:translateX(-50%);top:calc(50% + ${SAFE_H / 2}px + 14px);
        font-size:26px;color:rgba(255,0,0,.9);letter-spacing:3px;}
.bleed svg{width:620px;height:620px;}
</style><div class="b">
  <div class="bleed l">${asterisk('#ffffff')}</div>
  <div class="bleed r">${asterisk('#ffffff')}</div>
  <div class="safe">
    <div class="word"><span class="a">${cfg.line1 || ''}</span> <span class="b2">${cfg.line2 || ''}</span></div>
    <div class="rule"></div>
    <div class="tag">${cfg.tagline || ''}</div>
    ${cfg.subline ? `<div class="sch">${cfg.subline}</div>` : ''}
  </div>
  ${guides ? `<div class="guide"></div><div class="glabel">ZONA SEGURA 1235 x 338 — TODO LO DE FUERA SOLO SE VE EN TV</div>` : ''}
</div>`;

(async () => {
  const { chromium } = require('playwright-core');
  const { execSync } = require('child_process');
  let exe = null;
  try { exe = execSync('find /opt/pw-browsers -type f -name chrome 2>/dev/null | head -1').toString().trim(); } catch (_) {}
  const browser = exe
    ? await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] })
    : await chromium.launch({ args: ['--no-sandbox'] });

  const shoot = async (html, w, h, file) => {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await page.setContent(html);
    await page.waitForTimeout(300);
    await page.screenshot({ path: file });
    await page.close();
    console.log('Wrote ' + file);
  };

  for (const [name, html] of Object.entries(avatars)) await shoot(html, 800, 800, out(name + '.png'));
  const bn = cfg.bannerName || 'banner';
  await shoot(bannerHTML(false), 2048, 1152, out(bn + '.png'));
  if (cfg.guides) await shoot(bannerHTML(true), 2048, 1152, out(bn + '-guias.png'));

  await browser.close();
})().catch(e => { console.error(e.message); process.exit(3); });
