"""Genera la banda sonora y la incrusta en el video.

    python3 render_audio.py                 # WAV + MP4 con audio
    python3 render_audio.py --solo-wav      # solo la pista
    python3 render_audio.py --guia          # anade pista guia de voz (espeak)

La narracion con espeak-ng es un sintetizador de formantes: sirve para medir
tiempos en el montaje, no para publicar. La voz definitiva se graba aparte.
"""

from __future__ import annotations

import argparse
import pathlib
import re
import subprocess
import sys
import time

import imageio_ffmpeg
import numpy as np

from audio.mezcla import Mezcla, a_wav
from audio.partitura import construir
from audio.sintesis import SR, n_muestras
from lowpoly.scenes import PLANOS

RAIZ = pathlib.Path(__file__).resolve().parent
SALIDA = RAIZ / "salida"


def narracion_guia(planos) -> np.ndarray:
    """Pista guia con espeak-ng, un bloque de guion por plano."""
    guion = (RAIZ / "GUION.md").read_text(encoding="utf-8")
    bloques, actual = [], []
    for linea in guion.splitlines():
        s = linea.strip()
        if re.match(r"^### \d+", s):
            if actual:
                bloques.append(" ".join(actual))
            actual = []
        elif s and not s.startswith(("#", ">", "-", "*", "|")):
            actual.append(s)
    if actual:
        bloques.append(" ".join(actual))

    dur_total = sum(p.dur for p in planos)
    mez = Mezcla(dur_total)
    tmp = SALIDA / "_voz.wav"
    t = 0.0
    for p, texto in zip(planos, bloques):
        subprocess.run(["espeak-ng", "-v", "es", "-s", "155", "-p", "35",
                        "-a", "150", texto, "-w", str(tmp)],
                       check=True, capture_output=True)
        import wave
        with wave.open(str(tmp), "rb") as w:
            bruto = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2")
            sr_voz = w.getframerate()
        voz = bruto.astype(np.float64) / 32768.0
        if sr_voz != SR:                      # remuestreo lineal, suficiente
            n = int(len(voz) * SR / sr_voz)
            voz = np.interp(np.linspace(0, len(voz) - 1, n),
                            np.arange(len(voz)), voz)
        mez.add(voz * 0.55, t + 0.35)
        t += p.dur
    tmp.unlink(missing_ok=True)
    return mez.estereo(pico=0.7)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--video", default="alvin_york_132.mp4")
    ap.add_argument("--salida", default="alvin_york_132_con_audio.mp4")
    ap.add_argument("--solo-wav", action="store_true")
    ap.add_argument("--guia", action="store_true",
                    help="mezcla una pista guia de voz sintetica (no publicable)")
    args = ap.parse_args()

    SALIDA.mkdir(exist_ok=True)
    dur = sum(p.dur for p in PLANOS)
    print(f"Banda sonora para {len(PLANOS)} planos · {dur:.0f}s")

    t0 = time.time()
    mez = construir(PLANOS, dur)
    pista = mez.estereo()
    print(f"  musica y efectos: {time.time() - t0:.1f}s")

    if args.guia:
        t1 = time.time()
        voz = narracion_guia(PLANOS)
        n = min(len(pista), len(voz))
        # La voz manda: la musica baja mientras habla el narrador.
        env = np.abs(voz[:n]).mean(axis=1)
        env = np.convolve(env, np.ones(n_muestras(0.25)) / n_muestras(0.25), mode="same")
        ducking = 1.0 - 0.55 * np.clip(env / (env.max() + 1e-9), 0, 1)[:, None]
        pista = pista[:n] * ducking + voz[:n]
        pista = np.clip(pista, -1.0, 1.0)
        print(f"  pista guia de voz: {time.time() - t1:.1f}s")

    wav = SALIDA / ("banda_sonora_guia.wav" if args.guia else "banda_sonora.wav")
    a_wav(pista, wav)
    print(f"  {wav.name}: {wav.stat().st_size / 1e6:.1f} MB, {len(pista) / SR:.1f}s")
    if args.solo_wav:
        return 0

    origen = SALIDA / args.video
    if not origen.exists():
        print(f"No existe {origen}; renderiza antes el video.", file=sys.stderr)
        return 1
    destino = SALIDA / args.salida
    exe = imageio_ffmpeg.get_ffmpeg_exe()
    subprocess.run([exe, "-y", "-loglevel", "error", "-i", str(origen), "-i", str(wav),
                    "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
                    "-c:a", "aac", "-b:a", "192k", "-shortest",
                    "-movflags", "+faststart", str(destino)], check=True)
    print(f"\nListo: {destino}  ({destino.stat().st_size / 1e6:.1f} MB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
