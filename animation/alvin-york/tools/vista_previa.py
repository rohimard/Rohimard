"""Genera fotogramas sueltos para revisar encuadre, luz y rotulos.

    python3 tools/vista_previa.py            # un fotograma central de cada plano
    python3 tools/vista_previa.py -p 15 -n 3 # 3 momentos del plano 15
"""

from __future__ import annotations

import argparse
import pathlib
import sys
import time

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from lowpoly.overlay import dibuja_rotulo  # noqa: E402
from lowpoly.render import Renderer  # noqa: E402
from lowpoly.scenes import PLANOS  # noqa: E402

SALIDA = pathlib.Path(__file__).resolve().parent.parent / "salida" / "previa"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("-p", "--planos", type=int, nargs="*", help="indices 1-based")
    ap.add_argument("-n", "--muestras", type=int, default=1, help="fotogramas por plano")
    ap.add_argument("--escala", type=float, default=0.5)
    ap.add_argument("--ssaa", type=int, default=2)
    ap.add_argument("--rotulos", action="store_true", help="incluir texto en pantalla")
    args = ap.parse_args()

    SALIDA.mkdir(parents=True, exist_ok=True)
    w = int(1920 * args.escala) // 2 * 2
    h = int(1080 * args.escala) // 2 * 2
    r = Renderer(w, h, ssaa=args.ssaa)

    indices = args.planos or list(range(1, len(PLANOS) + 1))
    for i in indices:
        plano = PLANOS[i - 1]
        for k in range(args.muestras):
            u = 0.5 if args.muestras == 1 else k / (args.muestras - 1)
            u = min(max(u, 0.02), 0.98)
            t = u * plano.dur
            t0 = time.time()
            geo = plano.geometria(t)
            img = r.render(geo, plano.camara(u, t), plano.paleta)
            if args.rotulos:
                for rot in plano.rotulos:
                    img = dibuja_rotulo(img, rot, t)
            nombre = f"{plano.nombre}_{k}.png" if args.muestras > 1 else f"{plano.nombre}.png"
            img.save(SALIDA / nombre)
            caras = 0 if geo is None else geo.n_faces
            print(f"{plano.nombre:<28} t={t:5.2f}s  {caras:6d} caras  {time.time() - t0:5.2f}s")
        plano._cache = None
    print(f"\nGuardado en {SALIDA}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
