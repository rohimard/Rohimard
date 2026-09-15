# Producción 02 — El déjà vu (Wilder Penfield)

- `guion.txt` — guión de voz en off, 4.673 caracteres.
- `guion-voz.txt` — **el que se pega en ElevenLabs**: mismo texto con la
  ortografía adaptada a voz (pausas por párrafo, números en palabras,
  extranjerismos respelleados). Ver `../../kit-produccion/references/voz-natural.md`.
- `audio.mp3` — narración de ElevenLabs. **4:52.5 (292,47 s)**, medidos
  con `mp3_duration.js`.
- `segments.json` — guión repartido en 66 escenas (bloque/cue/texto).
  Cobertura verificada: la concatenación de las escenas reproduce el
  guión completo, sin perder ni una frase. El reparto se calcula
  minimizando la escena más larga (búsqueda binaria sobre el tamaño
  máximo), para que ningún plano se pase de 8s.
- `prompts-imagenes.txt` — 66 prompts fotorrealistas, uno por escena.
  Personaje recurrente: mujer de unos 30 años, cara corriente.
- `hoja-montaje.csv` / `.txt` — hoja de montaje **cuadrada al audio
  real** (292 s, 66 planos, ninguno supera 8s).
- `subtitulos.srt` — 82 subtítulos **anclados a las pausas reales del
  audio**, no estimados desde el texto. 55 de los 82 (67%) caen sobre
  una pausa medida. Verificado: sin solapamientos, ninguna línea de más
  de 42 caracteres, ningún bloque de más de 2 líneas.
- `miniatura/` — la de lanzamiento (`ERROR` / NO ES UNA / PREMONICIÓN) y
  la de rotación a las 48h (`¿YA VIVISTE ESTO ANTES?`).
- `seo.md` — títulos, emparejamiento con cada miniatura, descripción y
  la nota de precisión del tema.
- `escenas/` — dos imágenes de prueba de generación (cocina,
  supermercado). El resto del B-roll está sin generar.

## Regenerar

```
node ../../kit-produccion/scripts/mp3_duration.js audio.mp3
node ../../kit-produccion/scripts/timing_sheet.js segments.json 292.47 3 hoja-montaje
node ../../kit-produccion/scripts/srt_align.js guion.txt audio.mp3 subtitulos.srt
```

## Precisión (crítica en este video)

El tema llegó formulado como *"el déjà vu es epilepsia leve del lóbulo
temporal"*. **Eso es falso** y el guión lo corrige explícitamente: en una
persona sana el déjà vu no es epilepsia ni síntoma de nada. La relación
real es la inversa — en algunas epilepsias del lóbulo temporal aparece
como aura previa a una crisis, y por eso esos pacientes fueron la vía
por la que se estudió el fenómeno. Ver `seo.md` para el detalle.
