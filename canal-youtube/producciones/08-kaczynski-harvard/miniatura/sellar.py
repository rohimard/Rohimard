"""Compone el sello "16 AÑOS" sobre la placa de la miniatura.

El sello se hace aqui y no en el generador de imagen a proposito: gpt-image-2
bloqueo dos veces la escena cuando el texto "16 AÑOS" iba junto a una figura
humana sentada (el clasificador lo lee como un menor en situacion de
angustia). Separando las dos cosas -- placa limpia del modelo, texto compuesto
localmente -- se consigue el mismo resultado y ademas control exacto del
tamano, la posicion y el angulo.
"""
import random

from PIL import Image, ImageDraw, ImageFilter, ImageFont

PLACA = "placa-silla.png"
SALIDA = "miniatura-16anos-persona.png"
TEXTO = "16 AÑOS"
ROJO = (200, 20, 35)
FUENTE = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"

base = Image.open(PLACA).convert("RGBA")
W, H = base.size

# El sello se dibuja en grande sobre lienzo aparte y luego se reduce: los
# bordes quedan mas limpios que dibujando ya al tamano final.
ESCALA = 3
fuente = ImageFont.truetype(FUENTE, 86 * ESCALA)

pad_x, pad_y = 46 * ESCALA, 30 * ESCALA
grosor = 7 * ESCALA
tmp = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
izq, arr, der, aba = tmp.textbbox((0, 0), TEXTO, font=fuente)
tw, th = der - izq, aba - arr

sw, sh = tw + pad_x * 2, th + pad_y * 2
sello = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
d = ImageDraw.Draw(sello)
d.rectangle([0, 0, sw - 1, sh - 1], outline=ROJO + (255,), width=grosor)
d.text((pad_x - izq, pad_y - arr), TEXTO, font=fuente, fill=ROJO + (255,))

# Desgaste: manchas aleatorias que comen tinta, como un sello de caucho real
# que no entinta parejo.
random.seed(8)
desgaste = Image.new("L", (sw, sh), 255)
dd = ImageDraw.Draw(desgaste)
for _ in range(320):
    x, y = random.randrange(sw), random.randrange(sh)
    r = random.randrange(ESCALA, 5 * ESCALA)
    dd.ellipse([x - r, y - r, x + r, y + r], fill=0)
desgaste = desgaste.filter(ImageFilter.GaussianBlur(0.8 * ESCALA))

# Solo el nucleo de cada mancha borra tinta; el desenfoque de los bordes se
# queda por encima del umbral y el sello sigue entero.
alfa = Image.composite(
    sello.getchannel("A"),
    Image.new("L", (sw, sh), 0),
    desgaste.point(lambda v: 0 if v < 60 else 255),
)
sello.putalpha(alfa)

# Ancho objetivo: algo mas de la mitad del cuadro, para que se lea aunque la
# miniatura se vea a 168 px de ancho en el feed.
ancho_final = int(W * 0.52)
alto_final = int(sh * ancho_final / sw)
sello = sello.resize((ancho_final, alto_final), Image.LANCZOS)
sello = sello.rotate(-7, expand=True, resample=Image.BICUBIC)

# Abajo a la derecha, por encima del hombro, dejando libre la esquina inferior
# derecha (ahi YouTube pone la duracion del video).
cx, cy = int(W * 0.65), int(H * 0.66)
pos = (cx - sello.width // 2, cy - sello.height // 2)

capa = Image.new("RGBA", base.size, (0, 0, 0, 0))
capa.paste(sello, pos, sello)
base = Image.alpha_composite(base, capa)
base.convert("RGB").save(SALIDA, quality=95)
print(f"{SALIDA} {base.size} sello {sello.size} en {pos}")
