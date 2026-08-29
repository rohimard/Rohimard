"""Hoja de contactos: un fotograma de cada plano en una sola imagen.

Sirve para revisar de un vistazo encuadre, luz y continuidad de color.

    python3 tools/contacto.py            # mitad de cada plano
    python3 tools/contacto.py --u 0.15   # mismo instante relativo en todos
"""

from __future__ import annotations

import argparse
import pathlib
import sys
import time

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from PIL import Image, ImageDraw  # noqa: E402

from lowpoly.overlay import dibuja_rotulo, fuente  # noqa: E402
from lowpoly.render import Renderer  # noqa: E402
from lowpoly.scenes import PLANOS  # noqa: E402

SALIDA = pathlib.Path(__file__).resolve().parent.parent / "salida"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--u", type=float, default=0.5, help="instante relativo (0-1)")
    ap.add_argument("--cols", type=int, default=5)
    ap.add_argument("--ancho", type=int, default=384)
    ap.add_argument("--rotulos", action="store_true")
    args = ap.parse_args()

    w = args.ancho // 2 * 2
    h = int(w * 9 / 16) // 2 * 2
    r = Renderer(w, h, ssaa=2)
    filas = (len(PLANOS) + args.cols - 1) // args.cols
    hoja = Image.new("RGB", (args.cols * w, filas * (h + 22)), (12, 12, 14))
    d = ImageDraw.Draw(hoja)
    f = fuente("cuerpo", 15)

    t0 = time.time()
    for i, plano in enumerate(PLANOS):
        t = args.u * plano.dur
        img = r.render(plano.geometria(t), plano.camara(args.u, t), plano.paleta)
        if args.rotulos:
            for rot in plano.rotulos:
                img = dibuja_rotulo(img, rot, t)
        cx, cy = (i % args.cols) * w, (i // args.cols) * (h + 22)
        hoja.paste(img, (cx, cy + 22))
        d.text((cx + 6, cy + 4), plano.nombre, font=f, fill=(220, 214, 200))
        plano._cache = None
        print(f"  {plano.nombre}", flush=True)

    SALIDA.mkdir(exist_ok=True)
    destino = SALIDA / f"contacto_u{args.u:.2f}.png"
    hoja.save(destino)
    print(f"\n{destino}  ({time.time() - t0:.0f}s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
