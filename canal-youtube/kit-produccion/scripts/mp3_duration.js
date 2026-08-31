#!/usr/bin/env node
/*
 * mp3_duration.js — prints the exact duration of an MP3 in seconds.
 *
 * Why this exists: the ffmpeg build shipped in many sandboxes is compiled with
 * `--disable-everything` and cannot decode MP3, so `ffprobe`/`ffmpeg -i file.mp3`
 * fail with "Invalid data found". This parses the MP3 container directly instead:
 * it skips any ID3v2 tag, reads the first frame header for bitrate/samplerate,
 * uses a Xing/Info VBR header when present (exact), and otherwise computes
 * duration from file size for CBR (ElevenLabs exports are CBR — very accurate).
 *
 * Usage:  node mp3_duration.js path/to/audio.mp3
 * Output: human-readable info + a line "DURATION_SECONDS: <float>" to parse.
 */
const fs = require('fs');
const file = process.argv[2];
if (!file) { console.error('Usage: node mp3_duration.js <audio.mp3>'); process.exit(1); }
const b = fs.readFileSync(file);

let pos = 0;
// Skip ID3v2 tag if present (syncsafe size in bytes 6-9).
if (b.slice(0, 3).toString('latin1') === 'ID3') {
  const size = ((b[6] & 0x7f) << 21) | ((b[7] & 0x7f) << 14) | ((b[8] & 0x7f) << 7) | (b[9] & 0x7f);
  pos = 10 + size;
}
// Find the first frame sync (11 bits set).
while (pos < b.length - 4 && !(b[pos] === 0xFF && (b[pos + 1] & 0xE0) === 0xE0)) pos++;
if (pos >= b.length - 4) { console.error('No MP3 frame sync found — is this really an MP3?'); process.exit(2); }

const h2 = b[pos + 1], h3 = b[pos + 2], h4 = b[pos + 3];
const verBits = (h2 >> 3) & 3;
const ver = verBits === 3 ? 'MPEG1' : verBits === 2 ? 'MPEG2' : 'MPEG2.5';
const brIdx = (h3 >> 4) & 0xF, srIdx = (h3 >> 2) & 3, chMode = (h4 >> 6) & 3;
const brTab = {
  MPEG1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0],
  MPEG2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0],
};
brTab['MPEG2.5'] = brTab.MPEG2;
const srTab = { MPEG1: [44100, 48000, 32000], MPEG2: [22050, 24000, 16000], 'MPEG2.5': [11025, 12000, 8000] };
const bitrate = brTab[ver][brIdx] * 1000;
const sampleRate = srTab[ver][srIdx];
const spf = ver === 'MPEG1' ? 1152 : 576;
const mono = chMode === 3;

// Look for a Xing/Info VBR header just after the side-info block.
const sideInfo = ver === 'MPEG1' ? (mono ? 17 : 32) : (mono ? 9 : 17);
const xoff = pos + 4 + sideInfo;
const tag = b.slice(xoff, xoff + 4).toString('latin1');
let duration, method;
if (tag === 'Xing' || tag === 'Info') {
  const flags = b.readUInt32BE(xoff + 4);
  if (flags & 1) {
    const frames = b.readUInt32BE(xoff + 8);
    duration = frames * spf / sampleRate;
    method = 'VBR/Xing (frames=' + frames + ')';
  }
}
if (duration === undefined) {
  duration = (b.length - pos) * 8 / bitrate; // CBR
  method = 'CBR (file size / bitrate)';
}

const m = Math.floor(duration / 60), s = duration - m * 60;
console.log('codec:', ver, bitrate / 1000 + 'kbps', mono ? 'mono' : 'stereo', sampleRate + 'Hz');
console.log('method:', method);
console.log('DURATION_MMSS: ' + m + ':' + s.toFixed(1).padStart(4, '0'));
console.log('DURATION_SECONDS: ' + duration.toFixed(2));
