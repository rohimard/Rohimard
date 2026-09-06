# Miniatura — video 4 de Historia Incómoda

## Historial

**Primer intento (descartado)**: guardia genérico con gafas de aviador
reflectantes. El usuario no quedó convencido ("no me convence esa
miniatura, busca otro estilo"). Se generaron 3 conceptos nuevos,
completamente distintos entre sí, para comparar con datos reales en vez
de adivinar de nuevo:

- **A — la cinta**: reproductor de carrete abierto con la cinta
  desenrollándose, conectando directo con el giro real del video (las
  grabaciones desclasificadas).
- **B — el titiritero**: manos sosteniendo la cruceta y los hilos de una
  marioneta genérica, en penumbra.
- **C — la máscara partida**: máscara de teatro clásica partida por la
  mitad. Descartada: a tamaño de feed (246px) la forma se confunde con
  una calavera o una piedra, pierde el significado de "máscara".

## Concepto elegido: B — El titiritero

Manos sosteniendo los hilos de una marioneta genérica (sin rasgos
identificables) que cuelga borrosa en la penumbra debajo. Elegido sobre
A y C porque:

- Se lee perfecto incluso reducido a tamaño de feed: la cruceta y las
  manos son inconfundibles.
- No ilustra solo este video: la idea de "alguien mueve los hilos sin que
  la marioneta lo sepa" resume bien el giro del propio experimento
  (obedecer un guion social implícito sin que nadie dé la orden
  explícita), y podría reutilizarse como recurso visual si Historia
  Incómoda cubre más temas de manipulación/psicología social.
- Ningún rostro ni persona real identificable — solo manos genéricas.

**Segundo intento (descartado)**: sello rojo diagonal "MANIPULADO" estilo
ribete/cinta, con "1971 / ASÍ LO MONTARON" en violeta al lado. El usuario
lo rechazó: "esa etiqueta de cancelado no me convence" — el sello diagonal
se lee como una pegatina genérica de "cancelado/oferta", no comunica
"esto salió de un archivo real".

## Versión final: barra de documento censurado

Se sustituyó el sello diagonal por una **barra horizontal negra tipo
documento desclasificado**: dos marcas de tachado a los lados del texto
(como redacciones de un informe), filo rojo fino arriba y abajo, y una
etiqueta pequeña roja "ARCHIVO 1971" en la esquina superior derecha. Este
lenguaje visual conecta directamente con el giro real del video (las
grabaciones desclasificadas de Le Texier), en vez de con la estética
genérica de sello/pegatina que ya se había usado y rechazado dos veces.
Script nuevo, reutilizable: `render_thumbnail_redacted.js` en el kit.

La barra se posiciona sobre las cuerdas de la marioneta, dejando visibles
la cruceta, las manos y la silueta borrosa de la marioneta asomando
debajo — no tapa el elemento más expresivo de la imagen.

No se añadió número/año lateral aparte de la etiqueta "ARCHIVO 1971": el
título ("El experimento de psicología más citado fue manipulado") ya
aporta el dato concreto (el "qué"); la miniatura aporta la emoción/
metáfora (el "cómo se siente") más el contexto documental (el "de dónde
sale esto").

## Selección de la imagen base

Se generó 1 imagen por concepto (3 en total, 818 créditos cada una,
~0,45 USD por variante) en vez de 4 variantes por concepto, ya que el
objetivo era comparar direcciones distintas, no elegir entre varias
tomas de la misma idea.

## Verificación (versión titiritero — histórica)

`test-feed.png` de esa versión: "MANIPULADO" se leía con claridad
instantánea, y la silueta de manos + cruceta se reconocía sin esfuerzo.

## Rehecha: "la sonrisa que no debía existir" (descartada)

El usuario pidió una miniatura nueva con otra idea. Se generaron 3
conceptos (la cinta que lo delata, el expediente reabierto, la sonrisa
que no debía existir) y se eligió el tercero: primer plano extremo de
boca/mandíbula sonriendo con complicidad (sin ojos ni rasgos
identificables), foto de archivo en blanco y negro con grano — mismo
estilo de barra "documento censurado" que la versión anterior, texto
**"ACTUABA"** (conecta con la investigación real: uno de los guardias
confesó años después que estaba imitando a un personaje de película).
Aprobada en un primer momento, pero descartada al pedir el usuario que
la miniatura siguiera el **formato clásico de Historia Incómoda**
(el de Genghis Khan y Déjà vu: palabra/número amarillo grande + sujeto
a un lado + caja roja con la segunda línea), no el estilo de barra
negra que se había usado hasta ahora.

## Versión final (aprobada): formato clásico + guardia del propio video

Rehecha con `render_thumbnail.js` (el script estándar del canal, no
`render_thumbnail_redacted.js`). Se probaron dos imágenes de fondo
para el mismo texto y layout, comparando lado a lado:

- **A (elegida)** — reutiliza `imagenes/04.jpg`, ya generada para el
  propio video (guardia de uniforme caqui y gafas de aviador de pie en
  el pasillo de la cárcel). Costo: $0, la imagen ya existía.
- **B (descartada)** — imagen nueva del primer plano de la sonrisa
  (~818 créditos, ~0,15 USD), pero el texto amarillo terminaba tapando
  justo la sonrisa — el elemento que hacía interesante ese encuadre se
  perdía, y a tamaño de feed casi no se distinguía nada.

Texto: **"ACTUABA"** (amarillo, `numberSize: 220` porque a 300px por
defecto una palabra de 7 letras se sale del marco) / "EL GUARDIA MÁS
CRUEL" (blanco) / "LO CONFESÓ DESPUÉS" (caja roja). `side: "left"` deja
el texto a la izquierda y el guardia visible a la derecha, sin que se
tapen entre sí.

## Verificación

`test-feed.png` — a 246px el guardia con gafas de aviador y "ACTUABA"
se leen con claridad instantánea. Miniatura aprobada por el usuario
("la a").
