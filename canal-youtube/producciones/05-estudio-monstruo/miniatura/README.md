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

## Expresión facial (segunda iteración)

El usuario vio la miniatura ya acercada y dijo que la cara se veía "muy
amigable" y pidió una risa más malvada. Antes de generar nada se le dio
una recomendación: una risa malvada exagerada tiene más riesgo de salir
distorsionada en una foto realista y puede romper el tono documental del
resto del video; mejor una sonrisa cómplice/siniestra sutil. El usuario
pidió probar igual las tres intensidades para comparar con datos reales
en vez de solo la recomendación.

Se editó `imagenes/03.jpg` con IA (`gpt-image-2`, edición sobre
referencia) en tres niveles — únicamente la expresión, manteniendo
identidad, pose, ropa, manos, cuarto, luz y estilo documental:

1. **Sutil** (sonrisa cómplice, ojos ligeramente entrecerrados) — casi
   indistinguible de la original al montarla con el texto.
2. **Marcada** (sonrisa fría y calculadora, sin exagerar) — también muy
   parecida a la original a este tamaño; el cambio no se notaba lo
   suficiente en la miniatura final.
3. **Exagerada** (sonrisa amplia con dientes, mirada fija) — la única
   que de verdad cambiaba la lectura de la cara, y salió realista en vez
   de distorsionada (contra lo que se esperaba al recomendar en contra).

Las tres se montaron con el mismo texto para comparar en igualdad de
condiciones (mismo recorte `crop=938:528:88:54`, escalado desde el
`crop=750:422:70:43` original para la nueva resolución de salida del
editor, 1280x720 en vez de 1024x572). El usuario vio las tres y eligió
la **2 (marcada)** como definitiva — ni tan plana como la 1 ni tan
directa como la 3, con la cual quedó conforme sin más peros. Costo de
las tres ediciones: ~1.259 créditos (~0,23 USD).

`base.jpg`, `miniatura.jpg`/`.png` y `test-feed.png` ya reflejan esta
versión final.

## Verificación

`test-feed.png` — a 246px "MONSTRUO" se lee con claridad instantánea, la
sonrisa de la mujer se distingue bien (ya no "amigable" sin verse rota),
y las dos líneas inferiores siguen siendo legibles aunque más pequeñas.
