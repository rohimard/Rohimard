# -*- coding: utf-8 -*-
"""Narra una parte del guión con la cadena Piper -> Chatterbox.

El guión se trocea igual en todos los trabajos y cada uno genera solo los
trozos que le tocan, así que varios runners en paralelo hacen en minutos lo
que uno solo tarda casi una hora. El reparto es alterno y no por bloques
para que, si un trabajo falla, falten trozos sueltos y no un tramo entero
del vídeo.

Uso:
  python narrar-trozos.py guion-voz.txt --parte 0 --de 6
"""
import argparse
import os
import re

import torch
import torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

# Chatterbox pierde calidad por encima de unos trescientos caracteres.
MAX = 260

# Semilla fija. Sin ella el timbre deriva de un trozo al siguiente y a mitad
# del vídeo ya no es la misma voz; con varios runners en paralelo esto deja
# de ser un detalle y pasa a ser imprescindible.
SEMILLA = 1861

EXPRESIVIDAD = 0.4   # la muestra "sobrio", que fue la elegida
RITMO = 0.5


def trocear(texto: str) -> list:
    """Agrupa frases enteras sin pasar del límite del modelo."""
    frases = re.split(r"(?<=[.!?])\s+", re.sub(r"\s+", " ", texto).strip())
    trozos, actual = [], ""
    for f in frases:
        candidato = (actual + " " + f).strip()
        if len(candidato) > MAX and actual:
            trozos.append(actual)
            actual = f
        else:
            actual = candidato
    if actual:
        trozos.append(actual)
    return trozos


def main():
    p = argparse.ArgumentParser()
    p.add_argument("guion")
    p.add_argument("--parte", type=int, required=True)
    p.add_argument("--de", type=int, required=True)
    p.add_argument("--referencia", default="ref-piper.wav")
    p.add_argument("--salida", default="trozos")
    args = p.parse_args()

    trozos = trocear(open(args.guion, encoding="utf-8").read())
    mios = [(i, t) for i, t in enumerate(trozos, 1)
            if (i - 1) % args.de == args.parte]
    print(f"{len(trozos)} trozos en total, {len(mios)} para la parte {args.parte}")

    os.makedirs(args.salida, exist_ok=True)
    modelo = ChatterboxMultilingualTTS.from_pretrained(device="cpu")

    for i, trozo in mios:
        torch.manual_seed(SEMILLA)
        wav = modelo.generate(
            trozo,
            language_id="es",
            audio_prompt_path=args.referencia,
            exaggeration=EXPRESIVIDAD,
            cfg_weight=RITMO,
        )
        ta.save(f"{args.salida}/{i:03d}.wav", wav, modelo.sr)
        print(f"  trozo {i:03d}  {len(trozo)} caracteres")


if __name__ == "__main__":
    main()
