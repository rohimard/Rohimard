"""Malla low-poly y primitivas geometricas.

Todas las primitivas devuelven una `Mesh` con color plano por triangulo. El
aspecto low-poly viene de dos cosas: pocos segmentos en los cuerpos de
revolucion y un jitter de color por cara que rompe las superficies planas.
"""

from __future__ import annotations

import math

import numpy as np

from .math3d import euler


class Mesh:
    """Vertices (N,3), triangulos (M,3), color RGB y opacidad por triangulo."""

    __slots__ = ("verts", "faces", "colors", "alphas", "unlit")

    def __init__(self, verts, faces, colors, alphas=None, unlit=None):
        self.verts = np.asarray(verts, dtype=np.float64).reshape(-1, 3)
        self.faces = np.asarray(faces, dtype=np.int32).reshape(-1, 3)
        colors = np.asarray(colors, dtype=np.float64)
        if colors.ndim == 1:
            colors = np.tile(colors, (len(self.faces), 1))
        self.colors = colors.reshape(-1, 3)
        if alphas is None:
            self.alphas = np.ones(len(self.faces))
        else:
            self.alphas = np.broadcast_to(
                np.asarray(alphas, float).ravel(), (len(self.faces),)
            ).copy()
        if unlit is None:
            self.unlit = np.zeros(len(self.faces))
        else:
            self.unlit = np.broadcast_to(
                np.asarray(unlit, float).ravel(), (len(self.faces),)
            ).copy()

    def copy(self) -> "Mesh":
        return Mesh(
            self.verts.copy(), self.faces.copy(), self.colors.copy(),
            self.alphas.copy(), self.unlit.copy(),
        )

    def emisivo(self, k: float = 1.0) -> "Mesh":
        """Marca las caras como auto-iluminadas: niebla, fogonazos, luces.

        Sin esto, la luz direccional tine la niebla del color del sol y una
        bruma del amanecer acaba siendo rosa intenso.
        """
        self.unlit[:] = k
        return self

    def opacity(self, a: float) -> "Mesh":
        """Fija la opacidad de todas las caras (humo, niebla, fogonazos)."""
        self.alphas[:] = a
        return self

    # --- transformaciones (in-place, devuelven self para encadenar) ---------

    def transform(self, matriz: np.ndarray) -> "Mesh":
        self.verts = self.verts @ np.asarray(matriz, float).T
        return self

    def rotate(self, rx: float = 0.0, ry: float = 0.0, rz: float = 0.0) -> "Mesh":
        return self.transform(euler(rx, ry, rz))

    def scale(self, s) -> "Mesh":
        self.verts = self.verts * np.asarray(s, float)
        return self

    def translate(self, t) -> "Mesh":
        self.verts = self.verts + np.asarray(t, float)
        return self

    def place(self, pos=(0, 0, 0), rot=(0, 0, 0), esc=1.0) -> "Mesh":
        """Escala, rota y traslada en ese orden."""
        return self.scale(esc).rotate(*rot).translate(pos)

    # --- color -------------------------------------------------------------

    def paint(self, color) -> "Mesh":
        self.colors[:] = np.asarray(color, float)
        return self

    def jitter(self, cantidad: float = 0.05, semilla: int = 0) -> "Mesh":
        """Varia ligeramente el color de cada cara: la firma visual del low-poly."""
        rng = np.random.default_rng(semilla + len(self.faces))
        f = 1.0 + rng.uniform(-cantidad, cantidad, size=(len(self.faces), 1))
        self.colors = np.clip(self.colors * f, 0.0, 1.0)
        return self

    @property
    def n_faces(self) -> int:
        return len(self.faces)


def join(*mallas) -> Mesh:
    """Une varias mallas (o listas de mallas) en una sola."""
    planas = []
    for m in mallas:
        if m is None:
            continue
        planas.extend(m if isinstance(m, (list, tuple)) else [m])
    planas = [m for m in planas if m is not None and len(m.faces)]
    if not planas:
        return Mesh(np.zeros((0, 3)), np.zeros((0, 3), int), np.zeros((0, 3)))
    verts, faces, colors, alphas, unlit, off = [], [], [], [], [], 0
    for m in planas:
        verts.append(m.verts)
        faces.append(m.faces + off)
        colors.append(m.colors)
        alphas.append(m.alphas)
        unlit.append(m.unlit)
        off += len(m.verts)
    return Mesh(
        np.vstack(verts), np.vstack(faces), np.vstack(colors),
        np.concatenate(alphas), np.concatenate(unlit),
    )


# --- primitivas -------------------------------------------------------------


def box(size=(1, 1, 1), color=(0.6, 0.6, 0.6), center=(0, 0, 0)) -> Mesh:
    """Caja centrada en el origen (o en `center`)."""
    sx, sy, sz = (np.asarray(size, float) / 2.0)
    v = np.array(
        [
            [-sx, -sy, -sz], [sx, -sy, -sz], [sx, sy, -sz], [-sx, sy, -sz],
            [-sx, -sy, sz], [sx, -sy, sz], [sx, sy, sz], [-sx, sy, sz],
        ]
    )
    f = np.array(
        [
            [0, 2, 1], [0, 3, 2],  # -Z
            [4, 5, 6], [4, 6, 7],  # +Z
            [0, 1, 5], [0, 5, 4],  # -Y
            [3, 7, 6], [3, 6, 2],  # +Y
            [0, 4, 7], [0, 7, 3],  # -X
            [1, 2, 6], [1, 6, 5],  # +X
        ]
    )
    return Mesh(v + np.asarray(center, float), f, color)


def wedge(size=(1, 1, 1), color=(0.6, 0.6, 0.6)) -> Mesh:
    """Prisma triangular: tejados, terraplenes, rampas."""
    sx, sy, sz = (np.asarray(size, float) / 2.0)
    v = np.array(
        [
            [-sx, -sy, -sz], [sx, -sy, -sz], [sx, -sy, sz], [-sx, -sy, sz],
            [0.0, sy, -sz], [0.0, sy, sz],
        ]
    )
    f = np.array(
        [
            [0, 2, 1], [0, 3, 2],
            [0, 1, 4], [2, 3, 5],
            [1, 2, 5], [1, 5, 4],
            [3, 0, 4], [3, 4, 5],
        ]
    )
    return Mesh(v, f, color)


def cylinder(radio=0.5, alto=1.0, seg=8, color=(0.6, 0.6, 0.6), radio_sup=None) -> Mesh:
    """Cilindro/tronco de cono con base en y=0. Pocos segmentos = facetado."""
    r2 = radio if radio_sup is None else radio_sup
    ang = np.linspace(0, 2 * math.pi, seg, endpoint=False)
    abajo = np.stack([np.cos(ang) * radio, np.zeros(seg), np.sin(ang) * radio], 1)
    arriba = np.stack([np.cos(ang) * r2, np.full(seg, alto), np.sin(ang) * r2], 1)
    v = np.vstack([abajo, arriba, [[0, 0, 0]], [[0, alto, 0]]])
    c_ab, c_ar = 2 * seg, 2 * seg + 1
    f = []
    for i in range(seg):
        j = (i + 1) % seg
        f += [[i, j, seg + j], [i, seg + j, seg + i]]
        f.append([c_ab, j, i])
        f.append([c_ar, seg + i, seg + j])
    return Mesh(v, np.array(f), color)


def cone(radio=0.5, alto=1.0, seg=8, color=(0.6, 0.6, 0.6)) -> Mesh:
    ang = np.linspace(0, 2 * math.pi, seg, endpoint=False)
    base = np.stack([np.cos(ang) * radio, np.zeros(seg), np.sin(ang) * radio], 1)
    v = np.vstack([base, [[0, alto, 0]], [[0, 0, 0]]])
    punta, centro = seg, seg + 1
    f = []
    for i in range(seg):
        j = (i + 1) % seg
        f.append([i, j, punta])
        f.append([centro, j, i])
    return Mesh(v, np.array(f), color)


def sphere(radio=0.5, seg=8, anillos=5, color=(0.6, 0.6, 0.6), corte=1.0) -> Mesh:
    """Esfera UV facetada. `corte`<1 la recorta por arriba (cupulas, cascos)."""
    v, f = [], []
    filas = []
    for a in range(anillos + 1):
        phi = math.pi * (a / anillos) * corte
        y = math.cos(phi) * radio
        r = math.sin(phi) * radio
        fila = []
        if r < 1e-6:
            fila = [len(v)]
            v.append([0.0, y, 0.0])
        else:
            for s in range(seg):
                th = 2 * math.pi * s / seg
                fila.append(len(v))
                v.append([math.cos(th) * r, y, math.sin(th) * r])
        filas.append(fila)
    for a in range(anillos):
        sup, inf = filas[a], filas[a + 1]
        for s in range(max(len(sup), len(inf))):
            a0, a1 = sup[s % len(sup)], sup[(s + 1) % len(sup)]
            b0, b1 = inf[s % len(inf)], inf[(s + 1) % len(inf)]
            if a0 != a1:
                f.append([a0, b0, a1])
            if b0 != b1:
                f.append([a1, b0, b1])
    return Mesh(np.array(v), np.array(f), color)


def disc(radio=0.5, seg=10, color=(0.6, 0.6, 0.6), y=0.0) -> Mesh:
    ang = np.linspace(0, 2 * math.pi, seg, endpoint=False)
    v = np.vstack([np.stack([np.cos(ang) * radio, np.full(seg, y), np.sin(ang) * radio], 1), [[0, y, 0]]])
    f = np.array([[seg, (i + 1) % seg, i] for i in range(seg)])
    return Mesh(v, f, color)


def quad(p0, p1, p2, p3, color=(0.6, 0.6, 0.6)) -> Mesh:
    """Cuadrilatero libre a partir de cuatro esquinas."""
    return Mesh(np.array([p0, p1, p2, p3], float), np.array([[0, 1, 2], [0, 2, 3]]), color)


def grid(
    ancho=40.0,
    fondo=40.0,
    nx=16,
    nz=16,
    altura=None,
    color=(0.35, 0.42, 0.28),
    center=(0, 0, 0),
) -> Mesh:
    """Malla de terreno. `altura(x, z) -> y` esculpe colinas, crateres y valles."""
    xs = np.linspace(-ancho / 2, ancho / 2, nx + 1)
    zs = np.linspace(-fondo / 2, fondo / 2, nz + 1)
    gx, gz = np.meshgrid(xs, zs, indexing="ij")
    gy = np.zeros_like(gx) if altura is None else altura(gx, gz)
    v = np.stack([gx.ravel(), gy.ravel(), gz.ravel()], 1)
    f = []
    paso = nz + 1
    for i in range(nx):
        for j in range(nz):
            a, b, c, d = i * paso + j, i * paso + j + 1, (i + 1) * paso + j + 1, (i + 1) * paso + j
            f += [[a, b, c], [a, c, d]]
    return Mesh(v + np.asarray(center, float), np.array(f), color)


def prism(puntos_xz, alto=1.0, color=(0.6, 0.6, 0.6)) -> Mesh:
    """Extruye un poligono convexo del plano XZ hacia +Y (muros, parapetos)."""
    p = np.asarray(puntos_xz, float)
    n = len(p)
    abajo = np.stack([p[:, 0], np.zeros(n), p[:, 1]], 1)
    arriba = abajo + np.array([0.0, alto, 0.0])
    v = np.vstack([abajo, arriba])
    f = []
    for i in range(n):
        j = (i + 1) % n
        f += [[i, j, n + j], [i, n + j, n + i]]
    for i in range(1, n - 1):
        f.append([n, n + i, n + i + 1])
        f.append([0, i + 1, i])
    return Mesh(v, np.array(f), color)
