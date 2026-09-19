# Mesa de Montaje — editor móvil

https://claude.ai/code/artifact/919755c0-f271-442b-a022-689d96ff538e

App web (no se instala; se abre desde el navegador del teléfono) para
montar **cualquier** video del canal. Un proyecto por video.

## El flujo

1. **Nuevo proyecto** → título del video.
2. **Subir `hoja-montaje.csv`** — la que genera `scripts/timing_sheet.js`.
   De ahí salen los planos con su tiempo exacto, ya cuadrado al audio
   real, así que la sincronización no se estima: se obedece la hoja.
3. **Subir `subtitulos.srt`** (opcional) — los que genera
   `scripts/srt_align.js`. Se ven quemados en la vista previa.
4. **Subir el audio** del video. Se guarda solo en ese dispositivo
   (IndexedDB), no viaja a la nube: solo hace falta para previsualizar,
   y el MP3 ya vive en la carpeta de la producción.
5. **Subir las imágenes en lote.** Se ordenan solas por el número que
   lleva cada archivo (`01.jpg`, `02.jpg`, `07-lo-que-sea.png`…) y cada
   una cae en su plano. El orden en que se seleccionen da igual; los
   archivos sin número en el nombre se omiten y se avisa cuántos.
6. **Vista previa** — reproduce el audio con las imágenes puestas, el
   mismo Ken Burns que aplicará el render final y los subtítulos
   sincronizados.
7. **Marcar listo para renderizar** — deja la señal en la nube del
   artefacto para que yo tome el montaje y lo renderice.

## Cómo se guardan las cosas

| Qué | Dónde | Por qué |
|---|---|---|
| Proyectos (título, planos, subtítulos) | `db` del artefacto, colección `proyectos` | Persisten entre sesiones y dispositivos |
| Imágenes por plano | `db`, `proyectos/{id}/planos/{n}` | Un documento por plano: el tope es de 256 KB por documento |
| Audio | IndexedDB del navegador | Un MP3 no cabe en un documento de la base; solo hace falta local |

Las imágenes se comprimen en el propio teléfono antes de guardarse
(hasta 1024px, calidad adaptativa que va bajando hasta caber bajo el
límite de 256 KB). Un archivo que no quepa ni al mínimo se omite y el
resto del lote sigue.

## Lo que NO hace, a propósito

No exporta el MP4. Un navegador de teléfono no puede renderizar video
con la fiabilidad ni la calidad necesarias para publicar. El export real
lo hago con `scripts/montar_video.js` (ffmpeg) tomando las imágenes
guardadas en la base del artefacto.
