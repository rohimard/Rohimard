"""Etapa 2: guion optimizado + paquete SEO, listo para copiar y pegar."""
from __future__ import annotations

from .claude_client import ClaudeClient

_SISTEMA = (
    "Eres un guionista experto en YouTube y en el algoritmo de la plataforma. "
    "Dominas hooks de retención, ritmo, storytelling y CTAs. Escribes guiones "
    "que la gente termina de ver y que YouTube recomienda."
)


def generar_guion(
    claude: ClaudeClient,
    investigacion: dict,
    tema: str,
    duracion_min: int = 8,
    idioma: str = "es",
) -> dict:
    print(f"✍️  Generando guion optimizado para: «{tema}» ({duracion_min} min) ...")

    contexto = _contexto_investigacion(investigacion)

    # 1) Guion completo como texto (llamada dedicada para máxima calidad).
    prompt_guion = f"""Idioma de salida: {idioma}.

Escribe un GUION COMPLETO de YouTube, listo para copiar y pegar y grabar tal cual.

Tema del video: "{tema}"
Duración objetivo: ~{duracion_min} minutos.

Contexto de investigación del nicho (úsalo para acertar el ángulo y las palabras clave):
{contexto}

Requisitos del guion:
- HOOK potente en los primeros 5-10 segundos (evita introducciones lentas).
- Estructura clara con secciones marcadas: [GANCHO], [INTRO], [DESARROLLO 1..N], [CLÍMAX], [CTA/CIERRE].
- Marca visualmente dónde va cada corte de escena con la etiqueta «[ESCENA n]» al inicio de cada bloque visual.
- Lenguaje natural y hablado (como se dice en voz alta), frases cortas.
- Incluye indicaciones breves de b-roll/entonación entre paréntesis cuando ayude.
- Optimizado para retención: bucles abiertos, promesas que se cumplen, transiciones ágiles.
- Termina con un CTA claro (suscripción + siguiente video).

Devuelve SOLO el guion (sin comentarios previos)."""
    guion = claude.texto(prompt_guion, system=_SISTEMA, max_tokens=20000)

    # 2) Paquete SEO + lista de escenas (JSON) a partir del guion ya escrito.
    prompt_seo = f"""Idioma de salida: {idioma}.

A partir de este guion de YouTube, genera el paquete de publicación y la lista
de escenas para imágenes.

GUION:
\"\"\"
{guion}
\"\"\"

Contexto de palabras clave del nicho: {", ".join(investigacion.get("palabras_clave", [])[:15])}

Devuelve JSON con esta forma exacta:
{{
  "titulos": ["5 títulos optimizados para CTR, con curiosidad/beneficio, <70 caracteres"],
  "titulo_recomendado": "el mejor de los 5",
  "descripcion": "descripción de YouTube (2-4 párrafos) con palabras clave naturales y un resumen; incluye 1-2 líneas de gancho al inicio",
  "etiquetas": ["15-25 tags relevantes en minúscula"],
  "hashtags": ["3-5 hashtags con # incluido"],
  "texto_miniatura": ["2-3 opciones de texto MUY corto (2-4 palabras) para la miniatura"],
  "capitulos": ["timestamps sugeridos, formato '0:00 Título'"],
  "escenas": [
    {{"n": 1, "resumen": "qué se ve/dice en la escena", "palabras_clave_visuales": "términos concretos para buscar/generar la imagen"}}
  ]
}}
Extrae UNA escena por cada bloque [ESCENA n] del guion (o divide en 6-12 escenas lógicas si no hay etiquetas)."""
    seo = claude.json(prompt_seo, system=_SISTEMA, max_tokens=12000)

    return {"tema": tema, "duracion_min": duracion_min, "guion": guion, **seo}


def _contexto_investigacion(inv: dict) -> str:
    lineas = []
    if inv.get("palabras_clave"):
        lineas.append("Palabras clave: " + ", ".join(inv["palabras_clave"][:15]))
    if inv.get("tendencias"):
        lineas.append("Tendencias/formatos actuales: " + "; ".join(inv["tendencias"][:8]))
    if inv.get("canales_joya"):
        joyas = "; ".join(
            f"{c.get('titulo','')} ({c.get('vistas','?')} vistas)"
            for c in inv["canales_joya"][:5]
        )
        lineas.append("Videos de canales pequeños que explotaron: " + joyas)
    return "\n".join(lineas) or "(sin datos de investigación)"
