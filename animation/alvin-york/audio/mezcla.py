"""Mezclador: coloca sonidos en la linea de tiempo y entrega estereo."""

from __future__ import annotations

import numpy as np

from .sintesis import SR, limita, n_muestras, paso_alto


class Mezcla:
    """Dos buses de audio sobre los que se van sumando sonidos por tiempo."""

    def __init__(self, dur: float):
        self.n = n_muestras(dur) + SR          # un segundo de cola
        self.izq = np.zeros(self.n)
        self.der = np.zeros(self.n)

    def add(self, sonido: np.ndarray, t: float, pan: float = 0.0,
            vol: float = 1.0) -> None:
        """Suma `sonido` en el instante `t`. `pan` va de -1 (izq) a +1 (der)."""
        if sonido is None or len(sonido) == 0:
            return
        i = n_muestras(max(0.0, t))
        if i >= self.n:
            return
        s = sonido[: self.n - i] * vol
        # Paneo de potencia constante: el centro no sube de nivel al abrir.
        ang = (np.clip(pan, -1.0, 1.0) + 1.0) * np.pi / 4.0
        self.izq[i:i + len(s)] += s * np.cos(ang)
        self.der[i:i + len(s)] += s * np.sin(ang)

    def estereo(self, pico: float = 0.82) -> np.ndarray:
        """Devuelve (n, 2) listo para codificar."""
        y = np.stack([self.izq, self.der], axis=1)
        y = paso_alto(y.T, 28.0).T              # quita la corriente continua
        m = float(np.max(np.abs(y)))
        if m > 1e-9:
            y = y * (pico / m)
        return limita(y, 0.95)


def a_wav(estereo: np.ndarray, ruta) -> None:
    """Escribe un WAV PCM de 16 bits sin depender de bibliotecas de audio."""
    import struct
    import wave

    datos = np.clip(estereo, -1.0, 1.0)
    pcm = (datos * 32767.0).astype("<i2").tobytes()
    with wave.open(str(ruta), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm)
    del struct
