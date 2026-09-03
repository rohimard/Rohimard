"""Convierte la foto de una hoja rellenada en una tipografia .ttf real.

Cadena completa: detectar los marcadores -> corregir la perspectiva ->
compensar la iluminacion -> recortar cada celda -> vectorizar la tinta ->
ensamblar el fichero de fuente. Sin ninguna API de pago.
"""
from __future__ import annotations

import cv2
import numpy as np
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

import plantilla

UNIDADES_EM = 1000
ALTURA_X_OBJETIVO = 480     # a cuantas unidades equivale la altura de la x
MARGEN_LATERAL = 26         # aire a cada lado de cada letra
MARGEN_CELDA = 9            # se ignora el borde impreso de la casilla
TOLERANCIA = 1.15           # simplificacion de contornos, en pixeles
MOTA_MINIMA = 4             # px: por debajo es ruido del sensor, no tinta


class ExtraccionError(Exception):
    pass


# ------------------------------------------------------- 1. enderezar

def enderezar(imagen: np.ndarray) -> np.ndarray:
    """Localiza los 4 marcadores y devuelve la hoja en su geometria original."""
    dic = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
    detector = cv2.aruco.ArucoDetector(dic, cv2.aruco.DetectorParameters())
    esquinas, ids, _ = detector.detectMarkers(imagen)

    if ids is None or len(ids) < 4:
        encontrados = 0 if ids is None else len(ids)
        raise ExtraccionError(
            f"Solo veo {encontrados} de las 4 marcas de las esquinas. "
            "Haz la foto de frente, con toda la hoja dentro y buena luz.")

    centros = {}
    for identificador, grupo in zip(ids.flatten(), esquinas):
        centros[int(identificador)] = grupo.reshape(4, 2).mean(axis=0)
    if set(centros) < {0, 1, 2, 3}:
        raise ExtraccionError("No reconozco las cuatro marcas de la hoja.")

    origen = np.float32([centros[i] for i in (0, 1, 2, 3)])
    destino, _ = plantilla.geometria()
    matriz = cv2.getPerspectiveTransform(origen, destino)
    return cv2.warpPerspective(imagen, matriz, (plantilla.ANCHO, plantilla.ALTO),
                               flags=cv2.INTER_CUBIC, borderValue=255)


# --------------------------------------------------- 2. separar la tinta

def separar_tinta(hoja: np.ndarray, umbral: int = 145) -> np.ndarray:
    """Compensa la iluminacion desigual y deja solo la tinta.

    Se divide la imagen por una version muy desenfocada de si misma: eso
    elimina sombras y degradados. Las guias impresas son gris claro y quedan
    por encima del umbral, asi que desaparecen con ellas.
    """
    fondo = cv2.GaussianBlur(hoja.astype(np.float32), (0, 0), 26)
    fondo = np.maximum(fondo, 1.0)
    normalizada = np.clip(hoja.astype(np.float32) / fondo * 235, 0, 255).astype(np.uint8)
    _, binaria = cv2.threshold(normalizada, umbral, 255, cv2.THRESH_BINARY_INV)

    # Se descartan las motas por numero de pixeles, no con una apertura
    # morfologica: una apertura se comeria el punto de la i y los de los dos
    # puntos, que son legitimos y muy pequeños.
    total, etiquetas, estad, _ = cv2.connectedComponentsWithStats(binaria, 8)
    limpia = np.zeros_like(binaria)
    for indice in range(1, total):
        if estad[indice, cv2.CC_STAT_AREA] >= MOTA_MINIMA:
            limpia[etiquetas == indice] = 255
    return limpia


# ------------------------------------------------- 3. recortar los glifos

def recortar_glifos(tinta: np.ndarray) -> dict:
    """Devuelve, por caracter, su mascara y su posicion respecto a la linea base."""
    _, celdas = plantilla.geometria()
    glifos = {}
    for caracter, (x, y, ancho, alto) in celdas.items():
        m = MARGEN_CELDA
        trozo = tinta[y + m:y + alto - m, x + m:x + ancho - m]
        base_local = int(alto * plantilla.BASE_REL) - m

        columnas = np.where(trozo.any(axis=0))[0]
        filas = np.where(trozo.any(axis=1))[0]
        if len(columnas) == 0 or len(filas) == 0:
            continue  # casilla en blanco: la persona no la rellenó
        x0, x1 = columnas[0], columnas[-1] + 1
        y0, y1 = filas[0], filas[-1] + 1
        if (x1 - x0) < 3 and (y1 - y0) < 3:
            continue  # una mota, no un trazo

        glifos[caracter] = {
            "mascara": trozo[y0:y1, x0:x1],
            "ancho": int(x1 - x0),
            "alto": int(y1 - y0),
            # Altura del borde superior de la tinta sobre la linea base:
            # positivo hacia arriba. Asi la g y la p quedan colgando solas.
            "sobre_base": base_local - y0,
        }
    return glifos


# ------------------------------------------------------ 4. vectorizar

def _contornos(mascara: np.ndarray) -> list:
    relleno = cv2.copyMakeBorder(mascara, 1, 1, 1, 1, cv2.BORDER_CONSTANT, value=0)
    encontrados, jerarquia = cv2.findContours(relleno, cv2.RETR_CCOMP,
                                              cv2.CHAIN_APPROX_SIMPLE)
    if jerarquia is None:
        return []
    salida = []
    for indice, contorno in enumerate(encontrados):
        area = cv2.contourArea(contorno)
        if area < 1.0:
            continue
        # Un punto de la i mide 3x3 px: simplificarlo como un trazo largo lo
        # colapsa a menos de 3 puntos y desaparece de la fuente.
        tolerancia = TOLERANCIA if area > 45 else 0.35
        suave = cv2.approxPolyDP(contorno, tolerancia, True)
        if len(suave) < 3:
            continue
        es_hueco = jerarquia[0][indice][3] != -1   # tiene padre => es interior
        salida.append((suave.reshape(-1, 2) - 1, es_hueco))
    return salida


def _area_con_signo(puntos: np.ndarray) -> float:
    x, y = puntos[:, 0], puntos[:, 1]
    return float(np.dot(x, np.roll(y, -1)) - np.dot(y, np.roll(x, -1))) / 2.0


def dibujar_glifo(datos: dict, escala: float) -> tuple:
    """Traza los contornos en coordenadas de fuente (origen en la linea base)."""
    pluma = TTGlyphPen(None)
    for puntos, es_hueco in _contornos(datos["mascara"]):
        # Imagen: y hacia abajo. Fuente: y hacia arriba desde la linea base.
        fx = puntos[:, 0] * escala
        fy = (datos["sobre_base"] - puntos[:, 1]) * escala
        trazo = np.stack([fx, fy], axis=1)

        # TrueType rellena por regla non-zero: el contorno exterior en sentido
        # horario y los huecos al reves, o las contras de la a y la o se rellenan.
        horario = _area_con_signo(trazo) < 0
        if es_hueco == horario:
            trazo = trazo[::-1]

        pluma.moveTo((round(trazo[0][0]), round(trazo[0][1])))
        for px, py in trazo[1:]:
            pluma.lineTo((round(px), round(py)))
        pluma.closePath()
    return pluma.glyph(), round(datos["ancho"] * escala)


# ------------------------------------------------------ 5. montar la fuente

def construir_fuente(glifos: dict, nombre: str, salida: str) -> dict:
    if len(glifos) < 10:
        raise ExtraccionError(
            f"Solo he podido leer {len(glifos)} letras. Repite la foto con más luz.")

    # La escala se deduce de lo grande que escribe la persona: se toma la
    # altura de la x como referencia y se normaliza. Asi una letra pequeña y
    # una grande producen fuentes del mismo tamaño aparente.
    referencia = [glifos[c]["alto"] for c in "xoscenz" if c in glifos]
    altura_x = float(np.median(referencia)) if referencia else 34.0
    escala = ALTURA_X_OBJETIVO / max(altura_x, 1.0)

    orden = [".notdef", "space"]
    caracteres = {}
    for caracter in glifos:
        nombre_glifo = "uni%04X" % ord(caracter)
        orden.append(nombre_glifo)
        caracteres[ord(caracter)] = nombre_glifo

    constructor = FontBuilder(UNIDADES_EM, isTTF=True)
    constructor.setupGlyphOrder(orden)
    constructor.setupCharacterMap(caracteres)

    trazos, avances = {}, {}
    pluma_vacia = TTGlyphPen(None)
    trazos[".notdef"] = pluma_vacia.glyph()
    avances[".notdef"] = (300, 0)
    trazos["space"] = pluma_vacia.glyph()
    avances["space"] = (round(ALTURA_X_OBJETIVO * 0.62), 0)

    for caracter, datos in glifos.items():
        nombre_glifo = "uni%04X" % ord(caracter)
        glifo, ancho_tinta = dibujar_glifo(datos, escala)
        trazos[nombre_glifo] = glifo
        avances[nombre_glifo] = (ancho_tinta + 2 * MARGEN_LATERAL, MARGEN_LATERAL)

    constructor.setupGlyf(trazos)
    constructor.setupHorizontalMetrics(avances)
    constructor.setupHorizontalHeader(ascent=780, descent=-220)
    constructor.setupNameTable({
        "familyName": nombre,
        "styleName": "Regular",
        "fullName": nombre,
        "psName": nombre.replace(" ", "") + "-Regular",
        "version": "1.0",
    })
    constructor.setupOS2(sTypoAscender=780, sTypoDescender=-220, usWinAscent=980,
                         usWinDescent=280, sxHeight=ALTURA_X_OBJETIVO)
    constructor.setupPost(isFixedPitch=0)
    constructor.save(salida)

    return {"glifos": len(glifos), "altura_x_px": round(altura_x, 1),
            "escala": round(escala, 3), "fichero": salida}


# ------------------------------------------------------------ orquestador

def foto_a_fuente(ruta_foto: str, nombre: str, salida: str) -> dict:
    imagen = cv2.imread(ruta_foto, cv2.IMREAD_GRAYSCALE)
    if imagen is None:
        raise ExtraccionError(f"No puedo abrir '{ruta_foto}'.")
    hoja = enderezar(imagen)
    tinta = separar_tinta(hoja)
    glifos = recortar_glifos(tinta)
    informe = construir_fuente(glifos, nombre, salida)
    informe["leidos"] = sorted(glifos)
    return informe


if __name__ == "__main__":
    import sys
    datos = foto_a_fuente(sys.argv[1] if len(sys.argv) > 1 else "foto_simulada.png",
                          "Letra de Prueba", "letra.ttf")
    print(f"\n  {datos['glifos']} de 88 caracteres leidos")
    print(f"  altura de la x: {datos['altura_x_px']} px  ->  escala {datos['escala']}")
    print(f"  guardado en {datos['fichero']}")
    faltan = [c for c in plantilla.JUEGO if c not in datos["leidos"]]
    print(f"  no leidos: {''.join(faltan) if faltan else 'ninguno'}")
