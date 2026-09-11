# Sitios para negocios locales

Herramienta para vender webs a negocios locales **enseñando el trabajo hecho
antes de pedir dinero**. Rellenas un JSON, sale un sitio completo en un segundo.

```bash
node generar.mjs                    # genera todos los clientes
node generar.mjs barberia-el-corte  # genera solo uno
```

El resultado queda en `salida/<slug>/` — dos archivos, sin build ni servidor.
Se sube a Netlify Drop, Cloudflare Pages o GitHub Pages gratis, arrastrando
la carpeta.

---

## Por qué esto y no otra cosa

La venta normal es: escribes a 100 negocios, te ignoran 98, dos te piden
presupuesto, uno te contrata en tres semanas. No funciona sin reputación.

La venta con trabajo hecho es: **construyes su web antes de escribirles**, se la
mandas terminada y les pides 5 minutos. Convierte mucho mejor porque el negocio
no tiene que imaginarse nada ni arriesgar nada.

El problema de ese método siempre fue el tiempo: no puedes regalar 6 horas por
prospecto. Con esto son 20 minutos. Ahí está toda la ventaja.

---

## El método, paso a paso

### 1. Haz la lista (1 hora, una sola vez)

Abre Google Maps y busca en tu ciudad: `barbería`, `dentista`, `taller
mecánico`, `veterinaria`, `gimnasio`, `estética`, `cerrajero`, `clínica dental`.

Apunta solo los que cumplan **las tres**:

- Tienen ficha en Google con **reseñas buenas** (les importa su reputación)
- **No tienen web**, o tienen una de hace diez años que no se ve en móvil
- Tienen **WhatsApp o teléfono visible**

30 negocios es suficiente para empezar. Los que no tienen web y sí tienen
reseñas son los que mejor convierten: ya les funciona el negocio, solo les
falta estar en internet.

### 2. Construye la web (20 minutos por negocio)

Copia `clientes/barberia-el-corte.json`, renómbralo y rellénalo con los datos
**reales de su ficha de Google**: nombre, dirección, horario, teléfono, y sus
propias reseñas (cópialas literales, con el nombre de quien las escribió).

Los precios sácalos de sus fotos o su Facebook. Si no los encuentras, pon los
servicios sin precio — ya los ajustarán.

```bash
node generar.mjs nombre-del-negocio
```

Súbelo a Netlify Drop. Tienes una URL pública en 30 segundos.

### 3. Escribe (2 minutos)

Por WhatsApp, no por email. El email de un negocio local no lo lee nadie.

> Hola, buenas. Soy [tu nombre], hago páginas web aquí en [ciudad].
>
> Vi que [Negocio] tiene [X] reseñas de 5 estrellas pero no aparece en Google
> con página propia. Les hice una para que vean cómo quedaría:
>
> [tu-url.netlify.app]
>
> Está hecha con sus datos reales. Si les gusta la dejo funcionando con su
> dominio por [precio]. Si no, se la queda igual, sin compromiso.

Tres cosas que hacen que esto funcione y que no conviene cambiar:

- **Ya está hecha.** No prometes, enseñas.
- **Sin compromiso de verdad.** Si dices que se la regalan, cúmplelo.
- **Un solo precio.** Nada de "desde" ni paquetes. Una cifra, una decisión.

### 4. Precio

| Qué | Cuánto | Por qué |
|---|---|---|
| Web + dominio + publicación | **$250 – $400** | Una sola decisión, sin firma ni reunión |
| Cambios después | $40 por cambio | O gratis el primer mes, para que digan que sí |
| Mantenimiento mensual | $25/mes | Opcional. Es lo que convierte esto en ingreso recurrente |

No bajes de $200. Un precio muy bajo hace dudar de la calidad y te deja
trabajando gratis. El dominio cuesta ~$12 al año; el hosting, nada.

### 5. Los números reales

De 30 negocios contactados con la web ya hecha, lo esperable es:

- 10-15 responden
- 3-6 quieren hablar
- **1-3 pagan**

A $300, eso es **$300–900 del primer lote**. Con 20 minutos por web, son unas
10 horas de trabajo. No es hacerse rico: es cobrar en semanas en vez de en
meses, y tener 2-3 casos reales que enseñar al siguiente lote — que ya convierte
mejor porque dejas de ser un desconocido.

El segundo mes es más fácil que el primero. El tercero, más que el segundo.

---

## Arreglar las fotos (tu ventaja real)

Casi todos los negocios locales tienen fotos malas, y es lo que hace que su web
parezca barata. Tienes herramientas conectadas para arreglarlo **gratis**:

| Problema | Herramienta | Cómo |
|---|---|---|
| Fondo feo o desordenado | Hugging Face → `not-lain/background-removal` | Quita el fondo del producto o la persona |
| Foto oscura, borrosa, vieja | Hugging Face → `fffiloni/InstantIR` | Restaura y limpia |
| Falta una foto de portada | Hugging Face → `mcp-tools/Qwen-Image` | Genera una imagen con el texto de la marca |
| Marca de agua o un objeto molesto | Hugging Face → `prithivMLmods/Photo-Mate-i2i` | Lo borra |

Eso es lo que te diferencia del sobrino que le hace la web gratis: **sus fotos
se ven bien**. Enséñalo en el mensaje: *"les arreglé también las fotos"*.

---

## Formato del JSON

Solo `slug`, `negocio.nombre`, un medio de contacto y un servicio son
obligatorios. Todo lo demás es opcional y, si falta, la sección no aparece.

| Campo | Qué es |
|---|---|
| `slug` | Nombre de la carpeta. Minúsculas, números y guiones |
| `negocio.nombre` | **Obligatorio** |
| `negocio.eslogan` | Una línea bajo el título |
| `negocio.descripcion` | Párrafo de presentación. También es la meta descripción de Google |
| `negocio.portada` | URL de imagen de fondo. Si falta, se usa el color de marca |
| `contacto.whatsapp` | **Obligatorio** (o `telefono`). Cualquier formato: se limpia solo |
| `contacto.mapa` | URL de inserción de Google Maps. Sin ella no sale el mapa |
| `horario[]` | `{ dias, horas }` |
| `servicios[]` | `{ nombre, precio, descripcion }`. **Al menos uno.** `precio` admite número (`180` → `$180`) o texto (`"Desde $500"`) |
| `resenas[]` | `{ texto, autor }`. Cópialas de su ficha de Google |
| `galeria[]` | `{ src, alt }` |
| `redes` | `{ instagram, facebook, ... }` |
| `marca.color` | Color principal. `marca.moneda` cambia el símbolo |
| `textos` | Cambia cualquier título o el mensaje que se prellena en WhatsApp |

El generador valida antes de escribir y dice exactamente qué falta y en qué
archivo. Todo el texto se escapa, así que un nombre con `&` o comillas no rompe
la página.

---

## Lo que este sitio hace bien a propósito

- **WhatsApp, no formulario de contacto.** En Latinoamérica y España el negocio
  local cierra por WhatsApp. El botón lleva el mensaje ya escrito.
- **Móvil primero.** Casi todo el tráfico de un negocio local es de teléfono.
- **Datos estructurados** (`LocalBusiness`) para que Google entienda horario,
  dirección y teléfono.
- **Dos archivos, sin JavaScript.** Carga al instante hasta con mala señal.
