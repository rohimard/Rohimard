"""Rasterizador low-poly por software: camara, luz, niebla y cielo.

Estrategia: sombreado plano por triangulo + algoritmo del pintor (orden por
profundidad) dibujando con `ImageDraw.polygon`, que es codigo C y resulta mucho
mas rapido que un z-buffer en numpy para geometria de pocos poligonos.
El suavizado se consigue renderizando a 2x y reduciendo con Lanczos.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field

import numpy as np
from PIL import Image, ImageDraw

from .math3d import Vec3, look_at, normalize, v3

Z_NEAR = 0.12


@dataclass
class Camera:
    eye: Vec3
    target: Vec3
    fov: float = 45.0          # grados, vertical
    roll: float = 0.0          # inclinacion en radianes

    def basis(self) -> np.ndarray:
        R = look_at(np.asarray(self.eye, float), np.asarray(self.target, float))
        if abs(self.roll) > 1e-6:
            c, s = math.cos(self.roll), math.sin(self.roll)
            R = np.array([[c, s, 0], [-s, c, 0], [0, 0, 1]]) @ R
        return R


@dataclass
class Palette:
    """Todo el tono de un plano: luz, cielo, niebla y contraste."""

    cielo_alto: tuple = (0.30, 0.45, 0.66)
    cielo_bajo: tuple = (0.72, 0.78, 0.82)
    luz_dir: tuple = (-0.45, 0.72, 0.52)
    luz_color: tuple = (1.05, 0.98, 0.88)
    amb_cielo: tuple = (0.34, 0.40, 0.50)
    amb_suelo: tuple = (0.16, 0.15, 0.13)
    niebla: tuple = (0.72, 0.78, 0.82)
    densidad_niebla: float = 0.012
    sol: tuple = None           # color del halo solar; None = sin halo
    sol_tam: float = 0.30
    exposicion: float = 1.0
    contraste: float = 1.06
    saturacion: float = 1.0
    vineta: float = 0.32
    grano: float = 0.008

    def light_dir(self) -> np.ndarray:
        return normalize(np.asarray(self.luz_dir, float))


@dataclass
class Frame:
    """Un fotograma listo para componer: imagen RGB a resolucion final."""

    img: Image.Image
    meta: dict = field(default_factory=dict)


class Renderer:
    def __init__(self, ancho=1920, alto=1080, ssaa=2):
        self.w, self.h = ancho, alto
        self.ssaa = ssaa
        self.rw, self.rh = ancho * ssaa, alto * ssaa
        self._cache_cielo: dict = {}
        self._vineta: np.ndarray | None = None

    # --- cielo -------------------------------------------------------------

    def _cielo(self, pal: Palette, cam: Camera) -> Image.Image:
        """Degradado vertical + halo solar, generado en baja y ampliado."""
        clave = (
            pal.cielo_alto, pal.cielo_bajo, pal.sol, pal.sol_tam,
            None if pal.sol is None else (round(cam.eye[0], 2), round(cam.eye[1], 2)),
        )
        lw, lh = 320, 180
        y = np.linspace(0.0, 1.0, lh)[:, None]
        t = y ** 0.85
        alto = np.asarray(pal.cielo_alto, float)
        bajo = np.asarray(pal.cielo_bajo, float)
        cielo = alto[None, None, :] * (1 - t)[..., None] + bajo[None, None, :] * t[..., None]
        cielo = np.repeat(cielo, lw, axis=1)

        if pal.sol is not None:
            # Proyecta la direccion de la luz para situar el halo en pantalla.
            R = cam.basis()
            d = R @ pal.light_dir()
            if d[2] < -0.05:
                f = 1.0 / math.tan(math.radians(cam.fov) / 2)
                aspect = self.w / self.h
                sx = (0.5 + 0.5 * (d[0] / -d[2]) * (f / aspect)) * lw
                sy = (0.5 - 0.5 * (d[1] / -d[2]) * f) * lh
                gx, gy = np.meshgrid(np.arange(lw), np.arange(lh))
                r = np.sqrt(((gx - sx) / lw) ** 2 + ((gy - sy) / lh) ** 2)
                halo = np.exp(-(r / max(pal.sol_tam, 1e-3)) ** 1.7)
                cielo = cielo + np.asarray(pal.sol, float)[None, None, :] * halo[..., None]

        arr = np.clip(cielo, 0, 1)
        img = Image.fromarray((arr * 255).astype(np.uint8), "RGB")
        return img.resize((self.rw, self.rh), Image.BILINEAR)

    # --- sombreado ---------------------------------------------------------

    @staticmethod
    def _shade(mesh, cam: Camera, pal: Palette, prof: np.ndarray, orientacion=None) -> np.ndarray:
        v = mesh.verts
        f = mesh.faces
        a, b, c = v[f[:, 0]], v[f[:, 1]], v[f[:, 2]]
        n = np.cross(b - a, c - a)
        ln = np.linalg.norm(n, axis=1, keepdims=True)
        n = n / np.maximum(ln, 1e-12)

        # Iluminacion a dos caras: la normal se voltea hacia la camara para que
        # ninguna superficie abierta (terreno, planos de niebla) salga negra.
        centro = (a + b + c) / 3.0
        hacia = np.asarray(cam.eye, float)[None, :] - centro
        hacia /= np.maximum(np.linalg.norm(hacia, axis=1, keepdims=True), 1e-12)
        cara = np.einsum("ij,ij->i", n, hacia)     # >0 si la cara mira a camara
        if orientacion is not None:
            orientacion[:] = cara
        n *= np.sign(cara)[:, None]

        L = pal.light_dir()
        difusa = np.clip(n @ L, 0.0, 1.0)[:, None]
        cielo_f = (0.5 + 0.5 * n[:, 1])[:, None]
        ambiente = (
            np.asarray(pal.amb_cielo, float)[None, :] * cielo_f
            + np.asarray(pal.amb_suelo, float)[None, :] * (1 - cielo_f)
        )
        iluminado = mesh.colors * (ambiente + np.asarray(pal.luz_color, float)[None, :] * difusa)
        # Las caras emisivas conservan su color base (niebla, fogonazos, luces).
        u = mesh.unlit[:, None]
        col = iluminado * (1.0 - u) + mesh.colors * u

        # Niebla exponencial: separa planos y da profundidad atmosferica.
        fn = 1.0 - np.exp(-((np.maximum(prof, 0) * pal.densidad_niebla) ** 1.6))
        col = col * (1 - fn[:, None]) + np.asarray(pal.niebla, float)[None, :] * fn[:, None]

        col *= pal.exposicion
        if pal.saturacion != 1.0:
            gris = col @ np.array([0.299, 0.587, 0.114])
            col = gris[:, None] + (col - gris[:, None]) * pal.saturacion
        col = np.clip(col, 0.0, 1.0)
        if pal.contraste != 1.0:
            col = np.clip((col - 0.5) * pal.contraste + 0.5, 0.0, 1.0)
        return col

    # --- proyeccion y recorte ---------------------------------------------

    def _project(self, vv: np.ndarray, cam: Camera) -> np.ndarray:
        d = np.maximum(-vv[:, 2], Z_NEAR)
        fy = 1.0 / math.tan(math.radians(cam.fov) / 2)
        fx = fy / (self.w / self.h)
        sx = (0.5 + 0.5 * (vv[:, 0] / d) * fx) * self.rw
        sy = (0.5 - 0.5 * (vv[:, 1] / d) * fy) * self.rh
        return np.stack([sx, sy], 1)

    @staticmethod
    def _clip_near(p0, p1, p2):
        """Recorta un triangulo contra el plano cercano. Devuelve 0-2 triangulos."""
        poly = [p0, p1, p2]
        salida = []
        for i in range(len(poly)):
            a, b = poly[i], poly[(i + 1) % len(poly)]
            da, db = -a[2] - Z_NEAR, -b[2] - Z_NEAR
            if da >= 0:
                salida.append(a)
            if (da >= 0) != (db >= 0):
                t = da / (da - db)
                salida.append(a + (b - a) * t)
        if len(salida) < 3:
            return []
        if len(salida) == 3:
            return [salida]
        return [[salida[0], salida[1], salida[2]], [salida[0], salida[2], salida[3]]]

    # --- render ------------------------------------------------------------

    def render(self, mesh, cam: Camera, pal: Palette) -> Image.Image:
        img = self._cielo(pal, cam)
        if mesh is None or len(mesh.faces) == 0:
            return self._post(img, pal)

        eye = np.asarray(cam.eye, float)
        R = cam.basis()
        vv = (mesh.verts - eye) @ R.T           # espacio de camara
        f = mesh.faces
        dv = -vv[:, 2]
        df = dv[f]                               # profundidad por vertice de cara
        dentro = df >= Z_NEAR
        n_dentro = dentro.sum(1)

        prof = df.mean(1)
        cara = np.empty(len(f))
        colores = self._shade(mesh, cam, pal, prof, orientacion=cara)
        rgb = (colores * 255).astype(np.uint8)

        # Sesgo de orden para caras casi coplanares: en una lamina fina, la cara
        # superior y la inferior tienen practicamente la misma profundidad media
        # y el pintor las alternaba, partiendo el papel en triangulos sueltos.
        # Adelantar las caras que miran a camara resuelve el empate.
        orden_prof = prof - 0.018 * cara * np.clip(prof, 0.25, 6.0)

        completos = np.flatnonzero(n_dentro == 3)
        parciales = np.flatnonzero((n_dentro == 1) | (n_dentro == 2))

        pantalla = self._project(vv, cam)
        pts = pantalla[f[completos]]              # (K,3,2)
        orden = np.argsort(-orden_prof[completos])   # de lejos a cerca
        completos = completos[orden]
        pts = pts[orden]

        lote = []
        for k, idx in enumerate(completos):
            lote.append((orden_prof[idx], pts[k], rgb[idx], mesh.alphas[idx]))

        for idx in parciales:                     # pocos: bucle Python asumible
            tri = vv[f[idx]]
            for sub in self._clip_near(tri[0], tri[1], tri[2]):
                sp = self._project(np.asarray(sub), cam)
                lote.append((float(np.mean([-s[2] for s in sub])), sp, rgb[idx], mesh.alphas[idx]))

        lote.sort(key=lambda e: -e[0])

        draw = ImageDraw.Draw(img)
        draw_a = ImageDraw.Draw(img, "RGBA")
        for _, p, c, al in lote:
            poli = [(float(x), float(y)) for x, y in p]
            if al >= 0.995:
                draw.polygon(poli, fill=(int(c[0]), int(c[1]), int(c[2])))
            elif al > 0.02:
                draw_a.polygon(poli, fill=(int(c[0]), int(c[1]), int(c[2]), int(al * 255)))
        return self._post(img, pal)

    # --- acabado -----------------------------------------------------------

    def _mascara_vineta(self) -> np.ndarray:
        if self._vineta is None:
            y, x = np.mgrid[0:self.h, 0:self.w]
            nx = (x / self.w - 0.5) * 2
            ny = (y / self.h - 0.5) * 2
            r = np.sqrt(nx ** 2 * 0.9 + ny ** 2)
            self._vineta = np.clip(1.0 - (r / 1.45) ** 2.4, 0.0, 1.0)[..., None]
        return self._vineta

    def _post(self, img: Image.Image, pal: Palette) -> Image.Image:
        img = img.resize((self.w, self.h), Image.LANCZOS)
        if pal.vineta <= 0 and pal.grano <= 0:
            return img
        a = np.asarray(img, dtype=np.float32) / 255.0
        if pal.vineta > 0:
            m = self._mascara_vineta()
            a *= (1.0 - pal.vineta) + pal.vineta * m
        if pal.grano > 0:
            ruido = np.random.default_rng().normal(0, pal.grano, size=(self.h, self.w, 1))
            a += ruido
        return Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8), "RGB")
