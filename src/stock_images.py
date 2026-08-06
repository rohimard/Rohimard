"""Etapa 4: descarga de imágenes de stock desde Pexels (gratis)."""
from __future__ import annotations

from pathlib import Path

import requests

_PEXELS = "https://api.pexels.com/v1/search"


def descargar_imagenes(
    api_key: str | None,
    prompts: list[dict],
    carpeta: Path,
    por_escena: int = 1,
) -> list[dict]:
    """Descarga imágenes de stock para cada escena. Devuelve metadatos.

    Si no hay clave de Pexels, no descarga nada y devuelve lista vacía.
    """
    if not api_key:
        print("🖼️  Sin PEXELS_API_KEY: se omite la descarga de imágenes.")
        print("     (Los prompts de imágenes sí se generaron; puedes usarlos en tu generador favorito.)")
        return []

    destino = carpeta / "imagenes"
    destino.mkdir(parents=True, exist_ok=True)
    print(f"🖼️  Buscando y descargando imágenes de stock en {destino} ...")

    resultados: list[dict] = []
    headers = {"Authorization": api_key}

    for p in prompts:
        n = p.get("n", "?")
        consulta = (p.get("consulta_stock") or "").strip()
        if not consulta:
            continue
        try:
            r = requests.get(
                _PEXELS,
                headers=headers,
                params={"query": consulta, "per_page": por_escena, "orientation": "landscape"},
                timeout=30,
            )
            r.raise_for_status()
        except requests.RequestException as e:
            print(f"   ⚠️  Error buscando «{consulta}»: {e}")
            continue

        fotos = r.json().get("photos", [])
        if not fotos:
            print(f"   ⚠️  Sin resultados para escena {n} («{consulta}»).")
            continue

        for idx, foto in enumerate(fotos, start=1):
            url = foto["src"].get("large2x") or foto["src"].get("large") or foto["src"]["original"]
            nombre = f"escena_{n}_{idx}.jpg"
            ruta = destino / nombre
            try:
                img = requests.get(url, timeout=60)
                img.raise_for_status()
                ruta.write_bytes(img.content)
            except requests.RequestException as e:
                print(f"   ⚠️  No se pudo descargar {nombre}: {e}")
                continue
            resultados.append(
                {
                    "escena": n,
                    "archivo": f"imagenes/{nombre}",
                    "consulta": consulta,
                    "autor": foto.get("photographer", ""),
                    "credito_url": foto.get("url", ""),
                }
            )
            print(f"   ✓ escena {n}: {nombre}  (foto de {foto.get('photographer','?')})")

    return resultados
