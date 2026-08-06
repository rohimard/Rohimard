"""Etapa 3: prompts de imágenes para cada escena del guion.

Genera un prompt detallado (para Midjourney/DALL·E/Stable Diffusion) y una
consulta de búsqueda para banco de imágenes por cada escena.
"""
from __future__ import annotations

import json

from .claude_client import ClaudeClient

_SISTEMA = (
    "Eres director de arte especializado en imágenes para YouTube. Escribes "
    "prompts de generación de imágenes ricos en detalle (composición, estilo, "
    "iluminación, encuadre, cámara) y consultas de banco de imágenes efectivas."
)


def generar_prompts_imagenes(
    claude: ClaudeClient, escenas: list[dict], idioma: str = "es"
) -> list[dict]:
    if not escenas:
        return []
    print(f"🎨 Generando prompts de imágenes para {len(escenas)} escenas ...")

    escenas_txt = json.dumps(escenas, ensure_ascii=False, indent=2)
    prompt = f"""Idioma de las descripciones: {idioma}.

Para cada escena, crea material visual. Devuelve JSON: un arreglo donde cada
elemento tenga esta forma exacta:
{{
  "n": <número de escena>,
  "prompt_imagen": "prompt DETALLADO en inglés para generadores de imágenes (Midjourney/DALL·E/SD): sujeto, acción, entorno, estilo, iluminación, encuadre, lente, mood; sin texto dentro de la imagen",
  "prompt_imagen_es": "el mismo concepto explicado brevemente en {idioma}",
  "consulta_stock": "2-4 palabras en inglés, concretas y visuales, para buscar en bancos de imágenes (Pexels)"
}}

Escenas:
{escenas_txt}

Devuelve SOLO el arreglo JSON, en el mismo orden."""
    data = claude.json(prompt, system=_SISTEMA, max_tokens=12000)
    if isinstance(data, dict):  # por si el modelo envuelve en una clave
        for v in data.values():
            if isinstance(v, list):
                data = v
                break
    return data if isinstance(data, list) else []
