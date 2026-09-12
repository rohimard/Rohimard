#!/usr/bin/env python3
"""
srt_desde_palabras.py — construye el .srt a partir de las marcas de palabra
que devuelve Azure al sintetizar, no estimando los silencios del audio.

Por qué existe: la versión anterior (srt_align.js) medía la energía del MP3
para adivinar dónde había pausado el narrador y repartía el tiempo entre
anclas por número de caracteres. Medido contra los arranques de habla reales,
25 de 82 subtítulos se desviaban más de 0,3 s y los peores llegaban a 2,9 s.
El problema no era el ajuste: era que la información no estaba en el audio.

El SDK de Azure emite un evento por palabra con su posición exacta dentro del
audio generado. Aquí no se estima nada: cada subtítulo entra cuando entra su
primera palabra y sale cuando acaba la última.

  python3 srt_desde_palabras.py guion.txt palabras.json [salida.srt]
"""
import json
import re
import sys
import unicodedata

ANCHO = 42        # caracteres por línea
LINEAS = 2
COLA = 0.12       # segundos de respiración al final de cada subtítulo
HUECO = 0.04      # separación mínima entre un subtítulo y el siguiente
MIN_DUR = 0.9
MAX_DUR = 4.2       # más tiempo en pantalla y el ojo se va de la imagen


def normalizar(p: str) -> str:
    """Para emparejar guion y marcas hace falta ignorar tildes, mayúsculas y
    puntuación: Azure devuelve la palabra ya tokenizada y no siempre con el
    mismo signo pegado que el guion."""
    p = unicodedata.normalize("NFD", p.lower())
    p = "".join(c for c in p if unicodedata.category(c) != "Mn")
    return re.sub(r"[^\w]", "", p)


def emparejar(guion: str, marcas: list) -> list:
    """Devuelve la lista de palabras del guion con su tiempo.

    Se recorren las dos secuencias a la vez. Si una marca no cuadra con la
    palabra que toca (Azure a veces parte o junta un token), se avanza la que
    va por detrás en vez de abandonar: perder el sitio una vez no puede
    desalinear todo lo que viene después.
    """
    crudas = re.findall(r"\S+", guion)
    salida, j = [], 0
    for palabra in crudas:
        n = normalizar(palabra)
        if not n:
            continue
        encontrada = None
        for salto in range(0, 4):
            if j + salto >= len(marcas):
                break
            if normalizar(marcas[j + salto]["texto"]) == n:
                encontrada = marcas[j + salto]
                j += salto + 1
                break
        if encontrada is None and j < len(marcas):
            # Ni cuadra ni se recupera mirando adelante: se toma la marca que
            # toca por posición. Sigue siendo mejor que interpolar.
            encontrada = marcas[j]
            j += 1
        if encontrada is None:
            break
        salida.append({
            "palabra": palabra,
            "entra": encontrada["entra"],
            "sale": encontrada["entra"] + encontrada["dura"],
        })
    return salida


def cortar(palabras: list) -> list:
    """Agrupa palabras en subtítulos legibles.

    Primero por frases, porque el punto es donde el narrador para de verdad y
    donde el espectador puede soltar la vista. Las frases que no caben se
    parten por dentro, y ahí el sitio importa: la primera versión cortaba por
    longitud y dejaba "un hombre que" al final de un subtítulo y "está muerto"
    al principio del siguiente, o sea el remate del gancho partido en dos. Se
    parte por la conjunción o preposición más cercana al centro, que es donde
    el oído ya espera una junta.
    """
    tope = ANCHO * LINEAS

    # Palabras por las que es natural empezar un trozo nuevo.
    JUNTAS = {"para", "porque", "aunque", "cuando", "mientras", "pero", "sino",
              "que", "y", "o", "ni", "si", "como", "donde", "hasta", "desde",
              "con", "sin", "sobre", "entre", "tras", "durante", "salvo"}

    def frases(ps):
        act = []
        for w in ps:
            act.append(w)
            if re.search(r"[.!?]$", w["palabra"]):
                yield act
                act = []
        if act:
            yield act

    def largo(ps):
        return sum(len(w["palabra"]) for w in ps) + len(ps) - 1

    def partir(ps):
        """Parte una frase larga en trozos que quepan, buscando junta."""
        if largo(ps) <= tope and ps[-1]["sale"] - ps[0]["entra"] <= MAX_DUR:
            return [ps]
        # candidatos: índices donde empezaría el segundo trozo
        centro = len(ps) / 2
        cands = [i for i in range(1, len(ps))
                 if largo(ps[:i]) <= tope and largo(ps[i:]) <= tope]
        if not cands:
            cands = list(range(1, len(ps)))
        def coste(i):
            junta = normalizar(ps[i]["palabra"]) in JUNTAS
            coma = bool(re.search(r"[,;:]$", ps[i-1]["palabra"]))
            # una coma manda sobre todo; luego la conjunción; luego el centro
            return (0 if coma else (1 if junta else 2), abs(i - centro))
        i = min(cands, key=coste)
        return partir(ps[:i]) + partir(ps[i:])

    bloques = []
    for f in frases(palabras):
        bloques.extend(partir(f))
    return [b for b in bloques if b]


def dos_lineas(palabras: list) -> str:
    """Parte el texto en como mucho dos líneas equilibradas, sin dejar una
    palabra suelta abajo."""
    txt = " ".join(p["palabra"] for p in palabras)
    if len(txt) <= ANCHO:
        return txt
    trozos = txt.split(" ")
    mejor, dif = None, 1e9
    for k in range(1, len(trozos)):
        a, b = " ".join(trozos[:k]), " ".join(trozos[k:])
        if len(a) > ANCHO or len(b) > ANCHO:
            continue
        d = abs(len(a) - len(b))
        if d < dif:
            mejor, dif = (a, b), d
    if not mejor:                       # no cabe en dos: se parte por la mitad
        k = len(trozos) // 2
        mejor = (" ".join(trozos[:k]), " ".join(trozos[k:]))
    return mejor[0] + "\n" + mejor[1]


def reloj(t: float) -> str:
    t = max(0.0, t)
    h, r = divmod(t, 3600)
    m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s % 1) * 1000)):03d}"


def main() -> None:
    guion = open(sys.argv[1], encoding="utf-8").read()
    marcas = json.load(open(sys.argv[2], encoding="utf-8"))
    destino = sys.argv[3] if len(sys.argv) > 3 else "subtitulos.srt"

    palabras = emparejar(guion, marcas)
    bloques = cortar(palabras)

    lineas, previo = [], 0.0
    for i, b in enumerate(bloques, 1):
        entra = max(b[0]["entra"], previo + HUECO)
        sale = b[-1]["sale"] + COLA
        if i < len(bloques):
            sale = min(sale, bloques[i][0]["entra"] - HUECO)
        sale = max(sale, entra + MIN_DUR)
        previo = sale
        lineas.append(f"{i}\n{reloj(entra)} --> {reloj(sale)}\n{dos_lineas(b)}\n")
    open(destino, "w", encoding="utf-8").write("\n".join(lineas))

    fin = bloques[-1][-1]["sale"]
    total = len(guion.split())
    print(f"{destino}")
    print(f"  palabras del guion: {total} · marcas de Azure: {len(marcas)} · "
          f"emparejadas: {len(palabras)}")
    print(f"  {len(bloques)} subtítulos · última palabra a {fin:.2f}s")
    dur = [b[-1]["sale"] - b[0]["entra"] for b in bloques]
    print(f"  duración: min {min(dur):.1f}s · media {sum(dur)/len(dur):.1f}s · "
          f"max {max(dur):.1f}s")


if __name__ == "__main__":
    main()
