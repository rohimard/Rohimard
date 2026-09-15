#!/usr/bin/env node
/*
 * srt_align.js — builds an .srt whose timings are anchored to the REAL pauses
 * in the audio instead of being estimated from the text.
 *
 * Why: however good a text-based estimate is, its errors accumulate, so by the
 * middle of a video the subtitles have drifted seconds behind the voice. The
 * fix is to stop guessing where sentences end and measure it.
 *
 *   1. Decode the MP3 and take the RMS energy of every 20 ms frame.
 *   2. Frames under an adaptive threshold, for long enough, are the pauses the
 *      narrator actually took.
 *   3. Cut the script into subtitle cues. Cues that end a sentence or paragraph
 *      are "strong" boundaries and should coincide with one of those pauses.
 *   4. Match boundaries to pauses in order — never reusing one, never placing
 *      two so close together that the cue between them is unreadable.
 *   5. Between two anchors, share the time out by character count.
 *
 * Re-anchoring every couple of sentences is what stops drift from building up.
 *
 * Usage:  node srt_align.js guion.txt audio.mp3 [out.srt]
 * Needs:  npm install mpg123-decoder
 */
const fs = require('fs');
const { MPEGDecoder } = require('mpg123-decoder');

const SCRIPT = process.argv[2];
const AUDIO = process.argv[3];
const OUT = process.argv[4] || 'subtitulos.srt';
if (!SCRIPT || !AUDIO) { console.error('Usage: node srt_align.js guion.txt audio.mp3 [out.srt]'); process.exit(1); }

const MAX_LINE = 42, MAX_LINES = 2;
const CUE_CAP = MAX_LINE * MAX_LINES - 8;  // slack so the 2-line wrap always finds a break
const FRAME = 0.02;                        // energy window, seconds
const MIN_SIL = 0.16;                      // shortest gap that counts as a pause
const SNAP_STRONG = 2.5;                   // search radius at a sentence end
const SNAP_WEAK = 0.8;                     // search radius mid-sentence (breaths at commas)
const MIN_CUE = 0.9;                       // below this a subtitle cannot be read
const MAX_ON_SCREEN = 6.0;                 // past this it just sits there stale
const LEAD = 0.06;                         // appear a hair before the voice
const GAP = 0.08;                          // air between consecutive cues

/* ---------- 1. script -> cues ---------- */
const paragraphs = fs.readFileSync(SCRIPT, 'utf8').trim()
  .split(/\n\s*\n/).map(p => p.replace(/\s+/g, ' ').trim());
const sentencesOf = p => p.match(/[^.!?…]+[.!?…]+["'»]?|\S+$/g) || [p];

function split(sentence) {
  if (sentence.length <= CUE_CAP) return [sentence];
  const out = []; let rest = sentence.trim();
  while (rest.length > CUE_CAP) {
    const w = rest.slice(0, CUE_CAP + 1);
    let cut = Math.max(w.lastIndexOf(', '), w.lastIndexOf('; '), w.lastIndexOf(': '), w.lastIndexOf(' — '));
    cut = cut > CUE_CAP * 0.45 ? cut + 1 : w.lastIndexOf(' ');
    if (cut <= 0) cut = CUE_CAP;
    out.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest && rest.length < 12 && out.length && (out[out.length - 1] + ' ' + rest).length <= CUE_CAP) {
    out[out.length - 1] += ' ' + rest; rest = '';
  }
  if (rest) out.push(rest);
  return out;
}

const cues = [];
paragraphs.forEach((p, pi) => {
  const sents = sentencesOf(p).map(s => s.trim()).filter(Boolean);
  sents.forEach((s, si) => {
    const parts = split(s);
    parts.forEach((text, ci) => {
      const endsSentence = ci === parts.length - 1;
      cues.push({
        para: pi, text, chars: text.replace(/\s/g, '').length,
        strong: endsSentence,
        endsParagraph: endsSentence && si === sents.length - 1,
      });
    });
  });
});

// Staccato one-liners ("Grandes. Brillantes. Civilizadores.") read as blinks on
// their own — join them while they still fit two lines.
for (let i = 0; i < cues.length - 1; ) {
  const a = cues[i], b = cues[i + 1];
  const joined = a.text + ' ' + b.text;
  if (a.para === b.para && Math.min(a.text.length, b.text.length) < 30 && joined.length <= CUE_CAP) {
    a.text = joined; a.chars = joined.replace(/\s/g, '').length;
    a.strong = b.strong; a.endsParagraph = b.endsParagraph;
    cues.splice(i + 1, 1);
  } else i++;
}

/* ---------- 2. audio -> real pauses ---------- */
(async () => {
  const dec = new MPEGDecoder(); await dec.ready;
  const { channelData, sampleRate: sr } = dec.decode(new Uint8Array(fs.readFileSync(AUDIO)));
  const pcm = channelData[0];
  const TOTAL = pcm.length / sr;
  dec.free();

  const F = Math.round(sr * FRAME);
  const rms = [];
  for (let i = 0; i + F <= pcm.length; i += F) {
    let s = 0; for (let j = i; j < i + F; j++) s += pcm[j] * pcm[j];
    rms.push(Math.sqrt(s / F));
  }
  const sorted = [...rms].sort((a, b) => a - b);
  const pct = q => sorted[Math.floor(sorted.length * q)];
  const thr = Math.max(pct(0.10) * 2.2, pct(0.5) * 0.10);

  const sils = []; let run = 0;
  rms.forEach((v, i) => {
    if (v < thr) run++;
    else { if (run * FRAME >= MIN_SIL) sils.push({ start: (i - run) * FRAME, end: i * FRAME }); run = 0; }
  });
  if (run * FRAME >= MIN_SIL) sils.push({ start: (rms.length - run) * FRAME, end: rms.length * FRAME });

  const speechStart = sils.length && sils[0].start < 0.05 ? sils[0].end : 0;

  /* ---------- 3. rough guess, only to know where to look for each pause ---------- */
  const totalChars = cues.reduce((a, c) => a + c.chars, 0);
  let t = speechStart;
  cues.forEach(c => { c.estStart = t; t += (TOTAL - speechStart) * c.chars / totalChars; });

  /* ---------- 4. snap boundaries to pauses ---------- */
  // A cue after a boundary starts when the voice comes back — the END of a
  // pause. Walk forward so a pause is never reused, and refuse any anchor that
  // would leave the cues before it less than MIN_CUE each: two anchors landing
  // almost on top of each other is what produces unreadable 0.2 s flashes.
  let si = 0, anchored = 0;
  let lastT = speechStart, lastI = 0;
  for (let i = 1; i < cues.length; i++) {
    const strong = cues[i - 1].strong;
    const radius = strong ? SNAP_STRONG : SNAP_WEAK;
    const floor = lastT + MIN_CUE * (i - lastI);
    while (si < sils.length && sils[si].end < cues[i].estStart - radius) si++;
    let best = null;
    for (let k = si; k < sils.length && sils[k].end <= cues[i].estStart + radius; k++) {
      const cand = sils[k].end;
      if (cand < floor) continue;                                   // would squash what came before
      const len = sils[k].end - sils[k].start;
      if (!strong && len < 0.20) continue;                          // mid-sentence needs a real breath
      const score = Math.abs(cand - cues[i].estStart) - (cues[i - 1].endsParagraph ? len * 0.6 : 0);
      if (!best || score < best.score) best = { score, k, cand };
    }
    if (best) {
      cues[i].anchor = best.cand;
      si = best.k + 1; lastT = best.cand; lastI = i; anchored++;
    }
  }

  /* ---------- 5. spread each span by character count ---------- */
  const anchors = [0, ...cues.map((c, i) => (c.anchor !== undefined ? i : -1)).filter(i => i > 0), cues.length];
  for (let a = 0; a < anchors.length - 1; a++) {
    const from = anchors[a], to = anchors[a + 1];
    const t0 = from === 0 ? speechStart : cues[from].anchor;
    const t1 = to === cues.length ? TOTAL : cues[to].anchor;
    const span = t1 - t0;
    const n = to - from;
    // Water-filling: share the span by character count, but never let a cue
    // fall under MIN_CUE. Short cues are pinned to the minimum and the rest is
    // re-shared among the ones that can still give time away. Sharing purely by
    // characters is what left 0.3 s flashes when a two-word cue sat between two
    // long ones.
    let dur = cues.slice(from, to).map(c => c.chars);
    const totalC = dur.reduce((a, b) => a + b, 0) || 1;
    dur = dur.map(c => span * c / totalC);
    if (span >= n * MIN_CUE) {
      for (let pass = 0; pass < 8; pass++) {
        const pinned = dur.map(d => d <= MIN_CUE + 1e-9);
        if (!pinned.some(Boolean)) break;
        const fixedTime = pinned.filter(Boolean).length * MIN_CUE;
        const freeIdx = dur.map((_, k) => k).filter(k => !pinned[k]);
        const freeTime = span - fixedTime;
        const freeC = freeIdx.reduce((a, k) => a + cues[from + k].chars, 0) || 1;
        let changed = false;
        dur = dur.map((d, k) => {
          if (pinned[k]) return MIN_CUE;
          const nd = freeTime * cues[from + k].chars / freeC;
          if (Math.abs(nd - d) > 1e-6) changed = true;
          return nd;
        });
        if (!changed && !dur.some(d => d < MIN_CUE - 1e-9)) break;
      }
    } else {
      dur = dur.map(() => span / n);   // span too tight for everyone: split evenly
    }
    let cursor = t0;
    for (let i = from; i < to; i++) {
      cues[i].start = cursor;
      cursor += dur[i - from];
      cues[i].end = cursor;
    }
    cues[to - 1].end = t1;
  }

  /* ---------- 6. write ---------- */
  const wrap = x => {
    if ([...x].length <= MAX_LINE) return x;
    let best = null;
    for (let i = 0; i < x.length; i++) {
      if (x[i] !== ' ') continue;
      const l1 = x.slice(0, i), l2 = x.slice(i + 1);
      if ([...l1].length > MAX_LINE || [...l2].length > MAX_LINE) continue;
      const score = Math.abs(l1.length - l2.length);
      if (!best || score < best.score) best = { l1, l2, score };
    }
    if (best) return best.l1 + '\n' + best.l2;
    const mid = Math.floor(x.length / 2); let at = -1;
    for (let i = 0; i < x.length; i++) if (x[i] === ' ' && (at < 0 || Math.abs(i - mid) < Math.abs(at - mid))) at = i;
    return at > 0 ? x.slice(0, at) + '\n' + x.slice(at + 1) : x;
  };
  const ts = s => {
    const ms = Math.max(0, Math.round(s * 1000));
    const p = (n, w) => String(n).padStart(w, '0');
    return `${p(Math.floor(ms / 3600000), 2)}:${p(Math.floor(ms % 3600000 / 60000), 2)}:${p(Math.floor(ms % 60000 / 1000), 2)},${p(ms % 1000, 3)}`;
  };

  const rows = cues.map((c, i) => {
    const start = Math.max(0, c.start - LEAD);
    const end = Math.min(Math.max(start + 0.6, c.end - GAP), start + MAX_ON_SCREEN);
    return { i, start, end, text: wrap(c.text) };
  });
  fs.writeFileSync(OUT, rows.map(r => `${r.i + 1}\n${ts(r.start)} --> ${ts(r.end)}\n${r.text}\n`).join('\n'));

  const durs = cues.map(c => c.end - c.start);
  const short = durs.filter(d => d < MIN_CUE).length;
  console.log(`Wrote ${OUT}`);
  console.log(`  audio ${TOTAL.toFixed(2)}s · la voz entra en ${speechStart.toFixed(2)}s`);
  console.log(`  ${cues.length} subtítulos · ${anchored} anclados a una pausa real (${(anchored / cues.length * 100).toFixed(0)}%)`);
  console.log(`  pausas detectadas: ${sils.length} (umbral ${thr.toFixed(4)}, mínimo ${MIN_SIL}s)`);
  console.log(`  duración: min ${Math.min(...durs).toFixed(1)}s · media ${(durs.reduce((a, b) => a + b, 0) / durs.length).toFixed(1)}s · max ${Math.max(...durs).toFixed(1)}s`);
  console.log(`  subtítulos por debajo de ${MIN_CUE}s: ${short}`);
})();
