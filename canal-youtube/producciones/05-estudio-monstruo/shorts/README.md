# Short — resumen del video 5 de Historia Incómoda (El Estudio Monstruo)

Short de YouTube (9:16, 62.3s), guión reescrito desde cero para el
formato — no es un recorte del video completo.

## Por qué se rehizo distinto al de Stanford

El usuario vio el short de Stanford (121 palabras, 16 planos, 40.4s) y
lo encontró "un poco aburrido": pidió uno "más interesante, más datos,
más información, que la gente quiera ver el video completo". Cambios
respecto al de Stanford:

- **Más denso en datos concretos**: 1939, Universidad de Iowa, 22
  niños, dos grupos, el nombre de Wendell Johnson y que él mismo
  tartamudeaba de niño, 62 años oculto, 2001, seis décadas de daño,
  disculpa pública — casi cada frase mete un dato nuevo en vez de
  parafrasear.
- **Más planos**: 24 contra los 16 de Stanford para una duración
  similar (62.3s vs 40.4s) — media 2.6s por plano, ninguno por encima
  de 3.8s, para que el ritmo no decaiga en ningún tramo.
- **Estructura**: gancho en segunda persona (igual que el video
  completo) → revelación rápida de que es un experimento → ráfaga de
  datos duros → el giro (su hipótesis tenía razón, la usó para
  destruir) → conexión universal → CTA al video completo.

`guion-short.txt` — 182 palabras. `guion-voz-short.txt` — misma
adaptación fonética que el video completo (Uéndel Yónson, Áiowa).

## Audio

`audio.mp3` (no versionado, ver `.gitignore`) — voz David
(`qRUgOhnxGASxirG4fKjv`, la misma del canal), 62.35s, coste 1.047,90
créditos (~0,19 USD).

## Cómo se ancló el tiempo real

Mismo método que el video completo y el short de Stanford: audio
troceado en 13 ventanas de 5s (más finas que las 15s del video largo,
porque este guión tiene frases cortas seguidas), cada una transcrita
por separado con ElevenLabs Scribe, guión completo alineado contra las
13 transcripciones con `difflib.SequenceMatcher`: **94,0% de
coincidencia exacta** (más bajo que el 97-98% habitual porque el
guión escribe "1939", "62" y "2001" con dígitos para más impacto visual
en el propio texto, y Scribe los transcribe igual como dígitos sueltos
que no calzan palabra por palabra contra join de dígito+dígito en
`difflib`; las palabras sin ancla exacta se interpolan igual que
siempre entre sus vecinas ancladas). Script: `align.py` →
`word_times.json`.

`build_segments.py` reparte las 182 palabras en 24 tramos (definidos a
mano por sentido narrativo, no por conteo fijo de palabras) y calcula
`t_start`/`t_end` de cada uno como el punto medio entre la última
palabra de un tramo y la primera del siguiente — verificado con un
assert que compara la concatenación de los 24 textos contra
`guion-short.txt` palabra por palabra antes de escribir `segments.json`.

Un primer reparto en 23 tramos dejaba un plano de 6,07s (la frase más
larga del guión, sobre qué quería probar Johnson) muy por encima del
resto — se partió en dos con una imagen adicional, quedando en 24
planos, todos ≤ 3,8s.

## Planos e imágenes

24 planos, ninguna imagen nueva: todas reutilizadas de `../imagenes/`
(las 99 del video completo), recompuestas a 1080×1920 (fondo ampliado
y desenfocado + la imagen nítida completa centrada encima, mismo
método que el short de Stanford). Costo: $0.

**Dos sustituciones**: al revisar cada imagen contra la descripción de
su prompt original antes de usarla (no asumir que el generador acertó),
dos no coincidían — `29.jpg` (pensada como "lista con veintidós marcas
de verificación", salió con texto genérico en inglés y una escena de
taller sin relación) y `09.jpg` (pensada como "la mujer quitándose la
sonrisa de golpe, gesto frío y calculado", salió como una escena
doméstica genérica de madre e hijo). Se sustituyeron por `21.jpg`
(grupo de niños del orfanato jugando, mejor lectura visual de "22 niños
huérfanos") y `07.jpg` (mujer inclinada con el ceño fruncido
corrigiendo una libreta, sí transmite el gesto frío).

`subtitulos.srt` — 24 cues con los tiempos reales.

## Render

`render_short.js` — igual patrón que el de Stanford: no usa
`hoja-montaje.csv` (redondea a segundo entero, y aquí hay planos de
menos de 2s), sino los floats exactos de `segments.json`. 1080×1920 a
30fps, Ken Burns alternando dirección de zoom por plano, subtítulos
quemados con Alignment=6 (arriba-centro) calibrado igual que Stanford.

Verificado extrayendo fotogramas en 3 puntos (0:01, 0:41, 1:01) y
comprobando que imagen y subtítulo coinciden con `segments.json` —
incluyendo el cierre exacto en el plano del asterisco con "La historia
completa, en el video."

`short-final.mp4` (no versionado, ver `.gitignore`) — 62.3s, 1080×1920,
14,4 MB.

## Pendiente

- Miniatura propia del short (opcional — YouTube usa un frame del
  propio video por defecto si no se sube una).
- Subida a YouTube Shorts.
