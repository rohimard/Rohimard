# Producción 01 — "El hombre que mató al 10% de la humanidad" (Gengis Kan)

Entregables de este video, generados con `kit-produccion/` (ver
`../05-kit-de-produccion.md` para el rol del narrador adaptado a historia).

- `guion.txt` — **versión 2**, guión de voz en off, 4.988 caracteres (dentro
  del rango 4.500-5.000), listo para pegar en ElevenLabs.
- `guion-v1.txt` — primera versión, conservada como referencia.
- `segments.json` — guión segmentado en 78 escenas (bloque/cue/texto).
  Cobertura verificada automáticamente: la concatenación de las escenas
  reproduce el guión completo, sin huecos. Ningún plano supera los 8s.
- `prompts-imagenes.txt` — 78 prompts fotorrealistas listos para copiar en
  Flow/Imagen, uno por escena, formato imagen fija (sin movimiento de
  cámara). Personaje recurrente: guerrero mongol genérico (representación
  histórica, no un retrato de una persona real identificable).
- `audio.mp3` — narración de ElevenLabs. **5:39.9 (339,93 s)**, medidos con
  `mp3_duration.js`.
- `hoja-montaje.md` / `.csv` / `.txt` — hoja de montaje **definitiva,
  cuadrada al audio real** (340 s, 78 planos, ninguno supera 8s), con las
  notas de montaje del video: números animados, cortes anclados a la onda,
  bucle visual de la caja y transiciones. Si se regenera el audio:
  `node ../../kit-produccion/scripts/mp3_duration.js audio.mp3` y luego
  `node ../../kit-produccion/scripts/timing_sheet.js segments.json <segundos> 3 hoja-montaje`.
- `miniatura.md` + `miniatura.jpg` / `-b` / `-c` — miniatura montada en tres
  variantes para A/B, sobre `base.jpg`. Previews a tamaño de feed en
  `test-feed*.png`.
- `seo.md` — títulos A/B **emparejados con cada miniatura**, descripción y
  capítulos con los tiempos reales.

## Precisión histórica (v2 — corregida)

La v2 del guión corrige tres cosas que la mayoría de los videos del tema
hacen mal, y que son las que más comentarios correctivos generan:

1. **Atribución de la cifra.** Los 37-60 millones son de **las conquistas
   mongolas en conjunto**, no de la vida de Gengis Kan. El guión lo dice así.
2. **Cronología.** Gengis Kan murió en 1227; Kiev fue arrasada en 1240 y
   Bagdad destruida en 1258, bajo sus descendientes. En vez de esconder ese
   desfase, el guión lo convierte en el momento más fuerte del video ("la
   máquina siguió sola").
3. **El dato genético.** El estudio de 2003 identificó un linaje del
   cromosoma Y e **hipotetizó** su vínculo con Gengis Kan; sigue siendo
   discutido. El guión lo presenta explícitamente como hipótesis.

Aun así, contrasta las cifras exactas que aparezcan en pantalla y en la
miniatura con una fuente seria antes de publicar, como pide la regla de
rigor del kit.
