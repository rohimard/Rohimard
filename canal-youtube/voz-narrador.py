# -*- coding: utf-8 -*-
# Voz definitiva del narrador — Historia Incómoda. Generada por código, sin coste.
#
# Pipeline en tres pasos:
#   1. Kokoro TTS (voz em_santa) genera el español con la pronunciación correcta.
#   2. FreeVC24 (conversión de voz zero-shot) le transfiere el timbre de Kevin,
#      la voz de ElevenLabs que el canal venía usando, a partir de una referencia
#      de audio real de vídeos anteriores.
#   3. Acabado en ffmpeg: aire en agudos, cuerpo en graves, de-ess y normalización.
#
# Los modelos viven fuera del repo por su peso (ver kokoro-models/ y freevc-models/,
# ambos en .gitignore). Todos se descargan de releases de GitHub:
#   Kokoro:  github.com/thewh1teagle/kokoro-onnx  (model-files-v1.1)
#   FreeVC:  github.com/coqui-ai/TTS             (v0.13.0_models)
#
# Uso:
#   python3 voz-narrador.py guion-voz.txt salida.mp3
#
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf

BASE = Path(__file__).resolve().parent
KOKORO_MODEL = BASE / "kokoro-models/kokoro-v1.0.onnx"
KOKORO_VOICES = BASE / "kokoro-models/voices-v1.0.bin"
FREEVC_DIR = BASE / "freevc-models/voice_conversion_models--multilingual--vctk--freevc24"
REFERENCIA_KEVIN = BASE / "freevc-models/kevin-referencia.mp3"

# Trozos de como mucho estos segundos: FreeVC en CPU se ahoga con audios largos.
MAX_CHUNK_S = 25.0
# Acabado aprobado: realce de aire, cuerpo, de-ess suave y volumen de emisión.
FILTRO_ACABADO = (
    "highshelf=f=6500:g=3,"
    "deesser=i=0.3:m=0.5:f=0.55,"
    "equalizer=f=200:t=q:w=1.2:g=1.5,"
    "loudnorm=I=-16:TP=-1.5:LRA=11"
)


def generar_base(texto: str, destino: Path) -> int:
    """Paso 1: el español lo pone Kokoro."""
    from kokoro_onnx import Kokoro

    k = Kokoro(str(KOKORO_MODEL), str(KOKORO_VOICES))
    samples, sr = k.create(texto, voice="em_santa", speed=0.95, lang="es")
    sf.write(destino, samples, sr)
    return sr


def cortar_en_silencios(wav: np.ndarray, sr: int) -> list:
    """Parte el audio en trozos cortos, siempre por un silencio real.

    Cortar a ciegas cada N segundos partiría palabras por la mitad y se oiría
    el empalme; buscamos el punto más callado dentro de la ventana permitida.
    """
    limite = int(MAX_CHUNK_S * sr)
    if len(wav) <= limite:
        return [wav]

    ventana = max(1, int(0.02 * sr))
    energia = np.abs(wav)
    trozos, inicio = [], 0
    while inicio < len(wav):
        if len(wav) - inicio <= limite:
            trozos.append(wav[inicio:])
            break
        # Busca el instante más silencioso en el último tercio de la ventana.
        zona_ini = inicio + int(limite * 0.6)
        zona_fin = inicio + limite
        zona = energia[zona_ini:zona_fin]
        medias = np.convolve(zona, np.ones(ventana) / ventana, mode="same")
        corte = zona_ini + int(np.argmin(medias))
        trozos.append(wav[inicio:corte])
        inicio = corte
    return trozos


def convertir_timbre(base_wav: Path, destino: Path):
    """Paso 2: FreeVC le pone el timbre de Kevin, trozo a trozo."""
    from TTS.utils.synthesizer import Synthesizer

    syn = Synthesizer(
        vc_checkpoint=str(FREEVC_DIR / "model.pth"),
        vc_config=str(FREEVC_DIR / "config.json"),
        use_cuda=False,
    )

    wav, sr = sf.read(base_wav)
    trozos = cortar_en_silencios(wav, sr)
    print(f" > {len(trozos)} trozos a convertir")

    convertidos = []
    with tempfile.TemporaryDirectory() as tmp:
        for i, trozo in enumerate(trozos, 1):
            parte = Path(tmp) / f"parte{i:03d}.wav"
            sf.write(parte, trozo, sr)
            salida = syn.voice_conversion(
                source_wav=str(parte), target_wav=str(REFERENCIA_KEVIN)
            )
            convertidos.append(np.asarray(salida, dtype=np.float32))
            print(f"   trozo {i}/{len(trozos)} listo")

    sf.write(destino, np.concatenate(convertidos), syn.vc_config.audio["output_sample_rate"])


def acabado(entrada: Path, salida: Path):
    """Paso 3: el acabado de sonido, ya en mp3."""
    subprocess.run(
        ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", str(entrada),
         "-af", FILTRO_ACABADO, "-codec:a", "libmp3lame", "-qscale:a", "2", str(salida)],
        check=True,
    )


def main(texto_path: str, salida_path: str):
    texto = Path(texto_path).read_text(encoding="utf-8")
    salida = Path(salida_path)

    with tempfile.TemporaryDirectory() as tmp:
        base = Path(tmp) / "base.wav"
        convertido = Path(tmp) / "convertido.wav"

        print("Paso 1/3 — generando el español con Kokoro...")
        generar_base(texto, base)

        print("Paso 2/3 — transfiriendo el timbre de Kevin con FreeVC...")
        convertir_timbre(base, convertido)

        print("Paso 3/3 — acabado de sonido...")
        acabado(convertido, salida)

    print("OK ->", salida)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
