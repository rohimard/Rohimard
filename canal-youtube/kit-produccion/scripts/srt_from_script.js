#!/usr/bin/env node
/*
 * srt_from_script.js — builds an .srt from the narration script + the real
 * audio duration.
 *
 * Why not just split the duration by word count: a narrator does not speak at
 * a constant rate. They stop at full stops and stop longer between paragraphs,
 * and those silences are a real chunk of the runtime. So the model here is:
 *
 *   total = speech + pauses
 *   pauses = a fixed allowance at every sentence end and paragraph end
 *   speech = shared out in proportion to CHARACTERS (a better proxy for how
 *            long a phrase takes to say than word count, since word lengths
 *            vary a lot in Spanish)
 *
 * Cues are then cut to subtitle-legible size: max 2 lines, ~42 chars a line,
 * broken at punctuation where possible, never leaving an orphan word.
 *
 * Usage:  node srt_from_script.js guion.txt <audio_seconds> [out.srt]
 */
const fs = require('fs');

const src = process.argv[2];
const TOTAL = parseFloat(process.argv[3]);
const OUT = process.argv[4] || 'subtitulos.srt';
if (!src || !TOTAL) { console.error('Usage: node srt_from_script.js guion.txt <audio_seconds> [out.srt]'); process.exit(1); }

const PAUSE_PARAGRAPH = 0.55;   // seconds of silence between paragraphs
const PAUSE_SENTENCE  = 0.30;   // seconds after . ! ? inside a paragraph
const PAUSE_CLAUSE    = 0.10;   // after a comma we had to break on
const MAX_LINE        = 42;     // characters per subtitle line
const MAX_LINES       = 2;
const MIN_CUE         = 1.0;    // seconds
const MAX_CUE         = 6.0;    // seconds

const paragraphs = fs.readFileSync(src, 'utf8').trim().split(/\n\s*\n/).map(p => p.replace(/\s+/g, ' ').trim());

// 1) paragraph -> sentences
const sentencesOf = p => p.match(/[^.!?…]+[.!?…]+["'»]?|\S+$/g) || [p];

// 2) sentence -> cues that fit MAX_LINES x MAX_LINE, cut at punctuation first
function cuesOf(sentence) {
  const cap = MAX_LINE * MAX_LINES - 8;   // slack so wrap() always finds a break
  if (sentence.length <= cap) return [sentence];
  const out = [];
  let rest = sentence.trim();
  while (rest.length > cap) {
    const window = rest.slice(0, cap + 1);
    // prefer a break after , ; : — then after any space
    let cut = Math.max(window.lastIndexOf(', '), window.lastIndexOf('; '),
                       window.lastIndexOf(': '), window.lastIndexOf(' — '));
    cut = cut > cap * 0.45 ? cut + 1 : window.lastIndexOf(' ');
    if (cut <= 0) cut = cap;
    out.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  // never leave an orphan tail: fold a very short remainder back in
  if (rest.length && rest.length < 12 && out.length) {
    const merged = out[out.length - 1] + ' ' + rest;
    if (merged.length <= cap) { out[out.length - 1] = merged; rest = ''; }
  }
  if (rest.length) out.push(rest);
  return out;
}

// 3) flat cue list with the pause that follows each one
const cues = [];
paragraphs.forEach((p, pi) => {
  const sents = sentencesOf(p).map(s => s.trim()).filter(Boolean);
  sents.forEach((s, si) => {
    const parts = cuesOf(s);
    parts.forEach((text, ci) => {
      const lastOfSentence = ci === parts.length - 1;
      const lastOfParagraph = lastOfSentence && si === sents.length - 1;
      const lastOverall = lastOfParagraph && pi === paragraphs.length - 1;
      cues.push({
        para: pi,
        text,
        chars: text.replace(/\s/g, '').length,
        pause: lastOverall ? 0
             : lastOfParagraph ? PAUSE_PARAGRAPH
             : lastOfSentence ? PAUSE_SENTENCE
             : /[,;:]$/.test(text) ? PAUSE_CLAUSE : 0,
      });
    });
  });
});

// 3b) merge one-second flashes: short consecutive cues in the same paragraph
//     (the script's staccato "Grandes. Brillantes. Civilizadores.") read far
//     better as a single subtitle than as three blinks.
const MERGE_CAP = MAX_LINE * MAX_LINES - 8;
for (let i = 0; i < cues.length - 1; ) {
  const a = cues[i], b = cues[i + 1];
  const joined = a.text + ' ' + b.text;
  const shorter = Math.min(a.text.length, b.text.length);
  if (a.para === b.para && shorter < 30 && joined.length <= MERGE_CAP) {
    a.text = joined;
    a.chars = joined.replace(/\s/g, '').length;
    a.pause = b.pause;               // the pause that matters is the later one
    cues.splice(i + 1, 1);
  } else i++;
}

// 4) distribute time
const totalPause = cues.reduce((a, c) => a + c.pause, 0);
const totalChars = cues.reduce((a, c) => a + c.chars, 0);
const speech = TOTAL - totalPause;
if (speech <= 0) { console.error('Audio too short for the pause model.'); process.exit(2); }
cues.forEach(c => { c.dur = speech * c.chars / totalChars + c.pause; });

// 5) clamp, then rescale so the last cue still ends exactly at TOTAL
let clampedExtra = 0;
cues.forEach(c => {
  const d = Math.min(Math.max(c.dur, MIN_CUE), MAX_CUE);
  clampedExtra += d - c.dur; c.dur = d;
});
if (Math.abs(clampedExtra) > 0.01) {
  const free = cues.filter(c => c.dur > MIN_CUE + 0.2 && c.dur < MAX_CUE - 0.2);
  const freeTotal = free.reduce((a, c) => a + c.dur, 0) || 1;
  free.forEach(c => { c.dur -= clampedExtra * c.dur / freeTotal; });
}

// 6) wrap each cue onto at most MAX_LINES lines
function wrap(t) {
  if (t.length <= MAX_LINE) return t;
  let best = null;
  for (let i = 0; i < t.length; i++) {
    if (t[i] !== ' ') continue;
    const l1 = t.slice(0, i), l2 = t.slice(i + 1);
    if (l1.length > MAX_LINE || l2.length > MAX_LINE) continue;
    const score = Math.abs(l1.length - l2.length);
    if (!best || score < best.score) best = { l1, l2, score };
  }
  if (best) return best.l1 + '\n' + best.l2;
  // No split keeps both halves under the limit — break at the space closest to
  // the middle anyway. One slightly long line beats one enormous one.
  const mid = Math.floor(t.length / 2);
  let at = -1;
  for (let i = 0; i < t.length; i++) {
    if (t[i] === ' ' && (at < 0 || Math.abs(i - mid) < Math.abs(at - mid))) at = i;
  }
  return at > 0 ? t.slice(0, at) + '\n' + t.slice(at + 1) : t;
}

const ts = s => {
  const ms = Math.round(s * 1000);
  const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
  const m = String(Math.floor(ms % 3600000 / 60000)).padStart(2, '0');
  const sec = String(Math.floor(ms % 60000 / 1000)).padStart(2, '0');
  return `${h}:${m}:${sec},${String(ms % 1000).padStart(3, '0')}`;
};

let clock = 0, srt = [];
cues.forEach((c, i) => {
  const start = clock; clock += c.dur;
  // 80 ms of air between cues so they don't visually run together
  const end = Math.max(start + 0.4, clock - 0.08);
  srt.push(`${i + 1}\n${ts(start)} --> ${ts(end)}\n${wrap(c.text)}\n`);
});

fs.writeFileSync(OUT, srt.join('\n'));
const durs = cues.map(c => c.dur);
console.log(`Wrote ${OUT}`);
console.log(`  ${cues.length} subtítulos · total ${clock.toFixed(1)}s (audio ${TOTAL}s)`);
console.log(`  duración por subtítulo: min ${Math.min(...durs).toFixed(1)}s · media ${(clock / cues.length).toFixed(1)}s · max ${Math.max(...durs).toFixed(1)}s`);
console.log(`  pausas modeladas: ${totalPause.toFixed(1)}s (${(totalPause / TOTAL * 100).toFixed(0)}% del total)`);
