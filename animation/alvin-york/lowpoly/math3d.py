"""Algebra 3D minima y curvas de interpolacion para la camara."""

from __future__ import annotations

import math

import numpy as np

Vec3 = np.ndarray


def v3(x: float, y: float, z: float) -> Vec3:
    return np.array([x, y, z], dtype=np.float64)


def normalize(v: Vec3) -> Vec3:
    n = float(np.linalg.norm(v))
    return v / n if n > 1e-9 else v.copy()


def look_at(eye: Vec3, target: Vec3, up: Vec3 = None) -> np.ndarray:
    """Base ortonormal de camara (filas: derecha, arriba, atras). Mira hacia -Z."""
    up = v3(0.0, 1.0, 0.0) if up is None else up
    back = normalize(np.asarray(eye, float) - np.asarray(target, float))
    if abs(float(np.dot(back, normalize(up)))) > 0.999:  # evita el gimbal en cenitales
        up = v3(0.0, 0.0, -1.0)
    right = normalize(np.cross(up, back))
    true_up = np.cross(back, right)
    return np.stack([right, true_up, back])


def rot_x(a: float) -> np.ndarray:
    c, s = math.cos(a), math.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]], dtype=np.float64)


def rot_y(a: float) -> np.ndarray:
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]], dtype=np.float64)


def rot_z(a: float) -> np.ndarray:
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]], dtype=np.float64)


def euler(rx: float = 0.0, ry: float = 0.0, rz: float = 0.0) -> np.ndarray:
    return rot_y(ry) @ rot_x(rx) @ rot_z(rz)


# --- curvas de tiempo -------------------------------------------------------


def clamp01(t: float) -> float:
    return 0.0 if t < 0.0 else (1.0 if t > 1.0 else t)


def smoothstep(t: float) -> float:
    t = clamp01(t)
    return t * t * (3.0 - 2.0 * t)


def ease_in_out(t: float) -> float:
    """Mas suave que smoothstep en los extremos: arranques y frenadas invisibles."""
    t = clamp01(t)
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0)


def ease_out(t: float) -> float:
    t = clamp01(t)
    return 1.0 - (1.0 - t) ** 3


def ease_in(t: float) -> float:
    t = clamp01(t)
    return t * t * t


def lerp(a, b, t: float):
    return np.asarray(a, float) * (1.0 - t) + np.asarray(b, float) * t


def fade(t: float, entrada: float, salida: float) -> float:
    """Rampa 0->1->0 usada por rotulos y destellos. `t` normalizado al plano."""
    if entrada > 0 and t < entrada:
        return smoothstep(t / entrada)
    if salida > 0 and t > 1.0 - salida:
        return smoothstep((1.0 - t) / salida)
    return 1.0


def noise1d(x: float, semilla: int = 0) -> float:
    """Ruido de valor 1D interpolado, en [-1, 1]. Para vibracion de camara."""

    def h(i: int) -> float:
        n = (i * 1619 + semilla * 31337) & 0x7FFFFFFF
        n = (n << 13) ^ n
        n = (n * (n * n * 15731 + 789221) + 1376312589) & 0x7FFFFFFF
        return 1.0 - n / 1073741824.0

    i = math.floor(x)
    f = x - i
    return h(i) * (1 - smoothstep(f)) + h(i + 1) * smoothstep(f)
