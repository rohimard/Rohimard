"""Etapa 1: investigación de nicho.

Con clave de YouTube: datos reales (vistas, suscriptores, "Viral Score").
Sin clave: respaldo con búsqueda web de Claude.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import requests

from .claude_client import ClaudeClient
from .config import Config

_YT = "https://www.googleapis.com/youtube/v3"

# Umbrales para detectar "canales joya": pocos subs, muchas vistas.
MAX_SUBS_JOYA = 50_000
MIN_VISTAS_JOYA = 50_000


def investigar(cfg: Config, claude: ClaudeClient, nicho: str) -> dict:
    """Devuelve un informe de investigación del nicho."""
    print(f"🔎 Investigando el nicho: «{nicho}» ...")

    # Paso A: pedir a Claude palabras clave y ángulos semilla (siempre).
    semillas = _keywords_semilla(claude, nicho)

    if cfg.tiene_youtube:
        print("   → Usando la API oficial de YouTube (datos reales).")
        datos_yt = _investigar_youtube(cfg.youtube_api_key, semillas["consultas"])
    else:
        print("   → Sin YOUTUBE_API_KEY: usando búsqueda web de Claude (respaldo).")
        datos_yt = _investigar_web(claude, nicho)

    return {
        "nicho": nicho,
        "palabras_clave": semillas["palabras_clave"],
        "angulos_video": semillas["angulos_video"],
        "consultas_busqueda": semillas["consultas"],
        **datos_yt,
    }


def _keywords_semilla(claude: ClaudeClient, nicho: str) -> dict:
    prompt = f"""Eres un experto en SEO y estrategia de YouTube.
Para el nicho: "{nicho}", genera un plan de investigación de palabras clave.

Devuelve JSON con esta forma exacta:
{{
  "palabras_clave": ["12-18 palabras clave con intención de búsqueda real en YouTube"],
  "angulos_video": ["8-10 ángulos/ideas de video con alto potencial de clic (títulos tentativos)"],
  "consultas": ["4-6 consultas de búsqueda para explorar la competencia en YouTube"]
}}"""
    data = claude.json(prompt)
    return {
        "palabras_clave": data.get("palabras_clave", []),
        "angulos_video": data.get("angulos_video", []),
        "consultas": data.get("consultas", [])[:6],
    }


# ── Camino A: API de YouTube ────────────────────────────────────────────────
def _investigar_youtube(api_key: str, consultas: list[str]) -> dict:
    publicado_despues = (
        datetime.now(timezone.utc) - timedelta(days=180)
    ).isoformat().replace("+00:00", "Z")

    video_ids: list[str] = []
    origen: dict[str, str] = {}  # video_id -> consulta que lo encontró
    for consulta in consultas[:4]:  # limitar cuota
        for orden in ("relevance", "viewCount"):
            try:
                r = requests.get(
                    f"{_YT}/search",
                    params={
                        "key": api_key,
                        "q": consulta,
                        "part": "snippet",
                        "type": "video",
                        "order": orden,
                        "maxResults": 10,
                        "publishedAfter": publicado_despues,
                        "relevanceLanguage": "es",
                    },
                    timeout=30,
                )
                r.raise_for_status()
            except requests.RequestException as e:
                print(f"   ⚠️  Error en búsqueda de YouTube ({consulta}/{orden}): {e}")
                continue
            for item in r.json().get("items", []):
                vid = item["id"].get("videoId")
                if vid and vid not in origen:
                    video_ids.append(vid)
                    origen[vid] = consulta

    if not video_ids:
        return {"tendencias": [], "competencia": [], "canales_joya": []}

    videos = _detalles_videos(api_key, video_ids)
    canal_ids = list({v["channel_id"] for v in videos if v.get("channel_id")})
    subs = _suscriptores_canales(api_key, canal_ids)

    competencia = []
    for v in videos:
        s = subs.get(v["channel_id"], 0)
        vistas = v["vistas"]
        ratio = round(vistas / max(s, 1), 2)
        competencia.append(
            {
                "titulo": v["titulo"],
                "canal": v["canal"],
                "vistas": vistas,
                "suscriptores": s,
                "viral_score": ratio,  # vistas por suscriptor
                "url": f"https://youtu.be/{v['id']}",
                "consulta": origen.get(v["id"], ""),
            }
        )

    competencia.sort(key=lambda x: x["vistas"], reverse=True)

    # Canales joya: pocos subs, muchas vistas → mejor Viral Score.
    joyas = [
        c
        for c in competencia
        if c["suscriptores"] <= MAX_SUBS_JOYA and c["vistas"] >= MIN_VISTAS_JOYA
    ]
    joyas.sort(key=lambda x: x["viral_score"], reverse=True)

    return {
        "tendencias": [c["titulo"] for c in competencia[:10]],
        "competencia": competencia[:20],
        "canales_joya": joyas[:10],
    }


def _detalles_videos(api_key: str, video_ids: list[str]) -> list[dict]:
    out: list[dict] = []
    for i in range(0, len(video_ids), 50):
        lote = video_ids[i : i + 50]
        r = requests.get(
            f"{_YT}/videos",
            params={
                "key": api_key,
                "id": ",".join(lote),
                "part": "snippet,statistics",
            },
            timeout=30,
        )
        r.raise_for_status()
        for item in r.json().get("items", []):
            stats = item.get("statistics", {})
            snip = item.get("snippet", {})
            out.append(
                {
                    "id": item["id"],
                    "titulo": snip.get("title", ""),
                    "canal": snip.get("channelTitle", ""),
                    "channel_id": snip.get("channelId", ""),
                    "vistas": int(stats.get("viewCount", 0)),
                }
            )
    return out


def _suscriptores_canales(api_key: str, canal_ids: list[str]) -> dict[str, int]:
    subs: dict[str, int] = {}
    for i in range(0, len(canal_ids), 50):
        lote = canal_ids[i : i + 50]
        r = requests.get(
            f"{_YT}/channels",
            params={"key": api_key, "id": ",".join(lote), "part": "statistics"},
            timeout=30,
        )
        r.raise_for_status()
        for item in r.json().get("items", []):
            stats = item.get("statistics", {})
            oculto = stats.get("hiddenSubscriberCount", False)
            subs[item["id"]] = 0 if oculto else int(stats.get("subscriberCount", 0))
    return subs


# ── Camino B: respaldo con búsqueda web de Claude ────────────────────────────
def _investigar_web(claude: ClaudeClient, nicho: str) -> dict:
    prompt = f"""Investiga en la web el panorama actual de YouTube para el nicho: "{nicho}".
Busca videos recientes populares, tendencias y canales que estén creciendo.

Devuelve JSON con esta forma exacta (usa datos reales que encuentres; si un dato
no está disponible pon null):
{{
  "tendencias": ["8-10 temas/formatos que están funcionando ahora en este nicho"],
  "competencia": [
    {{"titulo": "...", "canal": "...", "vistas": 123456, "suscriptores": null,
      "viral_score": null, "url": "...", "consulta": ""}}
  ],
  "canales_joya": [
    {{"titulo": "video que despegó", "canal": "canal pequeño", "vistas": 200000,
      "suscriptores": 5000, "viral_score": 40.0, "url": "...", "consulta": ""}}
  ]
}}
Prioriza en "canales_joya" canales con pocos suscriptores pero muchas vistas."""
    try:
        crudo = claude.investigar_web(prompt)
        from .claude_client import _extraer_json

        data = _extraer_json(crudo)
    except Exception as e:  # noqa: BLE001
        print(f"   ⚠️  Falló la investigación web: {e}")
        return {"tendencias": [], "competencia": [], "canales_joya": []}
    return {
        "tendencias": data.get("tendencias", []),
        "competencia": data.get("competencia", []),
        "canales_joya": data.get("canales_joya", []),
    }
