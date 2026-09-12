# Producción 05 — El Estudio Monstruo (Wendell Johnson, 1939)

Video 5 de **Historia Incómoda**. Sale del banco de temas
`canal-youtube/09-banco-temas-cerebro-idiota.md`: el usuario pidió
empezar por los temas marcados ALTA en el testing de oportunidad, y este
es el que encabeza la shortlist (casi sin competencia en video en
español, verificado con búsqueda real). Adelanta en el orden de
producción al experimento de Milgram — la nota original decía que
Milgram pasaba a ser el siguiente después de este, pero la shortlist
final (`09-banco-temas-cerebro-idiota.md`, "Shortlist final recomendada
para video largo") lo reemplazó por el experimento de Landis (1924),
que es además el que ya quedó grabado como gancho de cierre en
`guion.txt`. Milgram queda pendiente de reprogramar más adelante.

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
- `prompts-imagenes.txt` — **99 prompts** fotorrealistas de
  reconstrucción documental, con tiempos reales ya anclados. Historial:
  45 iniciales (antes del audio) → 71 (el usuario avisó que 45 se
  quedaba corto) → 90 (el usuario notó que Stanford tenía 83 para una
  duración casi idéntica, así que se igualó la densidad) → **99 final**,
  ya con el audio real medido: de los 90 planos estimados, 9 duraban más
  de 5s reales y se partieron en dos, exactamente el mismo criterio que
  dejó a Stanford en 83 (75 frases naturales, 8 partidas). Media final
  real: **2,68s por plano** (más rápido que Stanford).

  **Corrección de estilo**: la primera versión pedía look de archivo en
  blanco y negro con viraje sepia. El usuario generó el primer lote en
  Flow y no le convenció — quería algo realista y humano, no una foto
  vieja. Se reescribió el bloque de estilo de los 99 prompts a
  fotografía cinematográfica realista **a color**, con textura de piel y
  detalle humano real (la ambientación de los años treinta queda en la
  ropa/objetos, no en el tratamiento de color). Se evitó escribir
  "sepia" o "blanco y negro" incluso en negativo ("no blanco y negro"),
  porque los generadores de imagen tienden a engancharse con la palabra
  presente en el prompt más que con la negación.
- `segments.json` — 99 escenas con bloque narrativo, cue, texto real y
  **tiempos reales** (`t_start`/`t_end`, anclados por transcripción, ver
  abajo). Cobertura verificada: la concatenación de los 99 textos
  reproduce `guion.txt` palabra por palabra, sin huecos.
- `word_times.json` — mapa palabra→tiempo real de las 845 palabras del
  guión, 97,9% de coincidencia exacta contra la transcripción (mismo
  método y precisión que Stanford, 97,8%).
- `subtitulos.srt` — 99 cues con los tiempos reales, bloques de máximo
  2 líneas de 42 caracteres.
- `hoja-montaje.csv` — 99 planos, formato exacto que espera la
  **Mesa de Montaje** (`kit-produccion/editor-movil.md`): separado por
  punto y coma, con BOM, columnas `Plano;Bloque;Entra;Sale;Duracion
  (s);Escena`, tiempos redondeados a segundo entero (mismo formato y
  redondeo con reconciliación de `scripts/timing_sheet.js`). Un primer
  intento con un formato propio (coma, columnas distintas, tiempos con
  centésimas) fue rechazado por la Mesa de Montaje — este es el que
  acepta. **Es solo para subir y previsualizar**: el render final usa
  los tiempos exactos (con centésimas) de `segments.json`, no los
  redondeados de este CSV.
- `align.py` — script de alineación (guión completo vs. transcripción
  troceada en 18 ventanas de 15s), reutilizable si se regenera el audio.
- `audio.mp3` (no versionado, ver `.gitignore`) — voz David
  (`qRUgOhnxGASxirG4fKjv`), 264,83s (4:24,8), coste 4.824,52 créditos
  (~0,88 USD).
- `imagenes/` — 99 imágenes (`01.jpg`…`99.jpg`), generadas por el usuario en
  Flow a partir de `prompts-imagenes.txt` y subidas a través de la Mesa de
  Montaje (proyecto `vvcxibze5gzv70rwadxf`), de donde se descargaron con
  `read_db` sobre la colección `planos` de ese proyecto.
- `render.js` — monta `video-final.mp4` (no versionado) leyendo los tiempos
  exactos de `segments.json`, no los redondeados de `hoja-montaje.csv`:
  varios planos duran menos de 1s (mínimo real 0,70s) y `montar_video.js`
  solo entiende segundos enteros (`m:ss`), igual que pasó con el Short. Es
  el mismo patrón que `shorts/render_short.js` de Stanford, adaptado a
  1920x1080/25fps. Verificado extrayendo fotogramas en 5 puntos del video
  (0:01, 1:01, 2:03, 3:12, 4:24) y comprobando que imagen y subtítulo
  coinciden exactamente con `segments.json`.
- `seo.md` — títulos, descripción y comentario fijado con las fuentes.

## Cómo se ancló el tiempo real

Mismo método que Stanford y el Short
(`kit-produccion/scripts/sync_desde_transcripcion.md`): `audio.mp3`
troceado en 18 ventanas de 15s con ffmpeg, cada una transcrita por
separado con ElevenLabs Scribe (coste real: 1.454,84 créditos, ~0,26
USD — bastante más barato que estimado, igual que pasó en Stanford),
guión completo alineado contra las 18 transcripciones con
`difflib.SequenceMatcher`: **97,9% de coincidencia exacta**. Las
palabras no reconocidas (sobre todo los nombres propios re-escritos
fonéticamente para la voz, que Scribe normalizó de vuelta a su
ortografía real en la mayoría de los casos) se interpolan entre sus
vecinas ya ancladas.

Con los tiempos reales medidos, **9 de los 90 planos estimados**
resultaron durar más de 5 segundos (máximo real: 7,34s antes de
partir) — se dividieron cada uno en dos planos con un prompt de imagen
adicional, llevando el total a **99 planos**, todos ≤ 4,89s reales,
media 2,68s.

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

1. ~~Generar el audio con la voz del canal.~~ Hecho — `audio.mp3`,
   264,83s, 4.824,52 créditos (~0,88 USD).
2. ~~Medir el audio real y anclar los tiempos.~~ Hecho — 97,9% de
   coincidencia exacta, 1.454,84 créditos de transcripción (~0,26 USD).
3. ~~Generar la hoja de montaje con tiempos reales.~~ Hecho —
   `hoja-montaje.csv` y `subtitulos.srt`, 99 planos.
4. ~~El usuario genera las 99 imágenes en Flow/Imagen.~~ Hecho —
   subidas a la Mesa de Montaje y descargadas a `imagenes/`.
5. ~~Render final.~~ Hecho — `render.js`, `video-final.mp4` (78 MB,
   264,84s, 1920x1080 @25fps), verificado por fotogramas contra
   `segments.json`.
6. ~~Miniatura.~~ Hecha — ver `miniatura/README.md`: reutiliza
   `imagenes/03.jpg` (Mary Tudor), titular "MONSTRUO" + "EXPERIMENTO CON
   NIÑOS" + caja roja "OCULTO 62 AÑOS".
7. Subida a YouTube.
