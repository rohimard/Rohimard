"""Guion sonoro: que suena en cada plano y en que segundo.

Los tiempos salen de las duraciones reales de `scenes.PLANOS`, de modo que la
banda sonora sigue al montaje aunque cambien los planos. Los efectos de disparo
replican la cadencia con la que los fogonazos aparecen en la animacion.
"""

from __future__ import annotations

from . import banco as B
from .mezcla import Mezcla
from .sintesis import nota

# --- material tematico ------------------------------------------------------
# Modo eolico sobre re: sabe a musica popular de montana sin sonar a fanfarria.
RE = -7.0                                   # semitonos respecto a La3 (220 Hz)
TEMA = [0, 3, 5, 7, 5, 3, 0, -2, 0]         # grados sobre la tonica
GRAVES = {"i": 0, "VI": 8, "VII": 10, "iv": 5, "III": 3, "v": 7}


def _acorde(mez: Mezcla, t: float, grado: str, dur: float, vol: float,
            octava: float = -12.0, cola: float = 2.6) -> None:
    """Colchon de cuerda: fundamental, quinta y octava.

    `cola` alarga la nota mas alla del plano para que la armonia solape con la
    siguiente; sin ese solape se oye un hueco en cada corte.
    """
    base = RE + GRAVES[grado] + octava
    for st, v in ((0.0, 1.0), (7.0, 0.55), (12.0, 0.35)):
        mez.add(B.cuerdas_graves(nota(base + st, 220.0), dur + cola, vol * v), t)


def _tema_pulsado(mez: Mezcla, t: float, vol: float, paso: float = 0.62,
                  octava: float = 0.0, semilla: int = 0) -> float:
    """Enuncia el tema con cuerda pulsada. Devuelve cuanto ha durado."""
    for i, g in enumerate(TEMA):
        f = nota(RE + g + octava, 220.0)
        mez.add(B.cuerda(f, paso * 1.9, vol * (0.85 + 0.15 * (i % 2)), semilla + i),
                t + i * paso)
    return len(TEMA) * paso


def construir(planos, dur_total: float) -> Mezcla:
    """Monta la banda sonora completa sobre la linea de tiempo del montaje."""
    mez = Mezcla(dur_total)

    # Inicio de cada plano, para poder anclar los efectos al montaje.
    ini, t = [], 0.0
    for p in planos:
        ini.append(t)
        t += p.dur
    d = [p.dur for p in planos]

    def P(n):                      # inicio del plano n (1-based)
        return ini[n - 1]

    def D(n):
        return d[n - 1]

    # ===== 01-02 · Tennessee ================================================
    mez.add(B.viento(D(1) + D(2), 0.20, semilla=1, fuerza=0.35), P(1), pan=-0.2)
    mez.add(B.pajaros(D(1) + D(2), 0.22, semilla=2, densidad=1.2), P(1), pan=0.35)
    _acorde(mez, P(1) + 0.5, "i", 9.0, 0.16)
    _tema_pulsado(mez, P(1) + 2.2, 0.30, semilla=10)
    _acorde(mez, P(2) + 0.2, "VI", 8.0, 0.14)
    _tema_pulsado(mez, P(2) + 1.0, 0.26, octava=12.0, semilla=20)
    mez.add(B.fuego(D(2) * 0.8, 0.09, semilla=3), P(2) + 1.0, pan=-0.4)

    # ===== 03 · conversion ==================================================
    mez.add(B.viento(D(3), 0.15, semilla=4, fuerza=0.25), P(3))
    _acorde(mez, P(3) + 0.3, "iv", 8.0, 0.17)
    mez.add(B.campana(430.0, 4.0, 0.16), P(3) + 1.2, pan=0.15)
    mez.add(B.campana(430.0, 4.0, 0.12), P(3) + 4.4, pan=0.15)

    # ===== 04-05 · la carta =================================================
    mez.add(B.sala(D(4) + D(5), 0.10, semilla=5), P(4))
    _acorde(mez, P(4) + 0.4, "i", 8.0, 0.13)
    for k in range(3):             # pluma sobre el papel
        mez.add(B.paso(0.05, semilla=40 + k, barro=0.0), P(4) + 3.0 + k * 0.7, pan=0.1)
    _acorde(mez, P(5) + 0.2, "VII", 7.0, 0.15)
    mez.add(B.tambor(0.7, 70.0, 0.34, semilla=6), P(5) + 1.4)   # el sello

    # ===== 06-08 · instruccion ==============================================
    mez.add(B.viento(D(6) + D(7) + D(8), 0.15, semilla=7, fuerza=0.4), P(6))
    for k in range(int(D(6) / 0.55)):        # paso militar de fondo
        mez.add(B.caja(0.2, 0.10, semilla=60 + k), P(6) + 0.4 + k * 0.55,
                pan=-0.15 + 0.3 * (k % 2))
    _acorde(mez, P(6) + 0.3, "i", 9.5, 0.15)
    _acorde(mez, P(7) + 0.2, "III", 7.5, 0.17)
    _tema_pulsado(mez, P(7) + 0.8, 0.24, paso=0.72, semilla=30)
    mez.add(B.pajaros(D(7), 0.16, semilla=8, densidad=0.6), P(7), pan=-0.3)
    # Campo de tiro: cinco tiradores, la cadencia de los fogonazos del plano 08
    for i in range(5):
        for k in range(int(D(8) * 1.7)):
            tt = (k + i * 0.31 / 1.7) / 1.7
            if tt < D(8) - 0.3:
                mez.add(B.disparo_fusil(0.30, semilla=80 + i * 9 + k, lejania=0.45),
                        P(8) + tt, pan=-0.5 + i * 0.25)

    # ===== 09 · Atlantico ===================================================
    mez.add(B.mar(D(9) + 1.0, 0.30, semilla=9), P(9))
    mez.add(B.viento(D(9), 0.16, semilla=10, fuerza=0.7), P(9), pan=0.3)
    _acorde(mez, P(9) + 0.2, "VI", 6.5, 0.16)

    # ===== 10-11 · el frente ================================================
    mez.add(B.viento(D(10) + D(11), 0.18, semilla=11, fuerza=0.55), P(10))
    _acorde(mez, P(10) + 0.3, "i", 8.0, 0.15, octava=-24.0)
    for k, off in enumerate((1.2, 3.6, 5.9)):
        mez.add(B.artilleria(0.30, semilla=100 + k, distancia=0.85),
                P(10) + off, pan=-0.4 + k * 0.4)
    mez.add(B.grillos(D(11), 0.16, semilla=12), P(11), pan=0.25)
    _acorde(mez, P(11) + 0.2, "VII", 8.5, 0.16, octava=-24.0)
    for k, off in enumerate((2.0, 4.8, 7.1)):
        mez.add(B.artilleria(0.26, semilla=110 + k, distancia=0.9), P(11) + off,
                pan=0.5 - k * 0.45)

    # ===== 12-14 · el Argonne ===============================================
    mez.add(B.viento(D(12) + D(13) + D(14), 0.16, semilla=13, fuerza=0.3), P(12))
    _acorde(mez, P(12) + 0.4, "i", 9.0, 0.17, octava=-24.0)
    mez.add(B.tambor(1.1, 58.0, 0.26, semilla=14), P(12) + 5.6)
    # Avance: pisadas de la fila india
    for k in range(int(D(13) / 0.42)):
        mez.add(B.paso(0.10, semilla=130 + k, barro=0.6), P(13) + 0.3 + k * 0.42,
                pan=-0.3 + 0.6 * ((k // 2) % 2))
    _acorde(mez, P(13) + 0.2, "iv", 8.5, 0.15, octava=-24.0)
    _acorde(mez, P(14) + 0.2, "VII", 8.0, 0.14, octava=-24.0)
    for k in range(4):
        mez.add(B.cerrojo(0.22, semilla=140 + k), P(14) + 1.4 + k * 0.5,
                pan=-0.35 + k * 0.25)

    # ===== 15-16 · la emboscada =============================================
    mez.add(B.tambor(1.4, 52.0, 0.44, semilla=15), P(15))
    for i in range(5):                      # cinco nidos batiendo la posicion
        for k in range(int(D(15) / 0.62)):
            mez.add(B.rafaga(6, 0.085, 0.34, semilla=150 + i * 7 + k, lejania=0.35),
                    P(15) + 0.15 + k * 0.62 + i * 0.11, pan=-0.6 + i * 0.3)
    _acorde(mez, P(15), "VII", D(15), 0.20, octava=-24.0)
    _acorde(mez, P(16) + 0.1, "i", D(16) - 0.5, 0.17, octava=-24.0)
    mez.add(B.viento(D(16), 0.16, semilla=16, fuerza=0.4), P(16))
    for k in range(3):
        mez.add(B.rafaga(5, 0.09, 0.16, semilla=160 + k, lejania=0.8),
                P(16) + 1.0 + k * 2.1, pan=0.5 - k * 0.5)

    # ===== 17-20 · el cazador ===============================================
    _acorde(mez, P(17) + 0.1, "i", D(17), 0.15, octava=-24.0)
    mez.add(B.cerrojo(0.26, semilla=17), P(17) + 2.6, pan=0.1)
    _acorde(mez, P(18) + 0.1, "VII", D(18), 0.15, octava=-24.0)
    for k in range(int(D(18) / 0.9)):       # las ametralladoras siguen arriba
        mez.add(B.rafaga(5, 0.085, 0.20, semilla=180 + k, lejania=0.55),
                P(18) + 0.4 + k * 0.9, pan=-0.45 + 0.3 * (k % 3))
    # Plano 19: un disparo cada 1.5 s, la cadencia del cazador
    _acorde(mez, P(19) + 0.1, "i", D(19), 0.14, octava=-24.0)
    for k in range(int(D(19) / 1.5) + 1):
        t0 = P(19) + k * 1.5
        if t0 < P(19) + D(19) - 0.4:
            mez.add(B.disparo_fusil(0.52, semilla=190 + k), t0, pan=0.08)
            mez.add(B.cerrojo(0.16, semilla=195 + k), t0 + 0.55, pan=0.12)
    _acorde(mez, P(20) + 0.1, "VII", D(20), 0.14, octava=-24.0)
    for k in range(int(D(20) / 1.5) + 1):
        t0 = P(20) + k * 1.5
        if t0 < P(20) + D(20) - 0.4:
            mez.add(B.disparo_fusil(0.44, semilla=200 + k, lejania=0.2), t0, pan=-0.1)

    # ===== 21-22 · la carga =================================================
    mez.add(B.tambor(1.2, 60.0, 0.40, semilla=21), P(21))
    for k in range(int(D(21) / 0.30)):      # seis hombres corriendo cuesta abajo
        mez.add(B.paso(0.16, semilla=210 + k, barro=0.35), P(21) + 0.4 + k * 0.30,
                pan=-0.4 + 0.8 * ((k % 3) / 2.0))
    _acorde(mez, P(21), "VII", D(21), 0.22, octava=-24.0)
    # Plano 22: pistola, un disparo cada 0.55 s
    for k in range(6):
        t0 = P(22) + 1.2 + k * 0.55
        mez.add(B.disparo_fusil(0.46, semilla=220 + k, lejania=0.0), t0,
                pan=0.05 + 0.04 * k)
    _acorde(mez, P(22), "i", D(22), 0.18, octava=-24.0)

    # ===== 23-25 · el silencio y la rendicion ===============================
    mez.add(B.viento(D(23) + D(24), 0.19, semilla=23, fuerza=0.3), P(23))
    _acorde(mez, P(23) + 0.3, "III", D(23) + 2.0, 0.19)      # respiro armonico
    mez.add(B.silbato(1.0, 0.34), P(24) + 5.4, pan=-0.15)
    _acorde(mez, P(24) + 0.2, "VI", 9.0, 0.19)
    _tema_pulsado(mez, P(24) + 1.0, 0.20, paso=0.8, semilla=40)
    _acorde(mez, P(25) + 0.2, "III", 8.5, 0.20)
    for k in range(14):                     # se van poniendo en pie
        mez.add(B.paso(0.09, semilla=250 + k, barro=0.4),
                P(25) + 0.8 + k * 0.55, pan=-0.5 + (k % 5) * 0.25)

    # ===== 26-29 · la columna ===============================================
    mez.add(B.viento(D(26) + D(27) + D(28) + D(29), 0.15, semilla=26, fuerza=0.3), P(26))
    for k in range(int((D(26) + D(27)) / 0.46)):   # paso de la columna
        mez.add(B.paso(0.11, semilla=260 + k, barro=0.45), P(26) + 0.2 + k * 0.46,
                pan=-0.35 + 0.7 * ((k // 2) % 2))
    _acorde(mez, P(26) + 0.2, "i", 8.0, 0.17)
    _acorde(mez, P(27) + 0.2, "VI", 8.5, 0.18)
    _tema_pulsado(mez, P(27) + 0.6, 0.22, paso=0.7, semilla=50)
    _acorde(mez, P(28) + 0.2, "VII", 7.5, 0.17)
    mez.add(B.multitud(D(28), 0.15, semilla=28, animo=0.15), P(28))
    # El numero: acorde pleno y timbal
    _acorde(mez, P(29) + 0.1, "III", D(29), 0.24)
    mez.add(B.tambor(1.6, 55.0, 0.42, semilla=29), P(29) + 0.6)
    mez.add(B.metal_grave(nota(RE - 12.0, 220.0), 5.0, 0.20), P(29) + 0.6)
    mez.add(B.metal_grave(nota(RE - 5.0, 220.0), 5.0, 0.14), P(29) + 0.6)

    # ===== 30 · la medalla ==================================================
    mez.add(B.sala(D(30), 0.09, semilla=30), P(30))
    _acorde(mez, P(30) + 0.2, "i", 8.5, 0.20)
    mez.add(B.metal_grave(nota(RE, 220.0), 6.0, 0.22), P(30) + 0.8)
    mez.add(B.campana(660.0, 4.5, 0.14), P(30) + 1.0, pan=0.2)
    _tema_pulsado(mez, P(30) + 2.2, 0.18, paso=0.66, octava=12.0, semilla=60)

    # ===== 31-32 · el regreso ===============================================
    mez.add(B.multitud(D(31), 0.20, semilla=31, animo=0.85), P(31))
    _acorde(mez, P(31) + 0.2, "VI", 8.5, 0.20)
    for k in range(int(D(31) / 0.5)):
        mez.add(B.caja(0.18, 0.12, semilla=310 + k), P(31) + 0.3 + k * 0.5,
                pan=-0.2 + 0.4 * (k % 2))
    _acorde(mez, P(32) + 0.2, "III", 8.5, 0.19)
    _tema_pulsado(mez, P(32) + 0.8, 0.26, paso=0.66, semilla=70)
    mez.add(B.pajaros(D(32), 0.19, semilla=32, densidad=1.0), P(32), pan=0.3)
    mez.add(B.campana(560.0, 4.0, 0.16), P(32) + 5.6, pan=-0.15)
    mez.add(B.multitud(D(32), 0.07, semilla=33, animo=0.5), P(32))   # ninos

    # ===== 33-34 · epilogo ==================================================
    mez.add(B.viento(D(33) + D(34), 0.18, semilla=34, fuerza=0.3), P(33))
    mez.add(B.pajaros(D(33) + D(34), 0.18, semilla=35, densidad=0.8), P(33), pan=-0.25)
    _acorde(mez, P(33) + 0.2, "i", 9.0, 0.20)
    _tema_pulsado(mez, P(33) + 1.0, 0.30, paso=0.72, semilla=80)
    _acorde(mez, P(34) + 0.2, "VI", 4.5, 0.20)
    _acorde(mez, P(34) + 4.0, "i", D(34) - 3.6, 0.22)
    _tema_pulsado(mez, P(34) + 0.6, 0.26, paso=0.70, octava=12.0, semilla=90)
    mez.add(B.metal_grave(nota(RE - 12.0, 220.0), 6.5, 0.18), P(34) + 1.0)

    return mez
