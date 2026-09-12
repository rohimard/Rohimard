# Producción 04 — El experimento de la cárcel de Stanford (mito/realidad)

Video 4 de **Historia Incómoda**. El tema salió de una investigación de
oportunidad hecha sobre un banco de 56 temas de neurociencia/psicología
(pensado en un inicio para un canal aparte que finalmente no se lanzó por
separado — se decidió publicar este video en Historia Incómoda en su
lugar): tema #44, oportunidad **ALTA** — la narrativa de "el experimento
más citado de la psicología estaba manipulado" tiene respaldo documental
fuerte en inglés pero apenas está explotada en YouTube en español.

## Por qué este ángulo

El experimento de Stanford (Zimbardo, 1971) es uno de los casos más
citados en psicología para explicar que "cualquiera se vuelve un monstruo
con poder". El video lo cuenta primero como se enseña habitualmente, y
luego lo desmonta con la investigación real de Thibault Le Texier sobre
las grabaciones desclasificadas del propio archivo de Stanford (2018) —
mismo tratamiento honesto de "mito vs. realidad" que ya usó Historia
Incómoda con Frank Tower. El giro final no es "todo es mentira": es que
el mecanismo real (obedecer un guion social implícito sin que nadie dé la
orden explícita) es más inquietante que el mito — tu comportamiento
cambia con un uniforme, un cargo o un grupo sin que tú lo decidas.

## Archivos

- `guion.txt` — 5.006 caracteres, ortografía correcta (lectura/subtítulos).
- `guion-voz.txt` — 4.979 caracteres, adaptado a pronunciación (Zimbárdo,
  Stánford, Tibó Le Teksié; años en letras; sin dos puntos ni símbolos).
- `prompts-imagenes.txt` — **83 prompts** fotorrealistas de reconstrucción
  documental, ya con tiempos reales verificados (ver más abajo). Ningún
  guardia/prisionero es una persona real identificable (son
  reconstrucciones genéricas, sin nombre ni rasgos de Zimbardo ni de
  ningún participante real) — mismo criterio de precaución que Frank
  Tower.
- `segments.json` — **83 escenas finales**, cada una con bloque narrativo,
  texto real y **tiempo de inicio/fin real** (`t_start`/`t_end`, en
  segundos, anclados por transcripción — ver abajo). Sustituye a
  `segments-placeholder.json`.
- `word_times.json` — el mapa palabra→tiempo completo de las 873 palabras
  del guión (`raw`, `tiempo`), producido por la alineación contra la
  transcripción. 97,8% de coincidencia exacta.
- `hoja-montaje.csv` / `.txt` — 83 planos con tiempos reales, formato
  compatible con `kit-produccion/scripts/montar_video.js`.
- `subtitulos.srt` — 83 cues ancladas a los mismos tiempos reales, en
  bloques de máximo 2 líneas de 42 caracteres (verificado carácter por
  carácter, no por bytes — cuidado con `awk length()` en textos con
  tildes, cuenta bytes UTF-8 y da falsos positivos).
- `seo.md` — títulos, descripción y comentario fijado con las fuentes.
- `miniatura/` — ver su propio README.

## Audio

`audio.mp3` (no versionado en git, ver `.gitignore`) — generado con
ElevenLabs, voz **David - Energetic, Deep and Pleasant**
(`qRUgOhnxGASxirG4fKjv`), pedida explícitamente por el usuario por nombre
— es la misma voz de referencia que ya cita `kit-produccion/references/guion.md`
para el perfil del narrador del canal. 4:39.7 min (279,75 s), coste 4.978
créditos (~0,91 USD).

Primer intento descartado: voz "SANDMOR" (cálida/cinematográfica), el
usuario pidió explícitamente cambiar a David antes de aprobarla.

## Cómo se ancló el tiempo real (troceo + transcripción)

Siguiendo `kit-produccion/scripts/sync_desde_transcripcion.md`:

1. `audio.mp3` (279,75 s) troceado en 19 ventanas de 15 s con ffmpeg
   (`-f segment`).
2. Cada ventana subida y transcrita por separado con ElevenLabs Scribe
   (19 transcripciones × ~5 créditos = ~96 créditos, ~0,017 USD — mucho
   más barato que estimado inicialmente porque el precio real de Scribe
   por esta duración es bajo).
3. Guión completo (873 palabras) alineado contra las 865 palabras
   transcritas con `difflib.SequenceMatcher`: **97,8% de coincidencia
   exacta**. Cada palabra reconocida recibe su tiempo real (posición
   dentro de su ventana de 15s); las palabras no reconocidas se
   interpolan entre sus vecinas más cercanas ya ancladas.
4. Como el `text` de cada una de las 75 escenas ya era el guión real
   partido en orden (no una etiqueta adivinada aparte), este paso solo
   necesitó **asignar tiempo**, no volver a verificar contenido — se
   evitó desde el origen el problema que tuvo el video 2.
5. Con los tiempos reales medidos, **8 de las 75 escenas** resultaron
   durar más de 5 segundos (máximo real: 6,38s) — se dividieron cada
   una en dos planos con un prompt de imagen adicional (continuación
   visual de la misma escena), llevando el total a **83 planos**,
   todos ≤ 4,96s reales, media 3,37s.
6. `hoja-montaje.csv`/`.txt` y `subtitulos.srt` generados directamente
   desde esos 83 tiempos reales — nada estimado.

## Pendiente

1. ~~Cuadrar los timestamps de capítulos en `seo.md` con la hoja real.~~
   Hecho — capítulos ya cuadrados contra `segments.json`.
2. ~~Generar las 83 imágenes de `prompts-imagenes-listos.txt`.~~ Hecho —
   el usuario las generó por su cuenta y las subió vía la Mesa de Montaje
   (`kit-produccion/editor-movil.md`); recuperadas de la base del
   artefacto y guardadas en `imagenes/01.jpg`…`83.jpg`.
3. ~~Renderizar el video final con `montar_video.js`.~~ Hecho —
   `video-final.mp4` (1920x1080, 280s, 85 MB), generado con
   `render.json` a partir de `hoja-montaje.csv`, `audio.mp3` y
   `subtitulos.srt`, todos con tiempos reales. Pendiente solo: subir a
   YouTube con el `seo.md` y la miniatura de `miniatura/`.
