# 🎨 Manual de Estilo y Maquetación
### *Sistema visual oficial de «El Sistema de Consistencia Visual con IA»*

> **Documento interno del maquetador.**
> Este archivo **no forma parte del producto que compra el cliente**. Es la biblia visual que garantiza que cada página del PDF respire coherencia. Si algo no está en este documento, **no se usa**.

---

## 📌 Índice del manual

| Sección | Contenido |
| :--- | :--- |
| 1 | Identidad y concepto visual |
| 2 | Paleta de colores (HEX exactos) |
| 3 | Tipografías y jerarquía |
| 4 | Retícula, márgenes e interlineado |
| 5 | Logo ficticio y su colocación |
| 6 | Componentes: cajas, tablas, bloques de código |
| 7 | Portada, contraportada y páginas divisorias |
| 8 | Checklist de control de calidad antes de exportar |

---

## 1. 🎯 Identidad y concepto visual

El producto se llama **AURA — Sistema de Consistencia Visual con IA** y su autor ficticio es:

> ### ✒️ **Mateo Rivas**
> *Director de Arte Digital · 9 años dirigiendo campañas visuales · Creador del método AURA*

**Concepto rector: «Noche de estudio con luz de neón».**
Fondo profundo azul marino, tipografía blanca limpia y acentos naranja/neón que funcionan como focos de luz. La página debe parecer la pantalla de un director de arte trabajando de madrugada: oscura, elegante y con puntos de energía.

**Tres reglas innegociables:**

1. **Un solo acento por página.** Si el naranja aparece en el título, no aparece también en la caja de tip. Elige uno.
2. **Aire antes que relleno.** Preferimos una página con 40 % de espacio vacío a una página apretada.
3. **Nunca más de 2 tipografías.** Montserrat y Inter. Punto.

---

## 2. 🎨 Paleta de colores oficial

### 2.1 Colores primarios

| Rol | Nombre | HEX | RGB | Uso |
| :--- | :--- | :--- | :--- | :--- |
| Fondo principal | Azul Marino Profundo | `#0A192F` | 10, 25, 47 | Portada, divisorias de capítulo, cajas oscuras |
| Acento principal | Naranja Ignición | `#FF6B35` | 255, 107, 53 | Números de capítulo, subrayados, CTA, iconos |
| Texto claro | Blanco Papel | `#F9F9F9` | 249, 249, 249 | Todo el texto sobre fondo oscuro |
| Texto oscuro | Grafito | `#1C1C1E` | 28, 28, 30 | Cuerpo de texto sobre fondo claro |

### 2.2 Colores secundarios (tendencia 2026: neón controlado)

| Rol | Nombre | HEX | Uso |
| :--- | :--- | :--- | :--- |
| Neón frío | Cian Sintético | `#2EE6D6` | Bloques de código, etiquetas `//prompt`, líneas de dato |
| Neón cálido | Magenta Vapor | `#FF3D9A` | Solo en la portada y en 2 infografías. **Máximo 3 apariciones en todo el PDF.** |
| Gris estructura | Gris Niebla | `#8892B0` | Textos secundarios, pies de imagen, numeración de página |
| Fondo alterno | Gris Lienzo | `#EDEFF2` | Fondo de las páginas de ejercicios prácticos |

> ### 💡 Tip de experto:
> El **Magenta Vapor `#FF3D9A`** es un color adictivo: en cuanto lo usas dos veces seguidas, el documento pasa de «premium» a «plantilla de Instagram». Trátalo como sal en la cocina: se nota cuando falta, arruina el plato cuando sobra.

### 2.3 Combinaciones aprobadas (y prohibidas)

| Combinación | Estado | Motivo |
| :--- | :--- | :--- |
| `#0A192F` + `#FF6B35` | ✅ Aprobada | Contraste 7.1:1 — accesible y con carácter |
| `#0A192F` + `#2EE6D6` | ✅ Aprobada | Ideal para código y datos |
| `#F9F9F9` + `#1C1C1E` | ✅ Aprobada | Cuerpo de texto estándar |
| `#FF6B35` + `#FF3D9A` | ⛔ Prohibida | Vibración cromática, ilegible impreso |
| `#2EE6D6` sobre `#F9F9F9` | ⛔ Prohibida | Contraste 1.6:1 — invisible |

---

## 3. ✍️ Tipografías y jerarquía

### 3.1 Familias

| Uso | Fuente | Peso | Dónde conseguirla |
| :--- | :--- | :--- | :--- |
| Títulos y capítulos | **Montserrat** | Bold (700) / Black (900) | Gratis en Google Fonts y nativa en Canva |
| Cuerpo de texto | **Inter** | Regular (400) / Medium (500) | Gratis en Google Fonts y en Canva |
| Código y prompts | **JetBrains Mono** | Regular (400) | Gratis en Google Fonts |
| Alternativa si falta Inter | **Work Sans** o **Source Sans 3** | Regular | Google Fonts |

### 3.2 Escala tipográfica exacta

| Elemento | Fuente | Tamaño | Interlineado | Color |
| :--- | :--- | :--- | :--- | :--- |
| Título de portada | Montserrat Black | 54 pt | 1.1 | `#F9F9F9` |
| Subtítulo de portada | Inter Medium | 20 pt | 1.4 | `#FF6B35` |
| `#` Título de sección | Montserrat Bold | 34 pt | 1.2 | `#0A192F` |
| `##` Capítulo | Montserrat Bold | 28 pt | 1.2 | `#0A192F` |
| `###` Subtítulo | Montserrat Bold | 20 pt | 1.3 | `#FF6B35` |
| `####` Detalle | Inter Medium | 16 pt | 1.4 | `#1C1C1E` |
| Cuerpo | Inter Regular | 11.5 pt | **1.5** | `#1C1C1E` |
| Cita / caja destacada | Inter Medium Italic | 12 pt | 1.5 | `#0A192F` |
| Código / prompt | JetBrains Mono | 10 pt | 1.45 | `#2EE6D6` sobre `#0A192F` |
| Pie de página | Inter Regular | 8.5 pt | 1.2 | `#8892B0` |

> ### ⚠️ Regla de oro tipográfica:
> **Nunca centres un párrafo de más de dos líneas.** El texto centrado largo obliga al ojo a buscar el inicio de cada renglón. Centrado solo para: portada, títulos de capítulo y pies de imagen.

---

## 4. 📐 Retícula, márgenes e interlineado

### 4.1 Formato de página

- **Tamaño:** A4 vertical — **210 × 297 mm** (en Canva: «Documento A4»).
- **Alternativa digital:** 1080 × 1527 px si el cliente lo leerá en móvil.
- **Resolución de exportación:** 300 DPI para imprimible, 150 DPI para versión web ligera.

### 4.2 Márgenes

| Margen | Medida |
| :--- | :--- |
| Superior | **2,5 cm** |
| Inferior | **2,5 cm** |
| Exterior | **2,5 cm** |
| Interior (lomo) | **3,0 cm** *(0,5 cm extra por si se imprime y encuaderna)* |

### 4.3 Retícula

- **Columnas:** 6 columnas con medianil de 5 mm.
- **Texto corrido:** ocupa 4 columnas (centradas). Las 2 restantes quedan como **columna de respiración** donde viven iconos, números de capítulo grandes y notas al margen.
- **Línea base:** 6 pt. Todo el texto se alinea a esta rejilla para que las páginas enfrentadas casen.

### 4.4 Espaciado vertical

| Entre... | Espacio |
| :--- | :--- |
| Párrafo y párrafo | 6 pt |
| Párrafo y `###` siguiente | 18 pt |
| `##` y su primer párrafo | 14 pt |
| Antes de una caja destacada | 16 pt |
| Después de una caja destacada | 16 pt |

> ### 💡 Tip de experto:
> El interlineado **1.5** parece exagerado en pantalla y perfecto en PDF. Si al exportar te parece «demasiado aireado», resiste la tentación de bajarlo a 1.2: ese aire es exactamente lo que hace que un producto de $1,99 se lea como uno de $47.

---

## 5. 🏷️ Logo ficticio y su colocación

### 5.1 Construcción del logo

El logo es **tipográfico**, no ilustrado (más barato de producir, más difícil de arruinar):

```
A U R A
———————
VISUAL SYSTEM
```

- **Palabra «AURA»:** Montserrat Black, 24 pt, letter-spacing **+8 %**, color `#F9F9F9`.
- **Línea divisoria:** 1 pt sólido, ancho igual al de la palabra, color `#FF6B35`.
- **Bajada «VISUAL SYSTEM»:** Inter Regular, 8 pt, letter-spacing **+20 %**, color `#8892B0`.
- **Versión clara:** las mismas piezas pero «AURA» en `#0A192F` y la línea en `#FF6B35`.

### 5.2 Área de protección

Deja alrededor del logo un margen libre igual a **la altura de la letra «A»**. Nada entra en esa zona: ni texto, ni imagen, ni número de página.

### 5.3 Dónde va en cada página

| Página | Posición del logo | Tamaño |
| :--- | :--- | :--- |
| Portada | Centrado, a 4 cm del borde inferior | 100 % (ancho 45 mm) |
| Divisoria de capítulo | Esquina superior derecha | 60 % (ancho 27 mm) |
| Páginas de contenido | **No aparece** — solo el pie con número de página | — |
| Última página | Centrado sobre fondo `#0A192F` | 100 % |

### 5.4 Pie de página estándar

Alineado a la izquierda en páginas pares y a la derecha en impares:

`AURA · Sistema de Consistencia Visual con IA` · · · `07`

Inter Regular 8,5 pt, color `#8892B0`, con una línea de 0,5 pt en `#8892B0` al 30 % justo encima.

---

## 6. 🧱 Componentes de maquetación

### 6.1 Caja de tip (`> ### 💡 Tip de experto:`)

- Fondo: `#0A192F` al **8 %** de opacidad (queda un azul grisáceo muy suave).
- Barra izquierda: 4 pt sólida en `#FF6B35`.
- Padding interno: 14 pt en los cuatro lados.
- Esquinas: radio 6 pt.
- Icono 💡 a 18 pt, alineado con la primera línea de texto.

### 6.2 Caja de advertencia (`> ⚠️ El Error del 99%`)

- Fondo: `#FF6B35` al **10 %**.
- Barra izquierda: 4 pt en `#FF6B35` sólido.
- Título en Montserrat Bold 13 pt, mayúsculas, color `#FF6B35`.

### 6.3 Caja de truco pro (`> 🚀 El Truco del Profesional`)

- Fondo: `#0A192F` **sólido** (caja oscura, contraste total con la página).
- Texto en `#F9F9F9`, título en `#2EE6D6`.
- Es el único componente que se permite ir a sangre (tocando el margen exterior).

### 6.4 Bloques de prompt (```)

- Fondo `#0A192F`, texto `#2EE6D6`, JetBrains Mono 10 pt.
- Radio de esquina 8 pt, padding 12 pt.
- **Etiqueta superior** en Inter Medium 8 pt, color `#8892B0`, con el texto `PROMPT ↓`.
- Si el prompt ocupa más de 6 líneas, redúcelo a 9 pt antes que partirlo en dos páginas. **Un prompt nunca se corta entre páginas.**

### 6.5 Tablas

- Cabecera: fondo `#0A192F`, texto `#F9F9F9`, Montserrat Bold 10 pt.
- Filas alternas: `#FFFFFF` y `#EDEFF2`.
- Sin bordes verticales. Solo una línea horizontal de 0,5 pt en `#8892B0` al 40 % entre filas.
- Alineación: texto a la izquierda, números y precios a la derecha.

### 6.6 Ejercicios prácticos (`- [ ]`)

- Página completa con fondo `#EDEFF2`.
- Casillas dibujadas como cuadrados de 10 × 10 pt, borde 1 pt en `#FF6B35`, radio 2 pt.
- Título del ejercicio en Montserrat Bold 20 pt sobre una banda naranja de 8 pt de alto.

---

## 7. 📖 Portada, divisorias y cierre

### 7.1 Portada

| Elemento | Especificación |
| :--- | :--- |
| Fondo | `#0A192F` sólido con un degradado radial sutil de `#FF3D9A` al 12 % en la esquina superior derecha |
| Título | «EL SISTEMA DE CONSISTENCIA VISUAL CON IA» — Montserrat Black 54 pt, `#F9F9F9`, 3 líneas máximo |
| Subrayado | Barra de 6 pt × 80 mm en `#FF6B35` bajo el título |
| Subtítulo | «Cómo mantener el mismo personaje, el mismo estilo y la misma marca en 100 imágenes seguidas» — Inter Medium 20 pt, `#8892B0` |
| Precio | Badge redondeado, fondo `#FF6B35`, texto `#0A192F`: **$1,99 USD** — Montserrat Bold 16 pt |
| Autor | «por **Mateo Rivas** · Director de Arte Digital» — Inter Medium 12 pt, `#F9F9F9` |
| Logo | Centrado a 4 cm del borde inferior |

### 7.2 Divisoria de capítulo (nueva página virtual)

Cada `---` seguido de `## Capítulo X` genera una página completa así:

1. Fondo `#0A192F` a sangre.
2. Número gigante del capítulo: Montserrat Black **180 pt**, color `#FF6B35` al **20 %**, alineado a la izquierda y sangrado fuera del margen.
3. Encima, el título del capítulo en Montserrat Bold 30 pt, `#F9F9F9`.
4. Debajo, la frase gancho en Inter Italic 14 pt, `#2EE6D6`.
5. Sin número de página.

### 7.3 Página de cierre

Fondo `#0A192F`, logo centrado, y una sola frase en Inter Medium 16 pt:

*«La consistencia no es un truco. Es una decisión que tomas una vez y repites mil veces.»*

---

## 8. ✅ Checklist antes de exportar a PDF

- [ ] Ningún prompt está partido entre dos páginas.
- [ ] Ninguna página tiene más de **una** caja destacada de tipo oscuro.
- [ ] El Magenta Vapor `#FF3D9A` aparece **3 veces o menos** en todo el documento.
- [ ] Todas las tablas caben en el ancho de texto sin reducir la fuente por debajo de 9 pt.
- [ ] Las viudas y huérfanas están eliminadas (ninguna línea suelta al inicio o final de página).
- [ ] Los 8 capítulos empiezan en página impar (derecha) si se va a imprimir.
- [ ] El pie de página y la numeración aparecen en todas las páginas de contenido, en ninguna divisoria.
- [ ] El PDF exportado pesa **menos de 15 MB** (obligatorio para Gumroad y Payhip).
- [ ] Los hipervínculos son clicables y abren en pestaña nueva.
- [ ] Portada revisada al 25 % de zoom: el título debe leerse en miniatura.

---

> ### 🔥 Última nota del director:
> Un PDF de $1,99 con maquetación de $47 genera reseñas de cinco estrellas y recompras. Un PDF de $47 con maquetación de $1,99 genera reembolsos. **La maquetación no es decoración: es la promesa de calidad que el lector ve antes de leer una sola palabra.**

***

`AURA · Manual de Estilo v1.0 · Uso interno`
