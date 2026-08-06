"""Configuración central del agente. Lee variables desde .env o el entorno."""
from __future__ import annotations

import os
from dataclasses import dataclass

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:  # dotenv es opcional; el entorno igual funciona
    pass


@dataclass
class Config:
    anthropic_api_key: str | None
    claude_model: str
    idioma: str
    youtube_api_key: str | None
    pexels_api_key: str | None

    @property
    def tiene_youtube(self) -> bool:
        return bool(self.youtube_api_key)

    @property
    def tiene_pexels(self) -> bool:
        return bool(self.pexels_api_key)


def cargar_config() -> Config:
    return Config(
        # anthropic_api_key puede ser None: el SDK también resuelve credenciales
        # desde un perfil `ant auth login`. Solo lo usamos para avisar al usuario.
        anthropic_api_key=os.getenv("ANTHROPIC_API_KEY"),
        claude_model=os.getenv("CLAUDE_MODEL", "claude-opus-5"),
        idioma=os.getenv("IDIOMA", "es"),
        youtube_api_key=os.getenv("YOUTUBE_API_KEY") or None,
        pexels_api_key=os.getenv("PEXELS_API_KEY") or None,
    )
