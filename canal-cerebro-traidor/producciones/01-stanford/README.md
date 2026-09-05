# Producción 01 — El experimento de la cárcel de Stanford (mito/realidad)

Primer video del canal **Cerebro Traidor**. Elegido de la lista de 56 temas
del banco (`../../02-banco-de-temas.md`) tras verificar oportunidad real en
YouTube: tema #44, oportunidad **ALTA** — la narrativa de "el experimento
más citado de la psicología estaba manipulado" tiene respaldo documental
fuerte en inglés pero apenas está explotada en YouTube en español.

## Por qué este ángulo

El experimento de Stanford (Zimbardo, 1971) es uno de los casos más
citados en psicología para explicar que "cualquiera se vuelve un monstruo
con poder". El video lo cuenta primero como se enseña habitualmente, y
luego lo desmonta con la investigación real de Thibault Le Texier sobre
las grabaciones desclasificadas del propio archivo de Stanford (2018) —
mismo tratamiento honesto de "mito vs. realidad" que se usó con Frank
Tower en Historia Incómoda. El giro final no es "todo es mentira": es que
el mecanismo real (obedecer un guion social implícito sin que nadie dé la
orden explícita) es más inquietante que el mito, y conecta directamente
con el canal ("tu cerebro te traiciona sin que lo notes").

## Archivos

- `guion.txt` — 5.006 caracteres, ortografía correcta (lectura/subtítulos).
- `guion-voz.txt` — 4.979 caracteres, adaptado a pronunciación (Zimbárdo,
  Stánford, Tibó Le Teksié; años en letras; sin dos puntos ni símbolos).
- `prompts-imagenes.txt` — 40 prompts fotorrealistas de reconstrucción
  documental. Ningún guardia/prisionero es una persona real identificable
  (son reconstrucciones genéricas, sin nombre ni rasgos de Zimbardo o de
  ningún participante real) — mismo criterio de precaución que Frank Tower.
- `segments-placeholder.json` — 40 escenas con rótulo y bloque narrativo
  (`EL_DILEMA`, `EL_EXPERIMENTO`, `LA_VERSION_OFICIAL`, `FAMA_DEL_ESTUDIO`,
  `LA_GRIETA`, `EL_MECANISMO_REAL`, `APLICACION_COTIDIANA`, `CIERRE`). El
  campo `text` se rellena con el guión real una vez exista el audio,
  siguiendo el método de `sync_desde_transcripcion.md` **desde el
  principio** (no repetir el error de reparto por proporción de video 2).
- `seo.md` — títulos, descripción y comentario fijado con las fuentes.
- `miniatura/` — ver su propio README.

## Pendiente (requiere el audio)

1. Pegar `guion-voz.txt` en ElevenLabs y traer `audio.mp3`.
2. Medir con `mp3_duration.js`.
3. Trocear y transcribir con ElevenLabs Scribe para anclar tiempos reales
   (palabra por palabra) y contenido real de cada escena — igual método
   que corrigió el desfase de video 2 en Historia Incómoda.
4. Generar `hoja-montaje.csv`/`.txt` y `subtitulos.srt` con esos tiempos.
5. Cuadrar los timestamps de capítulos en `seo.md`.
6. Generar las 40 imágenes de `prompts-imagenes.txt` (proponer un lote de
   prueba pequeño primero, no generar las 40 de golpe, mismo criterio de
   conciencia de costo que en Historia Incómoda).
