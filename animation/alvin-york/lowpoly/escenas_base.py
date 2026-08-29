"""Andamiaje de los planos: camaras animadas, paletas por tono y utilidades.

Ninguna camara es fija: todos los planos usan `dolly`, `orbita` o `grua`, de
modo que siempre hay desplazamiento o zoom en marcha.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field

import numpy as np

from .math3d import ease_in_out, ease_out, lerp, noise1d
from .mesh import join
from .render import Camera, Palette
from .overlay import Rotulo


# --- camaras ----------------------------------------------------------------


def _mezcla_fov(fov, e):
    return fov[0] + (fov[1] - fov[0]) * e if isinstance(fov, (tuple, list)) else fov


def dolly(p0, t0, p1, t1, fov=45.0, ease=ease_in_out, roll=(0.0, 0.0)):
    """Traslacion continua de camara y punto de mira, con zoom opcional."""

    def f(u, _t=0.0):
        e = ease(u)
        return Camera(
            lerp(p0, p1, e), lerp(t0, t1, e), _mezcla_fov(fov, e),
            roll[0] + (roll[1] - roll[0]) * e,
        )

    return f


def orbita(centro, radio, ang, alt, mira=None, fov=45.0, ease=ease_in_out):
    """Giro alrededor de un punto. `radio`, `ang` (rad) y `alt` son pares (ini, fin)."""
    centro = np.asarray(centro, float)
    mira = centro if mira is None else np.asarray(mira, float)

    def f(u, _t=0.0):
        e = ease(u)
        r = radio[0] + (radio[1] - radio[0]) * e
        a = ang[0] + (ang[1] - ang[0]) * e
        y = alt[0] + (alt[1] - alt[0]) * e
        ojo = centro + np.array([math.cos(a) * r, y, math.sin(a) * r])
        return Camera(ojo, mira, _mezcla_fov(fov, e))

    return f


def grua(p0, t0, p1, t1, fov=45.0, ease=ease_out):
    """Movimiento vertical de grua; misma firma que dolly con otra curva."""
    return dolly(p0, t0, p1, t1, fov=fov, ease=ease)


def temblor(camfn, amp=0.05, frec=7.0, semilla=1):
    """Envuelve una camara con vibracion tipo camara en mano."""

    def f(u, t=0.0):
        c = camfn(u, t)
        d = np.array(
            [
                noise1d(t * frec, semilla),
                noise1d(t * frec + 31.7, semilla + 5),
                noise1d(t * frec + 71.3, semilla + 9),
            ]
        ) * amp
        return Camera(np.asarray(c.eye) + d, np.asarray(c.target) + d * 0.55, c.fov, c.roll)

    return f


def deriva(camfn, amp=0.018, frec=0.55, semilla=3):
    """Micro-flotacion constante: evita que un plano parezca congelado."""

    def f(u, t=0.0):
        c = camfn(u, t)
        d = np.array(
            [noise1d(t * frec, semilla), noise1d(t * frec + 17.1, semilla + 2), 0.0]
        ) * amp
        return Camera(np.asarray(c.eye) + d, np.asarray(c.target) + d * 0.3, c.fov, c.roll)

    return f


# --- plano ------------------------------------------------------------------


@dataclass
class Plano:
    """Un plano del guion: geometria, camara, tono y rotulos."""

    nombre: str
    dur: float
    camara: object                       # f(u, t) -> Camera
    paleta: Palette
    estatico: object = None              # f() -> Mesh, construido una sola vez
    animado: object = None               # f(t, dur) -> Mesh | None
    rotulos: list = field(default_factory=list)
    entra: float = 0.0                   # fundido de entrada (s)
    sale: float = 0.0                    # fundido de salida (s)

    _cache: object = field(default=None, repr=False, compare=False)

    def geometria(self, t: float):
        if self._cache is None and self.estatico is not None:
            self._cache = self.estatico()
        din = self.animado(t, self.dur) if self.animado is not None else None
        if self._cache is None:
            return din
        return self._cache if din is None else join(self._cache, din)


# --- paletas por tono -------------------------------------------------------

PAL_AMANECER = Palette(
    cielo_alto=(0.16, 0.22, 0.40), cielo_bajo=(0.96, 0.68, 0.40),
    luz_dir=(-0.50, 0.30, -0.81), luz_color=(1.25, 0.86, 0.56),
    amb_cielo=(0.46, 0.42, 0.46), amb_suelo=(0.22, 0.18, 0.16),
    niebla=(0.86, 0.66, 0.50), densidad_niebla=0.0060,
    sol=(0.95, 0.55, 0.22), sol_tam=0.46, contraste=1.04, vineta=0.26,
)

PAL_GRANJA = Palette(
    cielo_alto=(0.30, 0.48, 0.72), cielo_bajo=(0.80, 0.86, 0.86),
    luz_dir=(-0.45, 0.68, -0.58), luz_color=(1.15, 1.05, 0.86),
    amb_cielo=(0.36, 0.42, 0.50), amb_suelo=(0.18, 0.16, 0.12),
    niebla=(0.80, 0.85, 0.86), densidad_niebla=0.0045,
    sol=(0.45, 0.35, 0.16), sol_tam=0.28, contraste=1.05, vineta=0.28,
)

PAL_ATARDECER = Palette(
    cielo_alto=(0.20, 0.20, 0.36), cielo_bajo=(0.88, 0.56, 0.34),
    luz_dir=(0.62, 0.26, -0.74), luz_color=(1.20, 0.80, 0.52),
    amb_cielo=(0.42, 0.38, 0.42), amb_suelo=(0.20, 0.17, 0.15),
    niebla=(0.74, 0.56, 0.44), densidad_niebla=0.0065,
    sol=(0.80, 0.42, 0.18), sol_tam=0.34, contraste=1.06, vineta=0.34,
)

PAL_INTERIOR = Palette(
    cielo_alto=(0.05, 0.04, 0.04), cielo_bajo=(0.12, 0.09, 0.07),
    luz_dir=(-0.35, 0.85, 0.38), luz_color=(1.30, 0.98, 0.62),
    amb_cielo=(0.20, 0.15, 0.11), amb_suelo=(0.07, 0.05, 0.04),
    niebla=(0.10, 0.08, 0.06), densidad_niebla=0.020,
    contraste=1.12, vineta=0.52, grano=0.008,
)

PAL_CAMPAMENTO = Palette(
    cielo_alto=(0.42, 0.52, 0.64), cielo_bajo=(0.78, 0.80, 0.80),
    luz_dir=(-0.42, 0.66, 0.62), luz_color=(1.08, 1.06, 1.00),
    amb_cielo=(0.38, 0.42, 0.48), amb_suelo=(0.17, 0.16, 0.14),
    niebla=(0.78, 0.80, 0.80), densidad_niebla=0.0055,
    contraste=1.02, saturacion=0.92, vineta=0.28,
)

PAL_MAR = Palette(
    cielo_alto=(0.30, 0.38, 0.50), cielo_bajo=(0.68, 0.72, 0.74),
    luz_dir=(0.40, 0.60, 0.68), luz_color=(1.04, 1.02, 0.98),
    amb_cielo=(0.36, 0.42, 0.50), amb_suelo=(0.12, 0.16, 0.20),
    niebla=(0.70, 0.74, 0.76), densidad_niebla=0.0055,
    contraste=1.04, saturacion=0.80, vineta=0.32,
)

PAL_FRANCIA = Palette(
    cielo_alto=(0.44, 0.46, 0.48), cielo_bajo=(0.68, 0.66, 0.62),
    luz_dir=(-0.36, 0.62, 0.70), luz_color=(1.02, 1.00, 0.94),
    amb_cielo=(0.36, 0.37, 0.38), amb_suelo=(0.16, 0.15, 0.13),
    niebla=(0.66, 0.65, 0.62), densidad_niebla=0.0075,
    contraste=1.04, saturacion=0.62, vineta=0.36,
)

PAL_NOCHE = Palette(
    cielo_alto=(0.05, 0.08, 0.17), cielo_bajo=(0.16, 0.22, 0.33),
    luz_dir=(0.52, 0.56, 0.62), luz_color=(0.46, 0.56, 0.82),
    amb_cielo=(0.30, 0.36, 0.50), amb_suelo=(0.13, 0.15, 0.20),
    niebla=(0.13, 0.17, 0.26), densidad_niebla=0.0110,
    contraste=1.10, saturacion=0.80, vineta=0.42, grano=0.008,
)

PAL_NIEBLA = Palette(
    cielo_alto=(0.56, 0.58, 0.56), cielo_bajo=(0.74, 0.74, 0.70),
    luz_dir=(-0.30, 0.72, 0.62), luz_color=(0.98, 0.98, 0.92),
    amb_cielo=(0.50, 0.52, 0.50), amb_suelo=(0.22, 0.22, 0.20),
    niebla=(0.66, 0.68, 0.64), densidad_niebla=0.0072,
    contraste=1.03, saturacion=0.74, vineta=0.40, grano=0.008,
)

PAL_COMBATE = Palette(
    cielo_alto=(0.40, 0.38, 0.38), cielo_bajo=(0.70, 0.62, 0.50),
    luz_dir=(-0.42, 0.58, 0.70), luz_color=(1.20, 1.02, 0.78),
    amb_cielo=(0.42, 0.41, 0.39), amb_suelo=(0.18, 0.16, 0.14),
    niebla=(0.58, 0.51, 0.42), densidad_niebla=0.020,
    contraste=1.12, saturacion=0.72, vineta=0.42, grano=0.010,
)

PAL_TENSION = Palette(
    cielo_alto=(0.38, 0.41, 0.45), cielo_bajo=(0.66, 0.64, 0.57),
    luz_dir=(-0.48, 0.56, 0.68), luz_color=(1.18, 1.02, 0.80),
    amb_cielo=(0.40, 0.42, 0.44), amb_suelo=(0.17, 0.16, 0.15),
    niebla=(0.62, 0.60, 0.53), densidad_niebla=0.0095,
    contraste=1.12, saturacion=0.74, vineta=0.44, grano=0.010,
)

PAL_RENDICION = Palette(
    cielo_alto=(0.40, 0.46, 0.52), cielo_bajo=(0.86, 0.80, 0.66),
    luz_dir=(-0.72, 0.52, 0.46), luz_color=(1.00, 0.92, 0.76),
    amb_cielo=(0.34, 0.36, 0.39), amb_suelo=(0.15, 0.14, 0.12),
    niebla=(0.74, 0.71, 0.62), densidad_niebla=0.0075,
    sol=(0.42, 0.32, 0.14), sol_tam=0.34, contraste=1.06, saturacion=0.76, vineta=0.36,
)

PAL_MEDALLA = Palette(
    cielo_alto=(0.04, 0.04, 0.05), cielo_bajo=(0.10, 0.09, 0.09),
    luz_dir=(-0.34, 0.76, 0.56), luz_color=(1.42, 1.16, 0.72),
    amb_cielo=(0.16, 0.14, 0.12), amb_suelo=(0.05, 0.04, 0.04),
    niebla=(0.08, 0.07, 0.07), densidad_niebla=0.0300,
    contraste=1.14, vineta=0.56, grano=0.007,
)

PAL_REGRESO = Palette(
    cielo_alto=(0.34, 0.52, 0.74), cielo_bajo=(0.88, 0.88, 0.84),
    luz_dir=(-0.44, 0.72, 0.54), luz_color=(1.22, 1.12, 0.94),
    amb_cielo=(0.40, 0.44, 0.50), amb_suelo=(0.18, 0.17, 0.15),
    niebla=(0.84, 0.85, 0.82), densidad_niebla=0.0050,
    contraste=1.04, vineta=0.26,
)

PAL_DORADO = Palette(
    cielo_alto=(0.22, 0.32, 0.50), cielo_bajo=(0.96, 0.74, 0.44),
    luz_dir=(0.62, 0.32, -0.58), luz_color=(1.28, 0.96, 0.62),
    amb_cielo=(0.46, 0.43, 0.44), amb_suelo=(0.22, 0.18, 0.15),
    niebla=(0.88, 0.72, 0.52), densidad_niebla=0.0055,
    sol=(0.82, 0.48, 0.20), sol_tam=0.38, contraste=1.05, vineta=0.32,
)


# --- utilidades de escenario -----------------------------------------------


def alturas(amp=3.0, escala=0.055, semilla=0, base=0.0, ondas=3):
    """Devuelve una funcion de altura de terreno reproducible."""
    rng = np.random.default_rng(semilla)
    fases = rng.uniform(0, 6.283, (ondas, 2))
    pesos = rng.uniform(0.5, 1.0, ondas)
    dirs = rng.uniform(-1, 1, (ondas, 2))

    def bruto(x, z):
        y = np.zeros_like(np.asarray(x, dtype=float))
        for i in range(ondas):
            k = escala * (1.0 + i * 0.9)
            y += (
                np.sin(x * k * dirs[i, 0] + fases[i, 0])
                * np.cos(z * k * dirs[i, 1] + fases[i, 1])
                * amp * pesos[i] / (1.0 + i * 0.8)
            )
        return y

    # El terreno se ancla a 0 en el origen: los planos se escenifican ahi y
    # tanto las camaras como las figuras se situan a alturas absolutas.
    cero = float(bruto(np.array(0.0), np.array(0.0)))

    def h(x, z):
        return bruto(x, z) - cero + base

    return h


def dispersar(generador, n, extension, altura=None, semilla=0, margen=None,
              radio_libre=0.0, centro_libre=(0.0, 0.0)):
    """Coloca n props al azar sobre el terreno, respetando un claro central."""
    rng = np.random.default_rng(semilla)
    ex, ez = extension if isinstance(extension, (tuple, list)) else (extension, extension)
    piezas = []
    intentos = 0
    while len(piezas) < n and intentos < n * 12:
        intentos += 1
        x = rng.uniform(-ex / 2, ex / 2)
        z = rng.uniform(-ez / 2, ez / 2)
        if radio_libre > 0:
            if math.hypot(x - centro_libre[0], z - centro_libre[1]) < radio_libre:
                continue
        if margen is not None and not margen(x, z):
            continue
        y = 0.0 if altura is None else float(altura(np.array(x), np.array(z)))
        piezas.append(generador(len(piezas)).translate((x, y, z)))
    return join(piezas)


def fila(generador, n, desde, hasta, jitter=0.0, semilla=0):
    """Distribuye n props en linea recta entre dos puntos."""
    rng = np.random.default_rng(semilla)
    a, b = np.asarray(desde, float), np.asarray(hasta, float)
    piezas = []
    for i in range(n):
        t = i / max(n - 1, 1)
        p = a + (b - a) * t
        if jitter:
            p = p + rng.uniform(-jitter, jitter, 3) * np.array([1, 0, 1])
        piezas.append(generador(i).translate(p))
    return join(piezas)
