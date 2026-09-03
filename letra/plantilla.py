"""Genera la hoja que la persona imprime y rellena a mano."""
from __future__ import annotations
import cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont

ANCHO, ALTO = 1240, 1754           # A4 a 150 ppp
MARCA_TAM, MARCA_MARGEN = 110, 55  # marcadores ArUco de las esquinas
COLS, FILAS = 8, 11                # 88 celdas, justo el juego de caracteres
CELDA_ANCHO, CELDA_ALTO = 135, 105
REJILLA_Y = 320                    # deja libres los marcadores inferiores
BASE_REL = 0.68                    # la linea de escritura, dentro de cada celda

JUEGO = (list("abcdefghijklmnopqrstuvwxyz")
         + list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
         + list("0123456789")
         + list(".,;:!?()-'\"")
         + list("áéíóúñüÁÉÍÓÚÑ¿¡"))


def geometria():
    """Coordenadas canonicas: centros de marcadores y rejilla de celdas."""
    c = MARCA_MARGEN + MARCA_TAM / 2
    centros = np.float32([[c, c], [ANCHO - c, c],
                          [ANCHO - c, ALTO - c], [c, ALTO - c]])
    rejilla_x = (ANCHO - COLS * CELDA_ANCHO) / 2
    celdas = {}
    for indice, caracter in enumerate(JUEGO):
        if indice >= COLS * FILAS:
            break
        fila, col = divmod(indice, COLS)
        x = rejilla_x + col * CELDA_ANCHO
        y = REJILLA_Y + fila * CELDA_ALTO
        celdas[caracter] = (int(x), int(y), CELDA_ANCHO, CELDA_ALTO)
    return centros, celdas


def construir(ruta_salida: str) -> None:
    hoja = Image.new("L", (ANCHO, ALTO), 255)
    dibujo = ImageDraw.Draw(hoja)

    dic = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
    for identificador, (x, y) in enumerate([
            (MARCA_MARGEN, MARCA_MARGEN),
            (ANCHO - MARCA_MARGEN - MARCA_TAM, MARCA_MARGEN),
            (ANCHO - MARCA_MARGEN - MARCA_TAM, ALTO - MARCA_MARGEN - MARCA_TAM),
            (MARCA_MARGEN, ALTO - MARCA_MARGEN - MARCA_TAM)]):
        marca = cv2.aruco.generateImageMarker(dic, identificador, MARCA_TAM)
        hoja.paste(Image.fromarray(marca), (x, y))

    try:
        titulo = ImageFont.truetype(
            "/mnt/skills/examples/canvas-design/canvas-fonts/InstrumentSans-Bold.ttf", 40)
        pie = ImageFont.truetype(
            "/mnt/skills/examples/canvas-design/canvas-fonts/InstrumentSans-Regular.ttf", 21)
        etiqueta = ImageFont.truetype(
            "/mnt/skills/examples/canvas-design/canvas-fonts/InstrumentSans-Regular.ttf", 19)
    except OSError:
        titulo = pie = etiqueta = ImageFont.load_default()

    dibujo.text((ANCHO / 2, 200), "Escribe cada letra sobre la línea",
                font=titulo, fill=0, anchor="mm")
    dibujo.text((ANCHO / 2, 250),
                "Boligrafo o rotulador negro. Sin salirte de la casilla. "
                "Las colas de la g y la p, por debajo de la linea.",
                font=pie, fill=110, anchor="mm")

    _, celdas = geometria()
    for caracter, (x, y, ancho, alto) in celdas.items():
        dibujo.rectangle([x, y, x + ancho, y + alto], outline=205, width=1)
        base = y + int(alto * BASE_REL)
        dibujo.line([x + 12, base, x + ancho - 12, base], fill=170, width=1)
        dibujo.text((x + 7, y + 5), caracter, font=etiqueta, fill=165)

    hoja.save(ruta_salida)
    return hoja


if __name__ == "__main__":
    construir("plantilla.png")
    print(f"plantilla.png generada — {len(JUEGO)} caracteres, "
          f"{COLS}x{FILAS} celdas")
