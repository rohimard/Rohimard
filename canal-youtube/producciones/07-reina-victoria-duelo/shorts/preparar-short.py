#!/usr/bin/env python3
"""
preparar-short.py — asigna imagen y tiempo real a cada plano del short.

IMÁGENES. El short reutiliza las del vídeo largo en vez de generar 24 nuevas
verticales. Cada escena del short se empareja a mano con la imagen del vídeo
que cuenta lo mismo (ver MAPA), sin repetir ninguna. Lo que NO se hace es
recortar el 16:9 a 9:16: se perdería el 68% del ancho y habría que ampliar el
recorte 2,5 veces, con lo que la imagen quedaría blanda. El renderizador las
coloca a ancho completo sobre un fondo desenfocado de la propia imagen.

TIEMPOS. Salen de las marcas de palabra de Azure, igual que en el vídeo largo:
cada plano entra cuando suena su primera palabra.

  python3 preparar-short.py
"""
import json
import pathlib
import re
import subprocess
import sys
import unicodedata

AQUI = pathlib.Path(__file__).parent
VIDEO = AQUI.parent

# escena del short -> nº de imagen del vídeo largo que cuenta lo mismo
MAPA = {
    1: 9,    # enterrar a tu marido      <- diciembre de mil ochocientos sesenta y uno
    2: 12,   # no quitarte el negro      <- vestida de negro cada día
    3: 5,    # la mujer más poderosa     <- la mujer más poderosa del mundo
    4: 4,    # Reino Unido, 1861         <- el castillo de Windsor
    5: 8,    # Alberto muere             <- el príncipe Alberto
    6: 10,   # cuarenta y dos años       <- cuarenta y dos años
    7: 7,    # su viuda se viste de luto <- la reina Victoria
    8: 22,   # no se lo quita nunca más  <- seguía de negro
    9: 24,   # hasta su muerte en 1901   <- mil novecientos uno
    10: 14,  # una década sin aparecer   <- una década sin aparecer
    11: 15,  # el pueblo pregunta        <- el pueblo empieza a preguntar
    12: 16,  # ¿seguía gobernando?       <- ¿sigue gobernando su reina?
    13: 17,  # el Parlamento             <- el Parlamento sin abrir
    14: 18,  # papel con borde negro     <- papel con borde negro
    15: 19,  # décadas después           <- décadas de luto en el papel
    16: 20,  # cartas ajenas a Alberto   <- cartas que nada tenían que ver
    17: 25,  # se contó como amor        <- la historia lo contó como amor
    18: 33,  # dos mil veintidós         <- el año dos mil veintidós
    19: 34,  # el manual                 <- el manual que usan los psicólogos
    20: 31,  # duelo prolongado          <- duelo prolongado
    21: 72,  # no es cuánto duele        <- no es cuánto sufres
    22: 73,  # doce meses igual          <- es cuánto tiempo sigue igual
    23: 80,  # a ella nadie se lo ofreció<- a ella nadie se lo ofreció
    24: 78,  # hoy sí existe             <- existe tratamiento específico
}


def normalizar(p: str) -> str:
    p = unicodedata.normalize("NFD", p.lower())
    p = "".join(c for c in p if unicodedata.category(c) != "Mn")
    return re.sub(r"[^\w]", "", p)


def emparejar(palabras: list, marcas: list) -> list:
    """Une palabras del guion con marcas de Azure tolerando desajustes puntuales
    (Azure emite tambien marcas de puntuacion y a veces parte un token)."""
    salida, j = [], 0
    for palabra in palabras:
        n = normalizar(palabra)
        if not n:
            salida.append(None)
            continue
        hallada = None
        for salto in range(0, 5):
            if j + salto >= len(marcas):
                break
            if normalizar(marcas[j + salto]["texto"]) == n:
                hallada = marcas[j + salto]
                j += salto + 1
                break
        if hallada is None and j < len(marcas):
            hallada = marcas[j]
            j += 1
        salida.append(hallada)
    return salida


def main() -> None:
    seg = json.load(open(AQUI / "segments.json", encoding="utf-8"))
    marcas = json.load(open(AQUI / "palabras.json", encoding="utf-8"))
    dur = float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", str(AQUI / "narracion.wav")],
        capture_output=True, text=True).stdout.strip())

    plano_de, palabras = [], []
    for s in seg:
        for w in s["text"].split():
            plano_de.append(s["id"])
            palabras.append(w)
    tiempos = emparejar(palabras, marcas)

    entra_de = {}
    for pid, t in zip(plano_de, tiempos):
        if t is not None and pid not in entra_de:
            entra_de[pid] = t["entra"]

    faltan = []
    for s in seg:
        n = MAPA.get(s["id"])
        img = VIDEO / "imagenes" / f"{n:02d}.jpg"
        if not img.exists():
            faltan.append(n)
        # Relativa, no absoluta: este archivo se versiona y una ruta con
        # /home/user dentro no vale en otra maquina.
        s["imagen"] = f"../imagenes/{n:02d}.jpg"
        s["t_start"] = entra_de.get(s["id"], 0.0)
    if faltan:
        print(f"::error:: faltan imagenes del video: {faltan}")
        sys.exit(1)

    seg[0]["t_start"] = 0.0
    for i, s in enumerate(seg):
        s["t_end"] = seg[i + 1]["t_start"] if i + 1 < len(seg) else dur

    # Ninguna imagen del video debe usarse dos veces: en 66 segundos se nota.
    usadas = [MAPA[s["id"]] for s in seg]
    if len(set(usadas)) != len(usadas):
        repes = [n for n in set(usadas) if usadas.count(n) > 1]
        print(f"::error:: imagenes repetidas en el short: {repes}")
        sys.exit(1)

    json.dump(seg, open(AQUI / "planos-short.json", "w"),
              ensure_ascii=False, indent=1)

    durs = [s["t_end"] - s["t_start"] for s in seg]
    print(f"{len(seg)} planos · audio {dur:.2f}s · suma {sum(durs):.2f}s")
    print(f"duracion por plano: min {min(durs):.1f}s · "
          f"media {sum(durs)/len(durs):.1f}s · max {max(durs):.1f}s")
    print(f"imagenes distintas: {len(set(usadas))} de {len(seg)}")


if __name__ == "__main__":
    main()
