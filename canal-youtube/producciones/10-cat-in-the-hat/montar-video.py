"""Monta el video 10 (tendencia Cat in the Hat): 12 fotos reales + narracion.

Uso:
    python3 montar-video.py [--zoom] [--subtitulos] [--salida video.mp4]

Mismo metodo que el video 9: duracion de cada plano tomada de
hoja-montaje.csv, demuxer concat o zoompan Ken Burns segun --zoom, fondo
difuminado en vez de recorte para no comerse cuerpos/rostros en fotos
verticales, subtitulos quemados con estilo minimalista si se piden.
"""
import argparse
import csv
import json
import os
import subprocess
import sys

CSV = "hoja-montaje.csv"
SRT = "subtitulos.srt"
TRADUCCION_SRT = "traduccion.srt"
AUDIO = "audio.mp3"
W, H, FPS = 1920, 1080, 30
EXT_VIDEO = (".mp4", ".mov", ".webm", ".mkv")


def duracion_real(ruta: str) -> float:
    salida = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", ruta],
        capture_output=True, text=True, check=True,
    ).stdout.strip()
    return float(salida)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--zoom", action="store_true")
    ap.add_argument("--subtitulos", action="store_true")
    ap.add_argument("--salida", default="video-10-montado.mp4")
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

    def relleno_difuminado(sufijo=""):
        # La imagen entera se ve completa (scale...decrease, sin recortar)
        # sobre un fondo hecho de la misma imagen ampliada y difuminada,
        # para no dejar barras negras ni comerse medio cuerpo en fotos
        # verticales.
        bg, fg, bgb, fgf = f"bg{sufijo}", f"fg{sufijo}", f"bgb{sufijo}", f"fgf{sufijo}"
        return (
            f"split=2[{bg}][{fg}];"
            f"[{bg}]scale={W}:{H}:force_original_aspect_ratio=increase,"
            f"crop={W}:{H},gblur=sigma=20,eq=brightness=-0.08[{bgb}];"
            f"[{fg}]scale={W}:{H}:force_original_aspect_ratio=decrease,setsar=1[{fgf}];"
            f"[{bgb}][{fgf}]overlay=(W-w)/2:(H-h)/2,setsar=1"
        )

    quemar = ""
    if args.subtitulos:
        if not os.path.exists(SRT):
            print(f"::error:: no encuentro los subtítulos: {SRT}")
            sys.exit(1)
        # Estilo minimalista y discreto (mismo del video 9): contorno
        # simple, letra chica, sin caja solida.
        estilo = ("FontName=DejaVu Sans,Fontsize=16,Bold=1,"
                  "PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,"
                  "BorderStyle=1,Outline=1.6,Shadow=0.8,"
                  "Alignment=2,MarginV=50,MarginL=60,MarginR=60")
        quemar = f",subtitles={SRT}:force_style='{estilo}'"

        # Dos imagenes reales (la cuadricula de posts de TikTok y el
        # cartel de la policia de Laredo) traen texto en pantalla en
        # ingles. En vez de recortarlo o dejarlo sin traducir, se quema
        # un segundo rotulo -- arriba, con caja solida para distinguirlo
        # claramente del subtitulo de la narracion -- con la traduccion.
        if os.path.exists(TRADUCCION_SRT):
            # Version anterior (Fontsize=15, Outline=6 de caja,
            # margenes de 100px) tapaba casi toda la imagen en formato
            # vertical/cuadrado. Ahora: letra mas chica, caja mas
            # angosta (menos padding), y mas ancho de linea (margenes
            # de 30px) para que el texto entre en una sola linea y la
            # caja sea lo mas baja posible.
            estilo_trad = ("FontName=DejaVu Sans,Fontsize=11,Bold=0,Italic=1,"
                           "PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,"
                           "BackColour=&H70000000,BorderStyle=3,Outline=2.5,Shadow=0,"
                           "Alignment=8,MarginV=18,MarginL=30,MarginR=30")
            quemar += f",subtitles={TRADUCCION_SRT}:force_style='{estilo_trad}'"

    if args.zoom:
        trozos = []
        for i, (p, d) in enumerate(rutas):
            if p.lower().endswith(EXT_VIDEO):
                # Clip de video real (no una foto): ya trae su propio
                # movimiento, no se le aplica zoompan. Se recorta a la
                # duracion del plano; si el clip es mas corto que el
                # plano, se sostiene el ultimo fotograma (tpad) en vez
                # de dejar el video mudo/negro o desincronizar el resto
                # del montaje. El audio propio del clip no se mapea --
                # se queda mudo, solo se oye la narracion.
                dur_clip = duracion_real(p)
                relleno_extra = ""
                if dur_clip < d:
                    relleno_extra = f",tpad=stop_mode=clone:stop_duration={d - dur_clip:.3f}"
                trozos.append(
                    f"[{i}:v]trim=start=0:end={min(d, dur_clip):.3f},setpts=PTS-STARTPTS,"
                    f"{relleno_difuminado(i)}{relleno_extra},fps={FPS}[v{i}]"
                )
                continue
            fr = max(1, round(d * FPS))
            # Alterna la direccion del zoom (in/out) para que no se vea
            # siempre el mismo movimiento.
            z = f"1+0.08*on/{fr}" if i % 2 == 0 else f"1.08-0.08*on/{fr}"
            trozos.append(
                f"[{i}:v]{relleno_difuminado(i)},"
                f"zoompan=z='{z}':d={fr}:"
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
               "-vf", f"{relleno_difuminado()},fps={FPS}{quemar}", "-r", str(FPS)]

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
