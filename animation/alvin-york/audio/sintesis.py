"""Sintesis de audio por codigo: osciladores, envolventes, filtros y reverb.

Todo se genera con numpy, sin muestras ni bibliotecas de sonido externas, igual
que la imagen. La frecuencia de muestreo es 48 kHz mono; la mezcla final se
espacializa en `mezcla.py`.
"""

from __future__ import annotations

import numpy as np
from scipy import signal

SR = 48000


def n_muestras(dur: float) -> int:
    return max(1, int(round(dur * SR)))


def tiempo(dur: float) -> np.ndarray:
    return np.arange(n_muestras(dur), dtype=np.float64) / SR


# --- osciladores ------------------------------------------------------------


def seno(frec, dur: float, fase: float = 0.0) -> np.ndarray:
    t = tiempo(dur)
    f = np.full_like(t, frec, dtype=float) if np.isscalar(frec) else np.asarray(frec)[:len(t)]
    return np.sin(2 * np.pi * np.cumsum(f) / SR + fase)


def sierra(frec, dur: float, armonicos: int = 24) -> np.ndarray:
    """Diente de sierra aditivo: sin aliasing, a diferencia de la rampa cruda."""
    t = tiempo(dur)
    f = np.full_like(t, frec, dtype=float) if np.isscalar(frec) else np.asarray(frec)[:len(t)]
    fase = 2 * np.pi * np.cumsum(f) / SR
    y = np.zeros_like(t)
    for k in range(1, armonicos + 1):
        if float(np.max(f)) * k > SR / 2.2:
            break
        y += np.sin(fase * k) / k
    return y * (2.0 / np.pi)


def triangulo(frec, dur: float, armonicos: int = 12) -> np.ndarray:
    t = tiempo(dur)
    f = np.full_like(t, frec, dtype=float) if np.isscalar(frec) else np.asarray(frec)[:len(t)]
    fase = 2 * np.pi * np.cumsum(f) / SR
    y = np.zeros_like(t)
    for i in range(armonicos):
        k = 2 * i + 1
        if float(np.max(f)) * k > SR / 2.2:
            break
        y += ((-1) ** i) * np.sin(fase * k) / (k * k)
    return y * (8.0 / np.pi ** 2)


def ruido(dur: float, semilla: int = 0) -> np.ndarray:
    return np.random.default_rng(semilla).normal(0.0, 1.0, n_muestras(dur))


def ruido_rosa(dur: float, semilla: int = 0) -> np.ndarray:
    """Ruido con caida de 3 dB por octava: base de viento, mar y multitudes."""
    b = ruido(dur, semilla)
    return signal.lfilter([0.049922, -0.095993, 0.050612, -0.004408],
                          [1, -2.494956, 2.017265, -0.522189], b)


# --- envolventes ------------------------------------------------------------


def adsr(dur: float, a=0.01, d=0.1, s=0.7, r=0.2) -> np.ndarray:
    n = n_muestras(dur)
    na, nd, nr = (n_muestras(a), n_muestras(d), n_muestras(r))
    ns = max(0, n - na - nd - nr)
    partes = [
        np.linspace(0, 1, na, endpoint=False),
        np.linspace(1, s, nd, endpoint=False),
        np.full(ns, s),
        np.linspace(s, 0, nr),
    ]
    env = np.concatenate(partes)[:n]
    if len(env) < n:
        env = np.pad(env, (0, n - len(env)))
    return env


def caida(dur: float, tau: float = 0.3, ataque: float = 0.002) -> np.ndarray:
    """Golpe percusivo: ataque muy corto y caida exponencial."""
    t = tiempo(dur)
    env = np.exp(-t / max(tau, 1e-4))
    na = n_muestras(ataque)
    if na > 1:
        env[:na] *= np.linspace(0, 1, na)
    return env


def rampa(dur: float, sube: float, baja: float) -> np.ndarray:
    """Fundido de entrada y salida para camas de ambiente."""
    n = n_muestras(dur)
    env = np.ones(n)
    ns, nb = n_muestras(sube), n_muestras(baja)
    if ns > 1:
        env[:ns] *= np.linspace(0, 1, ns) ** 1.5
    if nb > 1:
        env[-nb:] *= np.linspace(1, 0, nb) ** 1.5
    return env


# --- filtros ----------------------------------------------------------------


def paso_bajo(x: np.ndarray, corte: float, orden: int = 2) -> np.ndarray:
    b, a = signal.butter(orden, min(corte / (SR / 2), 0.99), btype="low")
    return signal.lfilter(b, a, x)


def paso_alto(x: np.ndarray, corte: float, orden: int = 2) -> np.ndarray:
    b, a = signal.butter(orden, max(min(corte / (SR / 2), 0.99), 1e-4), btype="high")
    return signal.lfilter(b, a, x)


def paso_banda(x: np.ndarray, bajo: float, alto: float, orden: int = 2) -> np.ndarray:
    lo = max(min(bajo / (SR / 2), 0.98), 1e-4)
    hi = max(min(alto / (SR / 2), 0.99), lo + 1e-3)
    b, a = signal.butter(orden, [lo, hi], btype="band")
    return signal.lfilter(b, a, x)


def resonante(x: np.ndarray, frec: float, q: float = 12.0) -> np.ndarray:
    """Realza una frecuencia concreta: cuerpo de tambores, silbatos y campanas."""
    w = max(min(frec / (SR / 2), 0.99), 1e-4)
    b, a = signal.iirpeak(w, q)
    return signal.lfilter(b, a, x)


# --- cuerda pulsada ---------------------------------------------------------


def karplus(frec: float, dur: float, semilla: int = 0, brillo: float = 0.5,
            amortigua: float = 0.996) -> np.ndarray:
    """Karplus-Strong: cuerda pulsada, el timbre del banjo de las montanas.

    Se procesa por bloques del tamano de la linea de retardo. Cada bloque solo
    depende del anterior, asi que dentro del bloque se puede vectorizar; muestra
    a muestra en Python seria dos ordenes de magnitud mas lento.
    """
    n = n_muestras(dur)
    d = max(2, int(SR / max(frec, 20.0)))
    rng = np.random.default_rng(semilla)
    buf = rng.uniform(-1, 1, d)
    buf = buf * (1 - brillo) + paso_bajo(buf, 2000.0) * brillo
    salida = np.empty(n)
    i = 0
    while i < n:
        m = min(d, n - i)
        salida[i:i + m] = buf[:m]
        # Filtro de media movil: cada pasada suaviza y apaga la cuerda.
        buf = amortigua * 0.5 * (buf + np.roll(buf, 1))
        i += m
    return salida


# --- espacio ----------------------------------------------------------------


def _ir_reverb(dur: float, decaimiento: float, semilla: int, brillo: float) -> np.ndarray:
    """Respuesta al impulso sintetica: ruido con caida exponencial."""
    n = n_muestras(dur)
    rng = np.random.default_rng(semilla)
    ir = rng.normal(0, 1, n) * np.exp(-np.arange(n) / (decaimiento * SR))
    ir = paso_bajo(ir, brillo)
    ir[:n_muestras(0.004)] *= np.linspace(0, 1, n_muestras(0.004))
    return ir / (np.sqrt(np.sum(ir ** 2)) + 1e-9)


_CACHE_IR: dict = {}


def reverb(x: np.ndarray, cantidad: float = 0.25, tamano: float = 1.6,
           brillo: float = 4000.0, semilla: int = 7) -> np.ndarray:
    """Reverb por convolucion con una cola sintetica."""
    if cantidad <= 0.001:
        return x
    clave = (round(tamano, 2), round(brillo), semilla)
    if clave not in _CACHE_IR:
        _CACHE_IR[clave] = _ir_reverb(tamano, tamano * 0.45, semilla, brillo)
    humedo = signal.fftconvolve(x, _CACHE_IR[clave])[:len(x)]
    return x * (1 - cantidad) + humedo * cantidad


def eco(x: np.ndarray, retardo: float, realim: float = 0.35, repeticiones: int = 4,
        atenua: float = 0.6) -> np.ndarray:
    """Ecos discretos: valles, montanas y espacios abiertos."""
    y = x.copy()
    d = n_muestras(retardo)
    g = realim
    for k in range(1, repeticiones + 1):
        desp = d * k
        if desp >= len(x):
            break
        y[desp:] += x[:len(x) - desp] * g
        g *= atenua
    return y


# --- utilidades -------------------------------------------------------------


def normaliza(x: np.ndarray, pico: float = 0.9) -> np.ndarray:
    m = float(np.max(np.abs(x))) if len(x) else 0.0
    return x * (pico / m) if m > 1e-9 else x


def limita(x: np.ndarray, umbral: float = 0.95) -> np.ndarray:
    """Saturacion suave: evita el recorte duro en los picos de combate."""
    return np.tanh(x / umbral) * umbral


def nota(semitonos: float, base: float = 220.0) -> float:
    """Frecuencia a partir de semitonos sobre `base` (La3 por defecto)."""
    return base * (2.0 ** (semitonos / 12.0))
