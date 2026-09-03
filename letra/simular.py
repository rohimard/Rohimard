"""Simula una hoja rellenada a mano y fotografiada con un movil.

Sirve para probar el extractor sin necesitar una foto real: escribe los
caracteres con una tipografia manuscrita y luego degrada la imagen como lo
haria una foto de verdad — perspectiva, sombra, ruido y desenfoque.
"""
from __future__ import annotations
import cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont

import plantilla

MANUSCRITA = "/mnt/skills/examples/canvas-design/canvas-fonts/NothingYouCouldDo-Regular.ttf"


def rellenar(hoja: Image.Image, ruta_fuente: str = MANUSCRITA,
             tam: int = 62) -> Image.Image:
    """Escribe cada caracter sobre la linea base de su celda."""
    hoja = hoja.copy()
    dibujo = ImageDraw.Draw(hoja)
    fuente = ImageFont.truetype(ruta_fuente, tam)
    _, celdas = plantilla.geometria()
    aleatorio = np.random.default_rng(7)

    for caracter, (x, y, ancho, alto) in celdas.items():
        base = y + int(alto * plantilla.BASE_REL)
        # Un humano no centra perfecto: se desvia unos pixeles.
        dx = aleatorio.integers(-6, 7)
        dy = aleatorio.integers(-3, 4)
        dibujo.text((x + ancho / 2 + dx, base + dy), caracter,
                    font=fuente, fill=15, anchor="ms")
    return hoja


def fotografiar(hoja: Image.Image, semilla: int = 3) -> np.ndarray:
    """Degrada la imagen como una foto de movil: angulo, sombra, ruido."""
    imagen = np.array(hoja).astype(np.float32)
    alto, ancho = imagen.shape
    aleatorio = np.random.default_rng(semilla)

    # 1. Perspectiva: la hoja no esta perpendicular a la camara.
    d = 0.045
    origen = np.float32([[0, 0], [ancho, 0], [ancho, alto], [0, alto]])
    destino = np.float32([
        [ancho * d * aleatorio.uniform(.5, 1.5), alto * d * aleatorio.uniform(.3, 1.2)],
        [ancho * (1 - d * aleatorio.uniform(.2, .9)), alto * d * aleatorio.uniform(.5, 1.4)],
        [ancho * (1 - d * aleatorio.uniform(.4, 1.3)), alto * (1 - d * aleatorio.uniform(.3, 1.1))],
        [ancho * d * aleatorio.uniform(.3, 1.1), alto * (1 - d * aleatorio.uniform(.4, 1.2))],
    ])
    matriz = cv2.getPerspectiveTransform(origen, destino)
    imagen = cv2.warpPerspective(imagen, matriz, (ancho, alto),
                                 borderValue=248, flags=cv2.INTER_LINEAR)

    # 2. Iluminacion desigual: sombra de la mano o de la ventana.
    yy, xx = np.mgrid[0:alto, 0:ancho].astype(np.float32)
    sombra = (1.0
              - 0.30 * (xx / ancho) * aleatorio.uniform(.6, 1.0)
              - 0.16 * (yy / alto) * aleatorio.uniform(.3, 1.0))
    sombra += 0.08 * np.sin(yy / alto * 3.4) * np.cos(xx / ancho * 2.1)
    imagen *= np.clip(sombra, .45, 1.05)

    # 3. Ruido del sensor y ligero desenfoque.
    imagen += aleatorio.normal(0, 4.5, imagen.shape)
    imagen = cv2.GaussianBlur(imagen, (3, 3), 0.7)
    return np.clip(imagen, 0, 255).astype(np.uint8)


if __name__ == "__main__":
    base = plantilla.construir("plantilla.png")
    rellenada = rellenar(base)
    rellenada.save("hoja_rellenada.png")
    foto = fotografiar(rellenada)
    cv2.imwrite("foto_simulada.png", foto)
    Image.fromarray(foto).resize((620, 877)).save("foto_vista.png")
    print("hoja_rellenada.png y foto_simulada.png generadas")
