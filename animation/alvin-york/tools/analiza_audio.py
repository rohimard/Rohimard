"""Revisa la banda sonora sin poder escucharla: niveles y espectrograma.

    python3 tools/analiza_audio.py

Avisa de los dos fallos que no se ven en el codigo: tramos donde el fondo se
queda mudo y picos que van a recortar en la mezcla final.
"""

from __future__ import annotations

import pathlib
import sys
import wave

import numpy as np
from PIL import Image, ImageDraw
from scipy import signal

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from lowpoly.overlay import fuente  # noqa: E402
from lowpoly.scenes import PLANOS  # noqa: E402

SALIDA = pathlib.Path(__file__).resolve().parent.parent / "salida"
UMBRAL_MUDO = -40.0


def carga(ruta):
    with wave.open(str(ruta), "rb") as w:
        crudo = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2")
        return crudo.astype(np.float64).reshape(-1, 2) / 32768.0, w.getframerate()


def main() -> int:
    ruta = SALIDA / "banda_sonora.wav"
    if not ruta.exists():
        print(f"No existe {ruta}: ejecuta antes render_audio.py --solo-wav",
              file=sys.stderr)
        return 1
    x, sr = carga(ruta)
    mono = x.mean(axis=1)
    dur = len(mono) / sr
    print(f"{dur:.1f}s  pico {np.abs(x).max():.2f}  RMS {np.sqrt((x ** 2).mean()):.3f}")

    print("\nplano                        RMS   pico")
    t, avisos = 0.0, 0
    for p in PLANOS:
        seg = mono[int(t * sr):int((t + p.dur) * sr)]
        rms = float(np.sqrt((seg ** 2).mean()))
        db = 20 * np.log10(rms + 1e-9)
        marca = ""
        if db < UMBRAL_MUDO:
            marca, avisos = "  <-- fondo mudo", avisos + 1
        elif np.abs(seg).max() > 0.97:
            marca, avisos = "  <-- recorta", avisos + 1
        print(f"{p.nombre:26s} {rms:.3f}  {np.abs(seg).max():.2f}{marca}")
        t += p.dur

    # Curva de nivel
    win = int(sr * 0.25)
    n = len(mono) // win
    db = np.array([20 * np.log10(np.sqrt((mono[i * win:(i + 1) * win] ** 2).mean()) + 1e-6)
                   for i in range(n)])
    W, H = 1500, 260
    im = Image.new("RGB", (W, H + 40), (12, 12, 14))
    d = ImageDraw.Draw(im)
    ft = fuente("cuerpo", 12)
    for i, v in enumerate(db):
        alt = int(np.clip((v + 60) / 60, 0, 1) * H)
        d.line([(int(i / n * W), H), (int(i / n * W), H - alt)], fill=(210, 150, 70))
    t = 0.0
    for i, p in enumerate(PLANOS):
        px = int(t / dur * W)
        d.line([(px, 0), (px, H)], fill=(70, 70, 90))
        if i % 2 == 0:
            d.text((px + 2, H + 4), p.nombre[:2], font=ft, fill=(190, 190, 200))
        t += p.dur
    for gl, lab in ((-20, "-20 dB"), (UMBRAL_MUDO, f"{UMBRAL_MUDO:.0f} dB")):
        y = H - int(np.clip((gl + 60) / 60, 0, 1) * H)
        d.line([(0, y), (W, y)], fill=(60, 80, 60))
        d.text((4, y - 14), lab, font=ft, fill=(120, 160, 120))
    im.save(SALIDA / "niveles.png")

    # Espectrograma
    f, tt, S = signal.spectrogram(mono, sr, nperseg=4096, noverlap=2048)
    S = np.clip((10 * np.log10(S + 1e-12) + 95) / 60, 0, 1)
    S, f = S[f < 9000], f[f < 9000]
    rgb = np.stack([S ** 0.8, S ** 1.3, S ** 2.0], axis=-1)
    Image.fromarray((np.flipud(rgb) * 255).astype(np.uint8), "RGB") \
        .resize((1500, 420), Image.LANCZOS).save(SALIDA / "espectrograma.png")

    print(f"\nnivel medio {db.mean():.1f} dB   minimo {db.min():.1f}   maximo {db.max():.1f}")
    print(f"avisos: {avisos}")
    print(f"guardado: {SALIDA / 'niveles.png'} y {SALIDA / 'espectrograma.png'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
