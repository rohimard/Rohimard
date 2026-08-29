"""Rotulos en pantalla: franja oscura, tipografia legible y fundidos."""

from __future__ import annotations

import pathlib
from dataclasses import dataclass

import numpy as np
from PIL import Image, ImageDraw, ImageFont

from .math3d import fade, smoothstep

DIR_FUENTES = pathlib.Path("/mnt/skills/examples/canvas-design/canvas-fonts")
FUENTES = {
    "titulo": "BigShoulders-Bold.ttf",
    "cuerpo": "WorkSans-Bold.ttf",
    "cuerpo_it": "WorkSans-BoldItalic.ttf",
}
_cache_fuentes: dict = {}


def fuente(clave: str, tam: int) -> ImageFont.FreeTypeFont:
    k = (clave, tam)
    if k not in _cache_fuentes:
        ruta = DIR_FUENTES / FUENTES[clave]
        _cache_fuentes[k] = ImageFont.truetype(str(ruta), tam)
    return _cache_fuentes[k]


@dataclass
class Rotulo:
    """Texto sobre franja oscura. `ini`/`fin` en segundos locales del plano."""

    texto: str
    ini: float = 0.5
    fin: float = 4.0
    estilo: str = "inferior"     # titulo | inferior | dato | cita | final
    sub: str = ""
    y: float = None              # posicion vertical relativa (0-1); None = por estilo


# Tamanos expresados para un lienzo de 1080p; se reescalan a la altura real
# para que las previsualizaciones en baja representen el encuadre final.
ALTO_REF = 1080

ESTILOS = {
    #        fuente       tam  tam_sub   y     alfa_franja  espaciado
    "titulo":   ("titulo", 80, 40, 0.615, 0.72, 8),
    "inferior": ("cuerpo", 42, 32, 0.850, 0.66, 10),
    "dato":     ("titulo", 168, 44, 0.470, 0.70, 4),
    "cita":     ("cuerpo_it", 46, 32, 0.520, 0.68, 10),
    "final":    ("titulo", 84, 38, 0.475, 0.74, 10),
}


def _envolver(texto: str, font, ancho_max: int, draw) -> list:
    palabras, lineas, actual = texto.split(), [], ""
    for p in palabras:
        prueba = f"{actual} {p}".strip()
        if draw.textlength(prueba, font=font) <= ancho_max or not actual:
            actual = prueba
        else:
            lineas.append(actual)
            actual = p
    if actual:
        lineas.append(actual)
    return lineas


def dibuja_rotulo(img: Image.Image, rot: Rotulo, t: float) -> Image.Image:
    """Compone un rotulo sobre `img`. `t` es el tiempo local del plano."""
    dur = rot.fin - rot.ini
    if dur <= 0 or t < rot.ini - 0.01 or t > rot.fin + 0.01:
        return img
    k = fade((t - rot.ini) / dur, entrada=min(0.22, 0.5 / dur), salida=min(0.25, 0.5 / dur))
    if k <= 0.005:
        return img

    W, H = img.size
    nombre, tam, tam_sub, y_def, alfa_franja, esp = ESTILOS[rot.estilo]
    k_esc = H / ALTO_REF
    tam = max(9, int(round(tam * k_esc)))
    tam_sub = max(8, int(round(tam_sub * k_esc)))
    esp = max(2, int(round(esp * k_esc)))
    f = fuente(nombre, tam)
    fs = fuente("cuerpo", tam_sub)

    capa = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(capa)

    ancho_max = int(W * 0.86)
    lineas = _envolver(rot.texto, f, ancho_max, d)
    lineas_sub = _envolver(rot.sub, fs, ancho_max, d) if rot.sub else []

    alto_linea = int(tam * 1.14)
    alto_sub = int(tam_sub * 1.34)
    alto_total = len(lineas) * alto_linea + (len(lineas_sub) * alto_sub if lineas_sub else 0)
    if lineas_sub:
        alto_total += esp * 2

    cy = (rot.y if rot.y is not None else y_def) * H
    y0 = cy - alto_total / 2

    # Franja: rectangulo redondeado ajustado al texto mas un margen generoso.
    anchos = [d.textlength(l, font=f) for l in lineas] + [d.textlength(l, font=fs) for l in lineas_sub]
    ancho_txt = max(anchos) if anchos else 0
    px, py = int(tam * 0.55), int(tam * 0.34)
    x0 = W / 2 - ancho_txt / 2 - px
    x1 = W / 2 + ancho_txt / 2 + px
    radio = int(min(22, py))
    d.rounded_rectangle(
        [x0, y0 - py, x1, y0 + alto_total + py],
        radius=radio,
        fill=(6, 8, 10, int(255 * alfa_franja * k)),
    )
    # Filete inferior de acento, ayuda a separar la franja del fondo.
    d.rounded_rectangle(
        [x0, y0 + alto_total + py - 4, x1, y0 + alto_total + py],
        radius=2,
        fill=(196, 152, 62, int(210 * k)),
    )

    y = y0
    for linea in lineas:
        w = d.textlength(linea, font=f)
        d.text((W / 2 - w / 2 + 2, y + 2), linea, font=f, fill=(0, 0, 0, int(150 * k)))
        d.text((W / 2 - w / 2, y), linea, font=f, fill=(244, 240, 232, int(255 * k)))
        y += alto_linea
    if lineas_sub:
        y += esp * 2
        for linea in lineas_sub:
            w = d.textlength(linea, font=fs)
            d.text((W / 2 - w / 2, y), linea, font=fs, fill=(206, 186, 148, int(248 * k)))
            y += alto_sub

    return Image.alpha_composite(img.convert("RGBA"), capa).convert("RGB")


def fundido(img: Image.Image, k: float) -> Image.Image:
    """Oscurece la imagen: k=1 imagen intacta, k=0 negro."""
    if k >= 0.999:
        return img
    a = np.asarray(img, dtype=np.float32) * max(0.0, k)
    return Image.fromarray(a.astype(np.uint8), "RGB")


def fundido_plano(t: float, dur: float, entra: float, sale: float) -> float:
    """Factor de fundido de un plano segun su tiempo local."""
    k = 1.0
    if entra > 0:
        k = min(k, smoothstep(t / entra))
    if sale > 0:
        k = min(k, smoothstep((dur - t) / sale))
    return k
