"""Agente experto en YouTube: investigación → guion → prompts → imágenes.

Uso:
    python -m src.agent "nicho o tema del canal"
    python -m src.agent "finanzas personales" --tema "3 errores al invertir" --duracion 10
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path

from .claude_client import ClaudeClient
from .config import Config, cargar_config
from .image_prompts import generar_prompts_imagenes
from .script_generator import generar_guion
from .stock_images import descargar_imagenes
from .youtube_research import investigar

RAIZ = Path(__file__).resolve().parent.parent
SALIDAS = RAIZ / "salidas"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Agente de IA experto en YouTube (investigación, guion, imágenes)."
    )
    parser.add_argument("nicho", help="Nicho o tema del canal, p. ej. 'finanzas personales'")
    parser.add_argument("--tema", default=None, help="Tema específico del video (opcional)")
    parser.add_argument("--duracion", type=int, default=8, help="Duración en minutos (def. 8)")
    parser.add_argument(
        "--imagenes-por-escena", type=int, default=1, help="Fotos de stock por escena (def. 1)"
    )
    parser.add_argument(
        "--solo-investigacion", action="store_true", help="Solo hacer la investigación"
    )
    args = parser.parse_args(argv)

    cfg = cargar_config()
    _avisos_config(cfg)

    try:
        claude = ClaudeClient(cfg)
    except Exception as e:  # noqa: BLE001
        print(f"❌ No se pudo inicializar Claude: {e}")
        print("   Configura ANTHROPIC_API_KEY (copia .env.example a .env).")
        return 1

    try:
        return _pipeline(cfg, claude, args)
    except Exception as e:  # noqa: BLE001
        return _manejar_error(e)


def _pipeline(cfg: Config, claude: ClaudeClient, args) -> int:
    # 1) Investigación
    inv = investigar(cfg, claude, args.nicho)

    if args.solo_investigacion:
        carpeta = _preparar_carpeta(args.nicho)
        _escribir_investigacion(carpeta, inv)
        (carpeta / "proyecto.json").write_text(
            json.dumps({"investigacion": inv}, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print(f"\n✅ Investigación lista en: {carpeta}")
        return 0

    # 2) Elegir tema del video
    tema = args.tema or _elegir_tema(claude, inv)
    print(f"🎯 Tema del video: «{tema}»")

    # 3) Guion + SEO
    paquete = generar_guion(claude, inv, tema, args.duracion, cfg.idioma)

    # 4) Prompts de imágenes
    prompts = generar_prompts_imagenes(claude, paquete.get("escenas", []), cfg.idioma)

    # 5) Descargar imágenes de stock
    carpeta = _preparar_carpeta(tema)
    imagenes = descargar_imagenes(
        cfg.pexels_api_key, prompts, carpeta, args.imagenes_por_escena
    )

    # 6) Escribir paquete de entrega
    _escribir_investigacion(carpeta, inv)
    _escribir_guion(carpeta, paquete)
    _escribir_prompts(carpeta, prompts, imagenes)
    (carpeta / "proyecto.json").write_text(
        json.dumps(
            {
                "investigacion": inv,
                "paquete": paquete,
                "prompts_imagenes": prompts,
                "imagenes": imagenes,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    print(f"\n✅ ¡Listo! Paquete completo en: {carpeta}")
    print("   • guion.md            → guion + SEO para copiar y pegar")
    print("   • prompts_imagenes.md → prompts + consultas de imágenes")
    print("   • investigacion.md    → competencia, tendencias y canales joya")
    print("   • imagenes/           → fotos de stock descargadas")
    return 0


def _manejar_error(e: Exception) -> int:
    msg = str(e)
    es_auth = (
        "authentication" in msg.lower()
        or "api_key" in msg.lower()
        or "x-api-key" in msg.lower()
        or "401" in msg
    )
    if es_auth:
        print("\n❌ No hay credencial de Claude válida.")
        print("   Configura ANTHROPIC_API_KEY: copia .env.example a .env y pega tu clave")
        print("   (la obtienes en https://console.anthropic.com).")
    else:
        print(f"\n❌ Error durante el proceso: {e}")
    return 1


# ── Selección de tema ────────────────────────────────────────────────────────
def _elegir_tema(claude: ClaudeClient, inv: dict) -> str:
    angulos = inv.get("angulos_video", [])
    if not angulos:
        return inv.get("nicho", "Video de YouTube")
    prompt = f"""Del siguiente listado de ideas de video para el nicho "{inv.get('nicho')}",
elige la de MAYOR potencial (CTR + retención + tendencia actual) y devuélvela
como un único título de video, sin explicaciones.

Tendencias actuales: {"; ".join(inv.get("tendencias", [])[:8])}

Ideas:
{chr(10).join(f"- {a}" for a in angulos)}"""
    try:
        elegido = claude.texto(prompt, max_tokens=200).strip().strip('"')
        return elegido or angulos[0]
    except Exception:  # noqa: BLE001
        return angulos[0]


# ── Escritura de archivos ──────────────────────────────────────────────────
def _preparar_carpeta(nombre: str) -> Path:
    slug = _slug(nombre)
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    carpeta = SALIDAS / f"{slug}-{ts}"
    carpeta.mkdir(parents=True, exist_ok=True)
    return carpeta


def _escribir_investigacion(carpeta: Path, inv: dict) -> None:
    L = [f"# Investigación de nicho: {inv.get('nicho','')}\n"]

    L.append("## Palabras clave\n")
    L += [f"- {k}" for k in inv.get("palabras_clave", [])]

    L.append("\n## Ideas de video (ángulos)\n")
    L += [f"- {a}" for a in inv.get("angulos_video", [])]

    L.append("\n## Tendencias / formatos actuales\n")
    L += [f"- {t}" for t in inv.get("tendencias", [])]

    joyas = inv.get("canales_joya", [])
    L.append("\n## 💎 Canales joya (pocos subs, muchas vistas)\n")
    if joyas:
        L.append("| Video | Canal | Vistas | Subs | Viral Score | Enlace |")
        L.append("|---|---|---:|---:|---:|---|")
        for c in joyas:
            L.append(
                f"| {c.get('titulo','')} | {c.get('canal','')} | {_num(c.get('vistas'))} "
                f"| {_num(c.get('suscriptores'))} | {c.get('viral_score','')} | {c.get('url','')} |"
            )
    else:
        L.append("_No se detectaron canales joya con los datos disponibles._")

    comp = inv.get("competencia", [])
    L.append("\n## Competencia (top por vistas)\n")
    if comp:
        L.append("| Video | Canal | Vistas | Subs | Viral Score | Enlace |")
        L.append("|---|---|---:|---:|---:|---|")
        for c in comp:
            L.append(
                f"| {c.get('titulo','')} | {c.get('canal','')} | {_num(c.get('vistas'))} "
                f"| {_num(c.get('suscriptores'))} | {c.get('viral_score','')} | {c.get('url','')} |"
            )
    else:
        L.append("_Sin datos de competencia._")

    (carpeta / "investigacion.md").write_text("\n".join(L) + "\n", encoding="utf-8")


def _escribir_guion(carpeta: Path, p: dict) -> None:
    L = [f"# Guion: {p.get('tema','')}\n"]

    L.append("## 🏷️ Título recomendado\n")
    L.append(f"**{p.get('titulo_recomendado','')}**\n")
    if p.get("titulos"):
        L.append("### Otras opciones de título\n")
        L += [f"- {t}" for t in p["titulos"]]

    if p.get("texto_miniatura"):
        L.append("\n## 🖼️ Texto para la miniatura\n")
        L += [f"- {t}" for t in p["texto_miniatura"]]

    L.append("\n## 🎬 GUION (copiar y pegar)\n")
    L.append(p.get("guion", ""))

    if p.get("capitulos"):
        L.append("\n## ⏱️ Capítulos (timestamps)\n")
        L += [f"{c}" for c in p["capitulos"]]

    L.append("\n## 📝 Descripción de YouTube\n")
    L.append(p.get("descripcion", ""))

    if p.get("hashtags"):
        L.append("\n## Hashtags\n")
        L.append(" ".join(p["hashtags"]))

    if p.get("etiquetas"):
        L.append("\n## 🏷️ Etiquetas (tags)\n")
        L.append(", ".join(p["etiquetas"]))

    (carpeta / "guion.md").write_text("\n".join(L) + "\n", encoding="utf-8")


def _escribir_prompts(carpeta: Path, prompts: list[dict], imagenes: list[dict]) -> None:
    img_por_escena: dict = {}
    for im in imagenes:
        img_por_escena.setdefault(im["escena"], []).append(im)

    L = ["# Prompts de imágenes por escena\n"]
    for p in prompts:
        n = p.get("n", "?")
        L.append(f"## Escena {n}\n")
        if p.get("prompt_imagen_es"):
            L.append(f"**Idea:** {p['prompt_imagen_es']}\n")
        L.append("**Prompt (generadores de imagen):**\n")
        L.append(f"```\n{p.get('prompt_imagen','')}\n```\n")
        L.append(f"**Consulta de banco de imágenes:** `{p.get('consulta_stock','')}`\n")
        for im in img_por_escena.get(n, []):
            L.append(f"- 📷 `{im['archivo']}` — foto de {im.get('autor','')} ({im.get('credito_url','')})")
        L.append("")

    (carpeta / "prompts_imagenes.md").write_text("\n".join(L) + "\n", encoding="utf-8")


# ── Utilidades ───────────────────────────────────────────────────────────────
def _slug(texto: str) -> str:
    s = re.sub(r"[^\w\s-]", "", texto.lower())
    s = re.sub(r"[\s_-]+", "-", s).strip("-")
    return (s or "video")[:50]


def _num(v) -> str:
    try:
        return f"{int(v):,}".replace(",", ".")
    except (TypeError, ValueError):
        return str(v) if v is not None else "?"


def _avisos_config(cfg: Config) -> None:
    if not cfg.anthropic_api_key:
        print("ℹ️  ANTHROPIC_API_KEY no está en el entorno; se intentará usar el perfil de `ant`.")
    if not cfg.tiene_youtube:
        print("ℹ️  Sin YOUTUBE_API_KEY: la investigación usará búsqueda web (menos preciso en subs/vistas).")
    if not cfg.tiene_pexels:
        print("ℹ️  Sin PEXELS_API_KEY: se generarán prompts de imágenes pero no se descargarán fotos.")


if __name__ == "__main__":
    sys.exit(main())
