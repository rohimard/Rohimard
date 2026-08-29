"""Modelos low-poly de la historia: figuras, armas, vegetacion y edificios.

Escala: 1 unidad = 1 metro. Todo se construye con la base en y=0 para poder
apoyarlo directamente sobre el terreno.
"""

from __future__ import annotations

import math

import numpy as np

from .math3d import euler
from .mesh import Mesh, box, cone, cylinder, disc, grid, join, prism, quad, sphere, wedge

# --- paleta de materiales ---------------------------------------------------

CAQUI = (0.46, 0.45, 0.28)          # lana norteamericana
FELDGRAU = (0.42, 0.47, 0.42)       # gris campo aleman
PIEL = (0.76, 0.58, 0.45)
CUERO = (0.32, 0.22, 0.14)
CASCO_US = (0.38, 0.40, 0.26)
CASCO_DE = (0.34, 0.37, 0.34)
MADERA = (0.44, 0.29, 0.18)
MADERA_CLARA = (0.55, 0.42, 0.28)
METAL = (0.28, 0.29, 0.31)
ACERO = (0.42, 0.44, 0.47)
TIERRA = (0.30, 0.24, 0.17)
BARRO = (0.24, 0.20, 0.15)
HIERBA = (0.32, 0.40, 0.22)
PIEDRA = (0.42, 0.42, 0.40)
HUESO = (0.62, 0.58, 0.48)
ORO = (0.82, 0.66, 0.24)
SANGRE = (0.32, 0.11, 0.09)


# Reloj de escena. Las figuras lo leen cuando no se les pasa `t`, para no
# tener que enhebrar el tiempo por las decenas de llamadas de `scenes.py`.
_RELOJ = 0.0


def reloj(t: float) -> None:
    """Fija el instante que usaran las figuras construidas a continuacion."""
    global _RELOJ
    _RELOJ = float(t)


def _rng(semilla: int) -> np.random.Generator:
    return np.random.default_rng(semilla)


# --- figuras ----------------------------------------------------------------


def casco(tipo="us", color=None) -> Mesh:
    """Casco Brodie americano, Stahlhelm aleman, sombrero civil o pelo."""
    if tipo is None or tipo == "pelo":
        c = (0.24, 0.17, 0.11) if color is None else color
        return box((0.215, 0.09, 0.215), c, center=(0, 0.02, 0))
    if tipo == "sombrero":
        c = (0.36, 0.28, 0.18) if color is None else color
        return join(
            disc(0.26, 10, c, y=0.0),
            cylinder(0.125, 0.15, 8, c).translate((0, 0.005, 0)),
        )
    if tipo == "us":
        c = CASCO_US if color is None else color
        ala = disc(0.20, 10, c, y=0.0)
        cupula = sphere(0.145, 8, 3, c, corte=0.55).scale((1.0, 0.75, 1.0))
        return join(ala, cupula)
    c = CASCO_DE if color is None else color
    cupula = sphere(0.155, 8, 4, c, corte=0.62).scale((1.0, 0.95, 1.1))
    visera = disc(0.175, 10, c, y=0.0).scale((1.0, 1.0, 1.15))
    return join(cupula, visera.translate((0, 0.005, 0.01)))


def _cadena(pivote, huesos, color, base=None):
    """Cadena cinematica de huesos colgando de `pivote`.

    `huesos` es una lista de (largo, grosor, rx, rz): cada hueso hereda la
    rotacion acumulada del anterior, que es lo que permite tener rodilla y codo
    de verdad. Devuelve las mallas, la posicion del extremo y su orientacion.
    """
    p = np.asarray(pivote, float)
    R = np.eye(3) if base is None else np.asarray(base, float)
    partes = []
    for largo, grosor, rx, rz in huesos:
        R = R @ euler(rx=rx, rz=rz)
        seg = box((grosor, largo, grosor), color, center=(0.0, -largo / 2.0, 0.0))
        seg.transform(R)
        seg.translate(p)
        partes.append(seg)
        p = p + R @ np.array([0.0, -largo, 0.0])
    return partes, p, R


def _ciclo(fase):
    """Angulos de una pierna y su brazo opuesto en un ciclo de marcha.

    Devuelve (muslo, rodilla, hombro, codo). La rodilla solo flexiona hacia
    atras, que es lo que distingue un paso de un peluche articulado.
    """
    th = fase * 2.0 * math.pi
    muslo = -0.52 * math.sin(th)
    rodilla = 0.95 * max(0.0, math.sin(th + 2.5)) ** 1.3 + 0.06
    hombro = 0.42 * math.sin(th)
    codo = 0.30 + 0.34 * (0.5 + 0.5 * math.sin(th + 1.1))
    return muslo, rodilla, hombro, codo


# Expresiones: (angulo de ceja, alto de ceja, ancho de boca, alto de boca,
# curva de boca). La curva positiva sonrie, la negativa aflige.
EXPRESIONES = {
    "neutro":  (0.00, 0.000, 0.075, 0.016, 0.000),
    "duro":    (0.42, -0.012, 0.070, 0.014, -0.010),
    "miedo":   (-0.52, 0.014, 0.055, 0.046, -0.014),
    "grito":   (0.30, 0.008, 0.070, 0.070, 0.000),
    "triste":  (-0.34, 0.004, 0.062, 0.018, -0.020),
    "alegre":  (-0.14, 0.012, 0.095, 0.030, 0.022),
    "cansado": (-0.20, -0.008, 0.066, 0.020, -0.012),
}


def cara(expresion="neutro", piel=PIEL, ancho=0.21, alto=0.25, fondo=0.21,
         parpadeo=1.0, mirada=0.0) -> Mesh:
    """Rasgos sobre la cara frontal (+Z) de la cabeza.

    `parpadeo` 1 = ojo abierto, 0 = cerrado. `mirada` desplaza las pupilas.
    """
    ceja_a, ceja_y, boca_w, boca_h, boca_c = EXPRESIONES.get(
        expresion, EXPRESIONES["neutro"])
    z = fondo / 2.0 + 0.004
    piezas = []
    ojo_x, ojo_y = ancho * 0.23, alto * 0.10
    blanco = (0.93, 0.92, 0.88)
    oscuro = (0.10, 0.09, 0.10)
    ceja_col = (0.20, 0.14, 0.10)
    for lado in (-1, 1):
        h_ojo = max(0.010, 0.052 * parpadeo)
        piezas.append(box((0.056, h_ojo, 0.012), blanco,
                          center=(lado * ojo_x, ojo_y, z)))
        if parpadeo > 0.25:
            piezas.append(box((0.024, h_ojo * 0.78, 0.014), oscuro,
                              center=(lado * ojo_x + mirada * 0.016, ojo_y, z + 0.004)))
        ceja = box((0.075, 0.017, 0.012), ceja_col,
                   center=(0.0, 0.0, 0.0))
        ceja.rotate(rz=ceja_a * lado)
        ceja.translate((lado * ojo_x, ojo_y + 0.055 + ceja_y, z + 0.002))
        piezas.append(ceja)
    piezas.append(box((0.035, 0.030, 0.026), tuple(c * 0.94 for c in piel),
                      center=(0.0, ojo_y - 0.052, z + 0.006)))          # nariz
    boca = box((boca_w, boca_h, 0.012), (0.34, 0.16, 0.15),
               center=(0.0, 0.0, 0.0))
    boca.rotate(rz=0.0)
    boca.translate((0.0, ojo_y - 0.108, z))
    piezas.append(boca)
    if abs(boca_c) > 0.004:                                             # comisuras
        for lado in (-1, 1):
            piezas.append(box((0.020, 0.014, 0.012), (0.34, 0.16, 0.15),
                              center=(lado * boca_w * 0.5, ojo_y - 0.108 + boca_c, z)))
    return join(piezas)


def fusil(largo=1.18, bayoneta=False) -> Mesh:
    """Fusil Enfield: culata de madera, canon de acero, bayoneta opcional."""
    culata = box((0.055, 0.115, 0.34), MADERA, center=(0, 0, -largo * 0.32))
    cuerpo = box((0.045, 0.075, largo * 0.45), MADERA, center=(0, 0.005, -largo * 0.02))
    canon = box((0.028, 0.030, largo * 0.52), METAL, center=(0, 0.02, largo * 0.28))
    cerrojo = box((0.075, 0.035, 0.09), ACERO, center=(0.03, 0.03, -largo * 0.10))
    piezas = [culata, cuerpo, canon, cerrojo]
    if bayoneta:
        piezas.append(box((0.018, 0.028, 0.40), ACERO, center=(0, 0.02, largo * 0.72)))
    return join(piezas)


def pistola() -> Mesh:
    """Colt M1911 esquematica."""
    corredera = box((0.032, 0.062, 0.21), ACERO, center=(0, 0.06, 0.03))
    empunadura = box((0.030, 0.125, 0.075), (0.20, 0.16, 0.13), center=(0, 0, -0.045))
    guarda = box((0.022, 0.022, 0.055), ACERO, center=(0, 0.028, -0.005))
    return join(corredera, empunadura, guarda)


def soldado(
    pose="firme",
    uniforme=CAQUI,
    casco_tipo="us",
    arma="fusil",
    semilla=0,
    giro=0.0,
    t=None,
    fase=None,
    expresion=None,
    detalle=True,
) -> Mesh:
    """Figura humana articulada y animada.

    Piernas y brazos son cadenas con rodilla y codo: sin esas dos
    articulaciones cualquier pose se lee como un muneco de palo. `t` es el
    tiempo en segundos y `fase` desincroniza a los miembros de un grupo, para
    que una tropa no marque el paso como un solo cuerpo.
    """
    if t is None:
        t = _RELOJ
    r = _rng(semilla)
    if fase is None:
        fase = r.uniform(0.0, 1.0)
    manga = tuple(c * 0.84 for c in uniforme)
    pernera = tuple(c * 0.91 for c in uniforme)
    alto = 1.0 + r.uniform(-0.035, 0.035)
    piel = tuple(np.clip(np.array(PIEL) * r.uniform(0.88, 1.08), 0, 1))
    if expresion is None:
        expresion = {"carga": "grito", "apunta": "duro", "dispara": "duro",
                     "manos_arriba": "miedo", "reza": "triste",
                     "tumbado": "duro"}.get(pose, "neutro")
    partes = []

    if pose == "tumbado":
        respira = math.sin(t * 1.9 + fase * 6.283) * 0.012
        partes += [
            box((0.44, 0.24 + respira, 0.68), uniforme, center=(0, 0.13, 0.0)),
            box((0.17, 0.19, 0.62), uniforme, center=(-0.11, 0.10, -0.62)),
            box((0.17, 0.19, 0.62), uniforme, center=(0.12, 0.10, -0.60)),
            box((0.14, 0.14, 0.24), CUERO, center=(-0.11, 0.08, -0.99)),
            box((0.14, 0.14, 0.24), CUERO, center=(0.12, 0.08, -0.97)),
            box((0.13, 0.13, 0.46), uniforme, center=(-0.20, 0.11, 0.30)),
            box((0.13, 0.13, 0.46), uniforme, center=(0.20, 0.11, 0.30)),
        ]
        cabeza = box((0.20, 0.20, 0.22), piel, center=(0, 0.22, 0.44))
        partes.append(cabeza)
        if detalle:
            f = cara(expresion, piel, 0.20, 0.20, 0.22)
            f.rotate(rx=-0.25).translate((0, 0.225, 0.45))
            partes.append(f)
        partes.append(casco(casco_tipo).place(pos=(0, 0.30, 0.46), rot=(-0.25, 0, 0)))
        if arma:
            partes.append(fusil().place(pos=(0.10, 0.22, 0.46), rot=(-0.06, 0, 0)))
        return join(partes).rotate(ry=giro)

    # --- proporciones ------------------------------------------------------
    cadera, hombro = 0.90 * alto, 1.44 * alto
    l_muslo, l_pierna = 0.44 * alto, 0.37 * alto
    l_brazo, l_ante = 0.28 * alto, 0.26 * alto
    g_pierna, g_brazo = 0.165, 0.125

    # --- estado del ciclo --------------------------------------------------
    anda = pose in ("marcha", "carga")
    vel = 1.85 if pose == "marcha" else (2.7 if pose == "carga" else 0.0)
    ciclo = (t * vel + fase) % 1.0
    respira = math.sin(t * 1.35 + fase * 6.283)
    balanceo = math.sin(t * 0.62 + fase * 4.1)          # peso de un pie al otro

    if anda:
        m_i, r_i, h_i, c_i = _ciclo(ciclo)
        m_d, r_d, h_d, c_d = _ciclo((ciclo + 0.5) % 1.0)
        bote = abs(math.cos(ciclo * 2 * math.pi)) * 0.035 * alto
        inclina = 0.30 if pose == "carga" else 0.07
        giro_torso = 0.10 * math.sin(ciclo * 2 * math.pi)
    else:
        m_i = m_d = 0.03 + balanceo * 0.02
        r_i = r_d = 0.07
        h_i = h_d = 0.0
        c_i = c_d = 0.16
        bote = respira * 0.006 * alto
        inclina = 0.10 if pose in ("apunta", "dispara") else 0.02
        giro_torso = balanceo * 0.03

    base_y = bote

    # --- piernas -----------------------------------------------------------
    for lado, mus, rod in ((-1, m_i, r_i), (1, m_d, r_d)):
        segs, pie_p, R = _cadena(
            (lado * 0.11, cadera + base_y, 0.0),
            [(l_muslo, g_pierna, mus, 0.0), (l_pierna, g_pierna * 0.88, rod, 0.0)],
            pernera,
        )
        partes += segs
        bota = box((0.155, 0.10, 0.29), CUERO, center=(0, 0.05, 0.055))
        bota.rotate(rx=-(mus + rod) * 0.55)
        partes.append(bota.translate(pie_p))

    # --- torso, cuello y cabeza -------------------------------------------
    l_torso = hombro - cadera
    torso = box((0.46, l_torso + 0.10, 0.27), uniforme, center=(0, 0, 0))
    torso.rotate(rx=inclina, ry=giro_torso)
    torso.translate((0, (cadera + hombro) / 2 + 0.03 + base_y, 0))
    partes.append(torso)
    partes.append(box((0.30, 0.10, 0.29), (0.24, 0.21, 0.16),
                      center=(0, cadera + 0.06 + base_y, 0)))

    dz = math.sin(inclina) * (l_torso * 0.55)
    hy = hombro + base_y - 0.02
    cuello_y = hombro + base_y + 0.04
    partes.append(box((0.15, 0.10, 0.15), piel, center=(0, cuello_y, dz * 0.6)))

    # La cabeza compensa parte del giro del torso y mira ligeramente alrededor.
    cabeza_y = cuello_y + 0.145
    mira = 0.0 if anda else balanceo * 0.16
    cabeza = box((0.21, 0.25, 0.21), piel, center=(0, 0, 0))
    cabeza.rotate(ry=mira - giro_torso * 0.5, rx=-inclina * 0.55)
    cabeza.translate((0, cabeza_y, dz))
    partes.append(cabeza)
    if detalle:
        parpadeo = 0.0 if ((t * 0.9 + fase * 3.3) % 3.4) < 0.13 else 1.0
        f = cara(expresion, piel, parpadeo=parpadeo, mirada=balanceo * 0.5)
        f.rotate(ry=mira - giro_torso * 0.5, rx=-inclina * 0.55)
        f.translate((0, cabeza_y, dz))
        partes.append(f)
    casc = casco(casco_tipo)
    casc.rotate(ry=mira - giro_torso * 0.5, rx=-inclina * 0.55)
    partes.append(casc.translate((0, cabeza_y + 0.115, dz)))

    # --- brazos ------------------------------------------------------------
    def brazo(lado, rx_h, rz_h, rx_c):
        segs, mano, R = _cadena(
            (lado * 0.255, hy, dz * 0.4),
            [(l_brazo, g_brazo, rx_h, rz_h), (l_ante, g_brazo * 0.9, rx_c, 0.0)],
            manga,
        )
        return segs, mano

    if pose == "manos_arriba":
        tembl = math.sin(t * 3.1 + fase * 6.283) * 0.05
        for lado in (-1, 1):
            segs, _ = brazo(lado, -2.55 + tembl * lado, 0.52 * lado, -0.45)
            partes += segs
    elif pose in ("apunta", "dispara"):
        sway = math.sin(t * 1.7 + fase * 6.283) * 0.035
        segs_i, mano_i = brazo(-1, -1.42 + sway, 0.34, -0.62)
        segs_d, mano_d = brazo(1, -1.30 + sway, -0.30, -0.95)
        partes += segs_i + segs_d
        centro = (mano_i + mano_d) / 2.0
        if arma == "pistola":
            partes.append(pistola().place(pos=tuple(centro + (0, 0.02, 0.04)),
                                          rot=(sway, 0, 0)))
        elif arma:
            partes.append(fusil().place(pos=tuple(centro + (0, 0.05, 0.10)),
                                        rot=(0.03 + sway, 0, 0.06)))
    elif pose == "carga":
        manos = []
        for lado, ang in ((-1, -1.25), (1, -0.85)):
            segs, mano = brazo(lado, ang + h_i * 0.3, 0.20 * lado, -0.75)
            partes += segs
            manos.append(mano)
        if arma:
            centro = (manos[0] + manos[1]) / 2.0
            partes.append(fusil(bayoneta=True).place(
                pos=tuple(centro + (0, 0.04, 0.16)), rot=(0.14, 0, 0.10)))
    elif pose == "reza":
        segs_i, _ = brazo(-1, -1.05, 0.40, -1.15)
        segs_d, _ = brazo(1, -1.05, -0.40, -1.15)
        partes += segs_i + segs_d
    else:
        segs_i, _ = brazo(-1, h_i * 0.9, 0.11, -c_i)
        segs_d, _ = brazo(1, h_d * 0.9, -0.11, -c_d)
        partes += segs_i + segs_d
        if arma == "fusil_hombro":
            partes.append(fusil().place(pos=(0.235, hombro + base_y + 0.04, 0.0),
                                        rot=(1.15, 0, 0.25)))
        elif arma == "fusil":
            partes.append(fusil().place(pos=(0.27, hy - 0.34, 0.06), rot=(1.45, 0, 0.06)))

    return join(partes).rotate(ry=giro)


def caido(uniforme=CAQUI, casco_tipo="us", semilla=0, giro=0.0, t=None) -> Mesh:
    """Cuerpo abatido en el suelo, sin detalle gore: siluetas y casco caido."""
    r = _rng(semilla)
    partes = [
        box((0.44, 0.22, 0.66), uniforme, center=(0, 0.11, 0)),
        box((0.16, 0.17, 0.58), uniforme, center=(-0.11, 0.09, -0.60)),
        box((0.16, 0.17, 0.54), uniforme, center=(0.13, 0.09, -0.58)).rotate(ry=0.2),
        box((0.13, 0.13, 0.44), uniforme, center=(-0.30, 0.08, 0.12)).rotate(ry=0.5),
        box((0.13, 0.13, 0.42), uniforme, center=(0.31, 0.08, 0.10)).rotate(ry=-0.4),
        box((0.20, 0.20, 0.20), PIEL, center=(0, 0.14, 0.42)),
    ]
    h = casco(casco_tipo).place(
        pos=(r.uniform(-0.1, 0.1) + 0.22, 0.03, 0.62), rot=(1.4, r.uniform(0, 3), 0)
    )
    return join(partes + [h]).rotate(ry=giro)


def multitud(n, pose="firme", uniforme=CAQUI, casco_tipo="us", extension=(6.0, 4.0),
             semilla=0, arma="fusil", giro=0.0, rejilla=False, t=None,
             detalle=True, expresion=None) -> Mesh:
    """Grupo de figuras repartidas, con variacion de posicion y orientacion.

    Cada figura recibe una fase distinta del ciclo: sin eso el grupo entero
    respira y marca el paso a la vez, que es justo lo que delata el truco.
    """
    r = _rng(semilla)
    piezas = []
    for i in range(n):
        if rejilla:
            cols = max(1, int(math.sqrt(n) + 0.5))
            x = (i % cols - (cols - 1) / 2) * (extension[0] / max(cols, 1))
            z = (i // cols) * (extension[1] / max(cols, 1))
            x += r.uniform(-0.12, 0.12)
            z += r.uniform(-0.12, 0.12)
        else:
            x = r.uniform(-extension[0] / 2, extension[0] / 2)
            z = r.uniform(-extension[1] / 2, extension[1] / 2)
        s = soldado(
            pose=pose, uniforme=uniforme, casco_tipo=casco_tipo, arma=arma,
            semilla=semilla * 97 + i, giro=giro + r.uniform(-0.25, 0.25),
            t=t, fase=r.uniform(0.0, 1.0), detalle=detalle, expresion=expresion,
        )
        piezas.append(s.translate((x, 0, z)))
    return join(piezas)


# --- vegetacion y terreno ---------------------------------------------------


def pino(altura=6.0, semilla=0, color_hoja=(0.16, 0.30, 0.18)) -> Mesh:
    r = _rng(semilla)
    h = altura * r.uniform(0.85, 1.15)
    tronco = cylinder(h * 0.035, h * 0.35, 6, MADERA)
    piezas = [tronco]
    capas = 3
    for i in range(capas):
        t = i / capas
        piezas.append(
            cone(h * (0.24 - t * 0.09), h * 0.34, 7, color_hoja).translate(
                (0, h * (0.28 + t * 0.22), 0)
            )
        )
    return join(piezas).jitter(0.09, semilla)


def arbol_frondoso(altura=5.0, semilla=0, color_hoja=(0.24, 0.36, 0.18)) -> Mesh:
    r = _rng(semilla)
    h = altura * r.uniform(0.85, 1.2)
    tronco = cylinder(h * 0.045, h * 0.45, 6, MADERA)
    copa = sphere(h * 0.30, 7, 4, color_hoja).scale((1.0, 0.85, 1.0))
    copa.translate((r.uniform(-0.1, 0.1) * h, h * 0.62, r.uniform(-0.1, 0.1) * h))
    return join(tronco, copa).jitter(0.10, semilla)


def arbol_muerto(altura=5.0, semilla=0) -> Mesh:
    """Tronco astillado sin copa: la firma visual del bosque de Argonne."""
    r = _rng(semilla)
    h = altura * r.uniform(0.6, 1.25)
    color = (0.26, 0.23, 0.19)
    tronco = cylinder(h * 0.045, h, 5, color, radio_sup=h * 0.012)
    tronco.rotate(rz=r.uniform(-0.12, 0.12), rx=r.uniform(-0.10, 0.10))
    piezas = [tronco]
    for _ in range(r.integers(1, 3)):
        y = h * r.uniform(0.35, 0.8)
        rama = cylinder(h * 0.016, h * r.uniform(0.15, 0.32), 4, color)
        rama.rotate(rz=r.uniform(-1.5, 1.5), rx=r.uniform(-1.2, 1.2)).translate((0, y, 0))
        piezas.append(rama)
    return join(piezas).jitter(0.08, semilla)


def arbusto(radio=0.6, semilla=0, color=(0.24, 0.32, 0.18)) -> Mesh:
    r = _rng(semilla)
    piezas = []
    for _ in range(3):
        s = sphere(radio * r.uniform(0.55, 1.0), 6, 3, color)
        s.translate((r.uniform(-0.3, 0.3), radio * r.uniform(0.3, 0.6), r.uniform(-0.3, 0.3)))
        piezas.append(s)
    return join(piezas).jitter(0.10, semilla)


def roca(radio=0.8, semilla=0, color=PIEDRA) -> Mesh:
    r = _rng(semilla)
    m = sphere(radio, 6, 4, color)
    m.verts *= r.uniform(0.68, 1.32, size=m.verts.shape)
    m.verts[:, 1] = np.maximum(m.verts[:, 1], -radio * 0.15)
    return m.translate((0, radio * 0.45, 0)).jitter(0.10, semilla)


def tocon(radio=0.35, semilla=0) -> Mesh:
    return cylinder(radio, radio * 1.1, 6, (0.30, 0.24, 0.18)).jitter(0.08, semilla)


def crater(radio=2.2, prof=0.7, semilla=0, color=BARRO) -> Mesh:
    """Embudo de obus, hundido en el terreno."""
    seg = 10
    ang = np.linspace(0, 2 * math.pi, seg, endpoint=False)
    r = _rng(semilla)
    rr = radio * r.uniform(0.85, 1.15, seg)
    borde = np.stack([np.cos(ang) * rr, np.full(seg, 0.12), np.sin(ang) * rr], 1)
    v = np.vstack([borde, [[0, -prof, 0]]])
    f = np.array([[seg, (i + 1) % seg, i] for i in range(seg)])
    return Mesh(v, f, color).jitter(0.12, semilla)


FLORES = [
    (0.92, 0.30, 0.34), (0.96, 0.78, 0.24), (0.70, 0.42, 0.86),
    (0.96, 0.96, 0.92), (0.94, 0.52, 0.20), (0.36, 0.60, 0.94),
]


def flor(alto=0.52, semilla=0, color=None) -> Mesh:
    """Tallo con corola: el acento de color que rompe el verde del prado."""
    r = _rng(semilla)
    c = FLORES[int(r.integers(0, len(FLORES)))] if color is None else color
    h = alto * r.uniform(0.7, 1.3)
    tallo = box((0.022, h, 0.022), (0.24, 0.44, 0.18), center=(0, h / 2, 0))
    corola = join(
        disc(0.105, 6, c, y=0.0),
        disc(0.105, 6, c, y=0.0).rotate(rx=1.0),
        cylinder(0.036, 0.05, 6, (0.99, 0.88, 0.32)),
    ).translate((0, h, 0))
    return join(tallo, corola)


def mata(radio=0.30, semilla=0, color=(0.26, 0.50, 0.20)) -> Mesh:
    """Mata baja de hierba: dos o tres conos cruzados."""
    r = _rng(semilla)
    piezas = []
    for _ in range(int(r.integers(2, 4))):
        c = cone(radio * r.uniform(0.3, 0.5), radio * r.uniform(1.6, 2.8), 4, color)
        c.rotate(rz=r.uniform(-0.35, 0.35), rx=r.uniform(-0.35, 0.35))
        c.translate((r.uniform(-0.15, 0.15), 0, r.uniform(-0.15, 0.15)))
        piezas.append(c)
    return join(piezas).jitter(0.12, semilla)


def hierba_alta(n=40, extension=8.0, semilla=0, color=(0.36, 0.40, 0.20), alto=0.5) -> Mesh:
    """Matas de hierba como pequenos conos: rompen la planitud del suelo."""
    r = _rng(semilla)
    piezas = []
    for i in range(n):
        p = cone(0.10, alto * r.uniform(0.6, 1.4), 4, color)
        p.translate((r.uniform(-extension, extension), 0, r.uniform(-extension, extension)))
        piezas.append(p)
    return join(piezas).jitter(0.14, semilla)


def surcos(n=12, largo=14.0, ancho=10.0, color=(0.34, 0.26, 0.16)) -> Mesh:
    """Campo arado: lomos de tierra paralelos."""
    piezas = []
    for i in range(n):
        x = (i / (n - 1) - 0.5) * ancho
        piezas.append(wedge((0.45, 0.16, largo), color).translate((x, 0.08, 0)))
    return join(piezas).jitter(0.08, 3)


# --- construcciones ---------------------------------------------------------


def cabana(ancho=4.6, fondo=3.6, alto=2.3, color=MADERA, semilla=0) -> Mesh:
    """Cabana de troncos apilados con tejado a dos aguas y chimenea."""
    piezas = []
    n = max(3, int(alto / 0.30))
    for i in range(n):
        y = 0.15 + i * 0.30
        c = tuple(np.clip(np.array(color) * (0.88 + 0.24 * ((i * 7) % 5) / 5), 0, 1))
        piezas.append(box((ancho, 0.28, 0.26), c, center=(0, y, -fondo / 2)))
        piezas.append(box((ancho, 0.28, 0.26), c, center=(0, y, fondo / 2)))
        piezas.append(box((0.26, 0.28, fondo), c, center=(-ancho / 2, y, 0)))
        piezas.append(box((0.26, 0.28, fondo), c, center=(ancho / 2, y, 0)))
    tejado = wedge((ancho + 0.7, 1.5, fondo + 0.7), (0.32, 0.26, 0.22))
    piezas.append(tejado.translate((0, alto + 0.75, 0)))
    piezas.append(box((0.85, 1.75, 0.12), (0.20, 0.14, 0.10), center=(0, 0.88, fondo / 2 + 0.03)))
    piezas.append(box((0.7, 1.6, 0.7), PIEDRA, center=(ancho / 2 + 0.2, 1.4, -0.4)))
    piezas.append(box((0.5, 0.9, 0.5), PIEDRA, center=(ancho / 2 + 0.2, alto + 1.1, -0.4)))
    return join(piezas).jitter(0.06, semilla)


def iglesia(ancho=5.0, fondo=8.0, alto=3.4, color=(0.80, 0.78, 0.72)) -> Mesh:
    """Capilla rural blanca con campanario y aguja."""
    cuerpo = box((ancho, alto, fondo), color, center=(0, alto / 2, 0))
    tejado = wedge((ancho + 0.5, 1.5, fondo + 0.4), (0.30, 0.24, 0.22)).translate((0, alto + 0.75, 0))
    torre = box((1.7, 3.0, 1.7), color, center=(0, alto + 1.5, fondo / 2 - 0.9))
    aguja = cone(1.25, 2.6, 4, (0.28, 0.24, 0.22)).translate((0, alto + 3.0, fondo / 2 - 0.9))
    puerta = box((1.1, 2.0, 0.12), (0.34, 0.24, 0.18), center=(0, 1.0, fondo / 2 + 0.02))
    ventanas = [
        box((0.10, 1.1, 0.5), (0.85, 0.78, 0.45), center=(ancho / 2 + 0.01, 1.9, z))
        for z in (-2.0, 0.0, 2.0)
    ]
    ventanas += [
        box((0.10, 1.1, 0.5), (0.85, 0.78, 0.45), center=(-ancho / 2 - 0.01, 1.9, z))
        for z in (-2.0, 0.0, 2.0)
    ]
    cruz = join(
        box((0.08, 0.7, 0.08), HUESO, center=(0, 0.35, 0)),
        box((0.34, 0.08, 0.08), HUESO, center=(0, 0.45, 0)),
    ).translate((0, alto + 5.5, fondo / 2 - 0.9))
    return join([cuerpo, tejado, torre, aguja, puerta, cruz] + ventanas).jitter(0.04, 11)


def granero(ancho=6.0, fondo=8.0, alto=3.6, color=(0.42, 0.20, 0.16)) -> Mesh:
    cuerpo = box((ancho, alto, fondo), color, center=(0, alto / 2, 0))
    tejado = wedge((ancho + 0.6, 2.0, fondo + 0.5), (0.30, 0.28, 0.26)).translate((0, alto + 1.0, 0))
    puerta = box((2.2, 2.6, 0.14), (0.28, 0.16, 0.13), center=(0, 1.3, fondo / 2 + 0.03))
    return join(cuerpo, tejado, puerta).jitter(0.06, 13)


def valla(largo=12.0, postes=13, alto=1.1, color=MADERA_CLARA) -> Mesh:
    piezas = []
    for i in range(postes):
        x = (i / (postes - 1) - 0.5) * largo
        piezas.append(box((0.10, alto, 0.10), color, center=(x, alto / 2, 0)))
    for y in (alto * 0.4, alto * 0.8):
        piezas.append(box((largo, 0.08, 0.06), color, center=(0, y, 0)))
    return join(piezas).jitter(0.09, 5)


def tienda(ancho=3.0, fondo=4.0, alto=2.2, color=(0.72, 0.68, 0.56)) -> Mesh:
    """Tienda de campana piramidal del campamento de instruccion."""
    t = wedge((ancho, alto, fondo), color)
    t.translate((0, alto / 2, 0))
    ent = box((0.7, 1.2, 0.06), (0.30, 0.28, 0.24), center=(0, 0.6, fondo / 2 + 0.02))
    return join(t, ent).jitter(0.05, 7)


def escuela(ancho=9.0, fondo=5.0, alto=3.2, color=(0.86, 0.84, 0.76)) -> Mesh:
    cuerpo = box((ancho, alto, fondo), color, center=(0, alto / 2, 0))
    tejado = wedge((ancho + 0.6, 1.3, fondo + 0.5), (0.36, 0.28, 0.24)).translate((0, alto + 0.65, 0))
    puerta = box((1.2, 2.1, 0.12), (0.34, 0.24, 0.18), center=(0, 1.05, fondo / 2 + 0.02))
    vent = [
        box((1.0, 1.2, 0.10), (0.72, 0.80, 0.68), center=(x, 1.9, fondo / 2 + 0.01))
        for x in (-3.0, -1.5, 1.5, 3.0)
    ]
    campanario = box((1.0, 1.0, 1.0), color, center=(0, alto + 1.4, 0))
    return join([cuerpo, tejado, puerta, campanario] + vent).jitter(0.04, 17)


def casa_ruina(ancho=5.0, fondo=5.0, alto=3.0, semilla=0) -> Mesh:
    """Casa francesa destechada: muros rotos a distintas alturas."""
    r = _rng(semilla)
    c = (0.58, 0.54, 0.48)
    piezas = []
    for eje, sx, sz, pos in (
        ("x", 0.3, fondo, (-ancho / 2, 0, 0)),
        ("x", 0.3, fondo, (ancho / 2, 0, 0)),
        ("z", ancho, 0.3, (0, 0, -fondo / 2)),
        ("z", ancho, 0.3, (0, 0, fondo / 2)),
    ):
        h = alto * r.uniform(0.35, 1.0)
        piezas.append(box((sx, h, sz), c, center=(pos[0], h / 2, pos[2])))
    for _ in range(6):
        piezas.append(
            box(
                (r.uniform(0.3, 0.7), 0.22, r.uniform(0.3, 0.7)),
                c,
                center=(r.uniform(-ancho, ancho), 0.11, r.uniform(-fondo, fondo)),
            )
        )
    viga = box((0.16, 0.16, 3.2), MADERA, center=(0, 1.0, 0)).rotate(rx=0.9, ry=0.5)
    return join(piezas + [viga]).jitter(0.08, semilla)


# --- guerra: trincheras, armas pesadas, obstaculos --------------------------


def sacos(n=6, largo=2.4, capas=3, color=(0.40, 0.36, 0.26), semilla=0) -> Mesh:
    """Parapeto de sacos terreros escalonados."""
    r = _rng(semilla)
    piezas = []
    for c in range(capas):
        m = n - c
        for i in range(m):
            x = (i / max(m - 1, 1) - 0.5) * largo * (1 - c * 0.06)
            s = box((largo / n * 1.05, 0.24, 0.42), color, center=(x, 0.12 + c * 0.24, 0))
            s.rotate(ry=r.uniform(-0.12, 0.12))
            piezas.append(s)
    return join(piezas).jitter(0.10, semilla)


def berma(largo=7.0, ancho=3.0, alto=0.9, semilla=0, color=TIERRA, base=None) -> Mesh:
    """Terraplen de tierra.

    Se construye como un trozo de terreno abombado, no como una caja: una caja
    apoyada en el suelo se lee como una losa flotante en cuanto la camara baja.
    """

    def h(x, z):
        cresta = np.exp(-((z / (ancho * 0.42)) ** 2))
        extremos = 1.0 - np.clip((np.abs(x) / (largo / 2)) ** 4, 0.0, 1.0)
        suelo = 0.0 if base is None else base(x, z)
        return suelo + alto * cresta * extremos

    return grid(largo, ancho * 2.4, 16, 12, h, color).jitter(0.09, semilla)


def trinchera(largo=14.0, ancho=2.0, prof=1.5, semilla=0, base=None,
              color=(0.30, 0.29, 0.20)) -> Mesh:
    """Zanja excavada: surco en el terreno con labios de tierra y refuerzos.

    Modelada tambien como terreno deformado para que se funda con el suelo en
    lugar de parecer una pila de tablones apilados.
    """
    r = _rng(semilla)

    def h(x, z):
        surco = -prof * np.exp(-((z / (ancho * 0.42)) ** 2) ** 1.4)
        labio = 0.55 * np.exp(-(((np.abs(z) - ancho * 0.95) / (ancho * 0.42)) ** 2))
        # Se desvanece en los bordes del parche para empalmar con el terreno.
        borde = 1.0 - np.clip((np.abs(z) / (ancho * 2.4)) ** 3, 0.0, 1.0)
        suelo = 0.0 if base is None else base(x, z)
        return suelo + (surco + labio) * borde + np.sin(x * 0.8 + semilla) * 0.04

    piezas = [grid(largo, ancho * 5.0, 30, 20, h, color).jitter(0.09, semilla)]
    # Entibado y pasarela en el fondo de la zanja.
    for i in range(int(largo / 1.6)):
        x = -largo / 2 + i * 1.6 + r.uniform(-0.2, 0.2)
        y0 = 0.0 if base is None else float(base(np.array(x), np.array(0.0)))
        piezas.append(box((0.10, prof * 0.8, 0.12), MADERA,
                          center=(x, y0 - prof + prof * 0.4, -ancho * 0.42)))
    for i in range(int(largo / 0.9)):
        x = -largo / 2 + i * 0.9
        y0 = 0.0 if base is None else float(base(np.array(x), np.array(0.0)))
        piezas.append(box((0.75, 0.06, ancho * 0.55), (0.21, 0.17, 0.12),
                          center=(x, y0 - prof + 0.05, 0)))
    y0 = 0.0 if base is None else float(base(np.array(0.0), np.array(-ancho)))
    piezas.append(sacos(6, largo * 0.42, 2, semilla=semilla).translate((0, y0 + 0.36, -ancho * 1.0)))
    return join(piezas)


def alambrada(largo=12.0, postes=7, alto=1.0, semilla=0) -> Mesh:
    """Alambre de espino: postes en X y alambres cruzados."""
    r = _rng(semilla)
    piezas = []
    xs = np.linspace(-largo / 2, largo / 2, postes)
    for x in xs:
        p = cylinder(0.06, alto * r.uniform(0.8, 1.15), 4, (0.28, 0.25, 0.20))
        p.rotate(rz=r.uniform(-0.18, 0.18)).translate((x, 0, r.uniform(-0.2, 0.2)))
        piezas.append(p)
    for i in range(len(xs) - 1):
        for y in (alto * 0.35, alto * 0.65, alto * 0.95):
            a = np.array([xs[i], y + r.uniform(-0.05, 0.05), 0])
            b = np.array([xs[i + 1], y + r.uniform(-0.05, 0.05), 0])
            m = (a + b) / 2
            largo_seg = float(np.linalg.norm(b - a))
            hilo = box((largo_seg, 0.035, 0.035), (0.30, 0.28, 0.26), center=(0, 0, 0))
            piezas.append(hilo.translate(m))
    return join(piezas).jitter(0.10, semilla)


def ametralladora(color=METAL) -> Mesh:
    """MG08 sobre tripode, con escudo y cinta de municion."""
    canon = cylinder(0.055, 0.85, 6, color).rotate(rx=math.pi / 2).translate((0, 0.62, 0.15))
    camisa = cylinder(0.10, 0.52, 8, (0.32, 0.34, 0.32)).rotate(rx=math.pi / 2).translate((0, 0.62, 0.10))
    cuerpo = box((0.22, 0.22, 0.42), color, center=(0, 0.60, -0.30))
    escudo = box((0.72, 0.46, 0.05), (0.30, 0.32, 0.30), center=(0, 0.66, 0.02))
    patas = []
    for a in (0.0, 2.2, 4.2):
        p = cylinder(0.035, 0.72, 4, color)
        p.rotate(rz=0.35, ry=a).translate((0, 0, 0))
        patas.append(p)
    caja = box((0.24, 0.16, 0.30), (0.30, 0.30, 0.24), center=(0.26, 0.08, -0.20))
    return join([canon, camisa, cuerpo, escudo, caja] + patas).jitter(0.06, 23)


def nido_ametralladora(semilla=0) -> Mesh:
    """Emplazamiento: parapeto en herradura, arma y dos sirvientes."""
    piezas = [
        sacos(8, 3.2, 3, semilla=semilla),
        sacos(4, 1.6, 3, semilla=semilla + 1).rotate(ry=math.pi / 2).translate((-1.6, 0, 0.8)),
        sacos(4, 1.6, 3, semilla=semilla + 2).rotate(ry=math.pi / 2).translate((1.6, 0, 0.8)),
        ametralladora().translate((0, 0.20, 0.15)),
        soldado("tumbado", FELDGRAU, "de", arma=None, semilla=semilla + 3).translate((-0.5, 0.05, 0.55)),
    ]
    return join(piezas)


def caja_municion(color=(0.34, 0.32, 0.22)) -> Mesh:
    return join(
        box((0.62, 0.34, 0.38), color, center=(0, 0.17, 0)),
        box((0.66, 0.05, 0.42), (0.26, 0.24, 0.18), center=(0, 0.36, 0)),
    )


def barril(radio=0.32, alto=0.85, color=(0.32, 0.30, 0.24)) -> Mesh:
    c = cylinder(radio, alto, 8, color)
    aros = [
        cylinder(radio * 1.04, 0.06, 8, (0.24, 0.22, 0.18)).translate((0, y, 0))
        for y in (alto * 0.18, alto * 0.75)
    ]
    return join([c] + aros)


def tablero(ancho=2.4, fondo=1.8, color=MADERA, semilla=0, grosor=0.10, n=12) -> Mesh:
    """Superficie plana subdividida (mesa, pano, tarima).

    El algoritmo del pintor ordena por profundidad del centroide: una tapa
    hecha de dos triangulos enormes puede quedar por delante de los objetos
    pequenos apoyados encima. Subdividirla mantiene el orden correcto.
    """
    tapa = grid(ancho, fondo, n, max(3, int(n * fondo / ancho)), None, color)
    faldon = box((ancho, grosor, fondo), tuple(c * 0.72 for c in color),
                 center=(0, -grosor / 2, 0))
    return join(tapa, faldon).jitter(0.05, semilla)


def mesa(ancho=1.6, fondo=0.9, alto=0.75, color=MADERA_CLARA) -> Mesh:
    tablero = box((ancho, 0.08, fondo), color, center=(0, alto, 0))
    patas = [
        box((0.09, alto, 0.09), color, center=(sx * (ancho / 2 - 0.12), alto / 2, sz * (fondo / 2 - 0.1)))
        for sx in (-1, 1) for sz in (-1, 1)
    ]
    return join([tablero] + patas).jitter(0.05, 29)


def banco(largo=1.8, color=MADERA) -> Mesh:
    asiento = box((largo, 0.07, 0.38), color, center=(0, 0.45, 0))
    respaldo = box((largo, 0.45, 0.06), color, center=(0, 0.72, -0.16))
    patas = [box((0.08, 0.45, 0.34), color, center=(sx * (largo / 2 - 0.12), 0.22, 0)) for sx in (-1, 1)]
    return join([asiento, respaldo] + patas)


def carta(ancho=0.30, alto=0.21, color=(0.88, 0.85, 0.76)) -> Mesh:
    """Hoja de papel con lineas de texto y sello, para los planos cenitales."""
    hoja = box((ancho, 0.022, alto), color, center=(0, 0, 0))
    lineas = []
    for i in range(7):
        z = -alto / 2 + 0.035 + i * (alto - 0.06) / 7
        w = ancho * (0.72 if i % 3 else 0.45)
        lineas.append(box((w, 0.004, 0.009), (0.30, 0.28, 0.26), center=(-ancho * 0.05, 0.014, z)))
    return join([hoja] + lineas)


def sello(radio=0.075, color=(0.55, 0.12, 0.10), papel=(0.87, 0.84, 0.75)) -> Mesh:
    """Cuno de caucho: anillo exterior y banda central, no un disco macizo."""
    aro = cylinder(radio, 0.012, 14, color)
    hueco = cylinder(radio * 0.76, 0.006, 14, papel).translate((0, 0.012, 0))
    barra = box((radio * 1.55, 0.008, radio * 0.34), color, center=(0, 0.016, 0))
    return join(aro, hueco, barra)


def biblia(color=(0.22, 0.16, 0.13)) -> Mesh:
    tapa = box((0.26, 0.05, 0.34), color, center=(0, 0.025, 0))
    hojas = box((0.24, 0.035, 0.32), (0.86, 0.83, 0.74), center=(0, 0.055, 0))
    cruz = join(
        box((0.015, 0.004, 0.09), ORO, center=(0, 0, 0)),
        box((0.05, 0.004, 0.015), ORO, center=(0, 0, 0.015)),
    ).translate((0, 0.052, 0))
    return join(tapa, hojas, cruz)


def estrella(radio=0.20, radio_int=0.085, puntas=5, grosor=0.02, color=ORO) -> Mesh:
    """Estrella plana de N puntas, tendida en el plano XZ (mira hacia +Y).

    Se triangula en abanico desde el centro: el poligono no es convexo y una
    tapa en abanico desde un vertice cualquiera lo deformaria.
    """
    n = puntas * 2
    borde = []
    for i in range(n):
        a = math.pi / 2 + i * math.pi / puntas
        r = radio if i % 2 == 0 else radio_int
        borde.append((math.cos(a) * r, math.sin(a) * r))
    v, f = [], []
    for y in (0.0, grosor):
        for bx, bz in borde:
            v.append([bx, y, bz])
    v.append([0.0, 0.0, 0.0])
    v.append([0.0, grosor, 0.0])
    c_ab, c_ar = 2 * n, 2 * n + 1
    for i in range(n):
        j = (i + 1) % n
        f.append([c_ab, j, i])                       # tapa inferior
        f.append([c_ar, n + i, n + j])               # tapa superior
        f.append([i, j, n + j])                      # canto
        f.append([i, n + j, n + i])
    return Mesh(np.array(v), np.array(f), color)


def medalla() -> Mesh:
    """Medalla de Honor tendida: cinta, barra y estrella de cinco puntas."""
    cinta = box((0.20, 0.012, 0.36), (0.26, 0.44, 0.74), center=(0, 0.006, -0.30))
    barra = box((0.26, 0.030, 0.07), ORO, center=(0, 0.015, -0.50))
    corona = box((0.09, 0.022, 0.07), ORO, center=(0, 0.014, -0.09))
    cuerpo = estrella(0.185, 0.080, 5, 0.022, ORO).translate((0, 0.008, 0.10))
    disco = cylinder(0.062, 0.016, 10, (0.92, 0.80, 0.36)).translate((0, 0.026, 0.10))
    laurel = cylinder(0.098, 0.010, 12, (0.62, 0.52, 0.20)).translate((0, 0.016, 0.10))
    return join(cinta, barra, corona, cuerpo, laurel, disco)


def bandera(alto=4.0, color=(0.62, 0.18, 0.18), ondea=0.0) -> Mesh:
    mastil = cylinder(0.05, alto, 6, (0.42, 0.36, 0.28))
    pano = []
    seg = 6
    for i in range(seg):
        t0, t1 = i / seg, (i + 1) / seg
        y0 = alto * 0.98
        onda = lambda t: math.sin(t * 5.0 + ondea) * 0.10 * t
        pano.append(
            quad(
                (t0 * 1.7, y0 - 0.9, onda(t0)), (t1 * 1.7, y0 - 0.9, onda(t1)),
                (t1 * 1.7, y0, onda(t1)), (t0 * 1.7, y0, onda(t0)), color,
            )
        )
    return join([mastil] + pano)


# --- vehiculos y naves ------------------------------------------------------


def camion(color=(0.30, 0.32, 0.24)) -> Mesh:
    chasis = box((2.0, 0.5, 4.6), color, center=(0, 0.75, 0))
    cabina = box((1.9, 1.0, 1.4), color, center=(0, 1.4, 1.5))
    toldo = box((2.0, 1.3, 3.0), (0.52, 0.48, 0.38), center=(0, 1.6, -0.6))
    ruedas = [
        cylinder(0.45, 0.28, 8, (0.16, 0.15, 0.14)).rotate(rz=math.pi / 2).translate((sx * 1.0, 0.45, sz))
        for sx in (-1, 1) for sz in (1.5, -1.2)
    ]
    return join([chasis, cabina, toldo] + ruedas).jitter(0.05, 31)


def barco(largo=26.0, color=(0.26, 0.28, 0.30)) -> Mesh:
    """Transporte de tropas visto desde lejos."""
    casco_b = prism(
        [(-largo / 2, -1.8), (largo * 0.38, -2.4), (largo / 2, 0.0),
         (largo * 0.38, 2.4), (-largo / 2, 1.8)], 2.6, color
    )
    cubierta = box((largo * 0.55, 1.6, 3.4), (0.42, 0.42, 0.40), center=(0, 3.4, 0))
    puente = box((largo * 0.22, 1.5, 3.0), (0.52, 0.52, 0.50), center=(largo * 0.10, 4.9, 0))
    chimeneas = [
        cylinder(0.75, 3.0, 8, (0.22, 0.20, 0.20)).translate((x, 4.2, 0)) for x in (-2.0, 2.5)
    ]
    return join([casco_b, cubierta, puente] + chimeneas).jitter(0.05, 37)


def ola(ancho=90.0, fondo=90.0, semilla=0, color=(0.16, 0.24, 0.32)) -> Mesh:
    r = _rng(semilla)
    fase = r.uniform(0, 10)

    def h(x, z):
        return (
            np.sin(x * 0.22 + fase) * 0.22
            + np.cos(z * 0.31 + fase * 1.3) * 0.18
            + np.sin((x + z) * 0.13) * 0.12
        )

    return grid(ancho, fondo, 26, 26, h, color).jitter(0.09, semilla)


# --- atmosfera --------------------------------------------------------------


def nube(radio=3.0, semilla=0, color=(0.92, 0.92, 0.90), alfa=1.0) -> Mesh:
    r = _rng(semilla)
    piezas = []
    for _ in range(r.integers(3, 6)):
        s = sphere(radio * r.uniform(0.45, 1.0), 6, 3, color).scale((1.5, 0.62, 1.0))
        s.translate((r.uniform(-radio, radio), r.uniform(-radio * 0.2, radio * 0.2), r.uniform(-radio * 0.5, radio * 0.5)))
        piezas.append(s)
    m = join(piezas).jitter(0.04, semilla)
    return m.opacity(alfa).emisivo(0.75)


def humo(radio=1.0, n=4, semilla=0, color=(0.55, 0.55, 0.53), alfa=0.45, altura=2.0) -> Mesh:
    """Columna de humo: esferas cada vez mas grandes y transparentes."""
    r = _rng(semilla)
    piezas = []
    for i in range(n):
        t = i / max(n - 1, 1)
        s = sphere(radio * (0.5 + t * 1.3), 6, 3, color)
        s.translate((r.uniform(-0.3, 0.3) + t * 0.5, t * altura, r.uniform(-0.3, 0.3)))
        s.opacity(alfa * (1.0 - t * 0.55)).emisivo(0.85)
        piezas.append(s)
    return join(piezas)


def fogonazo(escala=1.0, semilla=0) -> Mesh:
    """Destello de boca de fuego: estrella plana muy brillante."""
    r = _rng(semilla)
    piezas = []
    for i in range(5):
        a = i * 2 * math.pi / 5 + r.uniform(0, 1)
        p = cone(0.07 * escala, 0.34 * escala * r.uniform(0.6, 1.4), 3, (1.0, 0.86, 0.45))
        p.rotate(rz=-a - math.pi / 2, rx=r.uniform(-0.4, 0.4))
        piezas.append(p)
    nucleo = sphere(0.12 * escala, 6, 3, (1.0, 0.94, 0.72))
    return join(piezas + [nucleo]).emisivo()


def trazadora(largo=3.0, color=(1.0, 0.72, 0.30), alfa=0.75) -> Mesh:
    """Estela de bala trazadora."""
    m = box((0.035, 0.035, largo), color, center=(0, 0, 0))
    return m.opacity(alfa).emisivo()


def ave(envergadura=0.5, color=(0.18, 0.18, 0.20), fase=0.0) -> Mesh:
    a = math.sin(fase) * 0.5
    cuerpo = box((0.07, 0.06, 0.20), color, center=(0, 0, 0))
    ala_i = box((envergadura, 0.02, 0.10), color, center=(-envergadura / 2, 0, 0)).rotate(rz=a)
    ala_d = box((envergadura, 0.02, 0.10), color, center=(envergadura / 2, 0, 0)).rotate(rz=-a)
    return join(cuerpo, ala_i, ala_d)
