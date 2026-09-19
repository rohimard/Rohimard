# Producción 03 — El mito del superviviente de ocho catástrofes

## Origen del tema y por qué cambió

El usuario propuso el caso de "Reinhold Boyer": un hombre que habría
sobrevivido a un puente de tren caído, un incendio de teatro, una
explosión minera, un terremoto, el Titanic (canceló su billete), un
huracán y una inundación.

Verificado antes de escribir una sola línea: **esa persona no existe en
ningún registro**. Coincide con el patrón de una leyenda urbana centenaria
ya documentada — "Frank Tower", un fogonero inventado que Ripley's
Believe It or Not llegó a publicar como superviviente real de tres
naufragios distintos, y que se originó al deformar la historia de un
superviviente real del Lusitania (Francis Toner) al que un periódico de
la época atribuyó, sin pruebas, dos naufragios más.

Publicar la historia de Reinhold Boyer como hecho habría contradicho
directamente la promesa del canal ("historias reales que parecen
inventadas" — no al revés). Se decidió, con el usuario, convertir el
propio mito en el tema del video: se cuenta como gancho, se desmonta con
el precedente de Frank Tower, y cierra con el caso real y verificable de
**Violet Jessop**, tripulante que sobrevivió al accidente del Olympic
(1911), al hundimiento del Titanic (1912) y al del Britannic (1916) — los
tres barcos de la misma clase.

## Archivos

- `guion.txt` — 4.923 caracteres, 16 párrafos.
- `guion-voz.txt` — 4.916 caracteres, con la ortografía adaptada a voz
  (extranjerismos respelleados, sin dígitos ni dos puntos).
- `prompts-imagenes.txt` — 61 prompts fotorrealistas. Motivo visual:
  estética de investigación documental (manos sobre archivos, listas de
  pasajeros, fotografías de época) en vez de dramatizar a las víctimas de
  cada catástrofe — ninguna imagen muestra personas identificables ni
  escenas de muerte explícitas.
- `segments-placeholder.json` — 61 escenas con su rótulo y bloque
  narrativo. El campo `text` se rellena cuando llegue el audio: ese es el
  paso donde se reparte el guión real entre las escenas, no antes.
- `seo.md` — títulos, miniaturas, descripción y comentario fijado con las
  fuentes de verificación.

## Pendiente (requiere el audio)

1. Generar `audio.mp3` en ElevenLabs a partir de `guion-voz.txt`.
2. Medir con `mp3_duration.js`.
3. Rellenar `segments-placeholder.json` con el texto real repartido por
   posición de palabra (no por proporción de caracteres — ver
   `sync_desde_transcripcion.md`, el método que corrigió el desfase del
   video 2).
4. Trocear el audio y transcribir con ElevenLabs Scribe para anclar
   subtítulos y cortes de plano a los tiempos reales, desde el principio
   esta vez.
5. Generar los capítulos de `seo.md` con los tiempos ya cuadrados.

## Precisión

Antes de publicar, sería bueno contrastar dos números que el guión da por
buenos sin cita directa: la cifra de mil trescientos muertos en la
explosión minera (se corresponde aproximadamente con el desastre de
Courrières, 1906) y la de doscientos mil muertos en el terremoto (se
corresponde con Mesina, 1908). El guión no nombra ninguno de los dos
sucesos por su nombre a propósito, porque no hay evidencia de que
"Reinhold Boyer" — ni nadie con ese perfil de viajes — estuviera
realmente en ellos; son las catástrofes reales que la leyenda recicla,
no hechos verificados sobre una persona real.
