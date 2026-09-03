# Puño y Letra — prueba de concepto

Convierte **la letra de una persona en una tipografía instalable** (.ttf) a
partir de una foto de móvil.

> Esto es una prueba del mecanismo, no un producto. Existe para responder a
> una sola pregunta antes de invertir semanas: **¿se puede hacer esto sin
> APIs de pago y con una foto normal?** La respuesta es sí.

## Probarlo

```bash
pip install opencv-python-headless fonttools pillow numpy
python simular.py     # genera la plantilla y simula una hoja fotografiada
python extraer.py     # foto -> letra.ttf
```

Y para ver el resultado escrito:

```bash
python -c "
from PIL import Image, ImageDraw, ImageFont
im = Image.new('RGB', (900,160), 'white')
ImageDraw.Draw(im).text((40,40), 'Querida abuela:', font=ImageFont.truetype('letra.ttf', 54), fill='#111')
im.save('prueba.png')"
```

## Cómo funciona

| Paso | Qué hace | Con qué |
|---|---|---|
| 1 | Detecta los 4 marcadores ArUco de las esquinas | OpenCV |
| 2 | Corrige la perspectiva de la foto | homografía |
| 3 | Compensa sombras dividiendo por el fondo desenfocado | OpenCV |
| 4 | Recorta cada casilla y mide la tinta **respecto a la línea base** | numpy |
| 5 | Vectoriza los contornos, respetando las contras de la `a` y la `o` | OpenCV |
| 6 | Ensambla el `.ttf` normalizando por la altura de la x | fontTools |

**Coste por fuente generada: 0 €.** Ninguna API de pago, ningún modelo, ninguna GPU.

## Ficheros

```
plantilla.py   Genera la hoja que la persona imprime y rellena (88 caracteres)
simular.py     Simula una hoja rellenada y fotografiada de mala manera
extraer.py     La cadena completa: foto -> .ttf
muestras/      Plantilla, foto simulada, comparación y una fuente generada
```

## Qué está probado y qué no

**Probado:** con una foto simulada *con perspectiva, sombra fuerte, ruido de
sensor y desenfoque*, se leen los **88 de 88 caracteres** y la tipografía
resultante es reconociblemente la misma letra (ver `muestras/comparacion.png`).

**Sin probar — el riesgo que queda:** una foto real de un móvil real, con
papel arrugado, bolígrafo que traspasa, reflejos y tinta azul. La simulación
degrada la imagen a propósito, pero no sustituye a diez fotos de verdad.
**Ése es el siguiente paso antes de construir nada más.**

## Detalles que importan y no son obvios

- **La línea base.** La plantilla imprime una línea en cada casilla y la
  extracción mide la tinta respecto a ella. Sin eso, la `g` y la `p` no
  colgarían y la fuente se vería flotando.
- **Los puntos pequeños.** El punto de la `i` mide 3×3 px. Una apertura
  morfológica se lo come y los dos puntos de `:` desaparecen enteros; hay que
  filtrar el ruido contando píxeles por componente, no erosionando.
- **Las contras.** En TrueType el contorno exterior va en sentido horario y
  los huecos al revés, o la `a` y la `o` salen rellenas.
- **La escala.** Se normaliza por la altura de la x, así que una persona que
  escribe diminuto y otra que escribe enorme producen fuentes del mismo
  tamaño aparente.
