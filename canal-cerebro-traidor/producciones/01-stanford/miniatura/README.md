# Miniatura — video 1 de Cerebro Traidor

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
- No ilustra solo este video: resume la idea central de **todo el
  canal** ("alguien mueve los hilos sin que la marioneta lo sepa"),
  puede convertirse en un recurso visual recurrente de la marca.
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

## Verificación

`test-feed.png` — prueba obligatoria a 246px: "MANIPULADO" se lee con
claridad instantánea, y la silueta de manos + cruceta se reconoce sin
esfuerzo. Miniatura aprobada.
