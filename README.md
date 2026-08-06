# 🎬 GuionVisual

Convierte un **guión narrado** en un **storyboard de imágenes de stock sincronizadas** con la narración.

La idea central: un guión no es solo texto, es *ritmo*. GuionVisual **interpreta las frases, las comas, los puntos y los puntos suspensivos** como marcas de tiempo, estima cuánto dura cada trozo al narrarlo, y **corta a una imagen nueva con frecuencia** para mantener la retención del espectador (estilo vídeo "faceless" de YouTube/TikTok).

Le pegas el guión, y te devuelve una lista ordenada de imágenes con su momento de inicio, duración y la imagen de stock que le corresponde. Luego lo montas en tu editor de vídeo.

---

## ¿Cómo interpreta el guión?

El motor (`src/scriptParser.js`) hace cuatro cosas:

1. **Segmenta** el guión en frases usando la puntuación como límites (`. ! ? … ; : ,` y saltos de línea).
2. **Estima la duración** de cada frase a partir de la velocidad de narración (palabras por minuto) **más** el tiempo extra de los silencios:
   - una coma añade una micro-pausa,
   - un punto una pausa media,
   - los **puntos suspensivos** un silencio dramático largo,
   - un salto de línea, una respiración de cambio de escena.
3. **Divide para retención**: si una frase dura más que el máximo por imagen (3,5 s por defecto), la reparte en varias imágenes, intentando cortar justo en las comas. Así "se llena de imágenes" sin que ninguna se quede pegada en pantalla.
4. **Extrae palabras clave** de cada trozo (descartando palabras vacías en español e inglés, priorizando nombres propios) para buscar la foto o vídeo de stock adecuado.

El resultado es una secuencia de *slots* con `start`, `end`, `duration`, `text`, `query` y `keywords`.

---

## Puesta en marcha

Necesitas **Node.js 18 o superior**.

```bash
# 1. Instala dependencias
npm install

# 2. (Opcional) configura tu clave de Pexels
cp .env.example .env
#   edita .env y pega tu PEXELS_API_KEY  (gratis: https://www.pexels.com/api/)

# 3. Arranca la app
npm start
```

Abre <http://localhost:3000>.

> **Sin clave de Pexels** la app funciona igual en **modo demo**: hace todo el análisis y el storyboard, pero muestra placeholders de colores en lugar de fotos reales. Ideal para probar el flujo. En cuanto pongas la clave, las imágenes pasan a ser fotos/vídeos reales de Pexels.

---

## Uso

1. Pega tu guión (o pulsa **Cargar ejemplo**).
2. Ajusta la **velocidad** (palabras/min) y los **segundos máximos por imagen**.
3. Elige **fotos** o **vídeos**.
4. Pulsa **Analizar guión**.

En cada tarjeta del storyboard puedes:

- editar la **duración** (los tiempos de las siguientes imágenes se recalculan solos),
- reescribir la **query** de búsqueda y volver a buscar,
- pulsar **Otra** para pasar al siguiente resultado de stock.

Cuando estés conforme, **Exportar JSON** o **CSV** para llevarte el storyboard con sus tiempos e imágenes a tu editor.

---

## Estructura

```
guionvisual/
├── server.js               # Express: sirve la app + proxy a Pexels (protege la clave)
├── src/
│   └── scriptParser.js      # EL MOTOR: segmentación, tiempos, retención, keywords
├── public/
│   ├── index.html           # interfaz
│   ├── app.js               # une el motor con la búsqueda y pinta el storyboard
│   └── styles.css
├── test/
│   └── scriptParser.test.js # pruebas del motor
├── .env.example
└── package.json
```

## Tests

```bash
npm test
```

---

## Próximos pasos posibles

- Añadir **IA generativa** como fuente alternativa de imágenes (la arquitectura del proxy ya lo permite).
- Exportar directamente a formatos de editor (EDL, CapCut, Premiere).
- Detección de **entidades/emociones** para elegir imágenes con más criterio que las keywords.
- Renderizado a **vídeo `.mp4`** con transiciones.

## Licencia

MIT
