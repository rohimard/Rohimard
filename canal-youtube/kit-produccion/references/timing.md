# Hoja de montaje sincronizada con el audio

La duración de cada imagen la manda **el audio real**, no una estimación a ojo. El método:
una imagen debe estar en pantalla más o menos el tiempo que dura la narración que ilustra.
Como no tenemos la transcripción con marcas de tiempo exactas, repartimos la duración total
del audio **en proporción a las palabras** que cubre cada escena. Es exacto a ±1–2 s y el
ajuste fino se hace luego arrastrando sobre la onda en el editor.

## Pasos

1. **Medir el audio** con `scripts/mp3_duration.js` (ver por qué en el propio script: el
   ffmpeg de estos entornos no decodifica MP3). Anotar `DURATION_SECONDS`.
2. **Segmentar el guión** en escenas, en el mismo orden del texto. Cada escena recibe:
   - `id` (1, 2, 3… mantener el número del plano),
   - `block` (bloque narrativo: GANCHO / DATOS / POR QUÉ / SOLUCIÓN / CTA, o los que pida
     el guión),
   - `cue` (la frase corta que identifica el plano),
   - `text` (el fragmento **exacto** de narración que cubre esa escena).
   Regla de oro: **cada palabra del guión pertenece a una sola escena**. Así no quedan
   huecos y las imágenes cuadran con lo que se oye.
3. **Generar la tabla** con `scripts/timing_sheet.js segments.json <audio_seconds> [min]`.
   El script pondera por palabras, sube los planos muy cortos a un mínimo (3 s por defecto)
   para que registren, y reconcilia el redondeo para que las columnas sumen exactamente la
   duración del audio. Devuelve Markdown con In/Out por bloque, listo para presentar.

## Segmentar bien

- **Ningún plano de imagen fija debería superar ~8 s.** Lo que aburre no son los segundos,
  es la imagen quieta: 7–8 s con zoom lento (Ken Burns) y un número animado entrando se
  ven perfectos; 10–12 s en una imagen 100% fija se hacen largos. Por eso, si una escena
  —por su número de palabras— saldría de más de ~8 s, **pártela en dos planos** (misma
  frase, dos visuales distintos). Verifica el máximo tras generar la tabla y parte lo que
  se pase; luego vuelve a generar. Apunta a una media de 4–7 s por imagen.
- Un párrafo largo con varias ideas suele dar **2–3 planos** (más imágenes = más dinamismo).
- Los remates cortos ("Tú también puedes hacerlo", "…más rápido de lo que corres") son
  planos de 3 s a propósito: dan ritmo. Si al escuchar el audio el narrador hace una pausa
  dramática ahí, se alargan 1–2 s robándoselos al plano siguiente.
- Vigilar los tramos que **no** tienen imagen: si un trozo de narración se quedó sin escena,
  crear un plano nuevo para él (y su prompt). Es el error más típico.

## Notas de montaje que se entregan con la tabla

- **Imágenes fijas:** añadir **Ken Burns** (zoom/paneo lento) en los planos largos (≥8 s)
  para que no se sientan muertos; corte seco en el 90 % de las transiciones.
- **Planos con datos** (los largos): meter el número **animado** encima (95 %, 50.000 €…).
- **Anclar a la onda** los golpes emocionales y los datos clave (la cifra shock, el "no es
  tu culpa", el CTA final) — esos cortes tienen que caer con la palabra exacta.
- **Saltos de contraste** (p. ej. 2006→2026): un *dip to black* rápido o cambio de
  colorimetría marca el salto.
- Si se genera en **Veo/Flow**, cada clip sale de ~8 s: los planos de 10–12 s se cubren
  extendiendo el clip o generando dos tomas. Con **imágenes fijas** esto no aplica: se
  estira la imagen lo que haga falta.
