"""Monta el video entero: 95 imagenes + narracion, con los tiempos de la hoja.

Uso:
    python3 montar-video.py CARPETA_IMAGENES [--zoom] [--salida video.mp4]

CARPETA_IMAGENES debe contener 001.png ... 095.png (tambien vale .jpg).

Lee hoja-montaje.csv, que ya trae la duracion exacta de cada plano anclada a
la narracion, y se lo pasa a ffmpeg por el demuxer concat. El audio se mezcla
tal cual, sin recodificar la voz mas de lo imprescindible.

--zoom anade un zoom lento tipo Ken Burns a cada imagen. Es lo que da
sensacion de movimiento con material fijo. Cuesta bastante mas de render
(cada imagen pasa por zoompan), asi que conviene montar primero sin el para
revisar el sincronismo y activarlo en la pasada final.

--subtitulos quema subtitulos.srt en la imagen. Se quema y no se adjunta
aparte porque el 80% del consumo del canal es en movil, donde los subtitulos
opcionales vienen apagados por defecto.

El estilo va escrito aqui y no en el SRT: cuerpo grande, blanco con borde
negro grueso y sombra, pegado a la parte baja pero no al borde, que es lo que
aguanta sobre cualquier imagen sin tener que mirar plano a plano.

CUIDADO CON EL ORDEN DE fps Y subtitles
Con el demuxer concat cada imagen entra como UN SOLO fotograma que dura todo
el plano. Si se quema antes de fijar la cadencia, el filtro dibuja sobre ese
fotograma unico el subtitulo activo en ese instante y luego -r duplica el
fotograma YA COMPUESTO durante todo el plano: cada plano acaba enseñando un
subtitulo congelado, el que estaba activo cuando entro la imagen. Se vio en el
primer render -- en el segundo 8,28 seguia el subtitulo que acababa en el
7,64. Por eso va fps antes que subtitles: asi cada fotograma de salida existe
de verdad y consulta el SRT por su cuenta.
"""
import argparse
import csv
import os
import subprocess
import sys

CSV = "hoja-montaje.csv"
SRT = "subtitulos.srt"
AUDIO = "david-elevenlabs/david-narracion.mp3"
EXTENSIONES = (".png", ".jpg", ".jpeg", ".webp")
W, H, FPS = 1920, 1080, 30


def buscar(carpeta, n):
    for ext in EXTENSIONES:
        p = os.path.join(carpeta, f"{n:03d}{ext}")
        if os.path.exists(p):
            return p
    return None


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("carpeta")
    ap.add_argument("--zoom", action="store_true")
    ap.add_argument("--subtitulos", action="store_true")
    ap.add_argument("--salida", default="video-8-montado.mp4")
    ap.add_argument("--audio", default=AUDIO)
    args = ap.parse_args()

    filas = list(csv.DictReader(open(CSV, encoding="utf-8")))
    rutas, faltan = [], []
    for f in filas:
        n = int(f["plano"])
        p = buscar(args.carpeta, n)
        (rutas.append((p, float(f["dur"]))) if p else faltan.append(n))

    if faltan:
        print(f"::error:: faltan {len(faltan)} imágenes: "
              f"{', '.join(f'{n:03d}' for n in faltan[:15])}"
              f"{'...' if len(faltan) > 15 else ''}")
        sys.exit(1)
    if not os.path.exists(args.audio):
        print(f"::error:: no encuentro el audio: {args.audio}")
        sys.exit(1)

    # Encajar cualquier tamaño en 1920x1080 sin deformar: se escala hasta
    # cubrir y se recorta el sobrante. Si se usara pad quedarian franjas
    # negras cuando una imagen no salga exactamente en 16:9.
    encaje = (f"scale={W}:{H}:force_original_aspect_ratio=increase,"
              f"crop={W}:{H},setsar=1")

    # El filtro subtitles lee el SRT y aplica este estilo. Va SIEMPRE al final
    # de la cadena: si se pusiera antes del escalado, el texto se escalaria y
    # recortaria con la imagen.
    quemar = ""
    if args.subtitulos:
        if not os.path.exists(SRT):
            print(f"::error:: no encuentro los subtítulos: {SRT}")
            sys.exit(1)
        estilo = ("FontName=DejaVu Sans,Fontsize=22,Bold=1,"
                  "PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,"
                  "BorderStyle=1,Outline=2,Shadow=1,"
                  "Alignment=2,MarginV=60")
        quemar = f",subtitles={SRT}:force_style='{estilo}'"

    if args.zoom:
        # zoompan trabaja por fotogramas: cada plano dura dur*FPS frames y el
        # zoom va de 1.00 a 1.08 a lo largo de ese tramo, centrado.
        trozos = []
        for i, (p, d) in enumerate(rutas):
            fr = max(1, round(d * FPS))
            trozos.append(
                f"[{i}:v]{encaje},zoompan=z='1+0.08*on/{fr}':d={fr}:"
                f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS}[v{i}]"
            )
        cadena = ";".join(trozos)
        cadena += ";" + "".join(f"[v{i}]" for i in range(len(rutas)))
        cadena += f"concat=n={len(rutas)}:v=1:a=0"
        cadena += f"{quemar}[vid]" if quemar else "[vid]"

        # FALLO QUE HUBO AQUI: "-t 1" limitaba a un segundo fijo la entrada de
        # CADA imagen, sin importar cuanto durara su plano de verdad (2 a 6 s
        # segun la hoja). zoompan necesita fotogramas de entrada durante TODA
        # la duracion del plano; en cuanto se agotaban al segundo 1, ffmpeg se
        # quedaba repitiendo el ultimo fotograma disponible -- el plano se veia
        # congelado el resto de su duracion. Cada imagen debe entrar el tiempo
        # que le toca a SU plano, no un segundo parejo para todas.
        cmd = ["ffmpeg", "-y"]
        for p, d in rutas:
            cmd += ["-loop", "1", "-t", f"{d:.3f}", "-i", p]
        cmd += ["-i", args.audio, "-filter_complex", cadena, "-map", "[vid]",
                "-map", f"{len(rutas)}:a"]
    else:
        # Demuxer concat: mucho mas rapido y sin limite practico de entradas.
        lista = "lista-concat.txt"
        with open(lista, "w", encoding="utf-8") as fh:
            for p, d in rutas:
                fh.write(f"file '{os.path.abspath(p)}'\nduration {d:.3f}\n")
            # El demuxer ignora la duracion del ultimo fichero salvo que se
            # repita la linea file: sin esto el plano 95 dura un fotograma.
            fh.write(f"file '{os.path.abspath(rutas[-1][0])}'\n")
        cmd = ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", lista,
               "-i", args.audio,
               "-vf", f"{encaje},fps={FPS}{quemar}", "-r", str(FPS)]

    cmd += ["-c:v", "libx264", "-preset", "medium", "-crf", "18",
            "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
            "-shortest", args.salida]

    total = sum(d for _, d in rutas)
    print(f"{len(rutas)} imágenes, {total:.2f}s, "
          f"zoom={'sí' if args.zoom else 'no'}, "
          f"subtítulos={'quemados' if args.subtitulos else 'no'}")
    print(f"render -> {args.salida}\n")
    subprocess.run(cmd, check=True)
    print(f"\nlisto: {args.salida}")


if __name__ == "__main__":
    main()
