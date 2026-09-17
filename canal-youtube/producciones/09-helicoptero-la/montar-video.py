"""Monta el video 9 (helicoptero de Chatsworth): 10 fotos reales + narracion.

Uso:
    python3 montar-video.py [--zoom] [--salida video.mp4]

A diferencia del montar-video.py del video 8, aqui "archivo" en
hoja-montaje.csv ya es la ruta relativa a la imagen real (en
imagenes-reales/ o imagenes-noticia/), no un numero de plano -- solo hay 10
fotos reales y varias se repiten en varios planos con distinto encuadre/zoom,
asi que no tiene sentido la convencion 001.png...095.png del video anterior.

El resto es el mismo metodo que ya funciono en el video 8: duracion de cada
plano tomada de hoja-montaje.csv, demuxer concat o zoompan Ken Burns segun
--zoom, audio mezclado tal cual.
"""
import argparse
import csv
import os
import subprocess
import sys

CSV = "hoja-montaje.csv"
SRT = "subtitulos.srt"
AUDIO = "audio.mp3"
W, H, FPS = 1920, 1080, 30


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--zoom", action="store_true")
    ap.add_argument("--subtitulos", action="store_true")
    ap.add_argument("--salida", default="video-9-montado.mp4")
    ap.add_argument("--audio", default=AUDIO)
    args = ap.parse_args()

    filas = list(csv.DictReader(open(CSV, encoding="utf-8")))
    rutas, faltan = [], []
    for f in filas:
        p = f["archivo"]
        (rutas.append((p, float(f["dur"]))) if os.path.exists(p) else faltan.append(p))

    if faltan:
        print(f"::error:: faltan {len(faltan)} imágenes: {', '.join(faltan)}")
        sys.exit(1)
    if not os.path.exists(args.audio):
        print(f"::error:: no encuentro el audio: {args.audio}")
        sys.exit(1)

    encaje = (f"scale={W}:{H}:force_original_aspect_ratio=increase,"
              f"crop={W}:{H},setsar=1")

    quemar = ""
    if args.subtitulos:
        if not os.path.exists(SRT):
            print(f"::error:: no encuentro los subtítulos: {SRT}")
            sys.exit(1)
        # Estilo noticiero: caja solida (BorderStyle=3) en vez de solo
        # contorno, como un rotulo de breaking news, con el texto en
        # mayusculas ya resuelto en el propio SRT.
        # BorderStyle=3 dibuja una caja solida, pero el grosor de esa caja lo
        # marca Outline (no un padding aparte) -- con Outline=0 la caja sale
        # con area cero y no se ve nada. Con Outline=8 se ve como un rotulo.
        # La caja solida (BorderStyle=3) se veia demasiado pesada y grande.
        # Vuelve a contorno simple (BorderStyle=1), letra mas chica: mas
        # discreto, ocupa menos pantalla.
        estilo = ("FontName=DejaVu Sans,Fontsize=16,Bold=1,"
                  "PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,"
                  "BorderStyle=1,Outline=1.6,Shadow=0.8,"
                  "Alignment=2,MarginV=50,MarginL=60,MarginR=60")
        quemar = f",subtitles={SRT}:force_style='{estilo}'"

    if args.zoom:
        trozos = []
        for i, (p, d) in enumerate(rutas):
            fr = max(1, round(d * FPS))
            # Alterna la direccion del zoom (in/out) para que las imagenes
            # repetidas no se vean con el mismo movimiento cada vez.
            z = f"1+0.08*on/{fr}" if i % 2 == 0 else f"1.08-0.08*on/{fr}"
            trozos.append(
                f"[{i}:v]{encaje},zoompan=z='{z}':d={fr}:"
                f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS}[v{i}]"
            )
        cadena = ";".join(trozos)
        cadena += ";" + "".join(f"[v{i}]" for i in range(len(rutas)))
        cadena += f"concat=n={len(rutas)}:v=1:a=0"
        cadena += f"{quemar}[vid]" if quemar else "[vid]"

        cmd = ["ffmpeg", "-y"]
        for p, _ in rutas:
            cmd += ["-i", p]
        cmd += ["-i", args.audio, "-filter_complex", cadena, "-map", "[vid]",
                "-map", f"{len(rutas)}:a"]
    else:
        lista = "lista-concat.txt"
        with open(lista, "w", encoding="utf-8") as fh:
            for p, d in rutas:
                fh.write(f"file '{os.path.abspath(p)}'\nduration {d:.3f}\n")
            fh.write(f"file '{os.path.abspath(rutas[-1][0])}'\n")
        cmd = ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", lista,
               "-i", args.audio,
               "-vf", f"{encaje},fps={FPS}{quemar}", "-r", str(FPS)]

    cmd += ["-c:v", "libx264", "-preset", "medium", "-crf", "18",
            "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
            "-shortest", args.salida]

    total = sum(d for _, d in rutas)
    print(f"{len(rutas)} planos, {total:.2f}s, "
          f"zoom={'sí' if args.zoom else 'no'}, "
          f"subtítulos={'quemados' if args.subtitulos else 'no'}")
    print(f"render -> {args.salida}\n")
    subprocess.run(cmd, check=True)
    print(f"\nlisto: {args.salida}")


if __name__ == "__main__":
    main()
