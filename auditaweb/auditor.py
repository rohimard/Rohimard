"""Motor de auditoria SEO tecnica.

Descarga una URL publica, la analiza con ~30 comprobaciones y devuelve un
diccionario con la puntuacion global, el detalle por categoria y el plan de
accion. No depende de ninguna API de pago: todo sale del HTML y de las
cabeceras de la respuesta.
"""

from __future__ import annotations

import re
import socket
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

USER_AGENT = (
    "Mozilla/5.0 (compatible; AuditaWebBot/1.0; +https://auditaweb.app/bot)"
)
TIMEOUT = 15
MAX_BYTES = 5 * 1024 * 1024

OK, AVISO, ERROR, INFO = "ok", "aviso", "error", "info"

CATEGORIAS = [
    "Metadatos",
    "Contenido",
    "Imagenes y accesibilidad",
    "Redes sociales",
    "Datos estructurados",
    "Rendimiento",
    "Indexacion y seguridad",
]


class AuditError(Exception):
    """La URL no se ha podido analizar (DNS, timeout, bloqueo, no-HTML)."""


@dataclass
class Check:
    id: str
    categoria: str
    titulo: str
    estado: str
    peso: int
    detalle: str
    arreglo: str = ""
    valor: str = ""

    def como_dict(self) -> dict:
        return {
            "id": self.id,
            "categoria": self.categoria,
            "titulo": self.titulo,
            "estado": self.estado,
            "peso": self.peso,
            "detalle": self.detalle,
            "arreglo": self.arreglo,
            "valor": self.valor,
        }


@dataclass
class _Contexto:
    url: str
    respuesta: requests.Response
    sopa: BeautifulSoup
    ms: int
    redirecciones: list = field(default_factory=list)


# ---------------------------------------------------------------- utilidades

def normalizar_url(entrada: str) -> str:
    """Acepta 'midominio.com' y devuelve una URL http(s) valida."""
    texto = (entrada or "").strip()
    if not texto:
        raise AuditError("Escribe la direccion de una pagina web.")
    if not re.match(r"^https?://", texto, re.I):
        texto = "https://" + texto
    partes = urlparse(texto)
    if partes.scheme not in ("http", "https"):
        raise AuditError("Solo se admiten direcciones http:// o https://.")
    if not partes.netloc or "." not in partes.netloc:
        raise AuditError(f"'{entrada}' no parece un dominio valido.")
    return partes.geturl()


def _texto(nodo) -> str:
    return nodo.get_text(strip=True) if nodo else ""


def _descargar(url: str) -> _Contexto:
    inicio = time.perf_counter()
    try:
        respuesta = requests.get(
            url,
            timeout=TIMEOUT,
            headers={
                "User-Agent": USER_AGENT,
                "Accept": "text/html,application/xhtml+xml",
                "Accept-Encoding": "gzip, deflate",
            },
            allow_redirects=True,
            stream=True,
        )
        contenido = respuesta.raw.read(MAX_BYTES, decode_content=True)
        respuesta._content = contenido
    except requests.exceptions.SSLError as exc:
        raise AuditError(
            "El certificado HTTPS del sitio no es valido. Revisalo antes de auditar."
        ) from exc
    except requests.exceptions.ConnectTimeout as exc:
        raise AuditError("El servidor tardo demasiado en responder (timeout).") from exc
    except requests.exceptions.ProxyError as exc:
        raise AuditError(
            "No se pudo salir a internet desde este servidor (proxy). "
            "En local o en Render funciona con normalidad."
        ) from exc
    except (requests.exceptions.ConnectionError, socket.gaierror) as exc:
        raise AuditError(
            "No se pudo conectar con ese dominio. Comprueba que esta escrito bien "
            "y que la web esta en linea."
        ) from exc
    except requests.exceptions.RequestException as exc:
        raise AuditError(f"No se pudo descargar la pagina: {exc}") from exc

    ms = int((time.perf_counter() - inicio) * 1000)

    if respuesta.status_code >= 400:
        raise AuditError(
            f"El servidor respondio {respuesta.status_code}. "
            "Puede que la pagina no exista o que bloquee a los robots."
        )
    tipo = respuesta.headers.get("Content-Type", "")
    if "html" not in tipo.lower():
        raise AuditError(
            f"La direccion devuelve '{tipo or 'contenido desconocido'}' y no una pagina HTML."
        )

    sopa = BeautifulSoup(respuesta.text, "html.parser")
    saltos = [r.headers.get("Location", r.url) for r in respuesta.history]
    return _Contexto(url=url, respuesta=respuesta, sopa=sopa, ms=ms, redirecciones=saltos)


def _pedir(url: str) -> requests.Response | None:
    try:
        return requests.get(
            url, timeout=8, headers={"User-Agent": USER_AGENT}, allow_redirects=True
        )
    except requests.exceptions.RequestException:
        return None


# ------------------------------------------------------ bloques de analisis

def _metadatos(ctx: _Contexto) -> list[Check]:
    sopa, cat, checks = ctx.sopa, "Metadatos", []

    titulo = _texto(sopa.title)
    if not titulo:
        checks.append(Check(
            "title", cat, "Etiqueta <title>", ERROR, 10,
            "La pagina no tiene titulo. Google mostrara un texto inventado en los resultados.",
            "Anade <title>Palabra clave | Marca</title> dentro de <head>, entre 30 y 60 caracteres.",
        ))
    else:
        largo = len(titulo)
        if 30 <= largo <= 60:
            estado, detalle, arreglo = OK, f"Titulo correcto ({largo} caracteres).", ""
        elif largo < 30:
            estado = AVISO
            detalle = f"El titulo solo tiene {largo} caracteres: desaprovechas espacio en Google."
            arreglo = "Amplialo hasta 30-60 caracteres incluyendo la palabra clave y la marca."
        else:
            estado = AVISO
            detalle = f"El titulo tiene {largo} caracteres y Google lo cortara sobre los 60."
            arreglo = "Recortalo a 60 caracteres dejando la palabra clave al principio."
        checks.append(Check("title", cat, "Etiqueta <title>", estado, 10, detalle, arreglo, titulo))

    meta = sopa.find("meta", attrs={"name": re.compile("^description$", re.I)})
    desc = (meta.get("content") or "").strip() if meta else ""
    if not desc:
        checks.append(Check(
            "description", cat, "Meta description", ERROR, 8,
            "No hay meta description. Google recorta un fragmento al azar y baja el porcentaje de clics.",
            'Anade <meta name="description" content="..."> de 70-160 caracteres con una llamada a la accion.',
        ))
    else:
        largo = len(desc)
        if 70 <= largo <= 160:
            checks.append(Check("description", cat, "Meta description", OK, 8,
                                f"Descripcion correcta ({largo} caracteres).", "", desc))
        else:
            corta = largo < 70
            checks.append(Check(
                "description", cat, "Meta description", AVISO, 8,
                f"La descripcion tiene {largo} caracteres ({'demasiado corta' if corta else 'se cortara en Google'}).",
                "Ajustala a 70-160 caracteres describiendo el beneficio concreto de la pagina.",
                desc,
            ))

    canonical = sopa.find("link", rel=lambda v: v and "canonical" in [x.lower() for x in v])
    if canonical and canonical.get("href"):
        checks.append(Check("canonical", cat, "URL canonica", OK, 6,
                            "Declarada correctamente.", "", canonical["href"]))
    else:
        checks.append(Check(
            "canonical", cat, "URL canonica", ERROR, 6,
            "Falta rel=canonical. Si la pagina es accesible con y sin 'www', o con parametros, Google la vera duplicada.",
            'Anade <link rel="canonical" href="https://tudominio.com/esta-pagina"> en el <head>.',
        ))

    html = sopa.find("html")
    idioma = (html.get("lang") if html else "") or ""
    if idioma:
        checks.append(Check("lang", cat, "Idioma declarado", OK, 4,
                            f"Declarado como '{idioma}'.", "", idioma))
    else:
        checks.append(Check(
            "lang", cat, "Idioma declarado", AVISO, 4,
            "El elemento <html> no declara idioma: afecta a lectores de pantalla y a la segmentacion por pais.",
            'Cambia <html> por <html lang="es">.',
        ))

    robots = sopa.find("meta", attrs={"name": re.compile("^robots$", re.I)})
    valor = (robots.get("content") or "").lower() if robots else ""
    if "noindex" in valor:
        checks.append(Check(
            "meta_robots", cat, "Meta robots", ERROR, 10,
            "La pagina lleva 'noindex': le estas pidiendo a Google que NO la muestre. Es el fallo mas caro de esta lista.",
            "Quita 'noindex' del <meta name=\"robots\"> salvo que la pagina deba ser privada.",
            valor,
        ))
    else:
        checks.append(Check("meta_robots", cat, "Meta robots", OK, 10,
                            "La pagina es indexable.", "", valor or "sin restricciones"))

    icono = sopa.find("link", rel=lambda v: v and any("icon" in x.lower() for x in v))
    if icono:
        checks.append(Check("favicon", cat, "Favicon", OK, 2, "Declarado.", ""))
    else:
        checks.append(Check(
            "favicon", cat, "Favicon", AVISO, 2,
            "No se declara favicon: los resultados de movil de Google muestran un icono generico.",
            'Anade <link rel="icon" href="/favicon.ico"> al <head>.',
        ))
    return checks


def _contenido(ctx: _Contexto) -> list[Check]:
    sopa, cat, checks = ctx.sopa, "Contenido", []

    h1s = sopa.find_all("h1")
    if len(h1s) == 1:
        checks.append(Check("h1", cat, "Encabezado H1", OK, 8,
                            "Hay exactamente un H1.", "", _texto(h1s[0])[:120]))
    elif not h1s:
        checks.append(Check(
            "h1", cat, "Encabezado H1", ERROR, 8,
            "No hay ningun H1. Google usa el H1 para entender de que trata la pagina.",
            "Convierte el titular principal en <h1> (uno solo por pagina).",
        ))
    else:
        checks.append(Check(
            "h1", cat, "Encabezado H1", AVISO, 8,
            f"Hay {len(h1s)} etiquetas H1 y deberia haber solo una: el tema principal queda difuso.",
            "Deja un unico <h1> y baja el resto a <h2>.",
        ))

    encabezados = sopa.find_all(["h1", "h2", "h3", "h4", "h5", "h6"])
    niveles = [int(h.name[1]) for h in encabezados]
    saltos = [
        f"H{a} -> H{b}" for a, b in zip(niveles, niveles[1:]) if b - a > 1
    ]
    if not encabezados:
        checks.append(Check(
            "jerarquia", cat, "Jerarquia de encabezados", ERROR, 5,
            "La pagina no tiene encabezados: para un buscador es un muro de texto sin estructura.",
            "Estructura el contenido con <h1>, <h2> y <h3> en orden.",
        ))
    elif saltos:
        checks.append(Check(
            "jerarquia", cat, "Jerarquia de encabezados", AVISO, 5,
            f"Se saltan niveles ({', '.join(saltos[:3])}): confunde a lectores de pantalla y a los rastreadores.",
            "No te saltes niveles: despues de un H2 usa H3, nunca H4 directamente.",
        ))
    else:
        checks.append(Check("jerarquia", cat, "Jerarquia de encabezados", OK, 5,
                            f"Correcta, {len(encabezados)} encabezados bien anidados.", ""))

    # Se trabaja sobre una copia: descomponer nodos aqui dejaria sin <script>
    # a los bloques de datos estructurados y rendimiento que se ejecutan despues.
    solo_texto = BeautifulSoup(str(sopa), "html.parser")
    for etiqueta in solo_texto(["script", "style", "noscript", "template"]):
        etiqueta.decompose()
    texto = re.sub(r"\s+", " ", solo_texto.get_text(" ", strip=True))
    palabras = len([p for p in texto.split(" ") if p])
    if palabras >= 300:
        checks.append(Check("palabras", cat, "Volumen de contenido", OK, 6,
                            f"{palabras} palabras de texto visible.", "", str(palabras)))
    elif palabras >= 120:
        checks.append(Check(
            "palabras", cat, "Volumen de contenido", AVISO, 6,
            f"Solo {palabras} palabras. Cuesta posicionar por debajo de 300.",
            "Amplia con una seccion de preguntas frecuentes o casos de uso reales.",
            str(palabras),
        ))
    else:
        checks.append(Check(
            "palabras", cat, "Volumen de contenido", ERROR, 6,
            f"Apenas {palabras} palabras de texto: Google la tratara como pagina vacia.",
            "Anade al menos 300 palabras que respondan a lo que busca tu cliente.",
            str(palabras),
        ))

    bytes_html = len(ctx.respuesta.content) or 1
    ratio = len(texto.encode("utf-8")) / bytes_html * 100
    if ratio >= 10:
        checks.append(Check("ratio_texto", cat, "Ratio texto / HTML", OK, 3,
                            f"{ratio:.1f}% del HTML es texto util.", "", f"{ratio:.1f}%"))
    else:
        checks.append(Check(
            "ratio_texto", cat, "Ratio texto / HTML", AVISO, 3,
            f"Solo el {ratio:.1f}% del codigo es texto: mucho marcado para poco contenido.",
            "Reduce divs anidados y estilos en linea, o amplia el contenido real.",
            f"{ratio:.1f}%",
        ))

    enlaces = ctx.sopa.find_all("a", href=True)
    dominio = urlparse(ctx.respuesta.url).netloc
    internos = [a for a in enlaces if urlparse(urljoin(ctx.respuesta.url, a["href"])).netloc == dominio]
    externos = len(enlaces) - len(internos)
    checks.append(Check(
        "enlaces", cat, "Enlazado", OK if len(internos) >= 3 else AVISO, 4,
        f"{len(internos)} enlaces internos y {externos} externos."
        + ("" if len(internos) >= 3 else " Con menos de 3 enlaces internos Google rastrea peor el sitio."),
        "" if len(internos) >= 3 else "Enlaza desde esta pagina a tus servicios o articulos relacionados.",
        f"{len(internos)}/{externos}",
    ))
    return checks


def _imagenes(ctx: _Contexto) -> list[Check]:
    cat, checks = "Imagenes y accesibilidad", []
    imagenes = ctx.sopa.find_all("img")

    if not imagenes:
        checks.append(Check("alt", cat, "Texto alternativo", INFO, 0,
                            "La pagina no tiene imagenes.", ""))
    else:
        sin_alt = [i for i in imagenes if not (i.get("alt") or "").strip()]
        if not sin_alt:
            checks.append(Check("alt", cat, "Texto alternativo", OK, 7,
                                f"Las {len(imagenes)} imagenes tienen alt.", ""))
        else:
            porcentaje = len(sin_alt) / len(imagenes) * 100
            checks.append(Check(
                "alt", cat, "Texto alternativo", ERROR if porcentaje > 50 else AVISO, 7,
                f"{len(sin_alt)} de {len(imagenes)} imagenes no tienen atributo alt: "
                "no posicionan en Google Imagenes y fallan la accesibilidad.",
                'Describe cada imagen: <img src="..." alt="Tecnico instalando un cuadro electrico">.',
                f"{len(sin_alt)}/{len(imagenes)}",
            ))

        sin_medidas = [i for i in imagenes if not (i.get("width") and i.get("height"))]
        if sin_medidas:
            checks.append(Check(
                "cls", cat, "Dimensiones de imagen", AVISO, 4,
                f"{len(sin_medidas)} imagenes sin width/height: la pagina 'salta' al cargar "
                "y eso penaliza en Core Web Vitals (CLS).",
                'Indica las medidas reales: <img width="800" height="600" ...>.',
                f"{len(sin_medidas)}/{len(imagenes)}",
            ))
        else:
            checks.append(Check("cls", cat, "Dimensiones de imagen", OK, 4,
                                "Todas las imagenes reservan su espacio.", ""))

        perezosas = [i for i in imagenes if (i.get("loading") or "").lower() == "lazy"]
        checks.append(Check(
            "lazy", cat, "Carga diferida", OK if perezosas else AVISO, 3,
            f"{len(perezosas)} de {len(imagenes)} imagenes usan loading=\"lazy\"."
            + ("" if perezosas else " Sin carga diferida el movil descarga todo de golpe."),
            "" if perezosas else 'Anade loading="lazy" a las imagenes que no se ven al abrir la pagina.',
        ))

    viewport = ctx.sopa.find("meta", attrs={"name": re.compile("^viewport$", re.I)})
    if viewport:
        checks.append(Check("viewport", cat, "Viewport movil", OK, 8,
                            "Declarado.", "", (viewport.get("content") or "")[:80]))
    else:
        checks.append(Check(
            "viewport", cat, "Viewport movil", ERROR, 8,
            "Falta la etiqueta viewport: en movil la web se vera diminuta y Google la marca como no apta para moviles.",
            '<meta name="viewport" content="width=device-width, initial-scale=1"> en el <head>.',
        ))
    return checks


def _sociales(ctx: _Contexto) -> list[Check]:
    cat, checks = "Redes sociales", []

    def og(prop):
        etiqueta = ctx.sopa.find("meta", attrs={"property": prop})
        return (etiqueta.get("content") or "").strip() if etiqueta else ""

    presentes = {p: og(f"og:{p}") for p in ("title", "description", "image")}
    faltan = [p for p, v in presentes.items() if not v]
    if not faltan:
        checks.append(Check("open_graph", cat, "Open Graph", OK, 6,
                            "og:title, og:description y og:image estan definidos.", ""))
    else:
        checks.append(Check(
            "open_graph", cat, "Open Graph", ERROR if len(faltan) == 3 else AVISO, 6,
            f"Falta {', '.join('og:' + f for f in faltan)}. Al compartir el enlace en "
            "WhatsApp o LinkedIn saldra sin imagen ni descripcion, y casi nadie hara clic.",
            'Anade <meta property="og:title|og:description|og:image"> con una imagen de 1200x630 px.',
        ))

    tarjeta = ctx.sopa.find("meta", attrs={"name": "twitter:card"})
    if tarjeta:
        checks.append(Check("twitter", cat, "Twitter Card", OK, 3, "Declarada.", "",
                            tarjeta.get("content", "")))
    else:
        checks.append(Check(
            "twitter", cat, "Twitter Card", AVISO, 3,
            "Sin twitter:card el enlace se comparte como texto plano en X/Twitter.",
            '<meta name="twitter:card" content="summary_large_image">.',
        ))
    return checks


def _datos_estructurados(ctx: _Contexto) -> list[Check]:
    cat = "Datos estructurados"
    bloques = ctx.sopa.find_all("script", attrs={"type": re.compile("ld\\+json", re.I)})
    tipos = []
    for bloque in bloques:
        tipos += re.findall(r'"@type"\s*:\s*"([^"]+)"', bloque.string or "")
    if bloques:
        return [Check("jsonld", cat, "Schema.org (JSON-LD)", OK, 6,
                      f"{len(bloques)} bloque(s) detectado(s)"
                      + (f": {', '.join(sorted(set(tipos))[:5])}." if tipos else "."),
                      "", ", ".join(sorted(set(tipos))[:5]))]
    micro = ctx.sopa.find(attrs={"itemtype": True})
    if micro:
        return [Check("jsonld", cat, "Schema.org (JSON-LD)", AVISO, 6,
                      "Solo hay microdatos antiguos, no JSON-LD (el formato que Google recomienda).",
                      "Migra a JSON-LD con el tipo que corresponda (LocalBusiness, Product, Article, FAQPage).")]
    return [Check(
        "jsonld", cat, "Schema.org (JSON-LD)", ERROR, 6,
        "No hay datos estructurados: renuncias a los resultados enriquecidos (estrellas, precios, FAQ) "
        "que multiplican los clics.",
        'Anade <script type="application/ld+json"> con LocalBusiness, Product o FAQPage segun tu caso.',
    )]


def _rendimiento(ctx: _Contexto) -> list[Check]:
    cat, checks = "Rendimiento", []
    ms = ctx.ms
    if ms < 600:
        estado, detalle, arreglo = OK, f"La pagina respondio en {ms} ms.", ""
    elif ms < 1500:
        estado = AVISO
        detalle = f"La respuesta tardo {ms} ms. Por encima de 600 ms ya se nota en movil."
        arreglo = "Activa cache de servidor o un CDN (Cloudflare gratis) delante del hosting."
    else:
        estado = ERROR
        detalle = f"La respuesta tardo {ms} ms: mas de 1,5 s antes siquiera de pintar nada."
        arreglo = "Revisa el hosting, activa cache de pagina completa y pon un CDN delante."
    checks.append(Check("ttfb", cat, "Tiempo de respuesta", estado, 9, detalle, arreglo, f"{ms} ms"))

    kb = len(ctx.respuesta.content) / 1024
    if kb <= 150:
        checks.append(Check("peso_html", cat, "Peso del HTML", OK, 5,
                            f"{kb:.0f} KB de HTML.", "", f"{kb:.0f} KB"))
    else:
        checks.append(Check(
            "peso_html", cat, "Peso del HTML", AVISO if kb <= 400 else ERROR, 5,
            f"El HTML pesa {kb:.0f} KB, muy por encima de los 150 KB recomendados.",
            "Saca los estilos y scripts en linea a ficheros externos y pagina los listados largos.",
            f"{kb:.0f} KB",
        ))

    codificacion = ctx.respuesta.headers.get("Content-Encoding", "")
    if codificacion:
        checks.append(Check("compresion", cat, "Compresion", OK, 6,
                            f"Activa ({codificacion}).", "", codificacion))
    else:
        checks.append(Check(
            "compresion", cat, "Compresion", ERROR, 6,
            "El servidor no comprime la respuesta: estas enviando hasta un 70% mas de bytes de los necesarios.",
            "Activa gzip o brotli en el servidor (o pon Cloudflare delante, que lo hace solo).",
        ))

    scripts = ctx.sopa.find_all("script", src=True)
    bloqueantes = [s for s in scripts if not (s.has_attr("async") or s.has_attr("defer")
                                              or (s.get("type") == "module"))]
    if not bloqueantes:
        checks.append(Check("scripts", cat, "Scripts bloqueantes", OK, 6,
                            f"Ninguno de los {len(scripts)} scripts bloquea el render.", ""))
    else:
        checks.append(Check(
            "scripts", cat, "Scripts bloqueantes", AVISO if len(bloqueantes) <= 3 else ERROR, 6,
            f"{len(bloqueantes)} de {len(scripts)} scripts bloquean el pintado: "
            "el usuario ve la pagina en blanco hasta que se descargan.",
            "Anade defer (o async si es independiente) a cada <script src>.",
            f"{len(bloqueantes)}/{len(scripts)}",
        ))

    hojas = ctx.sopa.find_all("link", rel=lambda v: v and "stylesheet" in [x.lower() for x in v])
    checks.append(Check(
        "css", cat, "Hojas de estilo", OK if len(hojas) <= 4 else AVISO, 3,
        f"{len(hojas)} hojas de estilo externas."
        + ("" if len(hojas) <= 4 else " Cada una es una peticion que retrasa el primer pintado."),
        "" if len(hojas) <= 4 else "Unifica y minifica el CSS en un solo fichero.",
        str(len(hojas)),
    ))
    return checks


def _indexacion(ctx: _Contexto) -> list[Check]:
    cat, checks = "Indexacion y seguridad", []
    final = urlparse(ctx.respuesta.url)
    raiz = f"{final.scheme}://{final.netloc}"

    if final.scheme == "https":
        checks.append(Check("https", cat, "HTTPS", OK, 9, "El sitio sirve por HTTPS.", ""))
    else:
        checks.append(Check(
            "https", cat, "HTTPS", ERROR, 9,
            "El sitio va por HTTP sin cifrar: Chrome lo marca como 'No seguro' y Google lo penaliza.",
            "Instala un certificado (Let's Encrypt es gratis) y redirige todo el trafico a https://.",
        ))

    inseguros = 0
    for etiqueta, atributo in (("img", "src"), ("script", "src"), ("link", "href")):
        for nodo in ctx.sopa.find_all(etiqueta):
            valor = nodo.get(atributo) or ""
            if valor.startswith("http://"):
                inseguros += 1
    if final.scheme == "https" and inseguros:
        checks.append(Check(
            "contenido_mixto", cat, "Contenido mixto", ERROR, 7,
            f"{inseguros} recursos se cargan por http:// dentro de una pagina https: "
            "el navegador los bloquea y rompe el diseno.",
            "Cambia esas URLs a https:// (o a rutas relativas).",
            str(inseguros),
        ))
    else:
        checks.append(Check("contenido_mixto", cat, "Contenido mixto", OK, 7,
                            "Todos los recursos se cargan de forma segura.", ""))

    robots = _pedir(f"{raiz}/robots.txt")
    cuerpo = robots.text if (robots is not None and robots.status_code == 200) else ""
    if not cuerpo:
        checks.append(Check(
            "robots_txt", cat, "robots.txt", AVISO, 5,
            "No se encontro /robots.txt. No es obligatorio, pero es donde se declara el sitemap.",
            "Crea /robots.txt con 'User-agent: *', 'Allow: /' y 'Sitemap: https://tudominio.com/sitemap.xml'.",
        ))
    elif re.search(r"^\s*Disallow:\s*/\s*$", cuerpo, re.M | re.I):
        checks.append(Check(
            "robots_txt", cat, "robots.txt", ERROR, 5,
            "El robots.txt contiene 'Disallow: /': estas bloqueando el sitio entero a los buscadores.",
            "Elimina esa linea salvo que el sitio deba ser invisible en Google.",
        ))
    else:
        checks.append(Check("robots_txt", cat, "robots.txt", OK, 5,
                            "Presente y sin bloqueos globales.", ""))

    en_robots = re.search(r"^\s*Sitemap:\s*(\S+)", cuerpo, re.M | re.I) if cuerpo else None
    sitemap = _pedir(f"{raiz}/sitemap.xml")
    tiene = bool(en_robots) or (sitemap is not None and sitemap.status_code == 200
                                and "xml" in sitemap.headers.get("Content-Type", "").lower())
    if tiene:
        checks.append(Check("sitemap", cat, "Sitemap XML", OK, 5,
                            "Localizado" + (" desde robots.txt." if en_robots else " en /sitemap.xml."),
                            "", en_robots.group(1) if en_robots else f"{raiz}/sitemap.xml"))
    else:
        checks.append(Check(
            "sitemap", cat, "Sitemap XML", ERROR, 5,
            "No hay sitemap.xml: Google tiene que adivinar tus paginas en vez de recibir la lista.",
            "Genera /sitemap.xml, declaralo en robots.txt y subelo a Google Search Console.",
        ))

    cabeceras = ctx.respuesta.headers
    faltan = [c for c in ("Strict-Transport-Security", "X-Content-Type-Options")
              if c not in cabeceras]
    if not faltan:
        checks.append(Check("cabeceras", cat, "Cabeceras de seguridad", OK, 4,
                            "HSTS y X-Content-Type-Options presentes.", ""))
    else:
        checks.append(Check(
            "cabeceras", cat, "Cabeceras de seguridad", AVISO, 4,
            f"Faltan cabeceras de seguridad: {', '.join(faltan)}.",
            "Anadelas en la configuracion del servidor o del CDN; son dos lineas y suben la confianza del sitio.",
        ))

    if ctx.redirecciones:
        checks.append(Check(
            "redirecciones", cat, "Cadena de redirecciones",
            OK if len(ctx.redirecciones) == 1 else AVISO, 3,
            f"{len(ctx.redirecciones)} redireccion(es) hasta llegar al destino."
            + ("" if len(ctx.redirecciones) == 1 else " Cada salto anade latencia y diluye autoridad."),
            "" if len(ctx.redirecciones) == 1 else "Apunta los enlaces directamente a la URL final.",
            str(len(ctx.redirecciones)),
        ))
    else:
        checks.append(Check("redirecciones", cat, "Cadena de redirecciones", OK, 3,
                            "La URL responde directamente, sin saltos.", ""))
    return checks


# --------------------------------------------------------------- orquestador

_BLOQUES = (_metadatos, _contenido, _imagenes, _sociales,
            _datos_estructurados, _rendimiento, _indexacion)

_VALOR = {OK: 1.0, AVISO: 0.5, ERROR: 0.0}


def auditar(url_entrada: str) -> dict:
    """Analiza una URL y devuelve el informe completo como diccionario."""
    url = normalizar_url(url_entrada)
    explicito = bool(re.match(r"^https?://", (url_entrada or "").strip(), re.I))
    try:
        ctx = _descargar(url)
    except AuditError:
        # Si el usuario escribio solo el dominio asumimos https, pero hay sitios
        # que solo sirven por http: se reintenta para poder auditarlos (y que el
        # check de HTTPS refleje el problema en vez de dejarlos sin informe).
        if explicito or not url.startswith("https://"):
            raise
        ctx = _descargar("http://" + url[len("https://"):])

    checks: list[Check] = []
    for bloque in _BLOQUES:
        checks.extend(bloque(ctx))

    puntuables = [c for c in checks if c.peso > 0]
    total = sum(c.peso for c in puntuables) or 1
    logrado = sum(c.peso * _VALOR.get(c.estado, 0.0) for c in puntuables)
    puntuacion = round(logrado / total * 100)

    categorias = {}
    for nombre in CATEGORIAS:
        propios = [c for c in puntuables if c.categoria == nombre]
        if not propios:
            continue
        parcial = sum(c.peso for c in propios) or 1
        categorias[nombre] = {
            "puntuacion": round(sum(c.peso * _VALOR.get(c.estado, 0.0) for c in propios) / parcial * 100),
            "errores": sum(1 for c in propios if c.estado == ERROR),
            "avisos": sum(1 for c in propios if c.estado == AVISO),
            "correctos": sum(1 for c in propios if c.estado == OK),
        }

    prioridades = sorted(
        [c for c in checks if c.estado in (ERROR, AVISO)],
        key=lambda c: (c.estado != ERROR, -c.peso),
    )

    return {
        "url": url,
        "url_final": ctx.respuesta.url,
        "dominio": urlparse(ctx.respuesta.url).netloc,
        "fecha": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "ms": ctx.ms,
        "puntuacion": puntuacion,
        "nivel": nivel(puntuacion),
        "resumen": {
            "correctos": sum(1 for c in puntuables if c.estado == OK),
            "avisos": sum(1 for c in puntuables if c.estado == AVISO),
            "errores": sum(1 for c in puntuables if c.estado == ERROR),
            "total": len(puntuables),
        },
        "categorias": categorias,
        "checks": [c.como_dict() for c in checks],
        "prioridades": [c.como_dict() for c in prioridades],
    }


def nivel(puntuacion: int) -> str:
    if puntuacion >= 90:
        return "Excelente"
    if puntuacion >= 75:
        return "Bueno"
    if puntuacion >= 55:
        return "Mejorable"
    if puntuacion >= 35:
        return "Deficiente"
    return "Critico"
