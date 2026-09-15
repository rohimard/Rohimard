# -*- coding: utf-8 -*-
"""Parte un guión en planos que no pasen de una duración máxima.

El montaje dinámico pide planos cortos, y un plano dura lo que dura la
narración que ilustra. Como el ritmo del narrador es constante, la duración
se puede predecir por el número de palabras, así que el troceo se hace por
palabras y el corte se busca en la puntuación más cercana para que ningún
plano empiece a media frase.

Cada bloque del guión (un párrafo) se trata por separado, de modo que un
plano nunca cruza de un bloque narrativo al siguiente.

Uso:
  python trocear_planos.py guion-voz.txt 270.2 4.0
"""
import re
import sys

# Prioridad de los sitios por donde cortar. Un punto parte mejor que una
# coma, y una coma mejor que un espacio cualquiera.
CORTES = [r"(?<=[.!?])\s+", r"(?<=[,;:])\s+", r"\s+"]


def trocear_parrafo(parrafo: str, max_palabras: int) -> list:
    """Trozos de como mucho `max_palabras`, cortando por puntuación."""
    piezas = [parrafo.strip()]
    for patron in CORTES:
        nuevas = []
        for p in piezas:
            if len(p.split()) <= max_palabras:
                nuevas.append(p)
            else:
                nuevas.extend(x for x in re.split(patron, p) if x.strip())
        piezas = nuevas
        if all(len(p.split()) <= max_palabras for p in piezas):
            break

    # Volvemos a juntar trozos cortos contiguos: partir de más no ayuda, y
    # un plano de tres palabras se ve como un parpadeo.
    unidas, actual = [], ""
    for p in piezas:
        cand = (actual + " " + p).strip()
        if actual and len(cand.split()) > max_palabras:
            unidas.append(actual)
            actual = p
        else:
            actual = cand
    if actual:
        unidas.append(actual)

    # Las colas de párrafo quedan sueltas y muy cortas; se pegan a su vecino
    # aunque eso se pase un poco del tope, porque un plano de dos palabras
    # parpadea y uno de trece no se nota.
    minimo = max(4, max_palabras // 3)
    holgura = max_palabras + 3
    i = 0
    while i < len(unidas):
        if len(unidas[i].split()) >= minimo or len(unidas) == 1:
            i += 1
            continue
        antes = len(unidas[i - 1].split()) if i > 0 else 999
        despues = len(unidas[i + 1].split()) if i + 1 < len(unidas) else 999
        if min(antes, despues) + len(unidas[i].split()) > holgura:
            i += 1
            continue
        if antes <= despues:
            unidas[i - 1] = f"{unidas[i - 1]} {unidas[i]}"
        else:
            unidas[i + 1] = f"{unidas[i]} {unidas[i + 1]}"
        unidas.pop(i)
        i = max(0, i - 1)
    return unidas


def main():
    ruta = sys.argv[1]
    duracion = float(sys.argv[2])
    max_seg = float(sys.argv[3]) if len(sys.argv) > 3 else 4.0

    texto = open(ruta, encoding="utf-8").read().strip()
    parrafos = [p.strip() for p in texto.split("\n\n") if p.strip()]
    total = len(texto.split())
    ritmo = total / duracion                      # palabras por segundo
    max_palabras = int(max_seg * ritmo)

    print(f"{total} palabras en {duracion} s -> {ritmo:.2f} palabras/segundo")
    print(f"tope de {max_seg} s por plano -> {max_palabras} palabras\n")

    n = 0
    for i, p in enumerate(parrafos, 1):
        trozos = trocear_parrafo(p, max_palabras)
        print(f"--- párrafo {i} ({len(p.split())} palabras, "
              f"{len(trozos)} planos) ---")
        for t in trozos:
            n += 1
            pal = len(t.split())
            print(f"{n:>3}  {pal:>2}p  {pal/ritmo:4.1f}s  {t}")
        print()

    # La comprobación que importa: ni una palabra perdida ni duplicada.
    rehecho = " ".join(
        " ".join(trocear_parrafo(p, max_palabras)) for p in parrafos)
    ok = rehecho.split() == texto.split()
    print(f"{n} planos · cobertura exacta del guión: {ok}")
    if not ok:
        sys.exit("el troceo pierde o duplica texto")


if __name__ == "__main__":
    main()
