"""Cuenta caracteres y duracion estimada de la narracion del guion."""

import pathlib
import sys

RUTA = pathlib.Path(__file__).resolve().parent.parent / "GUION.md"
PREFIJOS_IGNORADOS = ("#", ">", "-", "*", "|")


def narracion(texto: str) -> str:
    """Devuelve solo las lineas de voz en off, sin cabeceras ni acotaciones."""
    lineas = []
    for linea in texto.splitlines():
        limpia = linea.strip()
        if not limpia or limpia.startswith(PREFIJOS_IGNORADOS):
            continue
        lineas.append(limpia)
    return "\n".join(lineas)


def main() -> int:
    texto = narracion(RUTA.read_text(encoding="utf-8"))
    palabras = len(texto.split())
    print(f"caracteres: {len(texto)}")
    print(f"palabras:   {palabras}")
    print(f"duracion a 165 ppm: {palabras / 165 * 60:.0f} s")
    if not 4500 <= len(texto) <= 5000:
        print("AVISO: fuera del rango 4500-5000 caracteres", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
