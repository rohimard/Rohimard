# Kit de viralidad — Cerebro Traidor

La mecánica técnica (medir audio, segmentar, generar imágenes, montar
video) es la misma de `canal-youtube/kit-produccion/` — no se duplica
nada de eso, se reutilizan los mismos scripts. Este documento define solo
lo que **cambia de contenido** frente a Historia Incómoda: cómo se
construye un título, un guión y una miniatura de alta viralidad para
neurociencia cotidiana en vez de historia.

## 1. Título — fórmula

**Estructura obligatoria**: `[Tu cerebro / Por qué / Sujeto cotidiano] +
[acción o mentira concreta] + [(opcional) giro que sorprende]`

Reglas duras (mismo criterio de <60 caracteres que Historia Incómoda,
adaptado):

1. **Un solo mecanismo por título.** Si el video toca memoria y también
   sesgo egotista, el título elige uno — el otro puede ser el segundo
   título para test A/B o el gancho de un Short.
2. **Segunda persona casi siempre.** "Tu cerebro..." funciona mejor que
   "El cerebro..." porque convierte al espectador en el caso de estudio,
   no en oyente de una clase — coherente con la promesa de "Cerebro
   Traidor" (te traiciona a ti, no a un genérico "las personas").
3. **Nunca repetir literalmente lo que va a decir la miniatura.** Si la
   miniatura ya muestra la palabra "MIENTE" en grande, el título no debe
   volver a incluir "mentira"/"miente" — puede nombrar el contexto (la
   situación) en vez del mecanismo.
4. **Evitar el paywall de curiosidad roto**: nunca revelar el hecho
   completo en el título (mata el clic). El título plantea la pregunta o
   la situación reconocible; la respuesta llega en el video.
5. **Cifra real cuando exista** (75% en el experimento de Asch, 3
   naufragios de Violet Jessop en el otro canal, etc.) — una cifra
   concreta rinde más que un adjetivo.

**Banco de aperturas de título ya validadas** (ver más ejemplos completos
en `02-banco-de-temas.md`):

- "Por qué [situación cotidiana] cuando tu cerebro [hace X]"
- "Tu cerebro [verbo] antes de que tú [verbo]" (ej.: "decide que tienes
  hambre antes de que tu estómago hable")
- "El experimento que demostró que [dato incómodo sobre la gente]"
- "Lo que tu cerebro hace [contexto], y nunca lo notaste"

## 2. Guión — estructura en 4 bloques

Adaptación del esqueleto de `canal-youtube/05-kit-de-produccion.md` al
contenido de neurociencia (mismo esqueleto emocional: empatía + dato +
denuncia + cierre que empodera).

1. **GANCHO (primeros ~15s): la escena cotidiana, no el concepto.**
   Arranca dentro de una situación reconocible en 2ª persona/presente
   ("Estás en una fiesta, no puedes ni oír tu propia voz, y de repente
   escuchas tu nombre al otro lado de la sala"), cerrada con la pregunta
   incómoda: ¿por qué pasó eso, si se supone que no estabas escuchando?
   Nada de "hoy te voy a hablar del cerebro".
2. **EL MECANISMO REAL, con nombre y estudio.** Qué hace exactamente el
   cerebro, nombrando el mecanismo o experimento real (no "los
   científicos dicen" genérico — el dato concreto que ya está verificado
   en `02-banco-de-temas.md`). Cierra con el reencuadre: "esto no es un
   fallo aleatorio, es tu cerebro decidiendo algo por ti sin permiso".
3. **POR QUÉ TU CEREBRO HACE ESO (la denuncia).** 1-2 razones evolutivas o
   funcionales, numeradas, y aquí vive el giro "traidor": el mecanismo que
   te ayudó a sobrevivir ahora te sabotea en la vida moderna (discutes
   peor, te da miedo lo que no debería, recuerdas lo que no pasó).
4. **APLICACIÓN + CIERRE.** Conecta el mecanismo con un momento futuro
   reconocible del espectador ("la próxima vez que te pase esto, vas a
   saber exactamente qué está haciendo tu cerebro y por qué"), CTA del
   siguiente video, suscripción, frase de cierre de marca.

Longitud y entrega: igual que el kit original — 4.500-5.000 caracteres,
texto corrido sin markdown, listo para ElevenLabs, guión de voz aparte con
respelleo fonético (`voz-natural.md`) para extranjerismos científicos
(ej.: "placebo", "Dunning-Kruger" → "Dánin Krúguer").

## 3. Miniatura — qué cambia frente a Historia Incómoda

Mismo motor técnico (`render_thumbnail.js` / `render_thumbnail_sello.js`,
mismas reglas de CTR: un foco emocional, espacio negativo, prueba de
legibilidad a 246px obligatoria antes de dar cualquier miniatura por
buena). Lo que cambia es **de dónde sale el impacto visual**, porque no
hay una escena histórica de la que tirar:

- **El personaje recurrente es el espectador mismo, en situación
  cotidiana reconocible** (alguien en una fiesta ruidosa, alguien
  mareado en un coche, una pareja discutiendo, alguien despertando de
  golpe) — nunca una figura histórica ni un rostro genérico "de stock"
  sin contexto.
- **Metáfora visual del "cerebro traidor"** como recurso propio del
  canal: silueta/contorno de cabeza con algo "mal cableado" dentro (grieta
  de luz, engranaje torcido, marioneta) — reservar este recurso para
  cuando el tema sea sobre el mecanismo en sí (sesgos, memoria, ilusión),
  y usar la situación cotidiana cuando el tema sea sobre una experiencia
  reconocible (miedo, mareo, ruptura).
- **Paleta propia**: acento **violeta eléctrico** (`#8B5CF6` o similar) en
  vez del amarillo/rojo de Historia Incómoda — evita que un espectador
  confunda los dos canales en la pantalla de recomendados, y el
  violeta/púrpura connota "mente/cerebro" sin caer en el típico azul
  genérico de canales de ciencia.
- **Palabra o cifra única y grande** en Anton, igual mecánica que Historia
  Incómoda (una palabra que "signifique algo sola": "TRAIDOR", "MIENTE",
  "75%", nunca una frase completa en la miniatura).
- Nunca repetir en la miniatura lo que ya dice el título (regla 3 de la
  sección de título, en espejo).

## 4. Flujo de trabajo

Igual que Historia Incómoda: dame un tema del banco (o uno nuevo) y
entrego en orden guión → guión-voz → prompts de imágenes → miniatura →
hoja de montaje (con el audio real) → SEO, usando el mismo pipeline
técnico de `canal-youtube/kit-produccion/`.
