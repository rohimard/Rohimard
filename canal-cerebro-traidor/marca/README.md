# Marca del canal — Cerebro Traidor

Archivos generados con `../../canal-youtube/kit-produccion/scripts/brand_assets.js brand.json`
(el mismo script de Historia Incómoda, ahora generalizado para soportar más
de un símbolo — ver `mark` en `brand.json`). Para cambiar textos o colores:
edita `brand.json` y vuelve a ejecutarlo.

## Paleta (paleta propia, distinta a Historia Incómoda a propósito)

| Color | Hex | Uso |
|---|---|---|
| Negro tinta | `#0B0B0C` | Fondo — mismo que Historia Incómoda, es la base de marca del creador |
| Violeta | `#8B5CF6` | Acento principal, cifras, logo — nunca amarillo/rojo de Historia Incómoda |
| Rojo carmesí | `#C40800` | Barra de remate — el mismo rojo ya usado en el sello "MANIPULADO" del video 1 |
| Blanco | `#FFFFFF` | Texto principal |

Que el acento sea violeta (no amarillo) es deliberado: los dos canales
comparten creador y a veces aparecen juntos en recomendados — con paletas
distintas, nadie los confunde a primer vistazo.

Tipografía: **Anton**, la misma en todo el kit.

## Logo — `logo-mark.png` (símbolo: anillo partido)

Un círculo casi cerrado con un hueco arriba — terminó pareciéndose a un
símbolo de encendido/apagado, lo cual resultó ser un acierto conceptual: la
pregunta que hace todo el canal es "¿de verdad tienes tú el control, o hay
algo que te enciende y apaga por su cuenta?".

**Por qué esta forma y no otra**: se probó primero un asterisco (el símbolo
de Historia Incómoda), pero habría hecho que un espectador confundiera los
dos canales en el feed. El anillo partido es una sola forma sólida, sin
detalle fino, y se probó explícitamente a tamaño real:

Verificado con `avatar_test.js` (circular, como lo recorta YouTube), a 96,
48 y 24px, sobre fondo blanco y sobre fondo oscuro — se mantiene legible
como una sola forma en los cuatro casos. Aprobado.

Variantes de comparación generadas también (`logo-asterisco.png`,
`logo-monograma.png`, etc.) por si en algún momento se quiere revisar la
decisión — no se usan, quedan como registro.

**Regla**: una vez subido a YouTube, no se cambia. El reconocimiento en el
feed se construye por repetición.

## Banner — `banner.png` (2048x1152)

`banner-guias.png` es la misma imagen con la zona segura dibujada; no se
sube, es solo para comprobar.

Contenido:
- **CEREBRO TRAIDOR** (blanco + violeta), una sola línea
- Barra roja de remate (11px, mismo carmesí que el sello del video 1)
- Tagline: **TU CEREBRO DECIDE POR TI SIN QUE LO SEPAS** — mismo registro
  de segunda persona que usan los guiones, nada de "aprende" ni "descubre"
- El anillo partido bleeding hacia los lados, fuera de la zona segura,
  como relleno intencionado en desktop/TV (mismo recurso que el asterisco
  de Historia Incómoda)

## Pendiente

- [ ] Subir `logo-mark.png` y `banner.png` a YouTube Studio una vez creado
      el canal.
- [ ] Reclamar el handle elegido (ver `01-identidad-del-canal.md`).
