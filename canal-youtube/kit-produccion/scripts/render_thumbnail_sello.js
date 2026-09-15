#!/usr/bin/env node
/*
 * render_thumbnail_sello.js — variante de render_thumbnail.js con un sello
 * diagonal ("FALSO", "MITO", etc.) cruzando la imagen, en vez de una caja de
 * texto lateral.
 *
 * Por qué existe aparte: en la miniatura del video 3, un efecto sutil en la
 * imagen base (una cara con grietas) no sobrevivía la prueba de tamaño de
 * feed — a 246px se confundía con grano de foto y no comunicaba nada. Un
 * sello rojo grande cruzando la cara sí se lee de inmediato reducido, porque
 * no depende de un detalle fino: es una forma y un contraste de color.
 *
 * Usar esta variante cuando el concepto necesite decir "esto es falso/un
 * mito/una trampa" de forma gráfica y no solo con una palabra en la caja de
 * texto. Para el resto de casos, render_thumbnail.js sigue siendo la opción
 * por defecto.
 *
 * Uso:  node render_thumbnail_sello.js config.json
 *
 * config.json:
 * {
 *   "image": "base.jpg",
 *   "font": "../assets/Anton-Regular.woff2",
 *   "out": "miniatura",
 *   "sello": "FALSO",           // texto del sello diagonal
 *   "selloColor": "#C40800",
 *   "selloAngulo": -13,          // grados
 *   "selloY": 298,               // posición vertical del sello, en px (canvas 1280x720)
 *   "numero": "8",               // número/palabra grande lateral (opcional)
 *   "numeroSize": 390,
 *   "leyenda": "CATÁSTROFES",    // texto pequeño bajo el número (opcional)
 *   "accent": "#FFD400"
 * }
 */
const fs = require('fs');
const path = require('path');

const cfgPath = process.argv[2];
if (!cfgPath) { console.error('Uso: node render_thumbnail_sello.js config.json'); process.exit(1); }
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const dir = path.dirname(path.resolve(cfgPath));
const rel = p => path.isAbsolute(p) ? p : path.join(dir, p);

const accent = cfg.accent || '#FFD400';
const selloColor = cfg.selloColor || '#C40800';
const selloAngulo = cfg.selloAngulo != null ? cfg.selloAngulo : -13;
const selloY = cfg.selloY != null ? cfg.selloY : 298;
const numeroSize = cfg.numeroSize || 390;

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
  const numeroHtml = cfg.numero ? `<div class="num">
      <div class="big">${cfg.numero}</div>
      ${cfg.leyenda ? `<div class="small">${cfg.leyenda}</div>` : ''}
    </div>` : '';

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face{font-family:'Anton';src:url(data:font/woff2;base64,${fontB64}) format('woff2');}
  *{margin:0;padding:0;box-sizing:border-box;}
  html,body{width:1280px;height:720px;overflow:hidden;background:#000;}
  .stage{position:relative;width:1280px;height:720px;overflow:hidden;font-family:'Anton',sans-serif;}
  .bg{position:absolute;inset:0;background:url(data:image/jpeg;base64,${imgB64}) no-repeat;background-size:cover;background-position:left center;}
  .grad{position:absolute;inset:0;background:linear-gradient(100deg, rgba(0,0,0,0) 42%, rgba(0,0,0,0.55) 56%, rgba(0,0,0,0.88) 68%);}
  .stamp{
    position:absolute; left:-60px; top:${selloY}px; width:900px; height:150px;
    background:${selloColor}; transform:rotate(${selloAngulo}deg);
    display:flex; align-items:center; justify-content:center;
    border-top:7px solid #fff; border-bottom:7px solid #fff;
    box-shadow:0 10px 40px rgba(0,0,0,0.55);
  }
  .stamp span{
    color:#fff; font-size:118px; letter-spacing:6px; line-height:1;
    text-shadow:0 4px 0 rgba(0,0,0,0.35);
  }
  .num{position:absolute; right:70px; top:96px; text-align:right;}
  .num .big{
    color:${accent}; font-size:${numeroSize}px; line-height:0.82; letter-spacing:-10px;
    text-shadow:-6px 6px 0 #0B0B0C, 0 10px 26px rgba(0,0,0,.5);
  }
  .num .small{
    display:inline-block; margin-top:6px; padding:10px 20px;
    background:#0B0B0C; color:#fff; font-size:46px; letter-spacing:2px;
  }
  </style></head><body>
  <div class="stage">
    <div class="bg"></div>
    <div class="grad"></div>
    <div class="stamp"><span>${cfg.sello || ''}</span></div>
    ${numeroHtml}
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
