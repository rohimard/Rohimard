# Producción 01 — "El hombre que mató al 10% de la humanidad" (Gengis Kan)

Entregables de este video, generados con `kit-produccion/` (ver
`../05-kit-de-produccion.md` para el rol del narrador adaptado a historia).

- `guion.txt` — guión de voz en off, 4.880 caracteres (dentro del rango
  4.500-5.000), listo para pegar en ElevenLabs.
- `segments.json` — guión segmentado en 63 escenas (bloque/cue/texto),
  cobertura completa verificada.
- `prompts-imagenes.txt` — 63 prompts fotorrealistas listos para copiar en
  Flow/Imagen, uno por escena, formato imagen fija (sin movimiento de
  cámara). Personaje recurrente: guerrero mongol genérico (representación
  histórica, no un retrato de una persona real identificable).
- `tiempos-sugeridos.md` / `.csv` / `.txt` — hoja de montaje con duración
  **estimada** (329s / 5:29, calculada a ~155 palabras/min). **Se debe
  regenerar con la duración real** en cuanto exista el audio de ElevenLabs:
  `node ../../kit-produccion/scripts/mp3_duration.js audio.mp3` y luego
  `node ../../kit-produccion/scripts/timing_sheet.js segments.json <segundos> 3 tiempos-sugeridos`.
- `miniatura.md` — estrategia, prompt de imagen base y 3 variantes de
  titular para la miniatura.
- `seo.md` — títulos A/B, descripción y capítulos.

## Verificar antes de publicar

La cifra central del video (37-60 millones de muertos, ~10% de la
población mundial del siglo XIII) es una **estimación historiográfica
citada habitualmente**, pero sigue siendo objeto de debate académico según
la fuente y el método de conteo — el guión ya lo señala como estimación
("los historiadores calculan"), pero conviene contrastar la cifra exacta
que se use en pantalla/miniatura con al menos una fuente seria antes de
publicar, como pide la regla de rigor del kit.
