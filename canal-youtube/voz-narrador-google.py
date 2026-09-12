# -*- coding: utf-8 -*-
"""Voz del narrador — Historia Incómoda, vía Google Cloud Text-to-Speech.

Usa la gama Chirp 3 HD, que entra en el millón de caracteres gratuitos al mes
(el guión de un vídeo son unos 4.800, así que la capa gratuita da para unos
200 vídeos mensuales).

La clave de API NO se guarda en el repo: se lee de la variable de entorno
GOOGLE_TTS_API_KEY, o del archivo canal-youtube/.google-tts-key (ignorado
por git).

Uso:
  python3 voz-narrador-google.py --voces                    # lista voces es-US
  python3 voz-narrador-google.py guion-voz.txt salida.mp3 [nombre-de-voz]
"""
import base64
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

BASE = Path(__file__).resolve().parent
API = "https://texttospeech.googleapis.com/v1"
VOZ_POR_DEFECTO = "es-US-Chirp3-HD-Charon"

# La API corta a 5.000 bytes por petición; troceamos por frases con margen.
MAX_BYTES = 4000

# Mismo acabado que veníamos usando: aire en agudos, algo de cuerpo,
# de-ess suave y volumen de emisión.
FILTRO_ACABADO = (
    "highshelf=f=6500:g=2,"
    "deesser=i=0.25:m=0.5:f=0.55,"
    "equalizer=f=200:t=q:w=1.2:g=1.5,"
    "loudnorm=I=-16:TP=-1.5:LRA=11"
)


def clave() -> str:
    k = os.environ.get("GOOGLE_TTS_API_KEY")
    if k:
        return k.strip()
    f = BASE / ".google-tts-key"
    if f.exists():
        return f.read_text(encoding="utf-8").strip()
    sys.exit("Falta la clave: exporta GOOGLE_TTS_API_KEY o crea canal-youtube/.google-tts-key")


def pedir(ruta: str, cuerpo=None):
    url = f"{API}/{ruta}{'&' if '?' in ruta else '?'}key={clave()}"
    datos = json.dumps(cuerpo).encode("utf-8") if cuerpo else None
    req = urllib.request.Request(
        url, data=datos,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST" if cuerpo else "GET",
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))


def listar_voces(idioma="es-US"):
    for v in pedir(f"voices?languageCode={idioma}").get("voices", []):
        print(f"{v['name']:<34} {v.get('ssmlGender',''):<8} {v.get('naturalSampleRateHertz','')} Hz")


def trocear(texto: str) -> list:
    """Parte el guión en peticiones que quepan en el límite de la API."""
    frases = re.split(r"(?<=[.!?])\s+", re.sub(r"\s+", " ", texto).strip())
    trozos, actual = [], ""
    for f in frases:
        candidato = (actual + " " + f).strip()
        if len(candidato.encode("utf-8")) > MAX_BYTES and actual:
            trozos.append(actual)
            actual = f
        else:
            actual = candidato
    if actual:
        trozos.append(actual)
    return trozos


def generar(texto_path: str, salida: str, voz: str = VOZ_POR_DEFECTO):
    texto = Path(texto_path).read_text(encoding="utf-8")
    trozos = trocear(texto)
    print(f"{len(trozos)} peticiones ({len(texto)} caracteres) con la voz {voz}")

    with tempfile.TemporaryDirectory() as tmp:
        partes = []
        for i, trozo in enumerate(trozos, 1):
            resp = pedir("text:synthesize", {
                "input": {"text": trozo},
                "voice": {"languageCode": "-".join(voz.split("-")[:2]), "name": voz},
                "audioConfig": {"audioEncoding": "MP3"},
            })
            parte = Path(tmp) / f"p{i:03d}.mp3"
            parte.write_bytes(base64.b64decode(resp["audioContent"]))
            partes.append(parte)
            print(f"  {i}/{len(trozos)}")

        lista = Path(tmp) / "lista.txt"
        lista.write_text("".join(f"file '{p}'\n" for p in partes), encoding="utf-8")
        subprocess.run([
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-f", "concat", "-safe", "0", "-i", str(lista),
            "-af", FILTRO_ACABADO, "-codec:a", "libmp3lame", "-qscale:a", "2", salida,
        ], check=True)

    print("OK ->", salida)


if __name__ == "__main__":
    if "--voces" in sys.argv:
        listar_voces(sys.argv[sys.argv.index("--voces") + 1] if len(sys.argv) > sys.argv.index("--voces") + 1 else "es-US")
    else:
        generar(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else VOZ_POR_DEFECTO)
