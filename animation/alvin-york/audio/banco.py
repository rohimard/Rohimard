"""Instrumentos y efectos de sonido, todos sintetizados.

Dos familias: instrumentos para la partitura (cuerda pulsada, cuerdas graves,
metal grave, tambor, campana) y efectos para la accion (fusil, ametralladora,
artilleria, silbato, viento, mar, pajaros, multitud).
"""

from __future__ import annotations

import numpy as np

from .sintesis import (
    adsr, caida, eco, karplus, limita, n_muestras, normaliza, paso_alto,
    paso_bajo, paso_banda, resonante, reverb, ruido, ruido_rosa, seno, sierra,
    tiempo, triangulo,
)


# --- instrumentos -----------------------------------------------------------


def cuerda(frec: float, dur: float, vol: float = 0.5, semilla: int = 0,
           brillo: float = 0.55) -> np.ndarray:
    """Cuerda pulsada tipo banjo: el color de las montanas de Tennessee."""
    y = karplus(frec, dur, semilla=semilla, brillo=brillo, amortigua=0.9965)
    y *= caida(dur, tau=dur * 0.55, ataque=0.001)
    y = resonante(y, frec * 2.0, q=6.0) * 0.5 + y
    return y * vol


def cuerdas_graves(frec: float, dur: float, vol: float = 0.35, detune: float = 0.4,
                   ataque: float = 0.9) -> np.ndarray:
    """Colchon de cuerda grave: tres sierras desafinadas y filtro suave."""
    y = np.zeros(n_muestras(dur))
    for k, d in enumerate((-detune, 0.0, detune)):
        f = frec * (2 ** (d / 100.0))
        vib = 1.0 + 0.0016 * np.sin(2 * np.pi * (4.6 + k * 0.7) * tiempo(dur))
        y += sierra(f * vib, dur, armonicos=16)
    y = paso_bajo(y / 3.0, 1400.0)
    y *= adsr(dur, a=ataque, d=0.6, s=0.75, r=min(1.4, dur * 0.4))
    return y * vol


def metal_grave(frec: float, dur: float, vol: float = 0.4) -> np.ndarray:
    """Viento metal grave para los momentos solemnes."""
    y = sierra(frec, dur, armonicos=10) * 0.6 + triangulo(frec, dur) * 0.4
    y = paso_bajo(y, 900.0)
    y = resonante(y, frec * 3.0, q=4.0) * 0.35 + y
    y *= adsr(dur, a=0.18, d=0.3, s=0.8, r=min(0.9, dur * 0.35))
    return y * vol


def tambor(dur: float = 0.45, tono: float = 92.0, vol: float = 0.6,
           semilla: int = 0) -> np.ndarray:
    """Timbal: seno con caida de tono mas cuerpo de ruido."""
    t = tiempo(dur)
    barrido = tono * (1.0 + 1.1 * np.exp(-t * 24.0))
    cuerpo = seno(barrido, dur) * caida(dur, tau=0.16)
    golpe = paso_bajo(ruido(dur, semilla), 2400.0) * caida(dur, tau=0.03)
    return (cuerpo * 0.85 + golpe * 0.35) * vol


def caja(dur: float = 0.22, vol: float = 0.35, semilla: int = 0) -> np.ndarray:
    """Redoble seco de caja para el paso militar."""
    n = paso_banda(ruido(dur, semilla), 900.0, 7000.0)
    n *= caida(dur, tau=0.05, ataque=0.001)
    tono = seno(190.0, dur) * caida(dur, tau=0.03) * 0.3
    return (n + tono) * vol


def campana(frec: float = 520.0, dur: float = 3.5, vol: float = 0.4) -> np.ndarray:
    """Campana de escuela: parciales inarmonicos con caidas distintas."""
    y = np.zeros(n_muestras(dur))
    for mult, amp, tau in ((1.0, 1.0, 1.5), (2.76, 0.6, 0.9), (5.4, 0.35, 0.5),
                           (8.9, 0.2, 0.3)):
        y += seno(frec * mult, dur) * caida(dur, tau=tau * dur / 3.5) * amp
    return normaliza(y, 0.9) * vol


# --- efectos de accion ------------------------------------------------------


def disparo_fusil(vol: float = 0.7, semilla: int = 0, lejania: float = 0.0) -> np.ndarray:
    """Disparo de fusil: chasquido, cuerpo y cola de valle.

    `lejania` de 0 a 1 apaga los agudos y alarga el eco, que es lo que
    distingue un tiro propio de otro en la ladera de enfrente.
    """
    dur = 0.9 + lejania * 0.7
    n = ruido(dur, semilla)
    chasquido = paso_alto(n, 2200.0) * caida(dur, tau=0.012, ataque=0.0004)
    cuerpo = paso_banda(n, 180.0, 1800.0) * caida(dur, tau=0.05)
    golpe = seno(110.0, dur) * caida(dur, tau=0.06) * 0.5
    y = chasquido * (1.0 - 0.75 * lejania) + cuerpo * 0.8 + golpe
    y = eco(y, 0.11 + lejania * 0.16, realim=0.22 + lejania * 0.3, repeticiones=4)
    y = reverb(y, cantidad=0.18 + lejania * 0.35, tamano=2.2, brillo=2600.0)
    if lejania > 0:
        y = paso_bajo(y, 4200.0 - 2800.0 * lejania)
    return normaliza(y, 0.95) * vol


def rafaga(n_disparos: int = 8, cadencia: float = 0.09, vol: float = 0.5,
           semilla: int = 0, lejania: float = 0.5) -> np.ndarray:
    """Rafaga de ametralladora."""
    uno = disparo_fusil(1.0, semilla, lejania) * 0.55
    largo = n_muestras(cadencia * n_disparos) + len(uno)
    y = np.zeros(largo)
    for i in range(n_disparos):
        d = n_muestras(cadencia * i + np.random.default_rng(semilla + i).uniform(0, 0.008))
        y[d:d + len(uno)] += uno * np.random.default_rng(semilla + i).uniform(0.8, 1.1)
    return limita(y) * vol


def artilleria(vol: float = 0.5, semilla: int = 0, distancia: float = 0.8) -> np.ndarray:
    """Impacto de obus lejano: retumbo grave sin definicion en agudos."""
    dur = 2.6
    n = ruido(dur, semilla)
    grave = paso_bajo(n, 160.0 - 60.0 * distancia) * caida(dur, tau=0.55)
    medio = paso_banda(n, 120.0, 900.0) * caida(dur, tau=0.22) * (1 - distancia * 0.7)
    sub = seno(38.0, dur) * caida(dur, tau=0.7) * 0.8
    y = grave + medio + sub
    y = reverb(y, cantidad=0.5, tamano=3.4, brillo=1200.0)
    return normaliza(y, 0.95) * vol


def silbato(dur: float = 1.1, vol: float = 0.45) -> np.ndarray:
    """Silbato de oficial: dos tonos batiendo y aire."""
    a = seno(2350.0, dur)
    b = seno(2480.0, dur)
    aire = paso_banda(ruido(dur, 5), 1800.0, 5200.0) * 0.35
    y = (a + b) * 0.5 + aire
    y *= adsr(dur, a=0.03, d=0.08, s=0.85, r=0.18)
    y = resonante(y, 2400.0, q=18.0)
    return normaliza(y, 0.9) * vol


def cerrojo(vol: float = 0.35, semilla: int = 0) -> np.ndarray:
    """Cerrojo de fusil: dos golpes metalicos secos."""
    dur = 0.34
    y = np.zeros(n_muestras(dur))
    for k, off in enumerate((0.0, 0.14)):
        g = paso_banda(ruido(0.12, semilla + k), 1400.0, 8000.0)
        g *= caida(0.12, tau=0.02, ataque=0.0005)
        g = resonante(g, 3200.0 + k * 900.0, q=14.0)
        d = n_muestras(off)
        y[d:d + len(g)] += g
    return normaliza(y, 0.85) * vol


def paso(vol: float = 0.25, semilla: int = 0, barro: float = 0.0) -> np.ndarray:
    """Pisada sobre hierba o barro."""
    dur = 0.22
    n = ruido(dur, semilla)
    y = paso_banda(n, 120.0, 1800.0 - 900.0 * barro) * caida(dur, tau=0.045)
    if barro > 0:
        y += paso_bajo(n, 400.0) * caida(dur, tau=0.09) * barro * 0.8
    return normaliza(y, 0.8) * vol


# --- ambientes --------------------------------------------------------------


def viento(dur: float, vol: float = 0.16, semilla: int = 0, fuerza: float = 0.5) -> np.ndarray:
    """Viento: ruido rosa con corte y volumen que respiran lentamente."""
    n = ruido_rosa(dur, semilla)
    t = tiempo(dur)
    lento = 0.5 + 0.5 * np.sin(2 * np.pi * 0.045 * t + semilla)
    medio = 0.5 + 0.5 * np.sin(2 * np.pi * 0.13 * t + semilla * 1.7)
    y = paso_banda(n, 220.0, 900.0 + 1400.0 * fuerza)
    y *= (0.45 + 0.55 * lento) * (0.7 + 0.3 * medio)
    return y * vol


def mar(dur: float, vol: float = 0.22, semilla: int = 0) -> np.ndarray:
    """Oleaje: rompientes lentas sobre una base grave."""
    n = ruido_rosa(dur, semilla)
    t = tiempo(dur)
    olas = 0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * t)
    espuma = paso_banda(n, 700.0, 6000.0) * (olas ** 3) * 0.7
    fondo = paso_bajo(n, 380.0) * (0.6 + 0.4 * olas)
    return (espuma + fondo) * vol


def pajaros(dur: float, vol: float = 0.2, semilla: int = 0, densidad: float = 1.0) -> np.ndarray:
    """Trinos: barridos rapidos de seno, repartidos al azar."""
    rng = np.random.default_rng(semilla)
    y = np.zeros(n_muestras(dur))
    for _ in range(int(dur * 2.2 * densidad)):
        d = rng.uniform(0.06, 0.16)
        f0 = rng.uniform(2100, 4200)
        t = tiempo(d)
        barrido = f0 * (1 + 0.35 * np.sin(2 * np.pi * rng.uniform(9, 22) * t))
        trino = seno(barrido, d) * caida(d, tau=d * 0.45, ataque=0.006)
        trino += seno(barrido * 2, d) * caida(d, tau=d * 0.3) * 0.25
        pos = n_muestras(rng.uniform(0, max(0.05, dur - d)))
        y[pos:pos + len(trino)] += trino * rng.uniform(0.5, 1.0)
    return reverb(y, cantidad=0.3, tamano=1.8, brillo=6000.0) * vol


def grillos(dur: float, vol: float = 0.12, semilla: int = 0) -> np.ndarray:
    """Grillos de noche: pulsos estrechos alrededor de 4.5 kHz."""
    rng = np.random.default_rng(semilla)
    y = np.zeros(n_muestras(dur))
    for _ in range(int(dur * 3)):
        f = rng.uniform(4200, 5200)
        pulsos = int(rng.integers(3, 7))
        for k in range(pulsos):
            d = 0.03
            g = seno(f, d) * caida(d, tau=0.008, ataque=0.002)
            pos = n_muestras(rng.uniform(0, max(0.05, dur - 1.0)) + k * 0.055)
            if pos + len(g) < len(y):
                y[pos:pos + len(g)] += g * rng.uniform(0.4, 1.0)
    return paso_banda(y, 3200.0, 7000.0) * vol


def multitud(dur: float, vol: float = 0.2, semilla: int = 0, animo: float = 0.0) -> np.ndarray:
    """Rumor de gentio. `animo` sube de murmullo a vitoreo."""
    n = ruido_rosa(dur, semilla)
    t = tiempo(dur)
    y = paso_banda(n, 200.0, 1600.0 + 1800.0 * animo)
    oleada = 0.6 + 0.4 * np.sin(2 * np.pi * 0.09 * t + semilla)
    y *= 0.5 + 0.5 * oleada
    if animo > 0:
        agudo = paso_banda(ruido(dur, semilla + 3), 1200.0, 5200.0)
        y += agudo * animo * 0.4 * (0.4 + 0.6 * oleada)
    return reverb(y, cantidad=0.25, tamano=2.4, brillo=3000.0) * vol


def sala(dur: float, vol: float = 0.05, semilla: int = 0) -> np.ndarray:
    """Fondo de interior: aire quieto y un leve zumbido de lampara."""
    n = paso_bajo(ruido_rosa(dur, semilla), 500.0)
    zumbido = seno(100.0, dur) * 0.05 + seno(200.0, dur) * 0.02
    return (n + zumbido) * vol


def fuego(dur: float, vol: float = 0.14, semilla: int = 0) -> np.ndarray:
    """Crepitar: ruido filtrado con chasquidos sueltos."""
    rng = np.random.default_rng(semilla)
    y = paso_banda(ruido_rosa(dur, semilla), 300.0, 2600.0) * 0.5
    for _ in range(int(dur * 6)):
        d = 0.05
        c = paso_banda(ruido(d, int(rng.integers(0, 9999))), 1200.0, 6000.0)
        c *= caida(d, tau=0.008, ataque=0.0005)
        pos = n_muestras(rng.uniform(0, max(0.05, dur - d)))
        y[pos:pos + len(c)] += c * rng.uniform(0.3, 1.0)
    return y * vol
