# Miniatura de YouTube (alto CTR) + montaje del texto

Una miniatura es un anuncio de 1 segundo que compite en un feed. Se diseña con criterio de
marketing, no como "una foto bonita".

## Principios de CTR

- **Un solo foco emocional:** una cara humana con emoción extrema (shock, agobio, alivio).
  En finanzas/lifestyle la cara vende más que cualquier gráfico.
- **Legible en móvil:** el 80 % de las vistas son en móvil. Máximo **3–4 palabras + 1
  número/palabra gigante**. Prueba de fuego: reducir la miniatura al 10 % y comprobar que
  aún se lee la palabra grande y se ve la emoción.
- **Conflicto visual:** persona pequeña/aplastada vs. algo enorme (una casa, una factura,
  una flecha) crea tensión al instante.
- **Color de alarma:** amarillo y rojo saturados que rompen el blanco/gris del feed.
- **Curiosity gap:** un dato tan extremo que obliga a hacer clic ("¿95 %? imposible").
- **Regla de tercios + espacio negativo:** cara a un lado, texto al otro. Nunca centrado y
  apretado. La mirada del sujeto a cámara sube el CTR.
- **Miniatura y título NO dicen lo mismo:** se complementan para crear el gap (si la
  miniatura grita "95 %", el título aporta el "por qué").

## Flujo en dos partes (importante)

El generador de imágenes no escribe texto decente, así que:

1. **Prompt de la imagen base (sin texto).** Se entrega al usuario para que la genere en
   Flow/Imagen. Composición: sujeto con emoción extrema en un tercio, conflicto visual,
   luz dramática, **amplio espacio negativo al lado contrario para el texto**, colores
   saturados. Personaje consistente con el vídeo. Terminar con "sin texto en pantalla,
   sin letras, sin números, 16:9, 1280x720".
2. **Montaje del texto (automático).** Cuando el usuario devuelve la imagen base generada,
   se compone el titular encima con `scripts/render_thumbnail.js` (usa la fuente Anton de
   `assets/Anton-Regular.woff2` y Chromium headless). Sale un **PNG** (calidad de edición)
   y un **JPG** (< 2 MB, listo para subir).

Si no se puede renderizar (sin Node/Chromium), se entrega en su lugar la **hoja de
composición** (posiciones, tamaños px y hex) para montarla en Canva en 5 minutos.

## Estrategia de texto

- **Número/palabra gigante** en amarillo `#FFD400`, fuente Anton, contorno negro grueso,
  inclinación ~-4°. Es siempre lo más grande.
- **Subtítulo blanco** (línea 1) + **línea 2 sobre caja roja `#E10600`**, ambas con
  contorno negro.
- Elegir el gancho según el vídeo. Tener listas **2–3 variantes para A/B**: un dato shock
  (número), una de identificación ("trabajas solo para…"), y una emocional ("no es tu
  culpa"). Lanzar con la del número; si el CTR flojea a las 48 h, probar otra.

## Config del render (`config.json`)

```json
{
  "image": "base.jpg",
  "font": "../assets/Anton-Regular.woff2",
  "out": "miniatura",
  "number": "95%",
  "line1": "DE TU SUELDO",
  "line2": "SE VA EN LA CASA",
  "side": "left",
  "accent": "#FFD400",
  "alarm": "#E10600"
}
```

`side` = lado donde va el texto (el opuesto a la cara). Ejecutar:
`node scripts/render_thumbnail.js config.json` (requiere `npm install playwright-core` una
vez). Antes de renderizar, leer la imagen base para confirmar de qué lado está el sujeto y
poner `side` en el lado del espacio negativo.

## Retoques que suben impacto (opcionales, en editor)

+15 % brillo/contraste en la cara, +10 % saturación global, viñeta en las esquinas, y una
luz de borde (rim light) tenue para separar al sujeto del fondo.
