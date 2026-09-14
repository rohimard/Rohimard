#!/usr/bin/env python3
"""
alinear_asr.py — convierte las marcas de un RECONOCEDOR en marcas del GUION.

Por qué existe: srt_desde_palabras.py da por hecho que cada marca trae la
palabra tal como está escrita en el guion. Es cierto para Azure, que emite las
marcas MIENTRAS sintetiza el guion, pero no para Whisper (ni para Scribe), que
escriben lo que oyen y con su propia ortografía:

    guion   ...Tenían dieciséis, diecisiete, dieciocho años...
    Whisper ...Tenían 16, 17, 18 años...

Ese script empareja avanzando y mirando como mucho cuatro marcas adelante. Con
una discrepancia así agota marcas más rápido que palabras, y al quedarse sin
ellas CORTA. Medido en el vídeo 8: emparejó 797 de 843 palabras y el subtítulo
final decía "Los otros veintiún estudiantes" cuando el audio terminaba en "Y se
lo pedía Harvard", 46 palabras después.

El método aquí es otro: difflib alinea las dos secuencias enteras de una vez y
decide por contexto, no palabra a palabra. Donde coinciden, cada palabra del
guion se queda con el tiempo MEDIDO de su marca. Donde no (números escritos con
cifra, una palabra que el reconocedor parte o junta), difflib acota el tramo
discrepante entre dos coincidencias firmes y el tiempo se reparte dentro de ese
tramo en proporción a la longitud de cada palabra. Así un desliz del
reconocedor no puede desalinear lo que viene después: como mucho estira o
encoge las palabras de su propio tramo.

La salida tiene el mismo formato que emitía Azure (texto/entra/dura) y con el
texto del GUION, así que srt_desde_palabras.py funciona después sin tocarlo.

  python3 alinear_asr.py guion.txt palabras-asr.json [salida.json]
"""
import json
import re
import sys
import unicodedata
from difflib import SequenceMatcher


def normalizar(p: str) -> str:
    p = unicodedata.normalize("NFD", p.lower())
    p = "".join(c for c in p if unicodedata.category(c) != "Mn")
    return re.sub(r"[^\w]", "", p)


def alinear(guion: str, marcas: list) -> list:
    crudas = [p for p in re.findall(r"\S+", guion) if normalizar(p)]
    gn = [normalizar(p) for p in crudas]
    mn = [normalizar(m["texto"]) for m in marcas]

    # Tiempos de cada marca, ya en (entra, sale).
    tiempo = [(m["entra"], m["entra"] + m["dura"]) for m in marcas]

    salida = [None] * len(crudas)
    huecos = []  # tramos del guion sin marca propia, a repartir despues

    for etiqueta, i1, i2, j1, j2 in SequenceMatcher(
            None, gn, mn, autojunk=False).get_opcodes():
        if etiqueta == "equal":
            for k in range(i2 - i1):
                salida[i1 + k] = tiempo[j1 + k]
        else:
            # 'replace', 'delete' o 'insert': el tramo del guion i1..i2 no casa
            # limpiamente con el de marcas j1..j2. Se anota para repartirlo
            # cuando ya se conozcan los tiempos firmes de alrededor.
            huecos.append((i1, i2, j1, j2))

    for i1, i2, j1, j2 in huecos:
        if i1 == i2:
            continue  # el reconocedor oyo de mas; no hay palabra que colocar
        # Limites del tramo: lo que abarcan sus marcas si las hay, y si no, el
        # espacio que dejan las palabras firmes vecinas.
        if j2 > j1:
            ini, fin = tiempo[j1][0], tiempo[j2 - 1][1]
        else:
            ini = salida[i1 - 1][1] if i1 > 0 and salida[i1 - 1] else 0.0
            sig = next((salida[k] for k in range(i2, len(salida)) if salida[k]),
                       None)
            fin = sig[0] if sig else ini
        if fin <= ini:
            fin = ini + 0.05 * (i2 - i1)
        pesos = [len(gn[k]) + 1 for k in range(i1, i2)]
        total = sum(pesos)
        t = ini
        for k, peso in zip(range(i1, i2), pesos):
            d = (fin - ini) * peso / total
            salida[k] = (t, t + d)
            t += d

    assert all(s is not None for s in salida), "quedaron palabras sin tiempo"
    return [{"texto": p, "entra": round(a, 3), "dura": round(max(b - a, 0.01), 3)}
            for p, (a, b) in zip(crudas, salida)]


def main() -> None:
    guion = open(sys.argv[1], encoding="utf-8").read()
    marcas = json.load(open(sys.argv[2], encoding="utf-8"))
    destino = sys.argv[3] if len(sys.argv) > 3 else "palabras.json"

    fuera = alinear(guion, marcas)
    json.dump(fuera, open(destino, "w", encoding="utf-8"), ensure_ascii=False)

    gn = [normalizar(p) for p in re.findall(r"\S+", guion) if normalizar(p)]
    mn = [normalizar(m["texto"]) for m in marcas]
    firmes = sum(b.size for b in SequenceMatcher(
        None, gn, mn, autojunk=False).get_matching_blocks())
    print(f"{destino}")
    print(f"  palabras del guion: {len(fuera)} · marcas del reconocedor: "
          f"{len(marcas)} · con tiempo medido: {firmes} "
          f"({100*firmes/len(fuera):.1f}%)")
    print(f"  primera a {fuera[0]['entra']:.2f}s · última acaba en "
          f"{fuera[-1]['entra'] + fuera[-1]['dura']:.2f}s")


if __name__ == "__main__":
    main()
