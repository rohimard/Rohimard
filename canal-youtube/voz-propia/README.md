# La voz propia del canal

Referencia para clonar la voz del narrador. La graba el dueño del canal y de
ahí sale la voz de todos los vídeos.

## Por qué esto y no una voz de catálogo

Se probaron cuatro caminos antes de llegar aquí, y los cuatro tienen techo:

- **Azure.** Se midieron once combinaciones de voz y estilo. La mejor
  (es-MX-JorgeNeural en estilo sad) llega a -48,9 dB en 12-16 kHz, que está
  bien de ancho de banda, pero el usuario la sigue oyendo sintética. El
  problema no es el espectro: es la prosodia, y ahí Azure no da más.
- **ElevenLabs.** Suena mejor al oído *teniendo menos agudos* (-101 dB por
  encima de 16 kHz, contra -58 dB de Azure), lo que confirma que lo que falla
  es la entonación y no la frecuencia. Pero la cuota esta agotada: 4 creditos
  de 121.004.
- **vidIQ.** Genera con ElevenLabs por debajo, asi que sirve como monedero
  alternativo, pero son 14 creditos por cada 1.000 caracteres y el guion
  entero se come casi toda la asignacion mensual.
- **Clonado con referencia ajena.** La referencia que habia guardada
  (kevin-referencia.mp3, de los corpus de OpenSLR) esta a 16 kHz y 48 kbps:
  calidad telefonica. En un clon el techo lo pone la referencia, no el
  modelo, asi que esa garantizaba el sonido amputado que se queria evitar.

Con una referencia propia a 48 kHz se resuelven las cuatro cosas: la voz es
unica, el coste es cero para siempre, no hay dudas de licencia al monetizar, y
el techo de calidad lo pone un microfono real y no un corpus de 2015.

## Cómo grabarla

Lee `texto-para-grabar.txt` entero, de una vez, sin cortar.

- Habitacion con cosas blandas: cama, cortinas, ropa colgada. Nunca el baño ni
  la cocina, que rebotan.
- Movil a un palmo de la boca, un poco de lado para que las pes no soplen.
- Grabadora de voz normal del telefono. Los movoles actuales graban a 44,1 o
  48 kHz, que es justo lo que hace falta.
- Sin musica, sin ventilador, sin television de fondo.
- Si te trabas, NO pares: repite la frase y sigue. Los trozos malos se cortan
  despues; volver a empezar solo hace que la voz suene cada vez mas forzada.

## Cómo leerlo

Esto importa mas que el modelo. El clon copia el REGISTRO de la referencia: si
lees animado, todos los videos saldran animados.

- Habla **a una sola persona**, no a un publico. Como si se lo contaras a
  alguien sentado enfrente, a media noche.
- **Mas lento de lo que te sale natural.** Un narrador de documental va un 20%
  por debajo de la conversacion normal.
- **Grave y apoyado**, sin forzar. Si tienes que empujar la voz, estas
  demasiado grave: sube medio tono.
- **Para de verdad en los puntos.** El modelo aprende tus silencios; si no
  paras, tendras un narrador que no respira.
- Las preguntas, hacia abajo. No las subas como en una conversacion: en este
  registro una pregunta es una insinuacion, no una duda.
- Nada de extremos: ni gritar, ni susurrar, ni reirse. El modelo extrapola a
  partir de este punto de partida, asi que conviene que sea neutro y calido.

## Qué lleva el texto dentro

No es un parrafo cualquiera. Esta construido para cubrir el español hablado:

- `rr` (ferrocarril, tierra), `ñ` (años, mañana), `j` y `g` (jamas, juzgar),
  `ll` (llorar), `s`/`z`/`c` (silencio, conclusiones)
- diptongos (cuarenta, viuda, propia) y hiatos (dia, maria)
- numeros largos dichos en palabras (mil ochocientos sesenta y uno)
- nombres propios (Windsor, Alberto)
- frases cortas y frases largas, preguntas, y una enumeracion con comas

199 palabras, unos 80 segundos a ritmo de documental.
