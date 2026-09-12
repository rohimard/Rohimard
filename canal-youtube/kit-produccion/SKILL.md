---
name: youtube-video-kit
description: >-
  Kit de producción para vídeos narrados de YouTube (faceless / voz en off).
  Arranca desde un TEMA o desde un GUIÓN + AUDIO (mp3) y entrega, listo para usar:
  el GUIÓN de voz en off (4.500–5.000 caracteres, listo para pegar en ElevenLabs,
  con la voz del canal) cuando solo hay tema; prompts de imágenes fotorrealistas
  para Flow/Imagen mapeados frase por frase; la miniatura (estrategia SEO, prompt
  de imagen base y montaje del texto en PNG cuando el usuario devuelve la imagen);
  la hoja de montaje con tiempos cuadrados al segundo con la duración real del
  audio; y títulos A/B + descripción SEO. Usa este skill SIEMPRE que el usuario dé
  un tema para un vídeo, o aporte un guión y/o un audio, y pida el guión, prompts
  de imágenes, los tiempos/hoja de montaje, la miniatura o el SEO — aunque no lo
  pida todo ni nombre el skill. También con "escríbeme el guión de un vídeo sobre
  X", "dame el guión para ElevenLabs", "tengo el guión y el audio", "hazme las
  imágenes", "móntame la miniatura" o "dame los tiempos para editar".
---

# YouTube Video Kit

Convierte un **guión + audio** en todo lo necesario para montar un vídeo narrado de
YouTube con imágenes fotorrealistas. Está pensado para un creador que trabaja las
imágenes en **Flow/Imagen de Google** y edita en CapCut/Premiere, así que la salida es
directa y copiable, sin jerga.

## Entradas y salidas

**Entradas (cualquiera de estas):**
- solo un **tema** (p. ej. "por qué no puedes ahorrar en España") → el skill escribe primero
  el guión;
- el **guión** ya escrito (texto de voz en off);
- el **audio** (normalmente `.mp3` de ElevenLabs), normalmente junto al guión.
Ver "Si falta algo" para cada combinación.

**Salidas (hasta 5 entregables):**
0. Guión de voz en off, 4.500–5.000 caracteres, listo para ElevenLabs (solo si se parte de
   un tema).
1. Prompts de imágenes fotorrealistas, uno por plano, mapeados a la frase que se narra.
2. Miniatura: estrategia + prompt de imagen base + montaje del texto en PNG/JPG.
3. Hoja de montaje con In/Out por plano, cuadrada a la duración real del audio.
4. Títulos (2–3, para A/B) + descripción SEO.

Entrega todo lo que el punto de partida permita salvo que el usuario pida solo una parte.
Si pide solo una (p. ej. "dame los tiempos"), haz esa y ofrece el resto.

## Flujo de trabajo

Sigue los pasos en orden. Los detalles de cada área están en `references/` — léelos cuando
llegues a ese paso, no todos de golpe.

### Paso 0 — Preparar el entorno

Los scripts van en Node (ya disponible). Para la miniatura hace falta Chromium headless:
`npm install playwright-core` una vez (Chromium suele estar preinstalado en estos entornos;
el script lo localiza solo). Si el guión llega como texto pegado, guárdalo en un archivo
para poder segmentarlo con calma.

### Paso G — Guión (solo si el usuario parte de un tema)

Si aún no hay guión, escríbelo tú a partir del tema. Lee `references/guion.md` para el rol,
la voz, la estructura de 5 bloques y el formato. **Por defecto, el guión va SIN etiquetas de
emoción** (texto limpio para ElevenLabs); solo añádelas si el usuario las pide. El guión
debe medir **4.500–5.000 caracteres**; guárdalo en `guion.txt` y verifica el conteo
de puntos de código con el one-liner de esa guía, ajustando hasta caer en rango. Entrégalo
en un bloque copiable, en texto corrido sin markdown (listo para pegar en ElevenLabs).

**Además del guión, entrega `guion-voz.txt`**: el mismo texto adaptado a cómo
debe sonar (párrafos agrupados para no generar pausas de más, extranjerismos
reescritos fonéticamente, números en letras). Lee `references/voz-natural.md`.
El de voz es el que se pega en ElevenLabs; el otro es el que alimenta los
subtítulos.

Luego el usuario crea el audio en ElevenLabs y lo trae de vuelta. Mientras tanto, ya puedes
hacer los Pasos 3 (imágenes) y 6 (SEO) desde el guión; los Pasos 1 y 4 (audio y tiempos)
esperan al audio. Si el usuario quiere avanzar sin audio, ver "Si falta algo".

### Paso 1 — Medir el audio

`node scripts/mp3_duration.js <audio.mp3>` → anota `DURATION_SECONDS`. Este número manda
sobre todos los tiempos. (El script existe porque el ffmpeg de estos entornos no decodifica
MP3; lee la cabecera directamente. Para `.wav`/`.m4a`, usa `ffprobe` si está disponible.)

### Paso 2 — Segmentar el guión

Divide el guión en escenas/planos **en el orden del texto**, de modo que **cada palabra
pertenezca a una sola escena** (así no quedan huecos sin imagen). A cada escena dale:
`id`, `block` (bloque narrativo: GANCHO / DATOS / POR QUÉ / SOLUCIÓN / CTA, o los que pida
el guión), `cue` (frase corta que la identifica) y `text` (el fragmento exacto de narración).

Un párrafo largo con varias ideas se parte en 2–3 planos (más imágenes = más dinamismo).
Apunta a una media de 4–7 s por plano, y **que ninguno pase de ~8 s**: tras generar la
tabla (Paso 4), si algún plano sale de más de ~8 s, pártelo en dos y vuelve a generar (ver
la regla en `references/timing.md`). Para 4–5 min de audio suelen salir ~45 planos. Guarda
todo en `segments.json` (forma en `references/timing.md`). **Comprueba que ninguna frase
del guión se quedó sin escena** — es el error más típico.

### Paso 3 — Prompts de imágenes

Lee `references/image-prompts.md`. Para cada escena escribe un prompt **fotorrealista**,
en español, que ilustre literalmente su frase, con el bloque de estilo base y el personaje
recurrente donde toque. Formato 16:9, **sin texto en la imagen** (los números van animados
en edición). Preséntalos numerados igual que los planos, listos para copiar en Flow. Si el
usuario genera **imágenes fijas**, omite el movimiento de cámara; si genera **vídeo (Veo)**,
añade un movimiento de cámara concreto por plano.

### Paso 4 — Hoja de montaje

Lee `references/timing.md`. Con `segments.json` y los segundos del Paso 1:
`node scripts/timing_sheet.js segments.json <audio_seconds> [min_seconds]`. Devuelve la
tabla en Markdown (In/Out/Dur por bloque) sumando exactamente la duración del audio.
Preséntala y añade las notas de montaje (Ken Burns en planos largos, anclar golpes a la
onda, números animados en los planos de datos). Recuerda: es exacta a ±1–2 s; el ajuste
fino se hace sobre la onda en el editor.

### Paso 5 — Miniatura

Lee `references/thumbnail.md`. Es un flujo de dos partes:
- **(a) Ahora:** entrega la **estrategia** (por qué), el **prompt de la imagen base sin
  texto** (sujeto con emoción extrema + conflicto visual + espacio negativo para el texto)
  y **2–3 variantes de titular** para A/B.
- **(b) Cuando el usuario devuelva la imagen base generada:** móntale el texto con
  `node scripts/render_thumbnail.js config.json` (config en `references/thumbnail.md`).
  Antes de renderizar, mira la imagen para poner `side` en el lado del espacio negativo.
  Salen PNG (edición) y JPG (< 2 MB, subir). Envíaselos con la herramienta de archivos.

En remoto/móvil, la descarga desde la tarjeta de archivo a veces falla; si el usuario no
puede guardarla, publica una página-artifact simple con la imagen (un `<img>` con la imagen
embebida como data URI) para que la abra en el navegador y la guarde con "mantener pulsada".

### Paso 6 — SEO

Lee `references/seo.md`. Da 2–3 **títulos** (A/B, < 60 caracteres, palabra clave al
principio) y una **descripción** (primera línea que indexa + cuerpo + CTA). Recuerda la
regla: título y miniatura no dicen lo mismo, se complementan.

## Si falta algo

- **Solo tema:** haz el Paso G (guión). Después ofrece seguir ya con Pasos 3, 5 y 6 desde el
  guión, y deja los tiempos (Pasos 1 y 4) para cuando traiga el audio de ElevenLabs.
- **Solo guión, sin audio:** haz Pasos 2, 3, 5 y 6, y en la hoja de montaje usa duraciones
  sugeridas avisando de que se cuadrarán cuando llegue el audio. Ofrece rehacerla al segundo
  en cuanto lo mande.
- **Solo audio, sin guión:** no hay transcripción fiable en el entorno; pide el texto del
  guión (es rápido para el usuario) en vez de adivinarlo.
- **9:16 (Shorts):** todo igual, cambiando el formato a 9:16 en los prompts y la miniatura.

## Estilo de entrega

Habla claro y sin jerga técnica: el usuario es creador, no programador. Presenta cada
entregable en bloques copiables. Al final, ofrece los pasos que aún no se hayan hecho
(p. ej. "cuando generes la imagen base de la miniatura, te monto el texto"). No inventes
cifras: los números que uses en miniatura/título salen del guión.
