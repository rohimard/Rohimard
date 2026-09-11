#!/usr/bin/env node
/**
 * Generador de sitios para negocios locales.
 *
 * Lee un JSON de cliente y escupe un sitio estático completo, listo para subir
 * a cualquier hosting gratuito. Sin build, sin dependencias, sin servidor.
 *
 *   node generar.mjs                      → genera todos los clientes
 *   node generar.mjs barberia-el-corte    → genera solo ese
 *
 * La salida queda en salida/<slug>/index.html
 */

import { readFile, readdir, mkdir, writeFile, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const DIR_CLIENTES = join(AQUI, "clientes");
const DIR_SALIDA = join(AQUI, "salida");
const DIR_PLANTILLA = join(AQUI, "plantilla");

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

/** Escapa texto para incrustarlo en HTML sin romper el marcado. */
function esc(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Deja solo dígitos: "+52 55 1234 5678" → "525512345678" (formato wa.me). */
function soloDigitos(valor) {
  return String(valor ?? "").replace(/\D/g, "");
}

/** Enlace de WhatsApp con mensaje prellenado. */
function enlaceWhatsapp(numero, mensaje) {
  const n = soloDigitos(numero);
  if (!n) return "";
  return `https://wa.me/${n}?text=${encodeURIComponent(mensaje)}`;
}

/** Error de validación con el nombre del archivo, para que se pueda arreglar. */
class ErrorCliente extends Error {
  constructor(archivo, mensaje) {
    super(`${archivo}: ${mensaje}`);
    this.name = "ErrorCliente";
  }
}

// ---------------------------------------------------------------------------
// Validación — falla pronto y con un mensaje que se entiende
// ---------------------------------------------------------------------------

function validar(datos, archivo) {
  if (!datos.slug || !/^[a-z0-9-]+$/.test(datos.slug)) {
    throw new ErrorCliente(
      archivo,
      'falta "slug" o tiene caracteres inválidos (solo minúsculas, números y guiones).',
    );
  }
  if (!datos.negocio?.nombre) {
    throw new ErrorCliente(archivo, 'falta "negocio.nombre".');
  }
  if (!datos.contacto?.whatsapp && !datos.contacto?.telefono) {
    throw new ErrorCliente(
      archivo,
      'necesita al menos "contacto.whatsapp" o "contacto.telefono".',
    );
  }
  if (!Array.isArray(datos.servicios) || datos.servicios.length === 0) {
    throw new ErrorCliente(archivo, 'necesita al menos un ítem en "servicios".');
  }
}

// ---------------------------------------------------------------------------
// Secciones — cada una devuelve HTML o "" si no hay datos
// ---------------------------------------------------------------------------

function seccionServicios(datos) {
  const { servicios, marca } = datos;
  const moneda = marca?.moneda ?? "$";

  const filas = servicios
    .map((s) => {
      const precio = s.precio
        ? `<span class="precio">${esc(
            typeof s.precio === "number" ? `${moneda}${s.precio}` : s.precio,
          )}</span>`
        : "";
      const desc = s.descripcion
        ? `<p class="servicio-desc">${esc(s.descripcion)}</p>`
        : "";
      return `        <li class="servicio">
          <div class="servicio-fila">
            <h3>${esc(s.nombre)}</h3>
            ${precio}
          </div>
          ${desc}
        </li>`;
    })
    .join("\n");

  return `    <section id="servicios" class="seccion">
      <h2>${esc(datos.textos?.tituloServicios ?? "Servicios y precios")}</h2>
      <ul class="servicios">
${filas}
      </ul>
    </section>`;
}

function seccionGaleria(datos) {
  const fotos = datos.galeria ?? [];
  if (fotos.length === 0) return "";

  const items = fotos
    .map(
      (f) => `        <figure>
          <img src="${esc(f.src)}" alt="${esc(f.alt ?? datos.negocio.nombre)}" loading="lazy" width="600" height="600">
        </figure>`,
    )
    .join("\n");

  return `    <section id="galeria" class="seccion">
      <h2>${esc(datos.textos?.tituloGaleria ?? "Nuestro trabajo")}</h2>
      <div class="galeria">
${items}
      </div>
    </section>`;
}

function seccionResenas(datos) {
  const resenas = datos.resenas ?? [];
  if (resenas.length === 0) return "";

  const items = resenas
    .map(
      (r) => `        <blockquote>
          <p>${esc(r.texto)}</p>
          <cite>${esc(r.autor)}</cite>
        </blockquote>`,
    )
    .join("\n");

  return `    <section id="resenas" class="seccion seccion-alt">
      <h2>${esc(datos.textos?.tituloResenas ?? "Lo que dicen los clientes")}</h2>
      <div class="resenas">
${items}
      </div>
    </section>`;
}

function seccionHorario(datos) {
  const horario = datos.horario ?? [];
  if (horario.length === 0) return "";

  const filas = horario
    .map(
      (h) => `          <div class="horario-fila">
            <dt>${esc(h.dias)}</dt>
            <dd>${esc(h.horas)}</dd>
          </div>`,
    )
    .join("\n");

  return `      <div class="horario">
        <h3>Horario</h3>
        <dl>
${filas}
        </dl>
      </div>`;
}

function seccionMapa(datos) {
  const mapa = datos.contacto?.mapa;
  if (!mapa) return "";
  return `      <div class="mapa">
        <iframe
          src="${esc(mapa)}"
          title="Ubicación de ${esc(datos.negocio.nombre)}"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          allowfullscreen></iframe>
      </div>`;
}

function seccionContacto(datos) {
  const c = datos.contacto ?? {};
  const lineas = [];

  if (c.direccion) {
    lineas.push(`          <li><strong>Dónde:</strong> ${esc(c.direccion)}</li>`);
  }
  if (c.telefono) {
    lineas.push(
      `          <li><strong>Teléfono:</strong> <a href="tel:${esc(soloDigitos(c.telefono))}">${esc(c.telefono)}</a></li>`,
    );
  }
  if (c.email) {
    lineas.push(
      `          <li><strong>Email:</strong> <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>`,
    );
  }

  const redes = datos.redes ?? {};
  const enlacesRedes = Object.entries(redes)
    .filter(([, url]) => url)
    .map(
      ([nombre, url]) =>
        `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(nombre)}</a>`,
    )
    .join(" · ");

  return `    <section id="contacto" class="seccion">
      <h2>${esc(datos.textos?.tituloContacto ?? "Dónde encontrarnos")}</h2>
      <div class="contacto">
        <ul class="datos-contacto">
${lineas.join("\n")}
        </ul>
${seccionHorario(datos)}
      </div>
${seccionMapa(datos)}
      ${enlacesRedes ? `<p class="redes">${enlacesRedes}</p>` : ""}
    </section>`;
}

// ---------------------------------------------------------------------------
// Plantilla
// ---------------------------------------------------------------------------

function construirHtml(datos) {
  const n = datos.negocio;
  const c = datos.contacto ?? {};
  const marca = datos.marca ?? {};

  const mensajeWa =
    datos.textos?.mensajeWhatsapp ?? `Hola, vengo de la web de ${n.nombre}. Quisiera información.`;
  const waUrl = enlaceWhatsapp(c.whatsapp || c.telefono, mensajeWa);
  const ctaTexto = datos.textos?.cta ?? "Escríbenos por WhatsApp";

  const descripcion =
    n.descripcion ?? `${n.nombre}${n.tipo ? ` — ${n.tipo}` : ""}${c.direccion ? ` en ${c.direccion}` : ""}.`;

  const botonPrincipal = waUrl
    ? `<a class="btn btn-wa" href="${esc(waUrl)}" target="_blank" rel="noopener">${esc(ctaTexto)}</a>`
    : `<a class="btn btn-wa" href="tel:${esc(soloDigitos(c.telefono))}">Llámanos</a>`;

  const flotante = waUrl
    ? `  <a class="wa-flotante" href="${esc(waUrl)}" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp">
    <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.03c-.24.68-1.42 1.31-1.95 1.36-.5.05-.98.23-3.3-.69-2.77-1.1-4.53-3.93-4.67-4.11-.14-.18-1.12-1.49-1.12-2.85s.71-2.02.97-2.3c.25-.27.55-.34.73-.34h.52c.17 0 .4-.06.62.48.24.57.8 1.98.87 2.12.07.14.12.31.02.5-.09.18-.14.3-.28.46-.14.16-.29.36-.42.48-.14.14-.28.29-.12.57.16.27.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.27.14.43.12.59-.07.16-.18.68-.79.86-1.07.18-.27.36-.22.61-.13.24.09 1.55.73 1.82.86.27.14.45.2.51.32.07.11.07.66-.17 1.34Z"/>
    </svg>
  </a>`
    : "";

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(n.nombre)}${n.tipo ? ` · ${esc(n.tipo)}` : ""}</title>
<meta name="description" content="${esc(descripcion)}">
<meta property="og:title" content="${esc(n.nombre)}">
<meta property="og:description" content="${esc(descripcion)}">
<meta property="og:type" content="website">
<link rel="stylesheet" href="estilos.css">
<style>:root{--marca:${esc(marca.color ?? "#0f766e")};--marca-oscuro:${esc(marca.colorOscuro ?? "#115e59")}}</style>
<script type="application/ld+json">
${JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: n.nombre,
    description: descripcion,
    telephone: c.telefono || c.whatsapp || undefined,
    address: c.direccion ? { "@type": "PostalAddress", streetAddress: c.direccion } : undefined,
  },
  null,
  2,
).replace(/</g, "\\u003c")}
</script>
</head>
<body>

<header class="hero"${n.portada ? ` style="background-image:linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.65)),url('${esc(n.portada)}')"` : ""}>
  <div class="hero-contenido">
    <h1>${esc(n.nombre)}</h1>
    ${n.eslogan ? `<p class="eslogan">${esc(n.eslogan)}</p>` : ""}
    ${c.direccion ? `<p class="hero-dir">${esc(c.direccion)}</p>` : ""}
    ${botonPrincipal}
  </div>
</header>

<main>
${n.descripcion ? `    <section class="seccion intro"><p>${esc(n.descripcion)}</p></section>` : ""}
${seccionServicios(datos)}
${seccionGaleria(datos)}
${seccionResenas(datos)}
${seccionContacto(datos)}

    <section class="seccion cierre">
      <h2>${esc(datos.textos?.tituloCierre ?? "¿Te agendamos?")}</h2>
      <p>${esc(datos.textos?.textoCierre ?? "Respondemos en minutos por WhatsApp.")}</p>
      ${botonPrincipal}
    </section>
</main>

<footer>
  <p>© ${new Date().getFullYear()} ${esc(n.nombre)}</p>
</footer>

${flotante}
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Programa principal
// ---------------------------------------------------------------------------

async function generarUno(archivo) {
  const crudo = await readFile(join(DIR_CLIENTES, archivo), "utf8");

  let datos;
  try {
    datos = JSON.parse(crudo);
  } catch (err) {
    throw new ErrorCliente(archivo, `el JSON no es válido — ${err.message}`);
  }

  validar(datos, archivo);

  const destino = join(DIR_SALIDA, datos.slug);
  await mkdir(destino, { recursive: true });
  await writeFile(join(destino, "index.html"), construirHtml(datos), "utf8");
  await copyFile(join(DIR_PLANTILLA, "estilos.css"), join(destino, "estilos.css"));

  return { slug: datos.slug, nombre: datos.negocio.nombre, destino };
}

async function main() {
  const filtro = process.argv[2];

  if (!existsSync(DIR_CLIENTES)) {
    console.error(`No existe la carpeta ${DIR_CLIENTES}`);
    process.exit(1);
  }

  let archivos = (await readdir(DIR_CLIENTES)).filter((f) => f.endsWith(".json"));
  if (filtro) {
    const buscado = filtro.endsWith(".json") ? filtro : `${filtro}.json`;
    archivos = archivos.filter((f) => f === buscado);
    if (archivos.length === 0) {
      console.error(`No encontré clientes/${buscado}`);
      process.exit(1);
    }
  }

  if (archivos.length === 0) {
    console.log("No hay clientes en clientes/. Copia el ejemplo y edítalo.");
    return;
  }

  let errores = 0;
  for (const archivo of archivos) {
    try {
      const r = await generarUno(archivo);
      console.log(`  ✓ ${r.nombre}  →  salida/${r.slug}/index.html`);
    } catch (err) {
      errores++;
      console.error(`  ✗ ${err instanceof ErrorCliente ? err.message : `${archivo}: ${err.message}`}`);
    }
  }

  const ok = archivos.length - errores;
  console.log(`\n${ok} sitio(s) generado(s)${errores ? `, ${errores} con error` : ""}.`);
  if (errores) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
