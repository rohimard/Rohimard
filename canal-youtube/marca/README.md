# Marca del canal — Historia Incómoda

Archivos generados con `../kit-produccion/scripts/brand_assets.js brand.json`.
Para cambiar textos o colores: edita `brand.json` y vuelve a ejecutarlo.

## Paleta (la misma de las miniaturas — esto es lo importante)

| Color | Hex | Uso |
|---|---|---|
| Negro tinta | `#0B0B0C` | Fondo de todo |
| Amarillo | `#FFD400` | Acento principal, cifras, logo |
| Rojo alarma | `#E10600` | Barra de remate, caja de titular |
| Blanco | `#FFFFFF` | Texto principal |

Que logo, banner y miniaturas usen estos tres colores es lo que hace que la
gente reconozca el canal en el feed **antes de leer el título**. No añadir
colores nuevos.

Tipografía: **Anton** (`../kit-produccion/assets/Anton-Regular.woff2`), la
misma de las miniaturas.

## Logo — recomendado: `logo-asterisco.png`

Asterisco amarillo sobre negro, 800x800.

**Por qué este y no los otros** (ver `test-logos.png`, prueba a 96/48/24px
recortados en círculo, que es como YouTube los muestra):

| Variante | Veredicto |
|---|---|
| **Asterisco amarillo** | ✅ Legible a 24px y sobre fondo claro. Una sola forma, máximo contraste |
| Monograma "HI" | ❌ A 24px se vuelve una mancha ilegible; además "HI" se lee como el saludo en inglés |
| Asterisco rojo | ❌ El rojo sobre negro pierde contraste al reducirse |
| Censura (barra negra) | ❌ Al recortarse en círculo pierde las esquinas y parece un botón de "prohibido" |

Y significa algo: el asterisco es el símbolo de "hay una nota al pie", de que
la versión que te contaron tenía letra pequeña. Encaja con el
posicionamiento sin necesidad de explicarlo.

**Regla**: una vez elegido, no se cambia nunca. El reconocimiento en el feed
se construye por repetición.

## Banner — `banner.png` (2048x1152)

`banner-guias.png` es la misma imagen con la zona segura dibujada; **no la
subas**, es solo para comprobar.

Lo que hay que saber: subes 2048x1152 pero **solo se ve el centro,
1235x338**, en móvil y escritorio. El resto solo aparece en televisor. Por
eso todo el texto vive dentro de esa franja y los asteriscos gigantes de los
lados son relleno intencionado para que en TV/escritorio no se vea vacío.

Contenido del banner:
- **HISTORIA INCÓMODA** (blanco + amarillo), en una sola línea
- Barra roja de remate
- **LA VERSIÓN QUE NO TE CONTARON EN CLASE**
- **MARTES Y VIERNES**

Sobre la última línea: anunciar la cadencia en el banner funciona porque
crea expectativa, **pero solo si la cumples**. Si no vas a publicar dos
veces por semana de forma sostenida, quita `"schedule"` de `brand.json` y
regenera — un horario incumplido resta más de lo que suma.

## Detalles técnicos que costaron un par de iteraciones

- La barra roja desaparecía: en un contenedor flex, un elemento de 11px de
  alto se comprime a cero si el contenido no cabe. Solución: `flex:none`.
- El acento de la **Ó** se salía de la zona segura: Anton dibuja los acentos
  por encima de la caja de la línea, así que hace falta `line-height` holgado
  (1.3) y dejar margen de sobra arriba.
- El nombre va en una sola línea, no en dos: además de verse más grande,
  evita que el acento de INCÓMODA choque con la línea de arriba.
