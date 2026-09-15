# Escribir el guión desde un tema (listo para ElevenLabs)

Cuando el usuario aporta solo un **tema** (p. ej. "la vivienda en España", "por qué no
puedes ahorrar", "la trampa de las tarjetas de crédito"), este paso genera el guión de voz
en off. El texto de salida se pega tal cual en ElevenLabs para crear el audio, así que es
**texto corrido, sin markdown, sin títulos ni numeración visible** — solo párrafos.

## El rol / la voz (mantener SIEMPRE)

Divulgador cercano, directo y algo inconformista — voz masculina enérgica, grave y
agradable (perfil tipo "David, Energetic Deep and Pleasant"). Habla **de tú**, mezcla
**empatía** ("sé por lo que estás pasando") con **datos reales** y un punto de **denuncia**
("el sistema está diseñado así"), y termina **empoderando** ("pero puedes darle la vuelta").
No es un profesor aburrido: es el amigo espabilado que te explica cómo funciona de verdad.

Rasgos de estilo:
- **Segunda persona** todo el rato. El espectador es el protagonista.
- **Frases cortas y con ritmo.** Golpes secos. Repetición retórica para enfatizar
  ("Otra vez.", "No es tu culpa.").
- **Preguntas retóricas** que abren bucles ("¿Y por qué pasa esto?").
- **Cifras concretas y comparaciones temporales** (antes vs. ahora, %, €). Un **dato shock**
  bien colocado.
- **Reencuadre**: del "es culpa mía" al "es estructural, y tiene solución".
- **Cierre esperanzador** y sensación de comunidad ("lo vamos a entender juntos").

## Estructura (5 bloques, ~mismos que el ejemplo de vivienda)

1. **GANCHO (primeros ~15 s):** una escena cotidiana ultra-reconocible en 2ª persona +
   una pregunta incómoda. Nada de introducciones; entrar directos a la emoción.
2. **EL PROBLEMA + DATOS:** cifras reales, comparación antes/ahora, un porcentaje que
   duela. Cierra con el reencuadre "esto no es un problema de X pequeño, es estructural".
3. **¿POR QUÉ PASA?:** 2–3 razones numeradas ("Primera… Segunda… Tercera…"), sencillas y
   memorables.
4. **LA SOLUCIÓN / REENCUADRE:** "el sistema está roto, pero las reglas están escritas";
   qué puede hacer el espectador; 1–2 ejemplos concretos y accionables.
5. **CTA / CIERRE:** promesa de los próximos vídeos (concreta), suscríbete, compártelo con
   alguien que lo necesite, y una frase final que una ("te prometo que… juntos").

## Etiquetas de emoción: DESACTIVADAS por defecto

Este creador prefiere el guión **sin etiquetas**: texto plano y limpio, listo para pegar en
ElevenLabs sin ningún `[corchete]`. Ese es el comportamiento **por defecto** — no metas
`[sighs]`, `[thoughtful]`, `[annoyed]`, etc. La emoción debe estar en las palabras y el
ritmo, no en anotaciones.

Solo añade etiquetas si el usuario las pide expresamente para esa entrega. Si las pide,
úsalas con moderación (una cada 1–2 párrafos, al inicio de la frase que tiñen) y recuerda
que **cuentan como caracteres** dentro del límite (quitarlas luego baja el conteo y puede
sacarte del rango 4.500–5.000 — recuenta y ajusta).

Ejemplo de apertura (tono correcto, sin etiquetas):
> Son las ocho de la tarde. Llegas a casa, abres la nevera, y está vacía. Pero no importa,
> porque el día 15 ya estás más cerca del número rojo que de la nevera llena.

## Longitud: 4.500–5.000 caracteres (obligatorio)

ElevenLabs cuenta caracteres, así que hay que quedar dentro del rango. Cuenta **puntos de
código** (no bytes; los acentos y la ñ cuentan como 1):

```bash
node -e "const fs=require('fs');console.log([...fs.readFileSync(process.argv[1],'utf8')].length)" guion.txt
```

Escribe el guión, guárdalo en `guion.txt`, cuenta, y **ajusta hasta caer en 4.500–5.000**:
si es corto, alarga el bloque de datos o añade una razón/ejemplo; si es largo, recorta
frases redundantes sin perder el ritmo. Reporta el conteo final al usuario.

## Datos y rigor

Adapta los números al tema. Si el tema trae datos que conoces, úsalos; si inventas cifras
de ejemplo, que sean **plausibles y redondas** y **avisa al usuario de verificarlas** antes
de publicar — la promesa del guión debe ser cierta. Nunca cifras absurdas: matarían la
credibilidad y el CTR.

## Formato de entrega

- Entrega el guión en un **bloque copiable** (y ofrece guardarlo como `.txt`).
- Texto corrido en párrafos separados por una línea en blanco. Sin `#`, sin listas con
  guiones, sin negritas: eso rompería la lectura en ElevenLabs.
- Cifras con dígitos y unidad ("1.856 euros", "95%", "2,79%") — el modelo las lee bien.
- Tras entregarlo, recuerda el flujo: el usuario crea el audio en ElevenLabs y lo trae de
  vuelta; entonces el skill mide el audio y cuadra la hoja de montaje. Los prompts de
  imágenes y el SEO ya se pueden hacer desde el guión sin esperar al audio.
