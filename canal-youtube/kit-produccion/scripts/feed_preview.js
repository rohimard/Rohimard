#!/usr/bin/env node
/*
 * feed_preview.js — renders a thumbnail at real YouTube feed size so you can
 * apply the kit's legibility test ("shrink it and check the big word still
 * reads") before publishing. 246px wide is roughly a home-feed card on desktop.
 *
 * Usage:  node feed_preview.js miniatura.jpg [width=246] [out.png]
 *
 * Needs playwright-core (same dependency as render_thumbnail.js):
 *   npm install playwright-core
 */
const fs = require('fs');
(async () => {
  const { chromium } = require('playwright-core');
  const { execSync } = require('child_process');
  let exe = null;
  try { exe = execSync('find /opt/pw-browsers -type f -name chrome 2>/dev/null | head -1').toString().trim(); } catch (_) {}
  const browser = exe
    ? await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] })
    : await chromium.launch({ args: ['--no-sandbox'] });
  const b64 = fs.readFileSync(process.argv[2]).toString('base64');
  const W = parseInt(process.argv[3] || '246', 10), H = Math.round(W * 9 / 16);
  const out = process.argv[4] || 'feed-preview.png';
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><body style="margin:0;background:#f2f2f2"><img src="data:image/jpeg;base64,${b64}" style="width:${W}px;height:${H}px;display:block">`);
  await page.waitForTimeout(200);
  await page.screenshot({ path: out });
  await browser.close();
  console.log('Wrote ' + out);
})().catch(e => { console.error(e.message); process.exit(3); });
