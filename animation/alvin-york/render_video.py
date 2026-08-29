"""Renderiza el video completo y lo codifica a MP4.

Uso:
    python3 render_video.py                       # video completo 1920x1080 24fps
    python3 render_video.py --planos 15 16 17     # solo esos planos
    python3 render_video.py --escala 0.5 --fps 12 # prueba rapida
"""

from __future__ import annotations

import argparse
import pathlib
import subprocess
import sys
import time

import imageio_ffmpeg

from lowpoly.overlay import dibuja_rotulo, fundido, fundido_plano
from lowpoly.render import Renderer
from lowpoly.scenes import PLANOS

RAIZ = pathlib.Path(__file__).resolve().parent
SALIDA = RAIZ / "salida"


def abre_ffmpeg(destino: pathlib.Path, w: int, h: int, fps: int) -> subprocess.Popen:
    exe = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [
        exe, "-y", "-loglevel", "error",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}", "-r", str(fps),
        "-i", "-",
        "-an",
        "-c:v", "libx264", "-preset", "medium", "-crf", "21",
        "-x264-params", "aq-mode=2:aq-strength=0.8",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart",
        str(destino),
    ]
    return subprocess.Popen(cmd, stdin=subprocess.PIPE)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--fps", type=int, default=24)
    ap.add_argument("--escala", type=float, default=1.0, help="factor sobre 1920x1080")
    ap.add_argument("--ssaa", type=int, default=2, help="supermuestreo (1 = sin suavizado)")
    ap.add_argument("--planos", type=int, nargs="*", help="indices 1-based a renderizar")
    ap.add_argument("--salida", default="alvin_york_132.mp4")
    args = ap.parse_args()

    w = int(1920 * args.escala) // 2 * 2
    h = int(1080 * args.escala) // 2 * 2
    SALIDA.mkdir(exist_ok=True)
    destino = SALIDA / args.salida

    planos = PLANOS
    if args.planos:
        planos = [PLANOS[i - 1] for i in args.planos]

    total_frames = sum(int(round(p.dur * args.fps)) for p in planos)
    print(f"Render {w}x{h} @ {args.fps}fps · {len(planos)} planos · "
          f"{sum(p.dur for p in planos):.0f}s · {total_frames} fotogramas")

    r = Renderer(w, h, ssaa=args.ssaa)
    ff = abre_ffmpeg(destino, w, h, args.fps)
    t0 = time.time()
    hechos = 0

    try:
        for idx, plano in enumerate(planos, 1):
            n = int(round(plano.dur * args.fps))
            for i in range(n):
                t = i / args.fps
                u = min(t / plano.dur, 1.0)
                cam = plano.camara(u, t)
                img = r.render(plano.geometria(t), cam, plano.paleta)
                for rot in plano.rotulos:
                    img = dibuja_rotulo(img, rot, t)
                k = fundido_plano(t, plano.dur, plano.entra, plano.sale)
                if k < 0.999:
                    img = fundido(img, k)
                ff.stdin.write(img.tobytes())
                hechos += 1
            plano._cache = None          # libera la geometria del plano terminado
            el = time.time() - t0
            eta = el / hechos * (total_frames - hechos)
            print(f"  [{idx:2d}/{len(planos)}] {plano.nombre:<28} "
                  f"{hechos}/{total_frames}  {el:6.0f}s transcurridos  ETA {eta:5.0f}s",
                  flush=True)
    finally:
        ff.stdin.close()
        ff.wait()

    mb = destino.stat().st_size / 1e6
    print(f"\nListo: {destino}  ({mb:.1f} MB, {time.time() - t0:.0f}s de render)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
