# Producción 01 — El experimento de la cárcel de Stanford (mito/realidad)

Primer video del canal **Cerebro Traidor**. Elegido de la lista de 56 temas
del banco (`../../02-banco-de-temas.md`) tras verificar oportunidad real en
YouTube: tema #44, oportunidad **ALTA** — la narrativa de "el experimento
más citado de la psicología estaba manipulado" tiene respaldo documental
fuerte en inglés pero apenas está explotada en YouTube en español.

## Por qué este ángulo

El experimento de Stanford (Zimbardo, 1971) es uno de los casos más
citados en psicología para explicar que "cualquiera se vuelve un monstruo
con poder". El video lo cuenta primero como se enseña habitualmente, y
luego lo desmonta con la investigación real de Thibault Le Texier sobre
las grabaciones desclasificadas del propio archivo de Stanford (2018) —
mismo tratamiento honesto de "mito vs. realidad" que se usó con Frank
Tower en Historia Incómoda. El giro final no es "todo es mentira": es que
el mecanismo real (obedecer un guion social implícito sin que nadie dé la
orden explícita) es más inquietante que el mito, y conecta directamente
con el canal ("tu cerebro te traiciona sin que lo notes").

## Archivos

- `guion.txt` — 5.006 caracteres, ortografía correcta (lectura/subtítulos).
- `guion-voz.txt` — 4.979 caracteres, adaptado a pronunciación (Zimbárdo,
  Stánford, Tibó Le Teksié; años en letras; sin dos puntos ni símbolos).
- `prompts-imagenes.txt` — **75 prompts** fotorrealistas de reconstrucción
  documental (ampliado desde 40: con 4:39,7 min de audio y un tope de 5s
  por plano pedido por el usuario, el mínimo matemático es 56 planos;
  75 deja margen cómodo). Ningún guardia/prisionero es una persona real
  identificable (son reconstrucciones genéricas, sin nombre ni rasgos de
  Zimbardo ni de ningún participante real) — mismo criterio de precaución
  que Frank Tower.
- `segments-placeholder.json` — **75 escenas**, cada una con su bloque
  narrativo (`EL_DILEMA`, `EL_EXPERIMENTO`, `FAMA_DEL_ESTUDIO`,
  `LA_GRIETA`, `EL_MECANISMO_REAL`, `CEREBRO_TRAIDOR_SUTIL`,
  `APLICACION_COTIDIANA`, `CIERRE_PREGUNTA`, `CIERRE_CTA`) y su `text`
  ya relleno — a diferencia de video 2, aquí el `text` de cada escena
  **es el propio guión partido en orden** (no una etiqueta adivinada por
  separado), así que no hay riesgo de desfase de contenido: el texto
  completo de las 75 escenas reconstruye exactamente `guion.txt`
  (verificado, 4.998 caracteres). Falta anclar el **tiempo** real de cada
  una — eso viene del paso de transcripción de abajo, no del contenido.
- `seo.md` — títulos, descripción y comentario fijado con las fuentes.
- `miniatura/` — ver su propio README.

## Audio

`audio.mp3` (no versionado en git, ver `.gitignore`) — generado con
ElevenLabs, voz **David - Energetic, Deep and Pleasant**
(`qRUgOhnxGASxirG4fKjv`), pedida explícitamente por el usuario por nombre
— es la misma voz de referencia que ya cita `kit-produccion/references/guion.md`
para el perfil del narrador del canal. 4:39.7 min (279,75 s), coste 4.978
créditos (~0,91 USD).

Primer intento descartado: voz "SANDMOR" (cálida/cinematográfica), el
usuario pidió explícitamente cambiar a David antes de aprobarla.

## Cuántas imágenes y por qué 75

El usuario pidió que ningún plano dure más de 5 segundos, para no aburrir.
Con 279,75 s de audio, el mínimo matemático es 279,75 ÷ 5 = **56 planos**
si cada uno durara exactamente 5s — algo que no pasa en la práctica porque
los cortes se ajustan al final de cada frase, no a un reloj fijo. El
guión se partió en 75 fragmentos por cláusula (no por proporción de
caracteres), a un ritmo real medido de ~17,5 car/s: el 90% de los
fragmentos caen entre 2 y 5 segundos estimados, y solo un puñado ronda
5-6s — esos se revisan y, si hace falta, se dividen en dos imágenes más
al anclar el tiempo real en el paso siguiente.

## Pendiente

1. Trocear el audio en ventanas de 15s y transcribir con ElevenLabs
   Scribe para anclar el tiempo real (palabra por palabra) de cada una
   de las 75 escenas — igual método que corrigió el desfase de video 2
   en Historia Incómoda. Como el `text` de cada escena ya es el guión
   real en orden, este paso solo asigna **tiempos**, no contenido.
2. Generar `hoja-montaje.csv`/`.txt` y `subtitulos.srt` con esos tiempos.
   Si algún plano supera 5s reales, dividirlo en dos imágenes.
3. Cuadrar los timestamps de capítulos en `seo.md`.
4. Generar las 75 imágenes de `prompts-imagenes.txt` (proponer un lote de
   prueba pequeño primero, no generar las 75 de golpe, mismo criterio de
   conciencia de costo que en Historia Incómoda).
