# Miniatura — video 3 (el mito de las ocho catástrofes)

`miniatura.jpg` — 2560x1440, lista para subir.

## Concepto

Un retrato de estudio de principios del siglo veinte cuya emulsión está
agrietada y desprendida en parte del rostro, como una fotografía física
deteriorada por el tiempo. La cara se lee al instante como "esto no es
del todo real" sin necesitar texto que lo explique — coherente con el
tema: una persona que nunca existió.

Encuadrado en el tercio izquierdo, con toda la mitad derecha como
espacio negativo oscuro para el texto. Se generaron 4 variantes con
Seedream 5 Pro; se eligió esta por el patrón de grietas más limpio a
tamaño pequeño y la mejor separación entre rostro y fondo.

## Texto

`8 VECES` en amarillo + `NO EXISTIÓ` sobre caja roja.

Probada a 246px (`test-feed.png`): la palabra grande se lee de inmediato
y las grietas de la cara siguen siendo visibles incluso reducida.

## Emparejamiento con el título

La miniatura vende el desmentido. El título recomendado en `../seo.md`
no repite "no existió" — usa el ángulo del canal de difusión:
**"Esta cadena de WhatsApp lleva 100 años circulando"**.

## Regenerar el texto

```
node ../../../kit-produccion/scripts/render_thumbnail.js config.json
```
