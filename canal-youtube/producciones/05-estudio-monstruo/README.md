# Producción 05 — El Estudio Monstruo (Wendell Johnson, 1939)

Video 5 de **Historia Incómoda**. Sale del banco de temas
`canal-youtube/09-banco-temas-cerebro-idiota.md`: el usuario pidió
empezar por los temas marcados ALTA en el testing de oportunidad, y este
es el que encabeza la shortlist (casi sin competencia en video en
español, verificado con búsqueda real). Adelanta en el orden de
producción al experimento de Milgram, que sigue confirmado pero pasa a
ser el siguiente después de este.

## Por qué este ángulo

En 1939, Wendell Johnson (Universidad de Iowa) quiso probar que la
tartamudez no es un defecto físico sino algo que se instala cuando te
tratan como si lo tuvieras. Usó a veintidós niños de un orfanato de
Davenport sin su consentimiento ni el de nadie que los protegiera: a la
mitad los trataba con elogios, a la otra mitad la humillaba por cada
palabra dudada, aunque casi ninguno tartamudeara de verdad. El estudio
quedó oculto más de sesenta años hasta que salió a la luz en 2001, y la
Universidad de Iowa pidió disculpas públicas. Mismo tratamiento honesto
de "esto pasó de verdad y es peor de lo que crees" que ya usó el canal
con Stanford y Frank Tower — aquí con una ética todavía más oscura
porque las víctimas eran niños sin capacidad de consentir.

## Cuidado ético (importante)

Los sujetos reales eran menores de edad, huérfanos, sin nombres
ampliamente publicados salvo referencias generales de prensa. El guión
no inventa nombres, edades exactas ni citas textuales de los niños —
solo usa lo verificable (el mecanismo del experimento, el descubrimiento
en 2001, la disculpa pública). Los prompts de imágenes evitan primeros
planos de angustia infantil: la cámara sugiere la emoción con el
entorno, las manos o el punto de vista, nunca con el rostro de un niño
en plano cerrado — ver la nota al principio de `prompts-imagenes.txt`.

## Archivos

- `guion.txt` — 4.814 caracteres, ortografía correcta (lectura/subtítulos).
- `guion-voz.txt` — 4.826 caracteres, adaptado a pronunciación (Uéndel
  Yónson, Meri Túdor, Dávenport, Áiowa; números en letras).
- `prompts-imagenes.txt` — 45 prompts fotorrealistas de reconstrucción
  documental, look de fotografía de archivo en blanco y negro/sepia de
  los años treinta (distinto del viraje cálido setentero de Stanford),
  con transición a color moderno neutro a partir de la escena 26
  (descubrimiento en 2001 en adelante) y en el bloque de conexión con el
  espectador actual.
- `segments.json` — 45 escenas con bloque narrativo, cue corto y texto
  real, en el mismo formato que las producciones anteriores. Tiempos
  reales pendientes de anclar cuando exista el audio.
- `seo.md` — títulos, descripción y comentario fijado con las fuentes.

## Guión: estructura

Gancho en segunda persona (eres un niño de seis años en el orfanato) →
contexto (quién era Johnson y por qué le obsesionaba el tema) → el
experimento (los dos grupos, Mary Tudor como ejecutora) → las
consecuencias reales sobre los niños → el descubrimiento en 2001 y la
disculpa → la revelación (la hipótesis de Johnson tenía razón, solo que
la usó para hacer daño) → conexión universal (las etiquetas que te
ponen un profesor o un jefe) → cierre con gancho al próximo video
(el experimento de Landis, 1924).

## Pendiente

1. Generar el audio con la voz del canal (David,
   `qRUgOhnxGASxirG4fKjv`) — coste estimado ~0,90 USD por la longitud
   del guión, similar a Stanford. Pendiente de confirmación antes de
   generar.
2. Medir el audio real y anclar los tiempos de `segments.json`
   (troceo + transcripción con ElevenLabs Scribe, mismo método que
   los videos anteriores).
3. Generar la hoja de montaje con tiempos reales.
4. El usuario genera las 45 imágenes en Flow/Imagen a partir de
   `prompts-imagenes.txt` y las trae de vuelta.
5. Miniatura: estrategia ya esbozada en `seo.md`, pendiente de imagen
   base y montaje del texto.
6. Render final y subida a YouTube.
