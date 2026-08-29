"""Parte el video en trozos que quepan en un limite de tamano.

Corta por frontera de plano y copia el flujo sin recodificar, asi que no hay
perdida de calidad y las partes se pueden unir en cualquier editor.

    python3 tools/partir.py                 # 3 partes
    python3 tools/partir.py --partes 4 --limite 30
"""

from __future__ import annotations

import argparse
import pathlib
import subprocess
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

import imageio_ffmpeg  # noqa: E402

from lowpoly.scenes import PLANOS  # noqa: E402

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "salida"


def fronteras() -> list:
    """Instante de inicio de cada plano, en segundos."""
    t, fs = 0.0, []
    for p in PLANOS:
        fs.append(t)
        t += p.dur
    fs.append(t)
    return fs


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--entrada", default="alvin_york_132.mp4")
    ap.add_argument("--partes", type=int, default=3)
    ap.add_argument("--limite", type=float, default=30.0, help="MiB por parte")
    args = ap.parse_args()

    src = SALIDA / args.entrada
    if not src.exists():
        print(f"No existe {src}", file=sys.stderr)
        return 1

    fs = fronteras()
    total = fs[-1]
    exe = imageio_ffmpeg.get_ffmpeg_exe()

    # Reparte los planos en n grupos de duracion lo mas pareja posible.
    objetivo = total / args.partes
    cortes = [0.0]
    for i in range(1, args.partes):
        ideal = objetivo * i
        cortes.append(min(fs, key=lambda f: abs(f - ideal)))
    cortes.append(total)

    generados = []
    for i in range(args.partes):
        ini, fin = cortes[i], cortes[i + 1]
        destino = SALIDA / f"{src.stem}_parte{i + 1}de{args.partes}.mp4"
        cmd = [exe, "-y", "-loglevel", "error", "-ss", f"{ini:.3f}"]
        if i < args.partes - 1:
            cmd += ["-to", f"{fin:.3f}"]
        cmd += ["-i", str(src), "-c", "copy", "-avoid_negative_ts", "make_zero", str(destino)]
        subprocess.run(cmd, check=True)
        mib = destino.stat().st_size / 1048576
        estado = "OK" if mib <= args.limite else "EXCEDE EL LIMITE"
        print(f"parte {i + 1}: {ini:6.1f}s -> {fin:6.1f}s  ({fin - ini:5.1f}s)  "
              f"{mib:5.1f} MiB  {estado}")
        generados.append((destino, mib))

    if any(m > args.limite for _, m in generados):
        print(f"\nAlguna parte supera {args.limite} MiB: repite con --partes "
              f"{args.partes + 1}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
