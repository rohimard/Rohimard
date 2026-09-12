#!/usr/bin/env node
/*
 * render_thumbnail_redacted.js — variante de render_thumbnail.js / _sello.js
 * con una barra horizontal negra tipo "documento censurado/desclasificado"
 * en vez de un sello diagonal rojo.
 *
 * Por qué existe aparte: el sello diagonal ("FALSO", "MANIPULADO"...) se lee
 * como una etiqueta genérica de "cancelado/oferta" — funciona para un mito
 * histórico contado de fuera, pero no transmite "esto viene de un archivo
 * real" cuando el giro del video es justo ese (grabaciones desclasificadas,
 * documentos, investigación). La barra negra con marcas de tachado a los
 * lados imita directamente ese lenguaje visual.
 *
 * Usar esta variante cuando el concepto necesite decir "esto salió de un
 * archivo/documento oculto" de forma gráfica. Para un mito contado como
 * leyenda popular sin ese ángulo documental, `render_thumbnail_sello.js`
 * sigue siendo la opción por defecto.
 *
 * Uso:  node render_thumbnail_redacted.js config.json
 *
 * config.json:
 * {
 *   "image": "base.jpg",
 *   "font": "../assets/Anton-Regular.woff2",
 *   "out": "miniatura",
 *   "text": "MANIPULADO",   // texto de la barra
 *   "sub": "ARCHIVO 1971",   // etiqueta pequeña opcional, esquina superior derecha
 *   "barY": 460,             // posición vertical de la barra, en px (canvas 1280x720)
 *   "barH": 120              // alto de la barra
 * }
 */
const fs = require('fs');
const path = require('path');
const cfgPath = process.argv[2];
if (!cfgPath) { console.error('Uso: node render_thumbnail_redacted.js config.json'); process.exit(1); }
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const dir = path.dirname(path.resolve(cfgPath));
const rel = p => path.isAbsolute(p) ? p : path.join(dir, p);

(async () => {
  const { chromium } = require('playwright-core');
  const { execSync } = require('child_process');
  let exe = null;
  try { exe = execSync('find /opt/pw-browsers -type f -name chrome 2>/dev/null | head -1').toString().trim(); } catch (_) {}
  const browser = exe
    ? await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] })
    : await chromium.launch({ args: ['--no-sandbox'] });

  const imgB64 = fs.readFileSync(rel(cfg.image)).toString('base64');
  const fontB64 = fs.readFileSync(rel(cfg.font)).toString('base64');
  const barY = cfg.barY;
  const barH = cfg.barH || 118;
  const text = cfg.text || 'MANIPULADO';
  const sub = cfg.sub || '';

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face{font-family:'Anton';src:url(data:font/woff2;base64,${fontB64}) format('woff2');}
  *{margin:0;padding:0;box-sizing:border-box;}
  html,body{width:1280px;height:720px;overflow:hidden;background:#000;}
  .stage{position:relative;width:1280px;height:720px;overflow:hidden;font-family:'Anton',sans-serif;}
  .bg{position:absolute;inset:0;background:url(data:image/jpeg;base64,${imgB64}) no-repeat;background-size:cover;background-position:left center;}
  .bar{
    position:absolute; left:0; top:${barY}px; width:100%; height:${barH}px;
    background:#0B0B0C;
    display:flex; align-items:center; padding:0 48px;
    border-top:3px solid #C40800; border-bottom:3px solid #C40800;
  }
  .bar .redact{
    display:inline-block; width:34px; height:${barH - 40}px; background:#000; margin-right:20px;
    border:2px solid #2a2a2a;
  }
  .bar span.txt{
    color:#fff; font-size:82px; letter-spacing:4px; line-height:1;
    text-shadow:0 3px 0 rgba(0,0,0,0.5);
  }
  .tag{
    position:absolute; right:56px; top:${barY - 54}px;
    background:#C40800; color:#fff; font-size:26px; letter-spacing:3px;
    padding:8px 16px;
  }
  </style></head><body>
  <div class="stage">
    <div class="bg"></div>
    <div class="bar">
      <div class="redact"></div>
      <span class="txt">${text}</span>
      <div class="redact" style="margin-left:20px;margin-right:0;"></div>
    </div>
    ${sub ? `<div class="tag">${sub}</div>` : ''}
  </div>
  </body></html>`;

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
  await page.setContent(html);
  await page.waitForTimeout(200);
  const outBase = rel(cfg.out || 'miniatura');
  await page.screenshot({ path: outBase + '.png' });
  await browser.close();
  console.log('Wrote ' + outBase + '.png (convertir a .jpg con topng2jpg.js antes de subir)');
})();
