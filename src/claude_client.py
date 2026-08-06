"""Envoltorio ligero sobre el SDK de Anthropic.

Centraliza las llamadas a Claude para el resto del agente: texto libre,
salida JSON robusta y búsqueda web (con la herramienta server-side de Claude).
"""
from __future__ import annotations

import json
import re

import anthropic

from .config import Config


class ClaudeClient:
    def __init__(self, cfg: Config):
        self.cfg = cfg
        # El SDK resuelve la credencial desde ANTHROPIC_API_KEY o un perfil de `ant`.
        self.client = anthropic.Anthropic()
        self.model = cfg.claude_model

    # ── Texto libre (streaming para salidas largas como el guion) ───────────
    def texto(self, prompt: str, system: str = "", max_tokens: int = 16000) -> str:
        partes: list[str] = []
        with self.client.messages.stream(
            model=self.model,
            max_tokens=max_tokens,
            system=system or anthropic.NOT_GIVEN,
            messages=[{"role": "user", "content": prompt}],
        ) as stream:
            for texto in stream.text_stream:
                partes.append(texto)
        return "".join(partes).strip()

    # ── Salida JSON robusta ─────────────────────────────────────────────────
    def json(self, prompt: str, system: str = "", max_tokens: int = 8000) -> dict | list:
        instruccion = (
            "\n\nResponde ÚNICAMENTE con JSON válido, sin texto adicional, "
            "sin bloques de código markdown."
        )
        crudo = self.texto(prompt + instruccion, system=system, max_tokens=max_tokens)
        return _extraer_json(crudo)

    # ── Investigación con búsqueda web ──────────────────────────────────────
    def investigar_web(self, prompt: str, system: str = "", max_tokens: int = 12000) -> str:
        """Usa la herramienta de búsqueda web de Claude para datos actuales."""
        resp = self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            system=system or anthropic.NOT_GIVEN,
            tools=[{"type": "web_search_20260209", "name": "web_search", "max_uses": 8}],
            messages=[{"role": "user", "content": prompt}],
        )
        # Reanudar si el bucle server-side se pausó (pause_turn).
        mensajes = [{"role": "user", "content": prompt}]
        vueltas = 0
        while resp.stop_reason == "pause_turn" and vueltas < 5:
            mensajes = [
                {"role": "user", "content": prompt},
                {"role": "assistant", "content": resp.content},
            ]
            resp = self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                system=system or anthropic.NOT_GIVEN,
                tools=[{"type": "web_search_20260209", "name": "web_search", "max_uses": 8}],
                messages=mensajes,
            )
            vueltas += 1

        return "".join(b.text for b in resp.content if b.type == "text").strip()


def _extraer_json(crudo: str) -> dict | list:
    """Parsea JSON tolerando envoltorios de markdown o texto alrededor."""
    crudo = crudo.strip()
    # Quitar cercas de código ```json ... ```
    crudo = re.sub(r"^```(?:json)?\s*", "", crudo)
    crudo = re.sub(r"\s*```$", "", crudo)
    try:
        return json.loads(crudo)
    except json.JSONDecodeError:
        pass
    # Buscar el primer objeto/arreglo balanceado
    for apertura, cierre in (("{", "}"), ("[", "]")):
        inicio = crudo.find(apertura)
        fin = crudo.rfind(cierre)
        if inicio != -1 and fin != -1 and fin > inicio:
            try:
                return json.loads(crudo[inicio : fin + 1])
            except json.JSONDecodeError:
                continue
    raise ValueError(f"No se pudo parsear JSON de la respuesta:\n{crudo[:500]}")
