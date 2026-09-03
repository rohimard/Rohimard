"""Persistencia en ficheros JSON.

Suficiente para el MVP: sin base de datos, sin migraciones y sin coste. La
escritura es atomica (fichero temporal + os.replace) y esta serializada con un
Lock, de modo que dos peticiones simultaneas no puedan corromper el fichero.
"""

from __future__ import annotations

import json
import os
import tempfile
import threading
from datetime import datetime, timezone
from pathlib import Path

DIRECTORIO = Path(__file__).parent / "data"
INFORMES = DIRECTORIO / "informes.json"
SUSCRIPTORES = DIRECTORIO / "suscriptores.json"

_cerrojo = threading.Lock()


def _leer(ruta: Path, por_defecto):
    try:
        with ruta.open(encoding="utf-8") as fichero:
            return json.load(fichero)
    except (FileNotFoundError, json.JSONDecodeError):
        return por_defecto


def _escribir(ruta: Path, datos) -> None:
    ruta.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporal = tempfile.mkstemp(dir=str(ruta.parent), suffix=".tmp")
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as fichero:
            json.dump(datos, fichero, ensure_ascii=False, indent=2)
        os.replace(temporal, ruta)
    except BaseException:
        Path(temporal).unlink(missing_ok=True)
        raise


def _ahora() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


# ------------------------------------------------------------------ informes

def guardar_informe(identificador: str, datos: dict) -> dict:
    registro = {
        "id": identificador,
        "creado": _ahora(),
        "pagado": False,
        "email": None,
        "stripe_session": None,
        "auditoria": datos,
    }
    with _cerrojo:
        informes = _leer(INFORMES, {})
        informes[identificador] = registro
        # El MVP solo necesita el historial reciente; asi el fichero no crece
        # sin limite en el plan gratuito de Render.
        if len(informes) > 500:
            for viejo in sorted(informes, key=lambda k: informes[k]["creado"])[:-500]:
                informes.pop(viejo, None)
        _escribir(INFORMES, informes)
    return registro


def obtener_informe(identificador: str) -> dict | None:
    return _leer(INFORMES, {}).get(identificador)


def marcar_pagado(identificador: str, sesion_stripe: str | None = None,
                  email: str | None = None) -> dict | None:
    with _cerrojo:
        informes = _leer(INFORMES, {})
        registro = informes.get(identificador)
        if registro is None:
            return None
        registro["pagado"] = True
        registro["pagado_en"] = _ahora()
        if sesion_stripe:
            registro["stripe_session"] = sesion_stripe
        if email:
            registro["email"] = email
        _escribir(INFORMES, informes)
        return registro


# -------------------------------------------------------------- suscriptores

def guardar_suscriptor(email: str, origen: str = "landing",
                       extra: dict | None = None) -> tuple[bool, int]:
    """Anade un email a la lista de espera. Devuelve (era_nuevo, total)."""
    email = (email or "").strip().lower()
    with _cerrojo:
        lista = _leer(SUSCRIPTORES, [])
        if any(s.get("email") == email for s in lista):
            return False, len(lista)
        lista.append({
            "email": email,
            "origen": origen,
            "alta": _ahora(),
            **(extra or {}),
        })
        _escribir(SUSCRIPTORES, lista)
        return True, len(lista)


def contar_suscriptores() -> int:
    return len(_leer(SUSCRIPTORES, []))
