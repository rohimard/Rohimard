# Miniatura — video 2 (déjà vu)

## Estrategia

El foco emocional no es un personaje histórico: es **una cara corriente con
una emoción imposible de ubicar**. El espectador tiene que reconocerse.

El conflicto visual es la **repetición**: la misma persona duplicada,
ligeramente desfasada, como un fotograma que se repite. Se entiende sin leer
nada y no necesita ningún elemento médico.

**Importante para monetización**: nada de cerebros expuestos, sangre ni
imaginería quirúrgica en la miniatura. El quirófano vive dentro del video,
no en la portada.

## Prompt de la imagen base (sin texto)

```
Crea una imagen fotorrealista cinematográfica en formato horizontal 16:9, 1280x720, sin ningún texto, sin letras, sin números: retrato de una mujer de unos 30 años, pelo castaño recogido de forma descuidada, jersey gris sencillo, rostro corriente, con los ojos muy abiertos y una expresión de reconocimiento inquietante, mirando directamente a cámara. Está encuadrada en el tercio IZQUIERDO del fotograma. Justo detrás de ella, ligeramente desplazada y semitransparente, aparece una segunda copia exacta de ella misma en la misma postura, como un fotograma repetido o una exposición doble, más tenue. Todo el lado DERECHO del encuadre es espacio negativo: una pared lisa y oscura en penumbra, sin detalle. Luz lateral dura y fría que esculpe su rostro, alto contraste, colorimetría desaturada de azules y grises. fotografía cinematográfica hiperrealista, full frame 35mm, profundidad de campo real, grano fílmico sutil, máximo detalle en la piel, 8K, sin texto en pantalla, 16:9.
```

## Texto encima (montar con render_thumbnail.js)

| Variante | number | line1 | line2 |
|---|---|---|---|
| **A (lanzamiento)** | `NO ES` | PREMONICIÓN | ES UN ERROR |
| B | `1 SEG` | TU CEREBRO | SE PILLA SOLO |
| C | `DÉJÀ VU` | LO QUE PASA | DE VERDAD |

Config base (`side` se ajusta al ver la imagen real):

```json
{
  "image": "base.jpg",
  "font": "../../kit-produccion/assets/Anton-Regular.woff2",
  "out": "miniatura",
  "number": "NO ES",
  "line1": "PREMONICIÓN",
  "line2": "ES UN ERROR",
  "side": "right",
  "accent": "#FFD400",
  "alarm": "#E10600"
}
```

Emparejamiento: la miniatura A niega el mito, así que el título debe aportar
**la escena** (el quirófano), no repetir la negación. Ver `seo.md`.
