# -*- coding: utf-8 -*-
# Voz definitiva del narrador — Historia Incómoda (generada por código, sin coste).
# Motor: Kokoro TTS (kokoro-onnx). Modelos en canal-youtube/kokoro-models/
#   (kokoro-v1.0.onnx + voices-v1.0.bin — descargados de los release assets de
#   https://github.com/thewh1teagle/kokoro-onnx, no de Hugging Face porque está bloqueado).
#
# Uso:
#   python3 voz-narrador-kokoro.py guion.txt salida.mp3
#
import sys
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro
import subprocess

MODEL = "kokoro-models/kokoro-v1.0.onnx"
VOICES = "kokoro-models/voices-v1.0.bin"

def voz_narrador(k):
    santa = k.get_voice_style("em_santa")
    fenrir = k.get_voice_style("am_fenrir")
    return (santa * 0.55 + fenrir * 0.45).astype(np.float32)

def generar(texto_path, salida_path):
    k = Kokoro(MODEL, VOICES)
    with open(texto_path, "r", encoding="utf-8") as f:
        texto = f.read()

    voice = voz_narrador(k)
    samples, sr = k.create(texto, voice=voice, speed=0.95, lang="es")

    raw_wav = salida_path + ".raw.wav"
    sf.write(raw_wav, samples, sr)

    subprocess.run([
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-i", raw_wav,
        "-af", "rubberband=pitch=0.97,equalizer=f=150:t=q:w=1:g=3,"
               "highshelf=f=7500:g=-4,loudnorm=I=-16:TP=-1.5:LRA=11",
        "-codec:a", "libmp3lame", "-qscale:a", "2",
        salida_path,
    ], check=True)

    print("OK ->", salida_path)

if __name__ == "__main__":
    generar(sys.argv[1], sys.argv[2])
