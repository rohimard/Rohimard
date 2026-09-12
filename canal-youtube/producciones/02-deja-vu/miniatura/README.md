# Miniatura — video 2 (déjà vu)

`miniatura.jpg` — 1280x720, lista para subir.

## Concepto

Una cara corriente con una **copia fantasmal de sí misma** detrás,
desplazada. La repetición se entiende sin leer una sola palabra, y el
espectador se reconoce en ella — no es un personaje histórico lejano, es
alguien como él.

Cero imaginería médica: ni cerebros, ni quirófano, ni sangre. Todo eso vive
dentro del video. En la portada rompería la regla de monetización del canal.

## Texto

`ERROR` en amarillo + `NO ES UNA` / `PREMONICIÓN` sobre caja roja.

Se descartó la variante `NO ES` / `PREMONICIÓN` / `ES UN ERROR` tras
compararlas a 246 px: la palabra grande es lo primero que ve el ojo en el
feed, y "ERROR" significa algo por sí sola mientras que "NO ES" no significa
nada hasta leer el resto. En un feed nadie lee el resto.

## Emparejamiento con el título

La miniatura niega el mito. El título pone la escena:
**"Le tocaron el cerebro y dijo: esto ya lo he vivido"**. No se solapan.

## Regenerar el texto

```
node ../../../kit-produccion/scripts/render_thumbnail.js config.json
```

`base.jpg` es la imagen base sin texto (guardada en JPG; el PNG original de
2K pesaba 4 MB). Se generó con Seedream 5 Pro, 4 variantes, elegida la
primera. Las otras tres no se conservaron.

## Variante «pregunta» (la de rotación)

`miniatura-pregunta.jpg` — `¿YA VIVISTE` en amarillo + `ESTO ANTES?` sobre
caja roja, sobre la misma base.

Invierte el marco: en vez de **corregir** una creencia ("no es una
premonición"), le hace al espectador una pregunta que él responde que sí
antes de decidir si hace clic. La portada deja de anunciar y se convierte en
un espejo.

Comparadas a 246 px, gana la de lanzamiento por dos motivos concretos:

1. **Jerarquía.** En `ERROR` hay una palabra dominante que significa algo
   sola. En la pregunta las dos líneas pesan casi igual, y el ojo tiene que
   leer las dos para que la frase exista. En un feed eso es medio segundo de
   más.
2. **Diferenciación.** La pregunta es *el* formato de portada del tema: media
   página de resultados de "déjà vu" pregunta algo. Con canal frío, parecerse
   al resto es el peor sitio donde estar.

Se queda como la rotación de las 48 h, no como una variante menor: cambia el
marco entero (corrección → espejo), que es justo lo que debe cambiar un test
de portada. Si sube, hay que arreglarle antes la jerarquía — subir
`¿YA VIVISTE` y bajar la caja roja, no dejarlas al mismo peso.

Regenerar: `node ../../../kit-produccion/scripts/render_thumbnail.js config-pregunta.json`
