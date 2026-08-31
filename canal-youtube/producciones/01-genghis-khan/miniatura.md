# Miniatura — "Un solo hombre mató al 10% de la humanidad"

## Estrategia (por qué)

- **Foco emocional único**: el rostro del guerrero mongol (nuestro "personaje
  recurrente") con emoción extrema — mirada fría, casi vacía, directa a
  cámara. En historia, un rostro humano con emoción real vende más clic que
  cualquier mapa o gráfico.
- **Conflicto visual**: su figura ocupa un tercio del encuadre; el resto es
  espacio negativo oscuro (humo/cielo de tormenta) donde va el texto — nunca
  centrado.
- **Curiosity gap**: el número "10%" es tan extremo que exige una
  explicación inmediata. La miniatura pone el **dato**; el título pone el
  **quién/por qué** (nunca los dos dicen lo mismo, regla del kit).
- **Color de alarma**: rojo/amarillo saturados rompiendo el tono
  tierra/desértico de la imagen de fondo.

## (a) Prompt de la imagen base — sin texto (para generar en Flow/Imagen)

```
Crea una imagen fotorrealista cinematográfica en formato horizontal 16:9,
1280x720, sin ningún texto, sin letras, sin números en pantalla: retrato de
un guerrero mongol de unos 55 años, rasgos asiáticos centrales, piel curtida
y bronceada por el viento y el sol, barba entrecana rala y bigote largo,
ojos rasgados de mirada fría, vacía y penetrante directa a cámara, cabello
oscuro trenzado bajo un gorro de piel de zorro, armadura de cuero endurecido
con placas de hierro superpuestas, manto grueso de piel sobre los hombros;
encuadrado en el tercio izquierdo del fotograma, fondo de cielo de tormenta
con humo denso y partículas de polvo en suspensión ocupando el resto del
encuadre como amplio espacio negativo, luz dramática lateral dura que
esculpe su rostro, alto contraste, colores desaturados y térreos. fotografía
cinematográfica hiperrealista, full frame 35mm, profundidad de campo real,
grano fílmico sutil, estilo documental contemporáneo, máximo detalle, 8K,
sin texto en pantalla, 16:9.
```

## (b) Cuando generes la imagen, mándamela

Con la imagen base la monto con `render_thumbnail.js` (fuente Anton,
amarillo `#FFD400` + caja roja `#E10600`, igual que el kit original) y te
devuelvo el PNG (edición) y el JPG (<2MB, listo para subir). Config
orientativa (ajusto `side` al lado del espacio negativo cuando vea la
imagen real):

```json
{
  "image": "base.jpg",
  "font": "../../kit-produccion/assets/Anton-Regular.woff2",
  "out": "miniatura",
  "number": "10%",
  "line1": "DE LA HUMANIDAD",
  "line2": "MURIÓ POR ÉL",
  "side": "right",
  "accent": "#FFD400",
  "alarm": "#E10600"
}
```

## 2-3 variantes de titular para la miniatura (A/B)

1. **Dato/número (lanzar con esta primero)**: `10%` grande en amarillo +
   `DE LA HUMANIDAD` / `MURIÓ POR ÉL` sobre caja roja.
2. **Identificación**: `NADIE` grande + `TE CONTÓ` / `ESTO DE ÉL`.
3. **Emocional/shock**: `1 HOMBRE` grande + `1 DE CADA 10` / `MURIÓ POR ÉL`.

Si el CTR flojea a las 48h con la variante 1, probar la 3 (más directa,
menos abstracta que "10%" para quien no ha visto aún el video).
