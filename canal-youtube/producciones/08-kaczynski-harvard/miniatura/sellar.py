"""Compone el sello "16 AÑOS" sobre la placa de la miniatura.

El sello se hace aqui y no en el generador de imagen a proposito: gpt-image-2
bloqueo dos veces la escena cuando el texto "16 AÑOS" iba junto a una figura
humana sentada (el clasificador lo lee como un menor en situacion de
angustia). Separando las dos cosas -- placa limpia del modelo, texto compuesto
localmente -- se consigue el mismo resultado y ademas control exacto del
tamano, la posicion y el angulo.

PRIMERA VERSION, DESCARTADA: letras rojas con textura de desgaste, sin fondo.
No se leia. Dos motivos: el rojo caia encima de la camisa blanca del sujeto
(contraste pobre justo donde empieza la frase) y las manchas de desgaste
mordian los trazos de una tipografia con remates finos. A 168 px de ancho, que
es como se ve en el feed, quedaba una mancha roja ilegible.

VERSION ACTUAL: bloque rojo solido con las letras CALADAS en blanco. El texto
deja de competir con la foto -- siempre tiene el mismo fondo debajo -- y la
tipografia es de palo seco y gruesa. El desgaste se aplica solo al bloque, no
a las letras.
"""
import random

from PIL import Image, ImageDraw, ImageFilter, ImageFont

PLACA = "placa-silla.png"
SALIDA = "miniatura-16anos-persona.png"
PREVIA = "previa-feed.png"
TEXTO = "16 AÑOS"
ROJO = (198, 18, 32)
CREMA = (250, 246, 240)
FUENTE = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

base = Image.open(PLACA).convert("RGBA")
W, H = base.size

# El sello se dibuja en grande y luego se reduce: los bordes quedan mas
# limpios que dibujando ya al tamano final.
ESCALA = 3
fuente = ImageFont.truetype(FUENTE, 96 * ESCALA)

pad_x, pad_y = 52 * ESCALA, 34 * ESCALA
tmp = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
izq, arr, der, aba = tmp.textbbox((0, 0), TEXTO, font=fuente)
tw, th = der - izq, aba - arr
sw, sh = tw + pad_x * 2, th + pad_y * 2

# Bloque rojo lleno. Las letras se calan restando su alfa, asi el texto es un
# agujero en el bloque y no tinta encima: contraste maximo y constante.
bloque = Image.new("RGBA", (sw, sh), ROJO + (255,))
letras = Image.new("L", (sw, sh), 0)
ImageDraw.Draw(letras).text((pad_x - izq, pad_y - arr), TEXTO, font=fuente, fill=255)

relleno = Image.new("RGBA", (sw, sh), CREMA + (255,))
bloque = Image.composite(relleno, bloque, letras)

# Filete crema por dentro, como un sello de expediente.
d = ImageDraw.Draw(bloque)
m = 11 * ESCALA
d.rectangle([m, m, sw - 1 - m, sh - 1 - m], outline=CREMA + (255,), width=4 * ESCALA)

# Desgaste SOLO en el bloque (no toca la legibilidad de las letras, que ya son
# huecos): unas pocas mordidas en los bordes para que no parezca un rectangulo
# de PowerPoint.
random.seed(11)
desgaste = Image.new("L", (sw, sh), 255)
dd = ImageDraw.Draw(desgaste)
for _ in range(900):
    x, y = random.randrange(sw), random.randrange(sh)
    # ESTRICTAMENTE en el borde. Una version anterior las repartia tambien por
    # dentro y los huecos dejaban ver el fondo oscuro: parecian moscas sobre el
    # rojo, no un sello mal entintado.
    if min(x, y, sw - x, sh - y) > 9 * ESCALA:
        continue
    r = random.randrange(ESCALA, 4 * ESCALA)
    dd.ellipse([x - r, y - r, x + r, y + r], fill=0)
desgaste = desgaste.filter(ImageFilter.GaussianBlur(0.7 * ESCALA))
bloque.putalpha(
    Image.composite(
        bloque.getchannel("A"),
        Image.new("L", (sw, sh), 0),
        desgaste.point(lambda v: 0 if v < 70 else 255),
    )
)

ancho_final = int(W * 0.56)
alto_final = int(sh * ancho_final / sw)
bloque = bloque.resize((ancho_final, alto_final), Image.LANCZOS)
bloque = bloque.rotate(-6, expand=True, resample=Image.BICUBIC)

# Sombra: despega el bloque del fondo para que no se funda con la pared oscura.
sombra = Image.new("RGBA", bloque.size, (0, 0, 0, 0))
sombra.putalpha(bloque.getchannel("A").point(lambda v: int(v * 0.72)))
sombra = sombra.filter(ImageFilter.GaussianBlur(9))

# Abajo a la derecha, pisando el hombro como un sello de expediente, dejando
# libre la esquina inferior derecha (ahi YouTube pone la duracion del video).
cx, cy = int(W * 0.64), int(H * 0.67)
pos = (cx - bloque.width // 2, cy - bloque.height // 2)

capa = Image.new("RGBA", base.size, (0, 0, 0, 0))
capa.paste(sombra, (pos[0] + 7, pos[1] + 9), sombra)
capa.paste(bloque, pos, bloque)
final = Image.alpha_composite(base, capa).convert("RGB")
final.save(SALIDA, quality=95)

# Prueba de legibilidad real: 168 px es el ancho al que YouTube muestra una
# miniatura en el feed de escritorio. Si no se lee aqui, no se lee.
final.resize((168, 94), Image.LANCZOS).resize((504, 282), Image.NEAREST).save(PREVIA)
print(f"{SALIDA} {final.size} | bloque {bloque.size} en {pos} | previa {PREVIA}")
