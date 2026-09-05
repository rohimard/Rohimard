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

## Audio

`audio.mp3` (no versionado en git, ver `.gitignore`) — generado con
ElevenLabs, voz **David - Energetic, Deep and Pleasant**
(`qRUgOhnxGASxirG4fKjv`), pedida explícitamente por el usuario por nombre
— es la misma voz de referencia que ya cita `kit-produccion/references/guion.md`
para el perfil del narrador del canal. 4:39.7 min (279,75 s), coste 4.978
créditos (~0,91 USD).

Primer intento descartado: voz "SANDMOR" (cálida/cinematográfica), el
usuario pidió explícitamente cambiar a David antes de aprobarla.

## Pendiente

1. Trocear el audio y transcribir con ElevenLabs Scribe para anclar
   tiempos reales (palabra por palabra) y contenido real de cada escena
   — igual método que corrigió el desfase de video 2 en Historia
   Incómoda.
2. Generar `hoja-montaje.csv`/`.txt` y `subtitulos.srt` con esos tiempos.
3. Cuadrar los timestamps de capítulos en `seo.md`.
4. Generar las 40 imágenes de `prompts-imagenes.txt` (proponer un lote de
   prueba pequeño primero, no generar las 40 de golpe, mismo criterio de
   conciencia de costo que en Historia Incómoda).
