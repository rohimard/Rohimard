#!/usr/bin/env node
/*
 * timing_sheet.js — builds a cut sheet that fits exactly the real audio length.
 *
 * The idea: a still image (or a Veo clip) should stay on screen roughly as long
 * as the narration it illustrates. So we weight each scene by how many WORDS of
 * script it covers, spread the total audio duration across those weights, clamp
 * very short beats up to a minimum so they still register, then reconcile the
 * rounding so the columns sum to the audio length to the second. The output is a
 * Markdown table grouped by narrative block, with In/Out timecodes ready to drop
 * on a timeline.
 *
 * Usage:  node timing_sheet.js segments.json <audio_seconds> [min_seconds] [out_prefix]
 *   If out_prefix is given, also writes <out_prefix>.csv (for Excel/Sheets) and
 *   <out_prefix>.txt (aligned, to keep open while editing) — the same numbers as
 *   the Markdown, so the creator has a downloadable cut sheet every time.
 *
 * segments.json shape:
 * {
 *   "segments": [
 *     { "id": "1", "block": "GANCHO", "cue": "Son las ocho... la nevera vacía",
 *       "text": "Son las ocho de la tarde. Llegas a casa, abres la nevera..." },
 *     ...
 *   ]
 * }
 * `text` is the exact narration this scene covers (used only to count words).
 * Every word of the script must belong to exactly one scene, in order — that is
 * what keeps the sheet honest.
 */
const fs = require('fs');
const cfgPath = process.argv[2];
const audioSeconds = parseFloat(process.argv[3]);
const minSeconds = process.argv[4] ? parseFloat(process.argv[4]) : 3;
const outPrefix = process.argv[5] || null;
if (!cfgPath || !audioSeconds) { console.error('Usage: node timing_sheet.js segments.json <audio_seconds> [min_seconds] [out_prefix]'); process.exit(1); }

const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const segs = cfg.segments.map(s => ({ ...s, words: (s.text || '').trim().split(/\s+/).filter(Boolean).length }));
const totalWords = segs.reduce((a, s) => a + s.words, 0);
if (totalWords === 0) { console.error('No word text found in segments.'); process.exit(2); }

// 1) Proportional seconds by word share.
segs.forEach(s => { s.dur = s.words / totalWords * audioSeconds; });

// 2) Clamp short beats to the minimum, then rescale the rest to still hit total.
for (let pass = 0; pass < 6; pass++) {
  const clamped = segs.filter(s => s.dur < minSeconds);
  const free = segs.filter(s => s.dur >= minSeconds);
  if (clamped.length === 0) break;
  const usedByClamp = clamped.length * minSeconds;
  const freeWords = free.reduce((a, s) => a + s.words, 0) || 1;
  clamped.forEach(s => { s.dur = minSeconds; });
  const remaining = audioSeconds - usedByClamp;
  free.forEach(s => { s.dur = Math.max(minSeconds, s.words / freeWords * remaining); });
}

// 3) Round to whole seconds and reconcile drift onto the longest scenes.
segs.forEach(s => { s.dur = Math.round(s.dur); });
let drift = Math.round(audioSeconds) - segs.reduce((a, s) => a + s.dur, 0);
const byLen = [...segs].sort((a, b) => b.dur - a.dur);
let i = 0;
while (drift !== 0) {
  const s = byLen[i % byLen.length];
  if (drift > 0) { s.dur += 1; drift -= 1; }
  else if (s.dur > minSeconds) { s.dur -= 1; drift += 1; }
  i++;
}

// 4) Emit a Markdown sheet grouped by block, with cumulative In/Out.
const mmss = t => `${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(2, '0')}`;
let clock = 0, lastBlock = null, out = [], rows = [];
out.push(`## Hoja de montaje — total ${mmss(Math.round(audioSeconds))} (${Math.round(audioSeconds)} s) · ${segs.length} imágenes\n`);
for (const s of segs) {
  if (s.block !== lastBlock) {
    out.push(`\n### ${s.block}`);
    out.push('| # | Entra | Sale | Dur | Frase / cue |');
    out.push('|---|------|------|-----|-------------|');
    lastBlock = s.block;
  }
  const entra = mmss(clock); clock += s.dur; const sale = mmss(clock);
  out.push(`| ${s.id} | ${entra} | ${sale} | ${s.dur}s | ${s.cue} |`);
  rows.push({ id: s.id, block: s.block, entra, sale, dur: s.dur, cue: s.cue });
}
const grand = segs.reduce((a, s) => a + s.dur, 0);
out.push(`\n**Total: ${mmss(grand)} (${grand} s).**`);
console.log(out.join('\n'));

if (outPrefix) {
  // CSV for spreadsheets (semicolon-separated, UTF-8 BOM so Excel shows accents).
  const esc = s => /[";\n]/.test(s) ? '"' + String(s).replace(/"/g, '""') + '"' : String(s);
  let csv = 'Plano;Bloque;Entra;Sale;Duracion (s);Escena\n';
  csv += rows.map(r => [r.id, r.block, r.entra, r.sale, r.dur, r.cue].map(esc).join(';')).join('\n') + '\n';
  fs.writeFileSync(outPrefix + '.csv', '﻿' + csv);
  // Aligned TXT to keep open while editing.
  const pad = (s, n) => String(s).padEnd(n);
  let txt = `HOJA DE MONTAJE — Total ${mmss(grand)} (${grand} s) · ${rows.length} imágenes\n${'='.repeat(74)}\n`;
  let lb = null;
  for (const r of rows) {
    if (r.block !== lb) { txt += `\n### ${r.block}\n` + pad('#', 8) + pad('ENTRA', 8) + pad('SALE', 8) + pad('DUR', 6) + 'ESCENA\n' + '-'.repeat(74) + '\n'; lb = r.block; }
    txt += pad(r.id, 8) + pad(r.entra, 8) + pad(r.sale, 8) + pad(r.dur + 's', 6) + r.cue + '\n';
  }
  txt += `\n${'-'.repeat(74)}\nTOTAL: ${mmss(grand)} (${grand} s)\nNota: zoom lento (Ken Burns) en planos >=8s; ancla a la onda los datos y golpes clave.\n`;
  fs.writeFileSync(outPrefix + '.txt', txt);
  console.error(`\n[archivos] ${outPrefix}.csv y ${outPrefix}.txt`);
}
