# Editor móvil — Mesa de Montaje

https://claude.ai/code/artifact/919755c0-f271-442b-a022-689d96ff538e

App web (no instala nada, se abre desde el navegador del teléfono) para
asignar una imagen a cada uno de los 78 planos del video y previsualizar
el montaje con el audio y los subtítulos reales antes de pedir el
render final.

## Qué hace

- Lista los 78 planos agrupados por bloque narrativo (el gancho,
  Samarcanda, el sistema, Merv, la máquina, por qué, el rastro, cierre),
  con el rango de tiempo y el texto de la escena de cada uno.
- Cada plano se toca para abrir una ficha: elegir foto desde la galería
  del teléfono, ver la asignada, o quitarla.
- Las fotos se comprimen en el propio teléfono antes de guardarse
  (hasta 1024px, calidad adaptativa) para caber en el límite de
  documento de la base de datos del artefacto (256 KB).
- El progreso (`X/78`) y las imágenes se guardan en la nube del
  artefacto (capacidad `db`) — persisten aunque cierres el navegador o
  cambies de dispositivo, y se sincronizan en vivo si lo abres a la vez
  en dos sitios.
- Botón "Vista previa": reproduce el audio real con las imágenes
  asignadas, el mismo Ken Burns que usará el render final y los
  subtítulos quemados en pantalla, sincronizados al segundo.
- "Marcar listo para renderizar" deja constancia en la nube de que el
  montaje está armado.

## Lo que NO hace (a propósito)

No genera el MP4 final. Un navegador de teléfono no puede correr ffmpeg
con la fiabilidad y calidad necesarias para publicar. El export real lo
hago yo en esta sesión con `../../kit-produccion/scripts/montar_video.js`
(ver más abajo) en cuanto me digas que el montaje está listo — leo las
imágenes guardadas en la base de datos del artefacto y las bajo a esta
carpeta antes de renderizar.

## El motor de render — `montar_video.js`

Nuevo script en `kit-produccion/scripts/`. Toma la hoja de montaje (ya
cuadrada al audio real), una carpeta de imágenes nombradas por plano
(`01.jpg`, `02.jpg`…), el audio y el SRT, y arma el MP4 final con
ffmpeg: un Ken Burns sutil por plano (zoom alterno + deriva lateral),
subtítulos quemados y todo cuadrado exactamente a los cortes de la hoja.

```
node ../../kit-produccion/scripts/montar_video.js config.json
```

Probado con un montaje de los primeros 47s del video usando imágenes de
relleno — funciona y el resultado es limpio (ver conversación). Requiere
ffmpeg; si no está instalado en el sistema, `npm install ffmpeg-static`
lo resuelve sin permisos de administrador.
