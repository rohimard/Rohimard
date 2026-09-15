#!/usr/bin/env python3
"""
retimar_planos.py — recuadra la hoja de montaje con los tiempos reales de la
narración, en vez de repartir la duración por número de caracteres.

Por qué: timing_sheet.js estimaba cuánto tardaba en decirse cada plano pesando
sus caracteres y ajustando el total a la duración del MP3. Eso reparte bien de
media pero mal en cada plano concreto, porque un narrador no habla a ritmo
constante: se para en los puntos y corre en las enumeraciones. El resultado es
que la imagen cambiaba a mitad de una frase.

Aquí cada plano entra exactamente cuando suena su primera palabra, con las
marcas que devuelve Azure al sintetizar. El cambio de imagen cae donde cae la
junta de la frase porque es literalmente el mismo instante.

  python3 retimar_planos.py segments.json palabras.json audio.wav <carpeta>
"""
import json
import pathlib
import re
import subprocess
import sys
import unicodedata


def normalizar(p: str) -> str:
    p = unicodedata.normalize("NFD", p.lower())
    p = "".join(c for c in p if unicodedata.category(c) != "Mn")
    return re.sub(r"[^\w]", "", p)


def emparejar(palabras_guion: list, marcas: list) -> list:
    """Une la secuencia de palabras del guion con la de marcas de Azure.

    Azure emite además marcas de puntuación, y a veces parte o junta un token,
    así que se busca la coincidencia mirando unas pocas posiciones adelante en
    vez de exigir que vayan en paralelo exacto.
    """
    salida, j = [], 0
    for palabra in palabras_guion:
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


def reloj(t: float) -> str:
    m, s = divmod(int(round(t)), 60)
    return f"{m}:{s:02d}"


def main() -> None:
    seg = json.load(open(sys.argv[1], encoding="utf-8"))["segments"]
    marcas = json.load(open(sys.argv[2], encoding="utf-8"))
    audio = sys.argv[3]
    destino = pathlib.Path(sys.argv[4])

    dur_audio = float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", audio],
        capture_output=True, text=True).stdout.strip())

    # Se aplanan las palabras de todos los planos conservando a qué plano va
    # cada una, y se emparejan de una vez: así un desajuste puntual no arrastra
    # al resto de la hoja.
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

    filas = []
    for i, s in enumerate(seg):
        entra = entra_de.get(s["id"])
        if entra is None:                       # sin marca: se hereda la anterior
            entra = filas[-1]["sale"] if filas else 0.0
        filas.append({"n": s["id"], "bloque": s["block"], "escena": s["cue"],
                      "entra": entra, "sale": 0.0})
    # Un plano acaba donde empieza el siguiente: así no quedan huecos negros.
    for i, f in enumerate(filas):
        f["sale"] = filas[i + 1]["entra"] if i + 1 < len(filas) else dur_audio
    filas[0]["entra"] = 0.0

    csv = ["Plano;Bloque;Entra;Sale;Duracion (s);Escena"]
    md = ["| Plano | Bloque | Entra | Sale | Dur | Escena |",
          "|---|---|---|---|---|---|"]
    txt = []
    for f in filas:
        d = f["sale"] - f["entra"]
        csv.append(f'{f["n"]};{f["bloque"]};{reloj(f["entra"])};'
                   f'{reloj(f["sale"])};{d:.1f};{f["escena"]}')
        md.append(f'| {f["n"]:02d} | {f["bloque"]} | {reloj(f["entra"])} | '
                  f'{reloj(f["sale"])} | {d:.1f}s | {f["escena"]} |')
        txt.append(f'{f["n"]:02d}  {reloj(f["entra"])}–{reloj(f["sale"])}  '
                   f'{d:4.1f}s  {f["bloque"]:<12} {f["escena"]}')

    (destino / "hoja-montaje.csv").write_text("\n".join(csv) + "\n",
                                              encoding="utf-8-sig")
    (destino / "hoja-montaje.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    (destino / "hoja-montaje.txt").write_text("\n".join(txt) + "\n", encoding="utf-8")

    durs = [f["sale"] - f["entra"] for f in filas]
    print(f"{len(filas)} planos · audio {dur_audio:.2f}s · "
          f"hoja {sum(durs):.2f}s")
    print(f"duración por plano: min {min(durs):.1f}s · "
          f"media {sum(durs)/len(durs):.1f}s · max {max(durs):.1f}s")
    largos = [(f["n"], d) for f, d in zip(filas, durs) if d > 4.5]
    if largos:
        print(f"planos por encima de 4,5 s: "
              + ", ".join(f"{n} ({d:.1f}s)" for n, d in largos))


if __name__ == "__main__":
    main()
