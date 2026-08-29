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
    # Personajes: se reconstruyen cada fotograma porque su pose depende de `t`.
    # Va al final para no desplazar los argumentos posicionales de las escenas.
    figuras: object = None               # f(t) -> Mesh | None

    _cache: object = field(default=None, repr=False, compare=False)

    def geometria(self, t: float):
        """Decorado cacheado + efectos + personajes reconstruidos cada fotograma.

        Las figuras van aparte del decorado porque su pose depende de `t`: si
        se construyen una sola vez, la escena entera queda congelada.
        """
        if self._cache is None and self.estatico is not None:
            self._cache = self.estatico()
        partes = [self._cache]
        if self.animado is not None:
            partes.append(self.animado(t, self.dur))
        if self.figuras is not None:
            partes.append(self.figuras(t))
        partes = [x for x in partes if x is not None]
        if not partes:
            return None
        return partes[0] if len(partes) == 1 else join(partes)


# --- paletas por tono -------------------------------------------------------

PAL_AMANECER = Palette(
    cielo_alto=(0.24, 0.34, 0.62), cielo_bajo=(1.00, 0.70, 0.42),
    luz_dir=(-0.50, 0.28, -0.82), luz_color=(1.22, 0.86, 0.50),
    amb_cielo=(0.40, 0.44, 0.60), amb_suelo=(0.26, 0.18, 0.14),
    relleno_dir=(0.60, 0.32, 0.73), relleno_color=(0.16, 0.20, 0.34),
    borde_color=(0.16, 0.11, 0.05),
    niebla=(0.96, 0.70, 0.48), densidad_niebla=0.0052,
    sol=(1.00, 0.60, 0.24), sol_tam=0.46,
    contraste=1.06, saturacion=1.12, vineta=0.20, grano=0.006,
)

PAL_GRANJA = Palette(
    cielo_alto=(0.22, 0.50, 0.86), cielo_bajo=(0.80, 0.92, 1.00),
    luz_dir=(-0.42, 0.66, -0.62), luz_color=(1.22, 1.11, 0.84),
    amb_cielo=(0.34, 0.48, 0.64), amb_suelo=(0.28, 0.24, 0.16),
    relleno_dir=(0.62, 0.30, 0.72), relleno_color=(0.16, 0.22, 0.34),
    borde_color=(0.10, 0.12, 0.08),
    niebla=(0.78, 0.90, 1.00), densidad_niebla=0.0038,
    sol=(0.55, 0.42, 0.18), sol_tam=0.26,
    contraste=1.06, saturacion=1.12, vineta=0.16, grano=0.005,
)

PAL_ATARDECER = Palette(
    cielo_alto=(0.20, 0.24, 0.52), cielo_bajo=(1.00, 0.58, 0.34),
    luz_dir=(0.62, 0.24, -0.75), luz_color=(1.26, 0.79, 0.45),
    amb_cielo=(0.36, 0.36, 0.52), amb_suelo=(0.26, 0.17, 0.13),
    relleno_dir=(-0.62, 0.30, 0.72), relleno_color=(0.18, 0.20, 0.36),
    borde_color=(0.18, 0.11, 0.05),
    niebla=(0.90, 0.60, 0.44), densidad_niebla=0.0056,
    sol=(1.00, 0.52, 0.22), sol_tam=0.38,
    contraste=1.06, saturacion=1.12, vineta=0.22, grano=0.006,
)

PAL_INTERIOR = Palette(
    cielo_alto=(0.05, 0.05, 0.08), cielo_bajo=(0.16, 0.12, 0.09),
    luz_dir=(-0.32, 0.82, 0.48), luz_color=(1.43, 1.08, 0.64),
    amb_cielo=(0.26, 0.22, 0.24), amb_suelo=(0.10, 0.07, 0.06),
    relleno_dir=(0.70, 0.20, -0.68), relleno_color=(0.12, 0.14, 0.24),
    borde_color=(0.10, 0.07, 0.03),
    niebla=(0.10, 0.08, 0.07), densidad_niebla=0.020,
    contraste=1.10, saturacion=1.12, vineta=0.38, grano=0.008,
)

PAL_CAMPAMENTO = Palette(
    cielo_alto=(0.26, 0.52, 0.84), cielo_bajo=(0.82, 0.90, 0.98),
    luz_dir=(-0.42, 0.64, -0.64), luz_color=(1.14, 1.08, 0.89),
    amb_cielo=(0.34, 0.46, 0.62), amb_suelo=(0.26, 0.24, 0.18),
    relleno_dir=(0.62, 0.30, 0.72), relleno_color=(0.16, 0.20, 0.32),
    borde_color=(0.10, 0.11, 0.09),
    niebla=(0.80, 0.88, 0.98), densidad_niebla=0.0042,
    contraste=1.04, saturacion=1.12, vineta=0.18, grano=0.005,
)

PAL_MAR = Palette(
    cielo_alto=(0.20, 0.44, 0.78), cielo_bajo=(0.78, 0.88, 0.96),
    luz_dir=(0.40, 0.58, 0.70), luz_color=(1.16, 1.11, 0.96),
    amb_cielo=(0.32, 0.48, 0.64), amb_suelo=(0.16, 0.26, 0.36),
    relleno_dir=(-0.60, 0.28, -0.74), relleno_color=(0.14, 0.22, 0.34),
    borde_color=(0.12, 0.16, 0.18),
    niebla=(0.76, 0.86, 0.95), densidad_niebla=0.0044,
    contraste=1.06, saturacion=1.12, vineta=0.20, grano=0.005,
)

PAL_FRANCIA = Palette(
    cielo_alto=(0.38, 0.52, 0.70), cielo_bajo=(0.86, 0.84, 0.78),
    luz_dir=(-0.36, 0.60, -0.72), luz_color=(1.08, 0.99, 0.81),
    amb_cielo=(0.34, 0.42, 0.58), amb_suelo=(0.26, 0.22, 0.16),
    relleno_dir=(0.62, 0.28, 0.73), relleno_color=(0.14, 0.18, 0.28),
    borde_color=(0.12, 0.11, 0.08),
    niebla=(0.82, 0.80, 0.74), densidad_niebla=0.0060,
    contraste=1.06, saturacion=1.00, vineta=0.24, grano=0.007,
)

PAL_NOCHE = Palette(
    cielo_alto=(0.03, 0.07, 0.20), cielo_bajo=(0.14, 0.26, 0.44),
    luz_dir=(0.50, 0.56, 0.66), luz_color=(0.52, 0.67, 1.01),
    amb_cielo=(0.24, 0.34, 0.50), amb_suelo=(0.12, 0.14, 0.20),
    relleno_dir=(-0.60, 0.24, -0.76), relleno_color=(0.20, 0.14, 0.10),
    borde_color=(0.14, 0.20, 0.34),
    niebla=(0.14, 0.22, 0.38), densidad_niebla=0.0075,
    contraste=1.08, saturacion=1.12, vineta=0.30, grano=0.009,
)

PAL_NIEBLA = Palette(
    cielo_alto=(0.46, 0.62, 0.76), cielo_bajo=(0.86, 0.88, 0.82),
    luz_dir=(-0.30, 0.66, -0.68), luz_color=(1.13, 1.04, 0.79),
    amb_cielo=(0.40, 0.50, 0.66), amb_suelo=(0.26, 0.24, 0.18),
    relleno_dir=(0.62, 0.30, 0.72), relleno_color=(0.14, 0.18, 0.28),
    borde_color=(0.14, 0.14, 0.10),
    niebla=(0.88, 0.90, 0.86), densidad_niebla=0.0235,
    sol=(0.42, 0.38, 0.22), sol_tam=0.40,
    contraste=1.05, saturacion=1.02, vineta=0.24, grano=0.008,
)

PAL_COMBATE = Palette(
    cielo_alto=(0.34, 0.44, 0.60), cielo_bajo=(0.92, 0.76, 0.52),
    luz_dir=(-0.40, 0.54, -0.74), luz_color=(1.26, 0.97, 0.66),
    amb_cielo=(0.34, 0.42, 0.58), amb_suelo=(0.26, 0.20, 0.14),
    relleno_dir=(0.64, 0.28, 0.72), relleno_color=(0.16, 0.18, 0.28),
    borde_color=(0.20, 0.13, 0.06),
    niebla=(0.88, 0.74, 0.54), densidad_niebla=0.0125,
    sol=(0.70, 0.42, 0.18), sol_tam=0.34,
    contraste=1.10, saturacion=1.08, vineta=0.30, grano=0.010,
)

PAL_TENSION = Palette(
    cielo_alto=(0.32, 0.46, 0.68), cielo_bajo=(0.88, 0.82, 0.64),
    luz_dir=(-0.46, 0.58, 0.68), luz_color=(1.21, 1.02, 0.72),
    amb_cielo=(0.32, 0.42, 0.58), amb_suelo=(0.26, 0.22, 0.15),
    relleno_dir=(0.64, 0.26, -0.72), relleno_color=(0.16, 0.20, 0.30),
    borde_color=(0.16, 0.13, 0.07),
    niebla=(0.86, 0.80, 0.66), densidad_niebla=0.0105,
    contraste=1.08, saturacion=1.10, vineta=0.28, grano=0.009,
)

PAL_RENDICION = Palette(
    cielo_alto=(0.28, 0.52, 0.84), cielo_bajo=(1.00, 0.90, 0.66),
    luz_dir=(-0.70, 0.50, 0.51), luz_color=(1.24, 1.08, 0.77),
    amb_cielo=(0.34, 0.48, 0.64), amb_suelo=(0.26, 0.23, 0.16),
    relleno_dir=(0.68, 0.28, -0.68), relleno_color=(0.16, 0.20, 0.32),
    borde_color=(0.18, 0.15, 0.08),
    niebla=(0.94, 0.86, 0.66), densidad_niebla=0.0050,
    sol=(0.78, 0.52, 0.20), sol_tam=0.36,
    contraste=1.06, saturacion=1.12, vineta=0.22, grano=0.006,
)

PAL_MEDALLA = Palette(
    cielo_alto=(0.04, 0.05, 0.09), cielo_bajo=(0.14, 0.12, 0.12),
    luz_dir=(-0.34, 0.76, 0.56), luz_color=(1.60, 1.26, 0.76),
    amb_cielo=(0.22, 0.20, 0.24), amb_suelo=(0.08, 0.07, 0.07),
    relleno_dir=(0.72, 0.22, -0.66), relleno_color=(0.14, 0.16, 0.28),
    borde_color=(0.20, 0.14, 0.05),
    niebla=(0.09, 0.08, 0.08), densidad_niebla=0.030,
    contraste=1.10, saturacion=1.12, vineta=0.40, grano=0.007,
)

PAL_REGRESO = Palette(
    cielo_alto=(0.20, 0.50, 0.88), cielo_bajo=(0.84, 0.94, 1.00),
    luz_dir=(-0.44, 0.70, -0.56), luz_color=(1.26, 1.16, 0.92),
    amb_cielo=(0.34, 0.50, 0.66), amb_suelo=(0.28, 0.25, 0.18),
    relleno_dir=(0.62, 0.30, 0.72), relleno_color=(0.16, 0.22, 0.34),
    borde_color=(0.12, 0.13, 0.10),
    niebla=(0.84, 0.92, 1.00), densidad_niebla=0.0036,
    contraste=1.05, saturacion=1.12, vineta=0.14, grano=0.005,
)

PAL_DORADO = Palette(
    cielo_alto=(0.20, 0.40, 0.76), cielo_bajo=(1.00, 0.78, 0.44),
    luz_dir=(0.60, 0.30, -0.74), luz_color=(1.30, 0.97, 0.57),
    amb_cielo=(0.36, 0.44, 0.60), amb_suelo=(0.28, 0.20, 0.14),
    relleno_dir=(-0.60, 0.30, 0.74), relleno_color=(0.16, 0.20, 0.34),
    borde_color=(0.20, 0.14, 0.06),
    niebla=(0.98, 0.80, 0.54), densidad_niebla=0.0048,
    sol=(1.00, 0.60, 0.24), sol_tam=0.42,
    contraste=1.05, saturacion=1.12, vineta=0.18, grano=0.005,
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


def decorado(extension, altura=None, semilla=0, radio_libre=0.0, centro_libre=(0.0, 0.0),
             densidad=1.0, verde=(0.26, 0.50, 0.20), con_flores=True):
    """Sotobosque: matas, flores, arbustos y piedras repartidos por la escena.

    Sin esto el terreno queda como una sabana de color plano; la referencia
    visual pide densidad de detalle en todo el encuadre.
    """
    from . import props as P

    ex, ez = extension if isinstance(extension, (tuple, list)) else (extension, extension)
    area = (ex * ez) / 1000.0
    piezas = [
        dispersar(lambda i: P.mata(0.32, semilla=semilla * 7 + i, color=verde),
                  int(52 * densidad * area), (ex, ez), altura, semilla=semilla + 1,
                  radio_libre=radio_libre, centro_libre=centro_libre),
        dispersar(lambda i: P.arbusto(0.55, semilla=semilla * 11 + i,
                                      color=tuple(c * 0.82 for c in verde)),
                  int(14 * densidad * area), (ex, ez), altura, semilla=semilla + 2,
                  radio_libre=radio_libre, centro_libre=centro_libre),
        dispersar(lambda i: P.roca(0.34, semilla=semilla * 13 + i, color=(0.46, 0.45, 0.42)),
                  int(8 * densidad * area), (ex, ez), altura, semilla=semilla + 3,
                  radio_libre=radio_libre, centro_libre=centro_libre),
    ]
    if con_flores:
        piezas.append(
            dispersar(lambda i: P.flor(0.34, semilla=semilla * 17 + i),
                      int(64 * densidad * area), (ex, ez), altura, semilla=semilla + 4,
                      radio_libre=radio_libre, centro_libre=centro_libre)
        )
    return join(piezas)


def cielo_nubes(n=7, alto=34.0, extension=200.0, fondo=-90.0, semilla=0,
                color=(0.99, 0.99, 0.97), radio=10.0):
    """Banco de nubes cumuliformes para los cielos diurnos."""
    from . import props as P

    rng = np.random.default_rng(semilla)
    piezas = []
    for i in range(n):
        c = P.nube(radio * rng.uniform(0.7, 1.35), semilla=semilla * 3 + i, color=color, alfa=1.0)
        c.translate((rng.uniform(-extension, extension),
                     alto + rng.uniform(-6, 10),
                     fondo + rng.uniform(-45, 25)))
        piezas.append(c)
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
