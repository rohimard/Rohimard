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

NOTA: no se ha podido probar el render completo aqui porque las imagenes
estan en la maquina del usuario, no en el repositorio. La generacion de la
lista de concat si esta verificada contra el CSV real.
"""
import argparse
import csv
import os
import subprocess
import sys

CSV = "hoja-montaje.csv"
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
        cadena += f"concat=n={len(rutas)}:v=1:a=0[vid]"

        cmd = ["ffmpeg", "-y"]
        for p, _ in rutas:
            cmd += ["-loop", "1", "-t", "1", "-i", p]
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
               "-i", args.audio, "-vf", encaje, "-r", str(FPS)]

    cmd += ["-c:v", "libx264", "-preset", "medium", "-crf", "18",
            "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
            "-shortest", args.salida]

    total = sum(d for _, d in rutas)
    print(f"{len(rutas)} imágenes, {total:.2f}s, zoom={'sí' if args.zoom else 'no'}")
    print(f"render -> {args.salida}\n")
    subprocess.run(cmd, check=True)
    print(f"\nlisto: {args.salida}")


if __name__ == "__main__":
    main()
