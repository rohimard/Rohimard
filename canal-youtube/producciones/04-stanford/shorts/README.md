# Short — resumen del video 4 de Historia Incómoda (Stanford)

Short de YouTube (9:16, 40.4s) hecho a partir del video completo, no es
un recorte: guión reescrito desde cero para el formato, optimizado para
el hook inmediato y el ritmo rápido de Shorts.

## Guión

`guion-short.txt` — 121 palabras. Estructura: hook en la primera frase
(cárcel falsa, sin intro ni "hola bienvenidos") → dato conocido → el
giro real (grabaciones ocultas) → las dos revelaciones más fuertes
(guardia actuando, preso fingiendo) → conclusión inquietante → gancho
al video completo. Nada del guión original de 4:39 se copia literal;
es un resumen redactado para 40s.

**Corrección de voz**: la primera versión decía "Unos, guardias. Otros,
presos." — cuatro fragmentos cortados por puntos y comas seguidos. El
usuario detectó que sonaba poco natural, con pausas que no correspondían
al ritmo del montaje. El problema no era el montaje: era que ElevenLabs
trata cada fragmento corto separado por punto como una frase aparte y
mete una pausa dramática entre cada uno. Se reescribió como una sola
oración fluida ("...cárcel falsa: unos de guardias, otros de presos.")
y se regeneró el audio completo — mismo costo (~$0.12), sonido natural.

## Audio

`audio.mp3` (no versionado, ver `.gitignore`) — voz David
(`qRUgOhnxGASxirG4fKjv`, la misma del video), 40.4s, coste 683
créditos (~0,12 USD).

## Cómo se ancló el tiempo real

Mismo método que el video principal
(`kit-produccion/scripts/sync_desde_transcripcion.md`), con ventanas
más finas que las de 15s del video largo: audio troceado en 8 ventanas
de ~5s, cada una transcrita por separado con ElevenLabs Scribe, guión
completo alineado contra las transcripciones con
`difflib.SequenceMatcher` — 99,2% de coincidencia exacta. Script:
`align.py` → `word_times.json`.

Ventanas más finas importan aquí porque el short tiene frases muy
cortas seguidas (0.8–1.1s cada una) — con ventanas de 15s como las del
video largo, el reparto de tiempo por palabra (uniforme dentro de cada
ventana) se nota más de la cuenta en frases cortas con pausas de coma
o punto; con ventanas de 5s el error de esa aproximación queda mucho
más acotado.

## Planos e imágenes

16 planos, todos ≤ 4.2s (media 2.5s — el ritmo de corte rápido es
intencional, es lo que distingue un short "de verdad" de un video
largo recortado). Ninguna imagen nueva: las 16 se reutilizan de las 83
ya generadas para el video completo (`../imagenes/`), elegidas leyendo
`../prompts-imagenes-listos.txt` para que cada plano ilustre
literalmente su frase (la fila de guardias/presos para el gancho, el
reproductor de cinta y el guardia recibiendo instrucciones para "le
decía cómo comportarse", la pantalla de cine para "copiando una
película", el preso encogido para "crisis nerviosa", el guion de
teatro mecanografiado para "guion social", la percha con
uniforme/chaqueta/camiseta para "cambias con un uniforme o un cargo").
Costo: $0.

Como el video es vertical y las imágenes fuente son 16:9, cada una se
recompuso en `imagenes/` (numeradas por plano, 01–16, no por su número
original) a 1080×1920: el mismo fondo ampliado + desenfocado (blur,
sigma 25) rellena todo el alto, y la imagen nítida completa va
centrada encima sin recortar nada — el look estándar de un short
reaprovechado de horizontal, sin perder ningún elemento importante del
encuadre (decisión del usuario, ver conversación: prefirió esto sobre
recortar al centro o generar imágenes nuevas en 9:16).

`hoja-montaje.csv` — igual que la del video principal, en formato
mm:ss (referencia legible, pero redondea a segundos enteros: varios
planos de este short duran bien menos de 1s, así que el CSV **no** es
lo que usa el render). `segments.json` sí tiene los tiempos exactos
(float, milisegundos) y es lo que consume `render_short.js`.

## Render

`render_short.js` — no es `../../kit-produccion/scripts/montar_video.js`:
ese script parsea la hoja en mm:ss (precisión de 1s), que no alcanza
para planos de 0.8s. Este script hermano lee `segments.json`
directamente (tiempos reales en segundos) y aplica el mismo Ken Burns
+ concat + subtítulos quemados, pero a 1080×1920 y con la tipografía
Anton del canal (instalada como fuente del sistema para que
`ffmpeg subtitles=` la encuentre vía fontconfig — antes solo existía
como `.woff2` para las miniaturas en HTML).

**Bug encontrado y corregido**: la primera versión usaba 30fps sin
fijar el framerate de entrada de las imágenes; el demuxer `image2` de
ffmpeg decodifica a 25fps por defecto si no se le indica lo contrario,
así que cada plano se reproducía a `duración×25/30` en vez de la
duración real — un plano de esos se adelantaba progresivamente sobre
el subtítulo, y hacia el final del short la imagen en pantalla ya no
correspondía a la frase que se estaba narrando. Se verificó extrayendo
fotogramas del render en varios timestamps y comparando contra
`subtitulos.srt`. Arreglado añadiendo `-r 30` como opción de entrada
antes de cada `-i` de imagen, para que la decodificación coincida con
el fps que usa el filtro `zoompan`. (El video principal no tuvo este
bug porque usa 25fps, que coincide por casualidad con el valor por
defecto de ffmpeg — aquí se hizo explícito para no depender de esa
coincidencia.)

Verificado extrayendo fotogramas en 5 puntos distintos del video final
y comparando manualmente contra el texto del subtítulo en ese momento:
todos correctos tras el fix.

## Subtítulos: de un cue por plano a grupos cortos por palabra real

**Segundo bug encontrado y corregido**: la primera versión ponía un
solo cue de subtítulo por plano, con el texto completo de la frase de
ese plano (hasta 13 palabras en el plano más largo). El filtro
`subtitles` de ffmpeg además no tenía declarada la resolución real del
video (`original_size`), así que escalaba el texto varias veces más
grande de lo pedido por `Fontsize`. Combinado, una frase larga se
envolvía en 6-7 líneas a un tamaño enorme, y como el bloque está
anclado abajo (`Alignment=2`) y crece hacia arriba, las primeras
líneas quedaban literalmente fuera del cuadro por arriba — el usuario
lo vio como "una parte se pierde arriba".

Arreglado en dos partes:
1. `subtitles=...:original_size=1080x1920:...` en `render_short.js`
   para que el `Fontsize` sea en píxeles reales del video final, no
   reescalado contra una resolución por defecto mucho más chica.
2. Los subtítulos ya no van uno por plano: se generan directo desde
   `word_times.json` (tiempos reales por palabra) en grupos cortos de
   máximo 4 palabras, cortando antes si termina en coma/punto/dos
   puntos — 35 cues en vez de 16, cada uno cabe siempre en 1-2 líneas
   sin importar cuántas palabras tenga la frase completa del plano.
   Un plano de imagen puede así mostrar 2-3 cues de subtítulo distintos
   dentro de su duración, que es el estilo real de caption de Shorts
   (rotación rápida de 3-4 palabras), no un párrafo estático.

Verificado de nuevo extrayendo fotogramas en los planos con las frases
más largas (los que antes se cortaban) — todos dentro del cuadro.

## Resultado

`short-final.mp4` (no versionado) — 1080×1920, 40.7s, 10 MB, cabe
directo en el chat sin comprimir.

## Pendiente

Subir a YouTube Shorts como contenido adicional del video 4 — mismo
título/ángulo que el video largo, con el video completo como destino
del "call to action" final ("La investigación completa, en el video").
