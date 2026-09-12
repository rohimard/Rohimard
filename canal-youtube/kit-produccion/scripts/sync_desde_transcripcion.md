# Sincronizar por transcripción (el método que sí funciona)

## El problema que resuelve

Los dos primeros intentos de cuadrar imagen y voz fallaron, y por la misma
razón de fondo: **estimar en vez de medir**.

1. `timing_sheet.js` reparte la duración total entre los planos en proporción
   al número de caracteres. Da por hecho que el narrador habla a velocidad
   constante. No lo hace. Medido en el video 2: **desfase medio de 10,6s y
   máximo de 19,7s** — a mitad de video la imagen iba veinte segundos por
   delante de la voz.
2. `srt_align.js` mejora eso anclando a los silencios detectados en la onda
   del MP3, pero la detección de silencios es aproximada: reconoce pausas que
   no son finales de frase y se salta las que el narrador encadena. Los
   subtítulos seguían descuadrados.

## El método

No estimar nada: preguntarle al audio qué dice y cuándo.

1. **Trocear el audio** en ventanas de 15s con ffmpeg (`-f segment`).
2. **Transcribir cada trozo** con ElevenLabs Scribe. El precio va por segundo
   de audio, así que 20 trozos de 15s cuestan lo mismo que transcribir el
   archivo entero (~1.650 créditos para 5 minutos, unos 30 céntimos).
   La transcripción de golpe **no sirve**: devuelve solo texto, sin marcas de
   tiempo. Troceada sí, porque el trozo *es* la marca de tiempo.
3. **Alinear** el guión con la transcripción palabra a palabra
   (`difflib.SequenceMatcher`, tolerante a los deslices del reconocedor: en el
   video 2 casaron el 99,4% de las palabras). Cada palabra del guión queda con
   su instante real.
4. **Generar desde ahí** los subtítulos y los cortes de plano. Ya no hay nada
   que estimar: se leen los tiempos.

## El ritmo, aparte de la sincronía

Sincronizar bien deja los planos con la duración que realmente ocupa su texto,
y eso descuadra el ritmo: salían planos de 1s junto a otros de 9s. Con los
tiempos reales en la mano el reparto se hace **por tiempo**: se divide la
duración en tantos tramos iguales como planos y cada corte se lleva al final
de frase más cercano. Resultado en el video 2: media 4,4s, máximo 8,5s.

Ojo con el reparto voraz — un primer intento empaquetó los cortes al principio
y dejó un plano final de 135s. El reparto por objetivo de tiempo es más simple
y no tiene ese fallo.

## Orden de la receta

```
mp3_duration.js audio.mp3                 # duración real
# trocear, transcribir, alinear  (ver arriba)
# generar subtitulos.srt y hoja-montaje.csv desde el mapa palabra->tiempo
montar_video.js config.json               # render final
```

`timing_sheet.js` sigue valiendo para una hoja provisional **antes** de tener
el audio. En cuanto exista el MP3, se descarta y se rehace por este método.
