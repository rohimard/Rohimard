# Short — resumen del video 4 de Historia Incómoda (Stanford)

Short de YouTube (9:16, 40.4s) hecho a partir del video completo, no es
un recorte: guión reescrito desde cero para el formato, optimizado para
el hook inmediato y el ritmo rápido de Shorts.

## Guión

`guion-short.txt` — 119 palabras. Estructura: hook en la primera frase
(cárcel falsa, sin intro ni "hola bienvenidos") → dato conocido → el
giro real (grabaciones ocultas) → las dos revelaciones más fuertes
(guardia actuando, preso fingiendo) → conclusión inquietante → gancho
al video completo. Nada del guión original de 4:39 se copia literal;
es un resumen redactado para 40s.

## Audio

`audio.mp3` (no versionado, ver `.gitignore`) — voz David
(`qRUgOhnxGASxirG4fKjv`, la misma del video), 40.4s, coste 683
créditos (~0,12 USD).

## Cómo se ancló el tiempo real

Mismo método que el video principal
(`kit-produccion/scripts/sync_desde_transcripcion.md`): audio troceado
en 3 ventanas (15s, 15s, 10.4s), cada una transcrita por separado con
ElevenLabs Scribe, guión completo alineado contra las transcripciones
con `difflib.SequenceMatcher` — **100% de coincidencia exacta** (guión
corto, sin palabras raras que Scribe transcribiera distinto). Script:
`align.py` → `word_times.json`.

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

## Resultado

`short-final.mp4` (no versionado) — 1080×1920, 40.4s, 9.9 MB, cabe
directo en el chat sin comprimir.

## Pendiente

Subir a YouTube Shorts como contenido adicional del video 4 — mismo
título/ángulo que el video largo, con el video completo como destino
del "call to action" final ("La investigación completa, en el video").
