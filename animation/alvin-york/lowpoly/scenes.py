"""Los 34 planos del guion, en orden.

Cada plano define su geometria, su camara en movimiento, su paleta de luz y
sus rotulos. Las duraciones coinciden con las anotadas en `GUION.md`.
"""

from __future__ import annotations

import math

import numpy as np

from . import props as P
from .escenas_base import (
    PAL_AMANECER, PAL_ATARDECER, PAL_CAMPAMENTO, PAL_COMBATE, PAL_DORADO,
    PAL_FRANCIA, PAL_GRANJA, PAL_INTERIOR, PAL_MAR, PAL_MEDALLA, PAL_NIEBLA,
    PAL_NOCHE, PAL_REGRESO, PAL_RENDICION, PAL_TENSION,
    Plano, alturas, deriva, dispersar, dolly, fila, grua, orbita, temblor,
)
from .math3d import ease_in, ease_in_out, ease_out, noise1d, smoothstep
from .mesh import box, cylinder, disc, grid, join, quad, sphere
from .overlay import Rotulo

# Alturas de terreno reutilizadas entre planos del mismo lugar.
H_VALLE = alturas(amp=13.0, escala=0.052, semilla=7)
H_GRANJA = alturas(amp=1.4, escala=0.045, semilla=3)
H_ARGONNE = alturas(amp=2.2, escala=0.048, semilla=21)
H_FRENTE = alturas(amp=1.1, escala=0.060, semilla=13)
H_NOCHE = alturas(amp=0.7, escala=0.070, semilla=15)


def _colina(cima=(0.0, -14.0), alto=7.0, radio=17.0, base=None):
    """Ladera con una cima marcada: la colina de las ametralladoras."""

    def h(x, z):
        y = 0.0 if base is None else base(x, z)
        d = np.sqrt((x - cima[0]) ** 2 + (z - cima[1]) ** 2)
        return y + alto * np.exp(-((d / radio) ** 2))

    return h


def _suelo(altura, color, ancho=170.0, n=34, centro=(0, 0, 0)):
    return grid(ancho, ancho, n, n, altura, color, centro).jitter(0.055, 2)


# ===========================================================================
# 01 · Montanas de Tennessee, amanecer
# ===========================================================================


def _p01():
    def construir():
        suelo = _suelo(H_VALLE, (0.34, 0.40, 0.25), 260.0, 54)
        pinos = dispersar(
            lambda i: P.pino(7.5, semilla=i, color_hoja=(0.13, 0.24, 0.16)),
            46, (170, 150), H_VALLE, semilla=11, radio_libre=16,
        )
        frondosos = dispersar(
            lambda i: P.arbol_frondoso(6.0, semilla=100 + i, color_hoja=(0.28, 0.30, 0.15)),
            16, (120, 110), H_VALLE, semilla=12, radio_libre=14,
        )
        nubes = join([
            P.nube(9.0, semilla=i, color=(0.95, 0.74, 0.54), alfa=0.85).translate(
                (-70 + i * 36, 34 + (i % 3) * 6, -80)
            )
            for i in range(6)
        ])
        # Primer termino: siluetas grandes que dan escala a las cordilleras.
        marco = join([
            P.pino(15.0, semilla=900 + i, color_hoja=(0.09, 0.15, 0.11)).translate(p)
            for i, p in enumerate(((-16.0, 14.0, 44.0), (17.0, 12.0, 40.0), (-24.0, 10.0, 34.0)))
        ])
        return join(suelo, pinos, frondosos, nubes, marco)

    def animado(t, dur):
        aves = []
        for i in range(6):
            x = -22 + i * 8 + t * 2.4
            y = 17 + math.sin(t * 0.8 + i) * 1.1
            aves.append(P.ave(0.9, (0.14, 0.12, 0.14), fase=t * 6 + i).translate((x, y, -26)))
        return join(aves)

    return Plano(
        "01_amanecer_tennessee", 11.0,
        deriva(dolly((9, 27, 80), (0, 13, -60), (3, 21, 56), (0, 11, -66), fov=(52, 44))),
        PAL_AMANECER, construir, animado,
        [Rotulo("Montañas de Tennessee", ini=1.0, fin=5.2, estilo="titulo",
                sub="Condado de Fentress · 1887"),
         Rotulo("Aprendió a disparar antes que a leer", ini=6.4, fin=10.4)],
        entra=1.4,
    )


# ===========================================================================
# 02 · La granja de los York
# ===========================================================================


def _p02():
    def construir():
        suelo = _suelo(H_GRANJA, (0.33, 0.38, 0.20), 140.0, 30)
        casa = P.cabana(5.0, 4.0, 2.4, semilla=2).translate((-6.0, float(H_GRANJA(np.array(-6.0), np.array(0.0))), 0))
        establo = P.granero(5.0, 6.5, 3.2).translate((9.0, float(H_GRANJA(np.array(9.0), np.array(-4.0))), -4.0))
        campo = P.surcos(12, 13.0, 10.0).translate(
            (2.0, float(H_GRANJA(np.array(2.0), np.array(14.0))) + 0.05, 14.0)
        )
        cerca = join(
            P.valla(26.0, 22).translate((0, 0.0, 20.0)),
            P.valla(18.0, 16).rotate(ry=math.pi / 2).translate((-13.0, 0, 11.0)),
        )
        arboles = dispersar(
            lambda i: P.arbol_frondoso(6.5, semilla=200 + i, color_hoja=(0.26, 0.34, 0.17)),
            14, (120, 100), H_GRANJA, semilla=15, radio_libre=15,
        )
        detalles = join(
            P.barril().translate((-3.2, 0, 2.4)),
            P.barril(0.28, 0.7).translate((-2.5, 0, 3.1)),
            P.caja_municion((0.36, 0.30, 0.20)).translate((-8.4, 0, 2.8)),
            P.tocon(0.4, 5).translate((-9.5, 0, 4.6)),
            P.hierba_alta(50, 22, 9, (0.34, 0.42, 0.20), 0.45),
        )
        hacha = join(
            cylinder(0.035, 0.75, 5, P.MADERA_CLARA),
            box((0.06, 0.16, 0.22), P.ACERO, center=(0, 0.78, 0.05)),
        ).rotate(rz=0.35).translate((-4.4, 0.35, 4.0))
        alvin = P.soldado("firme", (0.42, 0.36, 0.26), None, arma=None, semilla=1, giro=0.55)
        alvin.translate((-4.0, 0.0, 4.2))
        return join(suelo, casa, establo, campo, cerca, arboles, detalles, hacha, alvin)

    def animado(t, dur):
        return P.humo(0.45, 4, semilla=3, color=(0.72, 0.70, 0.66), alfa=0.35, altura=3.2).translate(
            (-3.3, 3.6 + math.sin(t * 0.5) * 0.15, -0.4)
        )

    return Plano(
        "02_granja_york", 10.0,
        deriva(dolly((-20, 7.5, 20), (-3, 2.0, 2), (14, 6.5, 20), (2, 1.6, 0), fov=(44, 44))),
        PAL_GRANJA, construir, animado,
        [Rotulo("Alvin C. York", ini=0.6, fin=4.6, estilo="titulo",
                sub="Tercero de once hermanos · herrero y cazador"),
         Rotulo("Fallar un tiro significaba no cenar", ini=6.0, fin=9.6)],
    )


# ===========================================================================
# 03 · Juventud y conversion
# ===========================================================================


def _p03():
    def construir():
        suelo = _suelo(H_GRANJA, (0.24, 0.28, 0.17), 120.0, 26)
        capilla = P.iglesia(5.0, 8.0, 3.4, (0.82, 0.78, 0.70)).translate((0, 0, -6))
        camino = join([
            box((2.6, 0.06, 3.0), (0.44, 0.38, 0.30), center=(0, 0.03, 2.0 + i * 3.0))
            for i in range(5)
        ]).jitter(0.08, 9)
        arboles = dispersar(
            lambda i: P.arbol_frondoso(7.0, semilla=300 + i, color_hoja=(0.20, 0.24, 0.14)),
            12, (90, 80), H_GRANJA, semilla=19, radio_libre=13,
        )
        cerca = P.valla(20.0, 18, 1.0).translate((0, 0, 13.0))
        farolas = join([
            join(cylinder(0.06, 2.1, 5, (0.24, 0.22, 0.20)),
                 sphere(0.16, 6, 3, (1.0, 0.86, 0.52)).emisivo().translate((0, 2.2, 0))).translate((x, 0, 3.0))
            for x in (-3.4, 3.4)
        ])
        fieles = join([
            P.soldado("firme", (0.22, 0.20, 0.22), "sombrero", arma=None, semilla=400 + i,
                      giro=math.pi).translate((-1.6 + i * 1.1, 0, 2.2 + (i % 2) * 0.7))
            for i in range(4)
        ])
        return join(suelo, capilla, camino, arboles, cerca, farolas, fieles)

    def animado(t, dur):
        u = min(t / dur, 1.0)
        alvin = P.soldado("firme", (0.30, 0.24, 0.20), "sombrero", arma=None, semilla=5, giro=math.pi)
        return alvin.translate((0.4, 0, 9.5 - u * 5.4))

    return Plano(
        "03_conversion", 9.0,
        deriva(dolly((3.5, 3.2, 16.0), (0.4, 2.2, -3.0), (1.2, 2.4, 8.5), (0.2, 2.6, -5.0), fov=(46, 40))),
        PAL_ATARDECER, construir, animado,
        [Rotulo("1915", ini=0.8, fin=4.4, estilo="titulo", sub="Entró en una iglesia y salió siendo otro hombre"),
         Rotulo("«No matarás»", ini=5.8, fin=8.7, estilo="cita")],
    )


# ===========================================================================
# 04 · La carta de reclutamiento (cenital)
# ===========================================================================


def _p04():
    def construir():
        tablero = P.tablero(2.4, 1.8, (0.34, 0.24, 0.16), semilla=3, n=14)
        vetas = join([
            box((2.4, 0.006, 0.030), (0.28, 0.19, 0.13), center=(0, 0.004, -0.80 + i * 0.23))
            for i in range(8)
        ])
        papel = P.carta(0.62, 0.44).translate((-0.10, 0.055, 0.0)).rotate(ry=0.06)
        sobre = join(
            box((0.52, 0.026, 0.32), (0.80, 0.74, 0.62), center=(0, 0, 0)),
            box((0.30, 0.030, 0.10), (0.70, 0.63, 0.50), center=(0, 0.006, 0.02)),
        ).place(pos=(0.72, 0.050, 0.38), rot=(0, -0.35, 0))
        pluma = join(
            cylinder(0.010, 0.26, 5, (0.20, 0.18, 0.16)),
            cylinder(0.012, 0.06, 5, (0.55, 0.52, 0.46)).translate((0, 0.24, 0)),
        ).place(pos=(0.50, 0.055, -0.34), rot=(0, 0, 1.35))
        tintero = join(
            cylinder(0.075, 0.10, 8, (0.16, 0.18, 0.22)),
            disc(0.085, 8, (0.12, 0.13, 0.16), y=0.10),
        ).translate((0.68, 0.045, -0.30))
        sombrero = join(
            disc(0.30, 12, (0.34, 0.27, 0.18), y=0.0),
            cylinder(0.15, 0.16, 8, (0.34, 0.27, 0.18)),
        ).translate((-0.86, 0.045, 0.30))
        lampara = join(
            disc(0.20, 10, (0.22, 0.20, 0.18), y=0.0),
            cylinder(0.045, 0.34, 6, (0.26, 0.24, 0.20)).translate((0, 0.02, 0)),
            sphere(0.16, 8, 4, (1.0, 0.88, 0.56)).translate((0, 0.50, 0)),
        ).translate((-0.80, 0.045, -0.48))
        biblia = P.biblia().translate((0.88, 0.045, -0.02)).rotate(ry=0.2)
        return join(tablero, vetas, papel, sobre, pluma, tintero, sombrero, lampara, biblia)

    return Plano(
        "04_carta_reclutamiento", 9.0,
        deriva(dolly((0.07, 1.15, 0.16), (-0.02, 0.0, 0.02), (0.02, 0.74, 0.08), (-0.05, 0.0, 0.0),
                     fov=(48, 42)), amp=0.004),
        PAL_INTERIOR, construir, None,
        [Rotulo("La carta de reclutamiento", ini=0.7, fin=4.3, estilo="titulo", sub="Junio de 1917"),
         Rotulo("«No quiero pelear»", ini=5.4, fin=8.7, estilo="cita")],
    )


# ===========================================================================
# 05 · La objecion denegada
# ===========================================================================


def _p05():
    def construir():
        tablero = P.tablero(1.9, 1.4, (0.30, 0.21, 0.14), semilla=4, n=13)
        expediente = join(
            P.carta(0.66, 0.46, (0.80, 0.77, 0.68)).translate((0.03, 0.045, -0.02)),
            P.carta(0.66, 0.46, (0.87, 0.84, 0.75)).translate((0.0, 0.080, 0.0)),
        )
        marca = P.sello(0.075).translate((0.15, 0.098, 0.05)).rotate(ry=-0.22)
        marca2 = P.sello(0.050, (0.30, 0.26, 0.22)).translate((-0.20, 0.098, -0.14))
        pluma = join(
            cylinder(0.010, 0.24, 5, (0.18, 0.16, 0.15)),
            cylinder(0.012, 0.05, 5, (0.52, 0.50, 0.45)).translate((0, 0.22, 0)),
        ).place(pos=(0.60, 0.050, 0.30), rot=(0, 0, 1.4))
        gafas = join(
            cylinder(0.055, 0.008, 10, (0.30, 0.28, 0.24)).rotate(rx=math.pi / 2),
            cylinder(0.055, 0.008, 10, (0.30, 0.28, 0.24)).rotate(rx=math.pi / 2).translate((0.13, 0, 0)),
            box((0.05, 0.006, 0.006), (0.30, 0.28, 0.24), center=(0.065, 0, 0)),
        ).translate((-0.62, 0.048, 0.34))
        return join(tablero, expediente, marca, marca2, pluma, gafas)

    return Plano(
        "05_objecion_denegada", 8.0,
        deriva(dolly((0.11, 1.20, 0.20), (0.03, 0.0, 0.0), (0.09, 0.78, 0.11), (0.09, 0.0, 0.01),
                     fov=(46, 40)), amp=0.004),
        PAL_INTERIOR, construir, None,
        [Rotulo("Objeción de conciencia: DENEGADA", ini=0.8, fin=4.6, estilo="titulo",
                sub="Su iglesia era demasiado pequeña para los registros"),
         Rotulo("Iría a la guerra quisiera o no", ini=5.6, fin=7.7)],
    )


# ===========================================================================
# 06 · Campamento Gordon
# ===========================================================================


def _p06():
    def construir():
        suelo = _suelo(alturas(0.5, 0.05, semilla=5), (0.40, 0.37, 0.24), 150.0, 26)
        tiendas = join([
            P.tienda(3.0, 4.2, 2.3).translate((-16 + col * 5.4, 0, -8 + fila_i * 6.6))
            for fila_i in range(4) for col in range(7)
        ])
        mastil = P.bandera(7.0, (0.55, 0.18, 0.20)).translate((0, 0, 12.0))
        tropa = join(
            P.multitud(24, "firme", P.CAQUI, "us", (9.0, 4.0), semilla=31, arma="fusil_hombro",
                       giro=0.0, rejilla=True).translate((0, 0, 16.0)),
            P.multitud(6, "marcha", P.CAQUI, "us", (7.0, 1.5), semilla=32, arma="fusil_hombro",
                       giro=1.57).translate((14, 0, 6.0)),
        )
        vehiculos = join(
            P.camion().translate((-20, 0, 14)).rotate(ry=0.3),
            P.camion((0.28, 0.30, 0.22)).translate((-24, 0, 8)).rotate(ry=-0.2),
        )
        cajas = join([
            P.caja_municion().translate((18 + (i % 3) * 0.8, 0, -2 + (i // 3) * 0.5))
            for i in range(9)
        ])
        arboles = dispersar(
            lambda i: P.pino(8.0, semilla=500 + i, color_hoja=(0.18, 0.26, 0.16)),
            14, (140, 130), None, semilla=23, radio_libre=32,
        )
        return join(suelo, tiendas, mastil, tropa, vehiculos, cajas, arboles)

    def animado(t, dur):
        return P.bandera(7.0, (0.55, 0.18, 0.20), ondea=t * 2.4).translate((0, 0, 12.0))

    return Plano(
        "06_campamento_gordon", 10.0,
        orbita((0, 0, 2), radio=(34, 27), ang=(1.05, 1.85), alt=(15.0, 9.5),
               mira=(0, 2.0, 2), fov=(46, 42)),
        PAL_CAMPAMENTO, construir, animado,
        [Rotulo("Campamento Gordon, Georgia", ini=0.8, fin=4.8, estilo="titulo", sub="1917"),
         Rotulo("¿Puede un hombre bueno matar?", ini=6.2, fin=9.7, estilo="cita")],
    )


# ===========================================================================
# 07 · La montana
# ===========================================================================


def _p07():
    H = _colina((0, -6), 11.0, 15.0, alturas(2.0, 0.04, semilla=9))

    def construir():
        suelo = _suelo(H, (0.24, 0.27, 0.17), 130.0, 30)
        rocas = dispersar(lambda i: P.roca(1.1, semilla=600 + i, color=(0.34, 0.32, 0.28)),
                          14, (60, 60), H, semilla=27, radio_libre=6, centro_libre=(0, -6))
        pinos = dispersar(lambda i: P.pino(6.5, semilla=700 + i, color_hoja=(0.12, 0.20, 0.14)),
                          22, (110, 100), H, semilla=29, radio_libre=13, centro_libre=(0, -6))
        cima_y = float(H(np.array(0.0), np.array(-6.0)))
        alvin = P.soldado("reza", (0.32, 0.28, 0.22), None, arma=None, semilla=7, giro=0.3)
        alvin.translate((0, cima_y, -6.0))
        piedra = P.roca(0.8, semilla=44, color=(0.40, 0.37, 0.32)).translate((2.6, cima_y - 0.2, -4.2))
        return join(suelo, rocas, pinos, alvin, piedra)

    def animado(t, dur):
        return None

    return Plano(
        "07_la_montana", 8.0,
        grua((4.0, 8.5, 7.0), (0.0, 11.6, -6.0), (5.2, 13.5, 10.5), (0.0, 11.4, -6.5), fov=(42, 36)),
        PAL_AMANECER, construir, animado,
        [Rotulo("Dos días solo en la montaña", ini=1.0, fin=5.0, estilo="titulo"),
         Rotulo("Cuando bajó, ya no dudaba", ini=5.8, fin=7.8)],
    )


# ===========================================================================
# 08 · Campo de tiro
# ===========================================================================


def _p08():
    def construir():
        suelo = _suelo(alturas(0.35, 0.06, semilla=11), (0.38, 0.38, 0.23), 120.0, 24)
        linea = join([
            P.soldado("tumbado", P.CAQUI, "us", semilla=800 + i).translate((-6.0 + i * 2.6, 0.02, 0))
            for i in range(5)
        ])
        blancos = join([
            join(
                box((0.10, 1.9, 0.10), P.MADERA, center=(0, 0.95, 0)),
                box((1.05, 1.05, 0.07), (0.86, 0.84, 0.76), center=(0, 1.6, 0)),
                cylinder(0.20, 0.02, 10, (0.60, 0.16, 0.14)).rotate(rx=math.pi / 2).translate((0, 1.6, -0.04)),
            ).translate((-6.0 + i * 2.6, 0, -22.0))
            for i in range(5)
        ])
        terraplen = box((26.0, 2.2, 3.0), (0.34, 0.30, 0.20), center=(0, 1.1, -25.0)).jitter(0.07, 8)
        instructor = P.soldado("firme", P.CAQUI, "us", arma="fusil", semilla=9, giro=1.5)
        instructor.translate((3.6, 0, 2.4))
        banderines = join([
            join(cylinder(0.04, 1.3, 4, (0.30, 0.28, 0.24)),
                 quad((0, 1.0, 0), (0.5, 1.05, 0.05), (0.5, 1.3, 0.05), (0, 1.3, 0), (0.72, 0.20, 0.18))
                 ).translate((-9.0 + i * 4.5, 0, -3.0))
            for i in range(5)
        ])
        cajas = join([P.caja_municion().translate((6.6, 0, 1.0 + i * 0.45)) for i in range(3)])
        return join(suelo, linea, blancos, terraplen, instructor, banderines, cajas,
                    P.hierba_alta(40, 26, 12, (0.36, 0.38, 0.20), 0.32))

    def animado(t, dur):
        piezas = []
        for i in range(5):
            if (t * 1.7 + i * 0.31) % 1.0 < 0.16:
                piezas.append(P.fogonazo(0.45, semilla=i).translate((-6.0 + i * 2.6, 0.32, 0.78)))
        return join(piezas) if piezas else None

    return Plano(
        "08_campo_de_tiro", 7.0,
        deriva(dolly((12.0, 2.6, 8.0), (-2.0, 1.0, -6.0), (5.0, 1.9, 4.6), (-3.0, 0.8, -10.0),
                     fov=(48, 40))),
        PAL_CAMPAMENTO, construir, animado,
        [Rotulo("Disparaba mejor que sus instructores", ini=1.2, fin=6.2, estilo="titulo")],
    )


# ===========================================================================
# 09 · Travesia del Atlantico
# ===========================================================================


def _p09():
    def construir():
        mar = P.ola(240, 240, semilla=2, color=(0.14, 0.21, 0.29))
        convoy = join(
            P.barco(30.0).translate((0, 0, 0)),
            P.barco(24.0, (0.24, 0.26, 0.28)).translate((-34, 0, -30)).rotate(ry=0.08),
            P.barco(22.0, (0.22, 0.24, 0.26)).translate((30, 0, -52)).rotate(ry=-0.05),
        )
        nubes = join([
            P.nube(9.0, semilla=800 + i, color=(0.78, 0.79, 0.80), alfa=0.9).translate(
                (-70 + i * 40, 26 + (i % 2) * 6, -60 - (i % 3) * 20)
            )
            for i in range(5)
        ])
        return join(mar, convoy, nubes)

    def animado(t, dur):
        estelas = []
        for x, z, l in ((0, 0, 30.0), (-34, -30, 24.0), (30, -52, 22.0)):
            estelas.append(
                quad((x - 3, 0.25, z - l / 2), (x + 3, 0.25, z - l / 2),
                     (x + 6, 0.25, z - l / 2 - 26 - math.sin(t) * 2),
                     (x - 6, 0.25, z - l / 2 - 26 - math.sin(t) * 2),
                     (0.72, 0.76, 0.78)).opacity(0.35)
            )
        humos = [
            P.humo(1.6, 4, semilla=int(t) + 1, color=(0.42, 0.42, 0.42), alfa=0.4, altura=7.0).translate(
                (-2.0, 7.2, 0)
            )
        ]
        return join(estelas + humos)

    return Plano(
        "09_atlantico", 7.0,
        deriva(dolly((46, 26, 46), (0, 3, -8), (16, 19, 34), (-4, 2, -20), fov=(50, 44))),
        PAL_MAR, construir, animado,
        [Rotulo("Mayo de 1918", ini=0.8, fin=5.0, estilo="titulo", sub="82.ª División · rumbo a Francia")],
    )


# ===========================================================================
# 10 · Francia devastada
# ===========================================================================


def _p10():
    def construir():
        suelo = _suelo(H_FRENTE, (0.31, 0.28, 0.20), 150.0, 32)
        ruinas = join([
            P.casa_ruina(5.0 + (i % 3), 4.6, 3.4, semilla=900 + i).translate(
                (-22 + i * 9.0, 0, -8 + (i % 2) * 9.0)
            )
            for i in range(6)
        ])
        muertos = dispersar(lambda i: P.arbol_muerto(6.0, semilla=1000 + i),
                            22, (130, 110), H_FRENTE, semilla=33, radio_libre=8)
        crateres = dispersar(lambda i: P.crater(2.4, 0.8, semilla=1100 + i),
                             10, (100, 80), None, semilla=35, radio_libre=6)
        convoy = join(
            P.camion().translate((-6, 0, 16)).rotate(ry=0.05),
            P.camion((0.26, 0.28, 0.20)).translate((2, 0, 22)).rotate(ry=0.02),
        )
        escombros = dispersar(
            lambda i: P.roca(0.6, semilla=1200 + i, color=(0.50, 0.47, 0.42)),
            26, (110, 90), None, semilla=37,
        )
        tropa = P.multitud(9, "marcha", P.CAQUI, "us", (5.0, 12.0), semilla=39,
                           arma="fusil_hombro", giro=0.0).translate((-3, 0, 26))
        return join(suelo, ruinas, muertos, crateres, convoy, escombros, tropa)

    def animado(t, dur):
        cols = []
        for i, (x, z) in enumerate(((-24, -14), (12, -20), (26, -6))):
            cols.append(
                P.humo(1.8, 5, semilla=i * 3 + int(t * 0.5), color=(0.44, 0.42, 0.40),
                       alfa=0.34, altura=9.0).translate((x, 0.5, z))
            )
        return join(cols)

    return Plano(
        "10_francia_devastada", 8.0,
        deriva(dolly((-26, 6.0, 30), (-6, 2.0, 6), (16, 5.4, 28), (4, 1.6, 2), fov=(50, 46))),
        PAL_FRANCIA, construir, animado,
        [Rotulo("Francia", ini=0.8, fin=4.4, estilo="titulo", sub="Pueblos sin techos, campos sin árboles")],
    )


# ===========================================================================
# 11 · Las trincheras, de noche
# ===========================================================================


def _p11():
    def construir():
        suelo = _suelo(H_NOCHE, (0.19, 0.17, 0.13), 110.0, 26)
        zanja = P.trinchera(30.0, 2.4, 1.7, semilla=5,
                            base=lambda x, z: H_NOCHE(x, z))
        alambre = join(
            P.alambrada(28.0, 13, 1.1, semilla=6).translate((0, 0, -6.5)),
            P.alambrada(24.0, 11, 0.9, semilla=7).translate((2, 0, -10.0)),
        )
        soldados = join([
            P.soldado("firme", P.CAQUI, "us", arma="fusil", semilla=1300 + i,
                      giro=math.pi + (i % 2) * 0.2).translate((-9.0 + i * 3.4, -1.7, -0.5))
            for i in range(6)
        ])
        centinela = P.soldado("apunta", P.CAQUI, "us", arma="fusil", semilla=77, giro=math.pi)
        centinela.translate((3.0, -0.85, -1.05))
        cajas = join([
            P.caja_municion().translate((-6.0 + i * 5.0, -1.7, 0.7)) for i in range(4)
        ])
        muertos = dispersar(lambda i: P.arbol_muerto(5.0, semilla=1400 + i),
                            12, (90, 70), None, semilla=41, radio_libre=9)
        crateres = dispersar(lambda i: P.crater(2.0, 0.7, semilla=1500 + i),
                             8, (80, 60), None, semilla=43, radio_libre=8)
        luna = sphere(2.2, 10, 6, (0.92, 0.94, 1.0)).emisivo().translate((-26, 34, -60))
        return join(suelo, zanja, alambre, soldados, centinela, cajas, muertos, crateres, luna)

    def animado(t, dur):
        piezas = []
        # Bengala que asciende y se apaga: unica fuente de luz movil del plano.
        u = (t / dur)
        y = 8.0 + u * 12.0
        piezas.append(sphere(0.55, 8, 4, (1.0, 0.94, 0.72)).emisivo().translate((14, y, -22)))
        piezas.append(
            P.humo(1.0, 3, semilla=2, color=(0.55, 0.58, 0.68), alfa=0.22, altura=3.0).translate((14, y - 3, -22))
        )
        for i in range(3):
            if (t * 0.8 + i * 0.4) % 1.0 < 0.10:
                piezas.append(P.fogonazo(1.0, semilla=i).translate((-20 + i * 18, 1.2, -34)))
        return join(piezas)

    return Plano(
        "11_trincheras_noche", 9.0,
        grua((-9.0, 1.1, 9.0), (0.0, -0.5, -2.0), (-5.5, 5.2, 12.0), (0.0, -0.4, -5.0), fov=(50, 46)),
        PAL_NOCHE, construir, animado,
        [Rotulo("Barro, ratas, gas", ini=1.0, fin=5.0, estilo="titulo"),
         Rotulo("No se parecía a ninguna guerra que le contaran de niño", ini=5.8, fin=8.7)],
    )


# ===========================================================================
# 12 · El bosque de Argonne (cenital descendente)
# ===========================================================================

H_COLINA = _colina((0, -20), 7.0, 13.5, H_ARGONNE)


def _p12():
    def construir():
        suelo = _suelo(H_COLINA, (0.27, 0.29, 0.21), 170.0, 36)
        bosque = dispersar(lambda i: P.arbol_muerto(7.5, semilla=1600 + i),
                           60, (150, 130), H_COLINA, semilla=45, radio_libre=10, centro_libre=(0, -20))
        vivos = dispersar(lambda i: P.pino(7.0, semilla=1700 + i, color_hoja=(0.16, 0.22, 0.16)),
                          18, (150, 120), H_COLINA, semilla=47, radio_libre=24, centro_libre=(0, -20))
        nidos = join([
            P.nido_ametralladora(semilla=50 + i * 3).translate(
                (-13.0 + i * 6.5, float(H_COLINA(np.array(-13.0 + i * 6.5), np.array(-17.0))), -17.0)
            ).rotate(ry=0.0)
            for i in range(5)
        ])
        crateres = dispersar(lambda i: P.crater(2.6, 0.9, semilla=1800 + i),
                             14, (120, 100), None, semilla=49, radio_libre=12)
        return join(suelo, bosque, vivos, nidos, crateres)

    def animado(t, dur):
        return None

    return Plano(
        "12_bosque_argonne", 10.0,
        dolly((0, 44, 30), (0, 2, -16), (0, 17, 24), (0, 3, -20), fov=(52, 46), ease=ease_in_out),
        PAL_NIEBLA, construir, animado,
        [Rotulo("8 de octubre de 1918", ini=1.0, fin=5.2, estilo="titulo", sub="Bosque de Argonne, Francia"),
         Rotulo("35 ametralladoras alemanas esperaban en la colina", ini=6.2, fin=9.7)],
    )


# ===========================================================================
# 13 · El avance en la niebla
# ===========================================================================


def _p13():
    def construir():
        suelo = _suelo(H_ARGONNE, (0.25, 0.27, 0.20), 150.0, 32)
        bosque = dispersar(lambda i: P.arbol_muerto(8.0, semilla=1900 + i),
                           48, (120, 130), H_ARGONNE, semilla=51, radio_libre=5)
        maleza = dispersar(lambda i: P.arbusto(0.8, semilla=2000 + i, color=(0.22, 0.25, 0.16)),
                           26, (100, 110), H_ARGONNE, semilla=53, radio_libre=4)
        troncos = dispersar(lambda i: P.tocon(0.45, semilla=2100 + i), 14, (90, 100), None, semilla=55)
        return join(suelo, bosque, maleza, troncos)

    def animado(t, dur):
        u = t / dur
        piezas = []
        # Los 17 hombres avanzan en fila india hacia el fondo del plano.
        for i in range(17):
            fase = t * 1.9 + i * 0.7
            paso = math.sin(fase) * 0.06
            x = -2.6 + (i % 3) * 2.4 + math.sin(i * 1.7) * 0.5
            z = 10.0 - i * 1.85 - u * 5.0
            s = P.soldado("marcha" if int(fase) % 2 == 0 else "firme", P.CAQUI, "us",
                          arma="fusil", semilla=2200 + i, giro=math.pi + math.sin(i) * 0.08)
            piezas.append(s.translate((x, paso, z)))
        return join(piezas)

    return Plano(
        "13_avance_niebla", 9.0,
        deriva(dolly((7.0, 2.6, 16.0), (-1.0, 1.4, 2.0), (4.2, 2.1, 8.0), (-1.5, 1.2, -5.0),
                     fov=(50, 46))),
        PAL_NIEBLA, construir, animado,
        [Rotulo("17 hombres", ini=1.0, fin=5.2, estilo="titulo",
                sub="Orden: rodear la colina y silenciar las ametralladoras")],
    )


# ===========================================================================
# 14 · El puesto de mando aleman
# ===========================================================================


def _p14():
    def construir():
        suelo = _suelo(alturas(0.6, 0.06, semilla=17), (0.26, 0.28, 0.20), 90.0, 22)
        refugio = join(
            P.tienda(3.6, 5.0, 2.5, (0.40, 0.42, 0.34)).translate((-4.5, 0, -3.0)),
            box((3.0, 1.6, 2.4), (0.34, 0.32, 0.26), center=(4.6, 0.8, -4.0)).jitter(0.07, 6),
        )
        campamento = join(
            P.mesa(2.0, 1.0).translate((0, 0, 0.5)),
            P.banco(1.9).translate((0, 0, 1.5)).rotate(ry=math.pi),
            P.banco(1.9).translate((0, 0, -0.6)),
            P.barril().translate((2.6, 0, 1.6)),
            P.caja_municion().translate((-2.4, 0, 2.0)),
            P.caja_municion().translate((-2.4, 0.34, 2.0)),
        )
        vajilla = join([
            join(disc(0.11, 8, (0.82, 0.80, 0.74), y=0.0),
                 cylinder(0.05, 0.09, 6, (0.72, 0.70, 0.64))).translate((-0.6 + i * 0.55, 0.79, 0.5))
            for i in range(4)
        ])
        rendidos = join([
            P.soldado("manos_arriba", P.FELDGRAU, "de", arma=None, semilla=2300 + i,
                      giro=0.25 + i * 0.12).translate((-1.9 + i * 1.25, 0, -1.9))
            for i in range(5)
        ])
        captores = join([
            P.soldado("apunta", P.CAQUI, "us", arma="fusil", semilla=2400 + i, giro=math.pi + 0.1 * i)
            .translate((-2.4 + i * 1.7, 0, 4.6))
            for i in range(4)
        ])
        armas_sueltas = join([
            P.fusil().place(pos=(-1.4 + i * 0.9, 0.06, -0.4), rot=(1.55, 0.4 * i, 0)) for i in range(4)
        ])
        arboles = dispersar(lambda i: P.arbol_muerto(7.0, semilla=2500 + i),
                            20, (80, 80), None, semilla=57, radio_libre=9)
        return join(suelo, refugio, campamento, vajilla, rendidos, captores, armas_sueltas, arboles)

    def animado(t, dur):
        return None

    return Plano(
        "14_puesto_mando", 9.0,
        orbita((0, 0, 0), radio=(11.5, 9.5), ang=(1.15, 1.95), alt=(4.6, 2.8),
               mira=(0, 1.4, -0.5), fov=(48, 44)),
        PAL_NIEBLA, construir, animado,
        [Rotulo("Sorprendieron un puesto de mando alemán", ini=0.9, fin=5.0, estilo="titulo",
                sub="Se rindieron sin disparar un tiro")],
    )


# ===========================================================================
# 15 · La emboscada
# ===========================================================================


def _p15():
    def construir():
        suelo = _suelo(H_COLINA, (0.24, 0.25, 0.19), 130.0, 30)
        nidos = join([
            P.nido_ametralladora(semilla=70 + i * 5).translate(
                (-11.0 + i * 5.6, float(H_COLINA(np.array(-11.0 + i * 5.6), np.array(-17.0))), -17.0)
            )
            for i in range(5)
        ])
        bosque = dispersar(lambda i: P.arbol_muerto(7.5, semilla=2600 + i),
                           26, (110, 90), H_COLINA, semilla=59, radio_libre=8)
        sacos = join([
            P.sacos(6, 2.6, 2, semilla=80 + i).translate(
                (-14 + i * 7.0, float(H_COLINA(np.array(-14.0 + i * 7.0), np.array(-13.0))), -13.0)
            )
            for i in range(4)
        ])
        return join(suelo, nidos, bosque, sacos)

    def animado(t, dur):
        piezas = []
        for i in range(5):
            x = -11.0 + i * 5.6
            y = float(H_COLINA(np.array(x), np.array(-17.0)))
            if (t * 8.0 + i * 0.5) % 1.0 < 0.45:
                piezas.append(P.fogonazo(0.75, semilla=i + int(t * 8)).translate((x, y + 0.72, -16.4)))
            for k in range(2):
                f = (t * 2.2 + i * 0.4 + k * 0.5) % 1.0
                # Trazadora orientada a lo largo de su propia trayectoria.
                dx, dz = (0.0 - x), 20.0
                tr = P.trazadora(4.0, (1.0, 0.76, 0.36), 0.55)
                tr.rotate(ry=math.atan2(dx, dz))
                piezas.append(tr.translate((x + dx * f, y + 0.72 - f * 0.35, -16.0 + dz * f)))
        piezas.append(P.humo(1.4, 4, semilla=int(t * 3), color=(0.50, 0.48, 0.44), alfa=0.3,
                             altura=4.0).translate((0, 4.0, -15)))
        return join(piezas)

    return Plano(
        "15_emboscada", 6.0,
        temblor(dolly((2.0, 2.2, 12.0), (0.0, 4.0, -14.0), (0.4, 1.7, 6.0), (0.0, 4.4, -16.0),
                      fov=(56, 44), ease=ease_in), amp=0.075, frec=9.0),
        PAL_COMBATE, construir, animado,
        [Rotulo("Las ametralladoras giraron", ini=0.4, fin=4.4, estilo="titulo")],
    )


# ===========================================================================
# 16 · Seis muertos, tres heridos
# ===========================================================================


def _p16():
    def construir():
        suelo = _suelo(H_ARGONNE, (0.25, 0.24, 0.18), 90.0, 24)
        caidos = join([
            P.caido(P.CAQUI, "us", semilla=2700 + i, giro=i * 1.1).translate(
                (-4.0 + (i % 3) * 3.2, 0.02, -1.5 + (i // 3) * 2.6)
            )
            for i in range(6)
        ])
        heridos = join([
            P.soldado("tumbado", P.CAQUI, "us", arma=None, semilla=2800 + i, giro=2.0 + i)
            .translate((3.4 + i * 1.6, 0.02, 2.2))
            for i in range(3)
        ])
        equipo = join([
            P.fusil().place(pos=(-3.0 + i * 1.9, 0.06, 0.5 + (i % 2) * 1.4), rot=(1.55, i * 0.8, 0))
            for i in range(5)
        ] + [
            P.casco("us").place(pos=(-2.2 + i * 2.4, 0.04, 3.4), rot=(1.3, i * 1.2, 0)) for i in range(3)
        ])
        crateres = dispersar(lambda i: P.crater(1.8, 0.6, semilla=2900 + i), 6, (50, 40), None, semilla=61)
        # Un superviviente arrodillado junto a los caidos: da escala y lectura.
        superviviente = P.soldado("reza", P.CAQUI, "us", arma=None, semilla=57, giro=2.4)
        superviviente.translate((-1.4, 0.0, 4.2))
        fusiles_clavados = join([
            P.fusil(bayoneta=True).place(pos=(x, 0.30, z), rot=(2.55, a, 0))
            for x, z, a in ((1.9, 3.4, 0.3), (-3.4, 1.6, 1.1), (4.6, 1.0, -0.6))
        ])
        arboles = dispersar(lambda i: P.arbol_muerto(6.5, semilla=3000 + i),
                            16, (70, 60), None, semilla=63, radio_libre=8)
        return join(suelo, caidos, heridos, equipo, crateres, arboles,
                    superviviente, fusiles_clavados)

    def animado(t, dur):
        return join(
            P.humo(1.2, 4, semilla=int(t), color=(0.48, 0.46, 0.42), alfa=0.26, altura=4.5).translate((-6, 0.3, -4)),
        )

    return Plano(
        "16_seis_muertos", 8.0,
        deriva(dolly((5.5, 4.6, 8.5), (0.0, 0.5, 0.5), (3.0, 3.1, 6.0), (0.0, 0.5, 0.0), fov=(50, 44))),
        PAL_TENSION, construir, animado,
        [Rotulo("6 muertos · 3 heridos", ini=0.8, fin=4.8, estilo="titulo",
                sub="Todos los sargentos, fuera de combate")],
    )


# ===========================================================================
# 17 · York queda al mando
# ===========================================================================


def _p17():
    def construir():
        suelo = _suelo(H_ARGONNE, (0.24, 0.26, 0.19), 70.0, 20)
        alvin = P.soldado("firme", P.CAQUI, "us", arma="fusil", semilla=13, giro=0.28)
        tronco = P.arbol_muerto(6.0, semilla=91).translate((1.6, 0, -1.4))
        tocones = join(P.tocon(0.5, 12).translate((-1.9, 0, 0.6)),
                       P.roca(0.7, 14, (0.36, 0.34, 0.30)).translate((2.2, 0, 1.2)))
        companeros = join([
            P.soldado("tumbado", P.CAQUI, "us", semilla=3100 + i, giro=2.6 + i * 0.5)
            .translate((-3.2 - i * 1.5, 0.02, 2.6 + i * 0.8))
            for i in range(3)
        ])
        maleza = dispersar(lambda i: P.arbusto(0.7, semilla=3200 + i, color=(0.21, 0.24, 0.15)),
                           10, (30, 30), None, semilla=65, radio_libre=2.5)
        arboles = dispersar(lambda i: P.arbol_muerto(7.0, semilla=3300 + i),
                            14, (60, 55), None, semilla=67, radio_libre=6)
        return join(suelo, alvin, tronco, tocones, companeros, maleza, arboles)

    def animado(t, dur):
        return None

    return Plano(
        "17_york_al_mando", 8.0,
        deriva(dolly((1.6, 2.0, 5.4), (0.0, 1.45, 0.0), (0.9, 1.72, 3.0), (0.0, 1.52, 0.0),
                     fov=(40, 32)), amp=0.010),
        PAL_TENSION, construir, animado,
        [Rotulo("Cabo Alvin York", ini=1.2, fin=5.4, estilo="titulo",
                sub="De 17 hombres, sólo 8 seguían en pie")],
    )


# ===========================================================================
# 18 · Solo, frente a la colina
# ===========================================================================


def _p18():
    def construir():
        suelo = _suelo(H_COLINA, (0.25, 0.27, 0.20), 120.0, 30)
        terraplen = P.berma(4.8, 2.4, 0.55, semilla=15, color=(0.33, 0.29, 0.20),
                            base=lambda x, z: H_COLINA(x, z - 1.2)).translate((0, 0, -1.2))
        alvin = P.soldado("tumbado", P.CAQUI, "us", semilla=17, giro=math.pi)
        alvin.translate((0, float(H_COLINA(np.array(0.0), np.array(-0.5))) + 0.48, -0.5))
        munis = join(
            P.caja_municion().translate((1.4, float(H_COLINA(np.array(1.4), np.array(0.4))), 0.4)),
            P.casco("us").place(pos=(-1.5, 0.62, 0.1), rot=(1.2, 0.4, 0)),
            P.fusil().place(pos=(1.15, 0.55, -0.2), rot=(1.5, 0.5, 0)),
        )
        nidos = join([
            P.nido_ametralladora(semilla=110 + i * 4).translate(
                (-9.0 + i * 4.8, float(H_COLINA(np.array(-9.0 + i * 4.8), np.array(-17.0))), -17.0)
            )
            for i in range(4)
        ])
        bosque = dispersar(lambda i: P.arbol_muerto(7.0, semilla=3400 + i),
                           22, (100, 90), H_COLINA, semilla=69, radio_libre=6)
        return join(suelo, terraplen, alvin, munis, nidos, bosque)

    def animado(t, dur):
        piezas = []
        for i in range(4):
            if (t * 5.0 + i * 0.7) % 1.0 < 0.25:
                x = -9.0 + i * 4.8
                y = float(H_COLINA(np.array(x), np.array(-17.0)))
                piezas.append(P.fogonazo(0.55, semilla=i + int(t * 5)).translate((x, y + 0.7, -16.4)))
        return join(piezas) if piezas else None

    return Plano(
        "18_solo_frente_colina", 8.0,
        orbita((0, 0.55, -0.5), radio=(5.0, 4.0), ang=(0.62, 1.48), alt=(2.15, 1.65),
               mira=(0, 0.60, -2.2), fov=(46, 42)),
        PAL_TENSION, construir, animado,
        [Rotulo("A menos de 30 metros. Solo.", ini=1.0, fin=5.6, estilo="titulo")],
    )


# ===========================================================================
# 19 · El cazador
# ===========================================================================


def _p19():
    def construir():
        suelo = _suelo(H_COLINA, (0.25, 0.27, 0.20), 100.0, 26)
        terraplen = P.berma(5.3, 2.4, 0.55, semilla=16, color=(0.33, 0.29, 0.20),
                            base=lambda x, z: H_COLINA(x, z + (-1.2))).translate((0, 0, -1.2))
        alvin = P.soldado("apunta", P.CAQUI, "us", arma="fusil", semilla=17, giro=math.pi)
        alvin.translate((0, float(H_COLINA(np.array(0.0), np.array(0.35))), 0.35))
        casquillos = join([
            cylinder(0.02, 0.055, 5, (0.72, 0.60, 0.28)).rotate(rz=1.4 + i * 0.3).translate(
                (0.55 + (i % 4) * 0.16, 0.93, -0.30 + (i // 4) * 0.14)
            )
            for i in range(10)
        ])
        bosque = dispersar(lambda i: P.arbol_muerto(7.0, semilla=3500 + i),
                           18, (85, 80), H_COLINA, semilla=71, radio_libre=6)
        nidos = join([
            P.nido_ametralladora(semilla=130 + i * 4).translate(
                (-7.0 + i * 5.6, float(H_COLINA(np.array(-7.0 + i * 5.6), np.array(-16.0))), -16.0)
            )
            for i in range(3)
        ])
        return join(suelo, terraplen, alvin, casquillos, bosque, nidos)

    def animado(t, dur):
        piezas = []
        # Un disparo cada 1.5 s: cadencia de cazador, no de ametralladora.
        f = (t % 1.5) / 1.5
        if f < 0.10:
            piezas.append(P.fogonazo(0.30, semilla=int(t)).translate((0.05, 1.42, 0.95)))
            piezas.append(P.humo(0.11, 3, semilla=int(t), color=(0.64, 0.62, 0.58), alfa=0.20,
                                 altura=0.45).translate((0.05, 1.42, 1.0)))
        return join(piezas)

    return Plano(
        "19_el_cazador", 9.0,
        deriva(dolly((3.0, 1.80, 3.6), (0.0, 1.05, 0.3), (2.1, 1.62, 2.6), (0.0, 1.05, 0.3),
                     fov=(46, 42))),
        PAL_TENSION, construir, animado,
        [Rotulo("No lo aprendió en el ejército", ini=0.8, fin=4.8, estilo="titulo",
                sub="Lo aprendió cazando pavos en Tennessee"),
         Rotulo("Un disparo. Un blanco.", ini=6.0, fin=8.7)],
    )


# ===========================================================================
# 20 · El truco del pavo (picado)
# ===========================================================================


def _p20():
    POS = [(-6.5 + i * 2.2, -14.0 + (i % 2) * 0.6) for i in range(7)]

    def construir():
        suelo = _suelo(H_COLINA, (0.26, 0.28, 0.20), 110.0, 28)
        zanja = P.trinchera(20.0, 2.0, 1.3, semilla=17,
            base=lambda x, z, z0=-14.0: H_COLINA(x, z + z0)
        ).translate((0, 0, -14.0))
        armas = join([
            P.ametralladora().translate((x, float(H_COLINA(np.array(x), np.array(z))) - 0.6, z + 0.7))
            for x, z in POS[::3]
        ])
        alvin = P.soldado("apunta", P.CAQUI, "us", arma="fusil", semilla=17, giro=math.pi)
        alvin.translate((0, float(H_COLINA(np.array(0.0), np.array(1.6))), 1.6))
        terraplen = P.berma(4.8, 2.4, 0.55, semilla=18, color=(0.33, 0.29, 0.20),
                            base=lambda x, z: H_COLINA(x, z + (0.4))).translate((0, 0, 0.4))
        bosque = dispersar(lambda i: P.arbol_muerto(6.5, semilla=3600 + i),
                           20, (95, 85), H_COLINA, semilla=73, radio_libre=7)
        return join(suelo, zanja, armas, alvin, terraplen, bosque)

    def animado(t, dur):
        piezas = []
        # Los cascos asoman por turnos; caen empezando por el ultimo de la fila.
        for i, (x, z) in enumerate(POS):
            base = float(H_COLINA(np.array(x), np.array(z))) - 1.30
            caida = dur * (0.20 + (len(POS) - 1 - i) * 0.085)
            if t > caida:
                continue
            asoma = math.sin(t * 2.2 + i * 1.1)
            if asoma <= 0:
                continue
            y = base + 0.55 + asoma * 0.55
            piezas.append(
                join(box((0.20, 0.24, 0.20), P.PIEL, center=(0, 0, 0)),
                     P.casco("de").translate((0, 0.12, 0))).translate((x, y, z))
            )
        f = (t % 1.5) / 1.5
        if f < 0.09:
            piezas.append(P.fogonazo(0.32, semilla=int(t)).translate((0.05, 1.42, 2.2)))
        return join(piezas)

    return Plano(
        "20_truco_del_pavo", 9.0,
        deriva(dolly((-11.0, 9.0, -6.0), (0.0, 4.8, -14.5), (-5.5, 7.4, -8.5), (1.0, 5.0, -15.0),
                     fov=(50, 44))),
        PAL_TENSION, construir, animado,
        [Rotulo("Disparaba siempre al de más atrás", ini=0.9, fin=5.4, estilo="titulo",
                sub="Los de delante no veían caer a nadie")],
    )


# ===========================================================================
# 21 · La carga de bayoneta
# ===========================================================================


def _p21():
    def construir():
        suelo = _suelo(H_COLINA, (0.25, 0.26, 0.19), 90.0, 24)
        bosque = dispersar(lambda i: P.arbol_muerto(7.5, semilla=3700 + i),
                           16, (75, 70), H_COLINA, semilla=75, radio_libre=7)
        zanja = P.trinchera(16.0, 1.8, 1.2, semilla=19,
            base=lambda x, z, z0=-13.0: H_COLINA(x, z + z0)
        ).translate((0, 0, -13.0))
        return join(suelo, bosque, zanja)

    def animado(t, dur):
        u = smoothstep(min(t / (dur * 0.86), 1.0))
        piezas = []
        for i in range(6):
            x = -3.2 + i * 1.28
            z0, z1 = -11.5, -3.4
            z = z0 + (z1 - z0) * u
            y = float(H_COLINA(np.array(x), np.array(z)))
            paso = abs(math.sin(t * 6.0 + i * 0.9)) * 0.10
            s = P.soldado("carga", P.FELDGRAU, "de", arma="fusil", semilla=3800 + i, giro=0.0)
            piezas.append(s.translate((x, y + paso, z)))
        return join(piezas)

    return Plano(
        "21_carga_bayoneta", 8.0,
        temblor(dolly((2.4, 1.85, 4.6), (0.0, 1.5, -7.0), (1.2, 1.35, 2.2), (0.0, 1.4, -5.0),
                      fov=(56, 50), ease=ease_in), amp=0.035, frec=6.0),
        PAL_COMBATE, construir, animado,
        [Rotulo("Seis hombres. Bayoneta calada.", ini=0.8, fin=5.0, estilo="titulo")],
    )


# ===========================================================================
# 22 · La pistola
# ===========================================================================


def _p22():
    def construir():
        suelo = _suelo(H_COLINA, (0.25, 0.27, 0.20), 80.0, 22)
        terraplen = P.berma(4.8, 2.4, 0.55, semilla=20, color=(0.33, 0.29, 0.20),
                            base=lambda x, z: H_COLINA(x, z + (-1.2))).translate((0, 0, -1.2))
        alvin = P.soldado("apunta", P.CAQUI, "us", arma="pistola", semilla=17, giro=math.pi)
        alvin.translate((0, 0.0, -0.4))
        fusil_suelo = P.fusil().place(pos=(0.95, 0.06, -0.5), rot=(1.5, 0.4, 0))
        bosque = dispersar(lambda i: P.arbol_muerto(7.0, semilla=3900 + i),
                           14, (70, 65), H_COLINA, semilla=77, radio_libre=6)
        return join(suelo, terraplen, alvin, fusil_suelo, bosque)

    def animado(t, dur):
        piezas = []
        f = (t % 0.55) / 0.55
        if f < 0.30:
            piezas.append(P.fogonazo(0.40, semilla=int(t * 2)).translate((0.06, 1.40, 0.60)))
        for i in range(6):
            tc = 1.2 + i * 0.55
            if t > tc:
                x = -2.6 + i * 1.05
                piezas.append(
                    P.caido(P.FELDGRAU, "de", semilla=4000 + i, giro=0.2 * i).translate((x, 0.02, -4.6 + i * 0.5))
                )
        return join(piezas)

    return Plano(
        "22_la_pistola", 9.0,
        deriva(temblor(dolly((2.9, 1.95, 3.5), (0.0, 1.25, -0.2), (2.0, 1.70, 2.5), (0.0, 1.28, -0.3),
                             fov=(46, 42), ease=ease_in), amp=0.022, frec=5.0)),
        PAL_COMBATE, construir, animado,
        [Rotulo("Colt del 45", ini=0.6, fin=4.2, estilo="titulo", sub="De atrás hacia delante. Como a los pavos."),
         Rotulo("Ninguno de los seis llegó hasta él", ini=5.6, fin=8.7)],
    )


# ===========================================================================
# 23 · El silencio
# ===========================================================================


def _p23():
    def construir():
        suelo = _suelo(H_COLINA, (0.26, 0.28, 0.21), 100.0, 26)
        terraplen = P.berma(4.8, 2.4, 0.55, semilla=21, color=(0.33, 0.29, 0.20),
                            base=lambda x, z: H_COLINA(x, z + (-1.2))).translate((0, 0, -1.2))
        alvin = P.soldado("tumbado", P.CAQUI, "us", semilla=17, giro=math.pi)
        alvin.translate((0, float(H_COLINA(np.array(0.0), np.array(-0.5))) + 0.48, -0.5))
        caidos = join([
            P.caido(P.FELDGRAU, "de", semilla=4100 + i, giro=0.4 * i).translate((-2.6 + i * 1.1, 0.02, -4.4 + i * 0.4))
            for i in range(6)
        ])
        zanja = P.trinchera(18.0, 1.9, 1.2, semilla=23,
            base=lambda x, z, z0=-13.0: H_COLINA(x, z + z0)
        ).translate((0, 0, -13.0))
        bosque = dispersar(lambda i: P.arbol_muerto(7.0, semilla=4200 + i),
                           20, (90, 80), H_COLINA, semilla=79, radio_libre=7)
        return join(suelo, terraplen, alvin, caidos, zanja, bosque)

    def animado(t, dur):
        return join(
            P.humo(0.8, 4, semilla=int(t * 0.5) + 3, color=(0.60, 0.58, 0.54), alfa=0.24,
                   altura=3.5).translate((-1.6, 0.6, -6.0)),
        )

    return Plano(
        "23_el_silencio", 6.0,
        deriva(dolly((1.9, 1.25, 2.8), (0.0, 0.75, -2.5), (4.4, 3.8, 10.0), (0.0, 0.8, -4.5),
                     fov=(44, 48), ease=ease_out)),
        PAL_TENSION, construir, animado,
        [Rotulo("Y entonces, silencio", ini=0.6, fin=5.0, estilo="titulo")],
    )


# ===========================================================================
# 24 · La rendicion
# ===========================================================================


def _p24():
    def construir():
        suelo = _suelo(H_COLINA, (0.27, 0.29, 0.21), 100.0, 26)
        vollmer = P.soldado("manos_arriba", (0.30, 0.33, 0.31), "de", arma=None, semilla=31, giro=0.15)
        vollmer.translate((-0.6, float(H_COLINA(np.array(-0.6), np.array(-5.0))), -5.0))
        alvin = P.soldado("apunta", P.CAQUI, "us", arma="pistola", semilla=17, giro=math.pi + 0.05)
        alvin.translate((0.9, 0, 0.6))
        otros = join([
            P.soldado("manos_arriba", P.FELDGRAU, "de", arma=None, semilla=4300 + i,
                      giro=0.1 * i).translate((-3.8 + i * 1.5, float(H_COLINA(np.array(-3.8 + i * 1.5), np.array(-7.5))), -7.5))
            for i in range(5)
        ])
        zanja = P.trinchera(20.0, 2.0, 1.3, semilla=27,
            base=lambda x, z, z0=-11.0: H_COLINA(x, z + z0)
        ).translate((0, 0, -11.0))
        armas = join([
            P.fusil().place(pos=(-2.6 + i * 1.3, 0.06, -6.0), rot=(1.55, i * 0.7, 0)) for i in range(5)
        ])
        bosque = dispersar(lambda i: P.arbol_muerto(7.0, semilla=4400 + i),
                           18, (85, 80), H_COLINA, semilla=81, radio_libre=8)
        return join(suelo, vollmer, alvin, otros, zanja, armas, bosque)

    def animado(t, dur):
        return None

    return Plano(
        "24_la_rendicion", 10.0,
        deriva(dolly((5.0, 2.4, 5.6), (-0.2, 1.5, -3.0), (2.6, 1.9, 3.4), (-0.4, 1.5, -4.5),
                     fov=(48, 42))),
        PAL_RENDICION, construir, animado,
        [Rotulo("Teniente Paul Vollmer", ini=0.9, fin=5.0, estilo="titulo"),
         Rotulo("«Si dejas de disparar, haré que se rindan todos»", ini=5.8, fin=9.7, estilo="cita")],
    )


# ===========================================================================
# 25 · Salen de las trincheras (cenital)
# ===========================================================================


def _p25():
    def construir():
        suelo = _suelo(H_COLINA, (0.27, 0.29, 0.21), 120.0, 30)
        zanjas = join([
            P.trinchera(24.0, 2.0, 1.3, semilla=29 + i,
                base=lambda x, z, z0=-9.0 - i * 6.0: H_COLINA(x, z + z0)
            ).translate((0, 0, -9.0 - i * 6.0))
            for i in range(3)
        ])
        bosque = dispersar(lambda i: P.arbol_muerto(7.0, semilla=4500 + i),
                           24, (110, 95), H_COLINA, semilla=83, radio_libre=9)
        alvin = P.soldado("apunta", P.CAQUI, "us", arma="pistola", semilla=17, giro=math.pi)
        alvin.translate((0, 0, 2.0))
        return join(suelo, zanjas, bosque, alvin)

    def animado(t, dur):
        piezas = []
        u = t / dur
        for i in range(34):
            aparece = 0.05 + (i / 34) * 0.72
            if u < aparece:
                continue
            k = min((u - aparece) / 0.14, 1.0)
            fila_i = i % 3
            x = -10.5 + (i // 3) * 1.85 + fila_i * 0.5
            z = -9.0 - fila_i * 6.0 + 1.4
            y = float(H_COLINA(np.array(x), np.array(z))) - 1.3 + k * 1.3
            s = P.soldado("manos_arriba", P.FELDGRAU, "de", arma=None, semilla=4600 + i, giro=0.1 * i)
            piezas.append(s.translate((x, y, z)))
        return join(piezas) if piezas else None

    return Plano(
        "25_salen_trincheras", 9.0,
        grua((-2.0, 9.0, 16.0), (0.0, 1.0, -10.0), (1.0, 22.0, 20.0), (0.0, 1.0, -12.0),
             fov=(50, 46)),
        PAL_RENDICION, construir, animado,
        [Rotulo("Salían de todas las trincheras", ini=1.2, fin=5.6, estilo="titulo",
                sub="Decenas. Y después, más.")],
    )


# ===========================================================================
# 26 · La columna
# ===========================================================================


def _p26():
    def construir():
        suelo = _suelo(H_ARGONNE, (0.28, 0.30, 0.21), 160.0, 32)
        camino = join([
            box((3.4, 0.05, 6.0), (0.36, 0.31, 0.23), center=(0, 0.03, -30 + i * 6.0))
            for i in range(12)
        ]).jitter(0.07, 22)
        bosque = dispersar(lambda i: P.arbol_muerto(7.5, semilla=4700 + i),
                           34, (140, 120), H_ARGONNE, semilla=85, radio_libre=6)
        crateres = dispersar(lambda i: P.crater(2.2, 0.7, semilla=4800 + i),
                             10, (120, 100), None, semilla=87, radio_libre=6)
        return join(suelo, camino, bosque, crateres)

    def animado(t, dur):
        piezas = []
        avance = t * 1.15
        for i in range(30):
            z = 12.0 - i * 1.5 - avance
            x = -0.9 + (i % 2) * 1.8 + math.sin(i * 0.9) * 0.25
            paso = abs(math.sin(t * 3.0 + i * 0.6)) * 0.055
            piezas.append(
                P.soldado("marcha", P.FELDGRAU, "de", arma=None, semilla=4900 + i, giro=math.pi)
                .translate((x, paso, z))
            )
        for i, (x, z) in enumerate(((-2.9, 8.0), (2.9, 5.0), (-2.9, -6.0), (3.0, -12.0))):
            piezas.append(
                P.soldado("marcha", P.CAQUI, "us", arma="fusil", semilla=5000 + i, giro=math.pi)
                .translate((x, abs(math.sin(t * 3.0 + i)) * 0.05, z - avance))
            )
        return join(piezas)

    return Plano(
        "26_la_columna", 8.0,
        deriva(dolly((11.0, 3.4, 10.0), (0.0, 1.3, 2.0), (10.0, 2.6, -6.0), (0.0, 1.2, -10.0),
                     fov=(48, 46))),
        PAL_RENDICION, construir, animado,
        [Rotulo("Ocho hombres. Una columna de prisioneros.", ini=1.0, fin=5.6, estilo="titulo")],
    )


# ===========================================================================
# 27 · Mas prisioneros por el camino (aereo)
# ===========================================================================


def _p27():
    def construir():
        suelo = _suelo(H_ARGONNE, (0.29, 0.31, 0.22), 200.0, 36)
        bosque = dispersar(lambda i: P.arbol_muerto(7.5, semilla=5100 + i),
                           46, (180, 150), H_ARGONNE, semilla=89, radio_libre=10)
        pinos = dispersar(lambda i: P.pino(7.0, semilla=5200 + i, color_hoja=(0.17, 0.24, 0.16)),
                          16, (180, 150), H_ARGONNE, semilla=91, radio_libre=14)
        zanjas = join([
            P.trinchera(14.0, 1.8, 1.2, semilla=31 + i).rotate(ry=0.4 * i).translate(
                (-22 + i * 22, 0, -26 + i * 8)
            )
            for i in range(3)
        ])
        return join(suelo, bosque, pinos, zanjas)

    def animado(t, dur):
        piezas = []
        avance = t * 1.5
        # Columna serpenteante: la curva la dibuja una sinusoide sobre z.
        for i in range(52):
            z = 26.0 - i * 1.35 - avance
            x = math.sin(z * 0.055) * 7.0 + (i % 2) * 1.5 - 0.7
            y = float(H_ARGONNE(np.array(x), np.array(z)))
            piezas.append(
                P.soldado("marcha", P.FELDGRAU, "de", arma=None, semilla=5300 + i, giro=math.pi)
                .translate((x, y + abs(math.sin(t * 3 + i * 0.5)) * 0.05, z))
            )
        for i in range(4):
            z = 20.0 - i * 13.0 - avance
            x = math.sin(z * 0.055) * 7.0 + (2.6 if i % 2 else -2.6)
            y = float(H_ARGONNE(np.array(x), np.array(z)))
            piezas.append(
                P.soldado("marcha", P.CAQUI, "us", arma="fusil", semilla=5400 + i, giro=math.pi)
                .translate((x, y, z))
            )
        return join(piezas)

    return Plano(
        "27_mas_prisioneros", 9.0,
        deriva(dolly((-17, 16, 20), (0, 1.5, 2), (13, 12, 14), (2, 1.5, -6), fov=(52, 46))),
        PAL_RENDICION, construir, animado,
        [Rotulo("La columna no dejaba de crecer", ini=1.0, fin=5.6, estilo="titulo",
                sub="Obligó a Vollmer a rendir cada posición del camino")],
    )


# ===========================================================================
# 28 · El recuento
# ===========================================================================


def _p28():
    def construir():
        suelo = _suelo(alturas(0.5, 0.05, semilla=25), (0.30, 0.32, 0.22), 120.0, 26)
        oficial = P.soldado("firme", (0.33, 0.34, 0.24), "us", arma=None, semilla=41, giro=math.pi - 0.3)
        oficial.translate((-1.8, 0, 1.6))
        tablilla = box((0.28, 0.36, 0.02), (0.80, 0.76, 0.66), center=(0, 0, 0)).place(
            pos=(-1.45, 1.15, 1.95), rot=(1.1, 0.3, 0)
        )
        york = P.soldado("firme", P.CAQUI, "us", arma="fusil", semilla=17, giro=0.25)
        york.translate((1.6, 0, 1.2))
        prisioneros = P.multitud(28, "manos_arriba", P.FELDGRAU, "de", (11.0, 7.0), semilla=95,
                                 arma=None, giro=0.0, rejilla=True).translate((0, 0, -7.0))
        guardias = join([
            P.soldado("firme", P.CAQUI, "us", arma="fusil", semilla=5500 + i, giro=math.pi)
            .translate((-6.0 + i * 4.0, 0, -2.0))
            for i in range(4)
        ])
        campamento = join(
            P.tienda(3.0, 4.0, 2.2).translate((-11, 0, 4)),
            P.camion().translate((10, 0, 3)).rotate(ry=-0.4),
            P.sacos(7, 3.0, 2, semilla=33).translate((6, 0, 6)),
            P.bandera(5.0, (0.55, 0.18, 0.20)).translate((-8, 0, 8)),
        )
        return join(suelo, oficial, tablilla, york, prisioneros, guardias, campamento)

    def animado(t, dur):
        return None

    return Plano(
        "28_el_recuento", 8.0,
        deriva(dolly((6.0, 3.4, 12.0), (0.0, 1.5, 0.0), (2.6, 2.2, 7.0), (-0.4, 1.4, -1.5),
                     fov=(50, 42))),
        PAL_RENDICION, construir, animado,
        [Rotulo("«Cuéntenlos otra vez»", ini=1.0, fin=5.6, estilo="cita")],
    )


# ===========================================================================
# 29 · Ciento treinta y dos
# ===========================================================================


def _p29():
    def construir():
        suelo = _suelo(alturas(0.4, 0.05, semilla=26), (0.29, 0.31, 0.21), 140.0, 28)
        prisioneros = P.multitud(60, "manos_arriba", P.FELDGRAU, "de", (17.0, 13.0), semilla=97,
                                 arma=None, giro=0.0, rejilla=True).translate((0, 0, -8.0))
        guardias = join([
            P.soldado("firme", P.CAQUI, "us", arma="fusil", semilla=5600 + i, giro=math.pi)
            .translate((-9.0 + i * 3.0, 0, 3.5))
            for i in range(7)
        ])
        armas = join([
            P.ametralladora().translate((-8.0 + i * 2.7, 0, 7.0)).rotate(ry=0.2 * i) for i in range(7)
        ])
        return join(suelo, prisioneros, guardias, armas)

    return Plano(
        "29_ciento_treinta_y_dos", 9.0,
        deriva(dolly((-8.0, 5.5, 16.0), (0.0, 1.4, -3.0), (4.0, 12.0, 13.0), (0.0, 1.2, -6.0),
                     fov=(50, 44))),
        PAL_RENDICION, construir, None,
        [Rotulo("132", ini=0.8, fin=5.2, estilo="dato", sub="prisioneros capturados"),
         Rotulo("35 ametralladoras silenciadas", ini=6.0, fin=8.7)],
    )


# ===========================================================================
# 30 · La Medalla de Honor
# ===========================================================================


def _p30():
    def construir():
        pano = P.tablero(1.5, 1.1, (0.18, 0.14, 0.16), semilla=27, grosor=0.05, n=12)
        borde = join([
            box((1.5, 0.02, 0.04), (0.42, 0.34, 0.16), center=(0, 0.005, sz * 0.53)) for sz in (-1, 1)
        ])
        estuche = box((1.7, 0.10, 1.3), (0.20, 0.15, 0.12), center=(0, -0.08, 0))
        medalla = P.medalla().rotate(rx=-math.pi / 2).translate((-0.16, 0.02, 0.10))
        cruz_guerra = join(
            box((0.10, 0.30, 0.015), (0.30, 0.42, 0.24), center=(0, 0, 0)),
            box((0.24, 0.06, 0.02), (0.72, 0.60, 0.24), center=(0, -0.10, 0.005)),
            cylinder(0.05, 0.012, 8, (0.72, 0.60, 0.24)).rotate(rx=math.pi / 2).translate((0, -0.10, 0.006)),
        ).rotate(rx=-math.pi / 2).translate((0.52, 0.02, 0.05))
        galones = join([
            box((0.20, 0.012, 0.05), (0.62, 0.52, 0.22), center=(0.52, 0.02, -0.34 + i * 0.08))
            for i in range(3)
        ])
        return join(pano, borde, estuche, medalla, cruz_guerra, galones)

    return Plano(
        "30_medalla_de_honor", 9.0,
        orbita((0, 0, 0), radio=(1.15, 0.85), ang=(1.35, 2.05), alt=(1.05, 0.68),
               mira=(-0.10, 0.05, 0.05), fov=(42, 36)),
        PAL_MEDALLA, construir, None,
        [Rotulo("Medalla de Honor", ini=1.0, fin=5.4, estilo="titulo", sub="Y Cruz de Guerra francesa"),
         Rotulo("«Lo más grande que ha hecho un soldado en Europa»", ini=6.2, fin=8.7, estilo="cita")],
    )


# ===========================================================================
# 31 · El regreso
# ===========================================================================


def _p31():
    def construir():
        suelo = _suelo(None, (0.34, 0.33, 0.31), 160.0, 20)
        calle = box((14.0, 0.06, 90.0), (0.42, 0.40, 0.38), center=(0, 0.04, -10)).jitter(0.05, 28)
        edificios = join([
            join(
                box((9.0, 12.0 + (i % 3) * 5.0, 12.0), (0.56, 0.50, 0.44),
                    center=(lado * 14.0, (12.0 + (i % 3) * 5.0) / 2, -30 + i * 14.0)),
                join([
                    box((0.9, 1.3, 0.10), (0.72, 0.78, 0.80),
                        center=(lado * 14.0 - lado * 4.55, 3.0 + f * 3.2, -30 + i * 14.0 - 4.0 + w * 3.6))
                    for f in range(3) for w in range(3)
                ]),
            )
            for i in range(5) for lado in (-1, 1)
        ]).jitter(0.05, 29)
        banderas = join([
            P.bandera(6.0, (0.58, 0.20, 0.22)).translate((lado * 9.2, 0, -22 + i * 14.0))
            for i in range(4) for lado in (-1, 1)
        ])
        gentio = join(
            P.multitud(34, "firme", (0.30, 0.26, 0.28), "sombrero", (10.0, 3.0), semilla=101,
                       arma=None, giro=1.6).translate((-8.6, 0, -8)),
            P.multitud(34, "firme", (0.26, 0.24, 0.30), "sombrero", (10.0, 3.0), semilla=103,
                       arma=None, giro=-1.6).translate((8.6, 0, -8)),
        )
        desfile = join([
            P.soldado("marcha", P.CAQUI, "us", arma="fusil_hombro", semilla=5700 + i, giro=0.0)
            .translate((-2.4 + (i % 3) * 2.4, 0, 6.0 - (i // 3) * 2.6))
            for i in range(12)
        ])
        coche = P.camion((0.24, 0.22, 0.24)).translate((0, 0, 12.0))
        return join(suelo, calle, edificios, banderas, gentio, desfile, coche)

    def animado(t, dur):
        papelitos = []
        rng = np.random.default_rng(7)
        for i in range(60):
            x = rng.uniform(-11, 11)
            z = rng.uniform(-24, 10)
            y = (14.0 - ((t * 2.2 + i * 0.7) % 14.0))
            papelitos.append(
                box((0.16, 0.16, 0.02), (0.92, 0.90, 0.80), center=(0, 0, 0))
                .rotate(ry=t * 2 + i, rx=t + i)
                .translate((x, y, z))
            )
        return join(papelitos)

    return Plano(
        "31_el_regreso", 9.0,
        deriva(dolly((-7.0, 4.0, 22.0), (0.0, 3.0, -6.0), (5.0, 6.5, 14.0), (0.0, 2.4, -14.0),
                     fov=(52, 48))),
        PAL_REGRESO, construir, animado,
        [Rotulo("Nueva York, 1919", ini=0.9, fin=5.0, estilo="titulo", sub="Rechazó casi todos los contratos"),
         Rotulo("«La guerra no es algo que se pueda vender»", ini=6.0, fin=8.7, estilo="cita")],
    )


# ===========================================================================
# 32 · La escuela
# ===========================================================================


def _p32():
    def construir():
        suelo = _suelo(H_GRANJA, (0.33, 0.40, 0.21), 140.0, 28)
        edificio = P.escuela(10.0, 6.0, 3.4).translate((0, 0, -8.0))
        patio = join(
            join([box((1.4, 0.05, 1.4), (0.52, 0.48, 0.40), center=(-4.0 + i * 1.5, 0.03, -1.0))
                  for i in range(7)]),
            P.valla(24.0, 20, 1.0).translate((0, 0, 9.0)),
        )
        arboles = dispersar(lambda i: P.arbol_frondoso(6.0, semilla=5800 + i, color_hoja=(0.28, 0.40, 0.18)),
                            12, (110, 90), H_GRANJA, semilla=105, radio_libre=14)
        ninos = join([
            P.soldado("firme", (0.30 + (i % 3) * 0.12, 0.28, 0.34), None, arma=None,
                      semilla=5900 + i, giro=0.4 + (i % 4) * 0.35)
            .scale(0.62).translate((-3.6 + (i % 6) * 1.4, 0, 1.4 + (i // 6) * 1.6))
            for i in range(12)
        ])
        maestro = P.soldado("firme", (0.28, 0.26, 0.24), "sombrero", arma=None, semilla=43, giro=math.pi)
        maestro.translate((2.8, 0, 3.0))
        campo = P.surcos(10, 12.0, 9.0).translate((13.0, 0.05, 4.0))
        bandera = P.bandera(6.0, (0.55, 0.18, 0.20)).translate((-7.0, 0, -2.0))
        return join(suelo, edificio, patio, arboles, ninos, maestro, campo, bandera,
                    P.hierba_alta(40, 20, 33, (0.34, 0.44, 0.20), 0.35))

    def animado(t, dur):
        return P.bandera(6.0, (0.55, 0.18, 0.20), ondea=t * 2.0).translate((-7.0, 0, -2.0))

    return Plano(
        "32_la_escuela", 9.0,
        deriva(dolly((-13.0, 5.0, 18.0), (0.0, 2.0, -4.0), (-2.0, 3.6, 12.0), (0.0, 1.8, -7.0),
                     fov=(50, 44))),
        PAL_REGRESO, construir, animado,
        [Rotulo("Instituto Agrícola Alvin C. York", ini=1.0, fin=5.4, estilo="titulo",
                sub="Fundado con el dinero que sí aceptó"),
         Rotulo("Para que no aprendieran a disparar antes que a leer", ini=6.0, fin=8.7)],
    )


# ===========================================================================
# 33 · Epilogo
# ===========================================================================


def _p33():
    def construir():
        suelo = _suelo(H_VALLE, (0.28, 0.34, 0.20), 200.0, 36)
        pinos = dispersar(lambda i: P.pino(7.5, semilla=6000 + i, color_hoja=(0.15, 0.25, 0.16)),
                          40, (170, 150), H_VALLE, semilla=107, radio_libre=13)
        frondosos = dispersar(lambda i: P.arbol_frondoso(6.5, semilla=6100 + i, color_hoja=(0.30, 0.32, 0.16)),
                              16, (140, 120), H_VALLE, semilla=109, radio_libre=12)
        cima = float(H_VALLE(np.array(0.0), np.array(4.0)))
        alvin = P.soldado("firme", (0.30, 0.27, 0.23), "sombrero", arma=None, semilla=47, giro=math.pi)
        alvin.translate((0, cima, 4.0))
        cerca = P.valla(12.0, 11, 1.0).translate((0, cima - 0.1, 6.4))
        roca = P.roca(1.2, 51, (0.36, 0.34, 0.30)).translate((2.4, cima - 0.2, 5.4))
        return join(suelo, pinos, frondosos, alvin, cerca, roca)

    def animado(t, dur):
        aves = [
            P.ave(0.8, (0.16, 0.14, 0.16), fase=t * 5 + i).translate(
                (-14 + i * 7 + t * 1.4, 15 + math.sin(t * 0.7 + i) * 1.0, -20)
            )
            for i in range(4)
        ]
        return join(aves)

    return Plano(
        "33_epilogo", 9.0,
        deriva(dolly((2.2, 3.2, 11.0), (0.0, 2.6, 3.0), (7.0, 9.5, 26.0), (0.0, 2.0, -2.0),
                     fov=(44, 50), ease=ease_out)),
        PAL_DORADO, construir, animado,
        [Rotulo("Pidió no ir a la guerra", ini=1.0, fin=5.2, estilo="titulo",
                sub="Terminó siendo su soldado más condecorado")],
    )


# ===========================================================================
# 34 · Cierre
# ===========================================================================


def _p34():
    def construir():
        suelo = _suelo(H_VALLE, (0.27, 0.33, 0.20), 220.0, 38)
        pinos = dispersar(lambda i: P.pino(8.0, semilla=6200 + i, color_hoja=(0.14, 0.23, 0.15)),
                          56, (220, 190), H_VALLE, semilla=111, radio_libre=8)
        nubes = join([
            P.nube(11.0, semilla=700 + i, color=(0.96, 0.78, 0.56), alfa=0.85).translate(
                (-90 + i * 42, 40 + (i % 3) * 8, -95)
            )
            for i in range(6)
        ])
        return join(suelo, pinos, nubes)

    def animado(t, dur):
        return join([
            P.ave(0.9, (0.15, 0.13, 0.15), fase=t * 4 + i).translate(
                (-18 + i * 9 + t * 1.1, 22 + math.sin(t * 0.6 + i) * 1.4, -30)
            )
            for i in range(5)
        ])

    return Plano(
        "34_cierre", 8.0,
        grua((7.0, 20.0, 40.0), (0.0, 7.0, -34.0), (10.0, 48.0, 70.0), (0.0, 3.0, -50.0),
             fov=(50, 46)),
        PAL_DORADO, construir, animado,
        [Rotulo("Alvin Cullum York", ini=1.0, fin=7.6, estilo="final", sub="1887 — 1964")],
        sale=2.2,
    )


PLANOS = [
    _p01(), _p02(), _p03(), _p04(), _p05(), _p06(), _p07(), _p08(), _p09(),
    _p10(), _p11(), _p12(), _p13(), _p14(), _p15(), _p16(), _p17(), _p18(),
    _p19(), _p20(), _p21(), _p22(), _p23(), _p24(), _p25(), _p26(), _p27(),
    _p28(), _p29(), _p30(), _p31(), _p32(), _p33(), _p34(),
]

DURACION_TOTAL = sum(p.dur for p in PLANOS)
