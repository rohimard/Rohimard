# Miniatura alternativa (generada de cero)

`miniatura-claude.jpg` — 1280x720, lista para subir.

Base generada con Seedream 5 Pro (4 variantes, elegida la 3ª) y texto montado
con `kit-produccion/scripts/render_thumbnail.js`.

## Qué cambia respecto a la miniatura principal

La de `../miniatura.jpg` es un retrato sobre humo. Esta añade **conflicto
visual**: al fondo derecho hay una ciudad amurallada ardiendo, desenfocada.
El rostro sigue ocupando el tercio izquierdo y el texto el derecho, pero
ahora la imagen cuenta el suceso, no solo al personaje.

Criterio de elección entre las 4 variantes: se montó el texto sobre las dos
mejores y se compararon a 246 px (tamaño real de tarjeta en el feed). Ganó
esta porque el humo oscuro detrás del bloque de texto da más contraste al
amarillo que el fondo claro de la otra.

Cumple la regla de monetización del canal (ver `../../08-configuracion-canal.md`):
fuego, humo y ceniza, sin sangre ni cadáveres.

## Regenerar el texto

```
node ../../../kit-produccion/scripts/render_thumbnail.js config.json
```

`base-v3.jpg` es la imagen base sin texto, guardada en JPG porque el PNG
original de 2K pesaba 4,3 MB. Las otras tres variantes no se conservaron.
