<div align="center">

# 🎁 BONOS Y CHEATSHEET

### ✨ *Los tres extras que acompañan a «El Sistema de Consistencia Visual con IA»*

**AURA** · `VISUAL SYSTEM` · ✒️ **Mateo Rivas**

</div>

***

## 📑 Contenido de este documento

| Bono | Qué es | Para qué sirve |
| :--- | :--- | :--- |
| 🥇 **1** | Cheatsheet de 20 comandos infalibles | Tenerla al lado del teclado y no volver a buscar nada |
| 🥈 **2** | Mockup de portada en Canva | Montar la portada de tu propio producto digital |
| 🥉 **3** | 30 tipos de cuenta que compran arte IA | Saber a quién ofrecer tu trabajo y con qué ángulo |

---
<br>

## 🥇 Bono 1 · Cheatsheet: 20 comandos infalibles

> ### 💡 Antes de empezar:
> Los parámetros con `--` son de **Midjourney**. En DALL·E y Leonardo se piden en lenguaje natural o desde la interfaz; la columna «Efecto» te dice qué buscar en cada caso. **Imprime esta página.**

### 📐 Bloque A · Formato y encuadre

| Comando | Efecto | Ejemplo |
| :--- | :--- | :--- |
| `--ar 9:16` | Formato vertical para Reels, TikTok y Shorts | `--ar 9:16` |
| `--ar 4:5` | Vertical de feed, el más rentable de Instagram | `--ar 4:5` |
| `--ar 1:1` | Cuadrado para feed, clipart y patrones | `--ar 1:1` |
| `--ar 21:9` | Panorámico cinematográfico para banners | `--ar 21:9` |
| `--zoom 1.5` | Aleja la cámara y genera más entorno alrededor | `--zoom 1.5` |

### 🎨 Bloque B · Estilo y consistencia

| Comando | Efecto | Ejemplo |
| :--- | :--- | :--- |
| `--sref [url]` | Copia el **estilo** de una imagen de referencia | `--sref https://ejemplo.com/estilo.png` |
| `--sw 100` | Intensidad de la referencia de estilo (0–1000) | `--sref [url] --sw 150` |
| `--cref [url]` | Copia el **personaje** de una imagen de referencia | `--cref https://ejemplo.com/canon.png` |
| `--cw 100` | Cuánto se copia del personaje: 100 cara+ropa, 0 solo cara | `--cref [url] --cw 85` |
| `--profile` | Aplica tu perfil de estilo personalizado guardado | `--profile abc123` |

### ⚙️ Bloque C · Control del resultado

| Comando | Efecto | Ejemplo |
| :--- | :--- | :--- |
| `--seed 4242` | Fija la semilla para reproducir resultados similares | `--seed 4242` |
| `--stylize 100` | Baja la interpretación artística: obedece más tu texto | `--stylize 80` |
| `--stylize 500` | Sube la interpretación: más bonito, menos fiel | `--stylize 500` |
| `--style raw` | Elimina el embellecimiento automático. **Clave en fotografía** | `--style raw` |
| `--quality 2` | Duplica el detalle y el tiempo de cálculo | `--quality 2` |

### 🚀 Bloque D · Producción en lote

| Comando | Efecto | Ejemplo |
| :--- | :--- | :--- |
| `{a, b, c}` | Permutaciones: una imagen por cada combinación | `icon of a {rocket, anchor, compass}` |
| `--repeat 4` | Lanza el mismo prompt varias veces de golpe | `--repeat 4` |
| `--tile` | Genera un patrón que se repite sin costuras | `--tile --ar 1:1` |
| `--no [x]` | Excluye un elemento del resultado | `--no text, watermark, hands` |
| `--chaos 30` | Aumenta la variedad entre las 4 propuestas iniciales | `--chaos 30` |

> ### ⚠️ **Los 3 errores de parámetros más caros**
> **1.** Usar `--stylize 750` en fotografía → el modelo te devuelve ilustración.
> **2.** Olvidar `--style raw` en producto → te sale un banco de imágenes genérico.
> **3.** Lanzar 64 permutaciones sin validar la estructura → 64 imágenes inservibles.

---
<br>

## 🥈 Bono 2 · Mockup de portada en Canva

> ### 🚀 Objetivo:
> Montar en **20 minutos** una portada que haga que tu producto de $1,99 parezca de $47.

### 📏 Paso 1 · Crear el lienzo con las medidas exactas

| Uso final | Medidas | Cómo crearlo en Canva |
| :--- | :--- | :--- |
| Portada de PDF (A4) | **210 × 297 mm** | Crear diseño → Tamaño personalizado → 2480 × 3508 px a 300 DPI |
| Miniatura de venta (Gumroad, Payhip) | **1280 × 720 px** | Crear diseño → Tamaño personalizado |
| Mockup vertical para redes | **1080 × 1350 px** | Crear diseño → Publicación de Instagram (vertical) |
| Portada tipo eBook (Kindle) | **1600 × 2560 px** | Crear diseño → Tamaño personalizado |

### 🎨 Paso 2 · Fondo

1. Añade un **rectángulo** que cubra todo el lienzo.
2. Rellénalo con el color `#0A192F` (Azul Marino Profundo).
3. Añade un **círculo** de 900 px en la esquina superior derecha, relleno `#FF3D9A`, y baja su transparencia al **12 %**.
4. Aplica desenfoque al círculo si tu plan lo permite. Esto crea el «halo de neón» de la portada.

### ✍️ Paso 3 · Tipografía

| Elemento | Fuente | Tamaño | Color | Posición |
| :--- | :--- | :--- | :--- | :--- |
| Título | **Montserrat Black** | 54 pt | `#F9F9F9` | Centrado, a 8 cm del borde superior |
| Barra de acento | Rectángulo 6 × 80 mm | — | `#FF6B35` | Justo debajo del título |
| Subtítulo | **Inter Medium** | 20 pt | `#8892B0` | 1,5 cm bajo la barra |
| Precio | **Montserrat Bold** | 16 pt | `#0A192F` sobre badge `#FF6B35` | A 3 cm bajo el subtítulo |
| Autor | **Inter Medium** | 12 pt | `#F9F9F9` | A 2 cm sobre el logo |
| Logo AURA | **Montserrat Black** + línea | 24 pt | `#F9F9F9` / línea `#FF6B35` | Centrado, a 4 cm del borde inferior |

### 🖼️ Paso 4 · Elemento visual

1. Genera con tu IA una imagen en **1:1** con el estilo del producto y **fondo liso**.
2. Súbela a Canva (`Subir archivos`).
3. Colócala **detrás** del bloque de texto, con transparencia al **25 %**, o **encima** en un círculo recortado de 400 px si prefieres protagonismo.
4. **Nunca** pongas texto sobre la zona de mayor detalle de la imagen.

### 📦 Paso 5 · Exportar

| Destino | Formato | Ajuste |
| :--- | :--- | :--- |
| PDF del producto | PDF Impresión | Marcas de recorte desactivadas |
| Miniatura de tienda | PNG | Comprimir activado |
| Redes sociales | JPG | Calidad 90 % |

> ### 💡 Tip de experto:
> Reduce la portada al **25 % de zoom** antes de exportar. Si el título no se lee a ese tamaño, no se leerá en la miniatura de la tienda — y la miniatura es lo único que ve el 100 % de los compradores potenciales antes de decidir.

---
<br>

## 🥉 Bono 3 · 30 tipos de cuenta que compran arte IA

> ### 📌 Cómo usar esta lista:
> No son nombres concretos: son **perfiles de comprador**. Busca cada perfil en Instagram, TikTok, Fiverr o Etsy, quédate con cuentas de entre **2.000 y 50.000 seguidores** (las grandes ya tienen estudio, las pequeñas no tienen presupuesto) y ofrece el ángulo indicado.

### 🏢 Negocios y marcas

- **Cafeterías de especialidad** → menús ilustrados y contenido estacional coherente.
- **Marcas de cosmética natural** → escenas de producto en un único estilo de luz.
- **Estudios de yoga y pilates** → ilustraciones serenas para horarios y anuncios.
- **Clínicas dentales y estéticas** → visuales amables que no den miedo.
- **Inmobiliarias boutique** → ambientaciones y estilos de interior antes de reformar.
- **Restaurantes de autor** → cartas ilustradas y contenido de temporada.
- **Marcas de mascotas** → mascota de marca en 20 poses (el encargo perfecto del Capítulo 4).
- **Tiendas de plantas** → fichas ilustradas coherentes para todo el catálogo.

### 🎙️ Creadores de contenido

- **Podcasters** → portadas de episodio semanales con la misma identidad.
- **Youtubers de nicho** → miniaturas en serie con estilo reconocible.
- **Blogs y medios de nicho** → cabeceras de artículo con una identidad visual única.
- **Streamers de gaming** → overlays, emotes y paneles en ciberpunk neón.
- **Coaches y formadores** → carruseles ilustrados para explicar conceptos.
- **Cuentas de citas y frases** → fondos coherentes en lugar de plantillas repetidas.
- **Divulgadores científicos** → ilustraciones didácticas de una misma familia visual.

### ✍️ Autores y editoriales

- **Autores autopublicados** → portadas de saga con coherencia entre volúmenes.
- **Escritores de fantasía y ciencia ficción** → mapas, personajes y criaturas.
- **Autores infantiles** → el mismo protagonista en 24 páginas (el encargo mejor pagado).
- **Editoriales pequeñas** → colecciones con identidad visual unificada.
- **Creadores de juegos de mesa** → cartas, fichas y tableros con un solo arquetipo.

### 🛍️ Vendedores de producto digital y físico

- **Vendedores de Etsy** → packs de clipart y papeles digitales coherentes.
- **Diseñadores de papelería** → agendas, planificadores y stickers en serie.
- **Marcas de camisetas print on demand** → series temáticas de 8–12 diseños.
- **Vendedores de pósters imprimibles** → colecciones que se compran de tres en tres.
- **Creadores de plantillas** → visuales de portada para sus propios productos.

### 🎯 Agencias y profesionales

- **Agencias de marketing pequeñas** → subcontratan visuales para sus clientes.
- **Wedding planners y fotógrafos de boda** → invitaciones y papelería ilustrada.
- **Organizadores de eventos** → carteles de una misma familia para todo el ciclo.
- **Consultoras y despachos** → visuales sobrios en estilo minimalista.
- **Startups en fase inicial** → identidad visual completa antes de tener presupuesto de agencia.

> ### 🚀 **El Truco del Profesional**
> No ofrezcas «servicios de diseño». Ofrece **el problema resuelto de ese perfil concreto**: a la cafetería, «12 visuales de temporada coherentes»; al autor, «tu protagonista en 24 escenas»; al streamer, «tu pack completo de canal». El mensaje genérico se ignora; el mensaje específico se responde.

---

<div align="center">

***

**AURA** · `VISUAL SYSTEM`

*«La consistencia no es un truco. Es una decisión que tomas una vez y repites mil veces.»*

✒️ **Mateo Rivas** · Director de Arte Digital · 💰 **$1,99 USD**

</div>
