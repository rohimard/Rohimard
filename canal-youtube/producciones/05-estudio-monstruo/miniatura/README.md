# Miniatura — video 5 de Historia Incómoda

## Concepto

Formato clásico del canal (`render_thumbnail.js`, el mismo que Stanford y
Déjà vu): palabra grande amarilla + sujeto a un lado + caja roja con la
segunda línea. La propuesta original en `seo.md` (silla infantil vacía,
foto de archivo en blanco y negro) quedó descartada al fijar el estilo
realista a color de todo el video — usar ahora una imagen de archivo
sepia en la miniatura contradiría el resto del montaje.

**Imagen base**: se reutiliza `imagenes/03.jpg`, ya generada para el
propio video (Mary Tudor, la ejecutora del experimento, sentada con
libreta y sonrisa profesional pero fría). Costo: $0, la imagen ya
existía. Elegida sobre una silla vacía porque una persona real generando
una reacción de "algo no cuadra" en su expresión funciona mejor para el
click que un objeto, y evita mostrar a un niño (ético: los sujetos reales
eran menores sin consentimiento, la responsable adulta del experimento no
tiene ese problema).

Texto: **"MONSTRUO"** (amarillo, `numberSize: 165` — a 200px por defecto
la palabra de 8 letras se extendía tanto hacia la derecha que tapaba la
cara, el mismo tipo de ajuste que "ACTUABA" necesitó en Stanford) /
"EXPERIMENTO CON NIÑOS" (blanco) / "OCULTO 62 AÑOS" (caja roja).
`side: "left"` dejando el texto a la izquierda y a la mujer visible a la
derecha, sin superposición con su rostro.

## Iteración

Primer intento con `numberSize: 200` (el valor que usó "ACTUABA", 7
letras): "MONSTRUO" tiene una letra más y con ese tamaño llegaba a tapar
los ojos de la mujer. Se bajó a 165 y quedó despejado, pero el usuario
pidió acercar más la imagen y mover a la mujer más a la derecha para
dejar aún más aire entre el texto y su cara. Se recortó `base.jpg` desde
`imagenes/03.jpg` (`crop=750:422:70:43`, ~1.37x de zoom) manteniendo su
posición relativa vertical pero desplazándola del 60% al 72% del ancho
del encuadre — mismo `numberSize: 165`, ahora con más margen de sobra.

## Verificación

`test-feed.png` — a 246px "MONSTRUO" se lee con claridad instantánea, la
sonrisa fría de la mujer se distingue bien, y las dos líneas inferiores
siguen siendo legibles aunque más pequeñas.
