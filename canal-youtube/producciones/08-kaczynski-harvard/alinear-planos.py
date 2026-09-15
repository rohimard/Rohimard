"""Alinea los 95 planos con las frases del guion, de una vez y en orden.

POR QUE SE REHIZO
La version anterior buscaba, para cada titulo de plano, la frase que mas
palabras compartia, se quedaba solo con unas pocas anclas espaciadas (10 de
95) y repartia el resto proporcionalmente entre ellas. Entre ancla y ancla la
deriva se acumulaba: medido en el tramo de Murray, cada plano caia DOS frases
por delante de su narracion -- "La OSS" sonaba sobre "no se puede demostrar",
"Medir al espia" sobre "El profesor se llama Henry Murray", y asi todo el
tramo. El orden de los planos estaba bien; lo que estaba mal era el reparto.

EL METODO
Es un problema de alineacion de dos secuencias en orden, el mismo que ya se
resolvio para las palabras del reconocedor: programacion dinamica. A cada
plano se le asigna una frase, respetando el orden (el plano i+1 nunca cae en
una frase anterior a la del plano i) y maximizando el parecido total. No hay
anclas ni tramos: TODOS los planos quedan sujetos a la vez, asi que no hay
donde acumular deriva.

Los planos que caen en la misma frase se reparten su duracion medida en
proporcion a la duracion con que se escribieron. Las frases sin ningun plano
no se pierden: el plano anterior se estira hasta el siguiente, porque el final
de cada plano es el principio del que viene.
"""
import csv
import json
import re
import unicodedata

GUION = "guion-voz.txt"
PROMPTS = "prompts-imagenes.txt"
PALABRAS = "palabras-guion.json"
DURACION = 292.34
SALIDA_CSV = "hoja-montaje.csv"
SALIDA_MD = "hoja-montaje.md"

VACIAS = {"de", "la", "el", "los", "las", "un", "una", "que", "y", "en", "a",
          "se", "su", "del", "al", "lo", "con", "por", "para", "es", "no",
          "mas", "ya", "te", "tu", "le", "si", "como", "pero", "o"}

# Peso del "no te alejes de donde te tocaria por posicion". Solo desempata
# entre caminos que la similitud deja igual de buenos; si hay parecido real,
# manda el parecido.
DERIVA = 0.35

# Castigo por dejarse frases sin ningun plano. Sin el, el alineador amontona
# dos planos en la frase que mas se les parece y deja la de al lado vacia; el
# plano que la cubre se queda entonces en pantalla 16 s. Con el, "Murray,
# antes de Harvard" baja a la frase que presenta a Murray en vez de pegarse a
# la de la OSS con su vecino.
SALTO = 0.30

# Limites de lo que un plano puede durar en pantalla. La alineacion sola deja
# extremos inservibles -- tres planos de 0,33 s amontonados en la frase
# "Respetuoso de la ley", que dura un segundo, y 16 s de un plano fijo donde
# la narracion avanza sin imagenes asignadas.
MIN, MAX = 1.6, 5.5


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return set(re.findall(r"[a-z0-9]+", s)) - VACIAS


def mmss(s):
    return f"{int(s // 60)}:{s % 60:05.2f}"


def main() -> None:
    planos = [
        (int(n), float(d), t.strip())
        for n, d, t in re.findall(
            r"(?m)^(\d+)\s+\[([\d.]+)s\]\s+(.+)$",
            open(PROMPTS, encoding="utf-8").read(),
        )
    ]
    texto = open(GUION, encoding="utf-8").read().strip()
    frases = [f.strip() for f in
              re.findall(r"[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$", texto) if f.strip()]

    # Tiempos MEDIDOS de cada frase, consumiendo las palabras en orden.
    marcas = json.load(open(PALABRAS, encoding="utf-8"))
    cursor, ini, fin = 0, [], []
    for f in frases:
        k = len(f.split())
        trozo = marcas[cursor:cursor + k]
        ini.append(trozo[0]["entra"])
        fin.append(trozo[-1]["entra"] + trozo[-1]["dura"])
        cursor += k
    assert cursor == len(marcas), f"{cursor} palabras contra {len(marcas)} marcas"
    fin[-1] = DURACION

    N, M = len(planos), len(frases)
    nf = [norm(f) for f in frases]
    sim = [[0.0] * M for _ in range(N)]
    for i, (_, _, tit) in enumerate(planos):
        tn = norm(tit)
        for j in range(M):
            if tn:
                sim[i][j] = len(tn & nf[j]) / len(tn)

    # Programacion dinamica: cada plano toma una frase, sin retroceder nunca.
    NEG = float("-inf")
    D = [[NEG] * M for _ in range(N)]
    DE = [[0] * M for _ in range(N)]
    for i in range(N):
        for j in range(M):
            if i == 0:
                base, origen = 0.0, 0
            else:
                base, origen = NEG, 0
                for k in range(j + 1):
                    if D[i - 1][k] == NEG:
                        continue
                    v = D[i - 1][k] - SALTO * max(0, j - k - 1)
                    if v > base:
                        base, origen = v, k
            if base == NEG:
                continue
            castigo = DERIVA * abs(j / max(M - 1, 1) - i / max(N - 1, 1))
            D[i][j] = base + sim[i][j] - castigo
            DE[i][j] = origen

    j = max(range(M), key=lambda x: D[N - 1][x])
    asignada = [0] * N
    for i in range(N - 1, -1, -1):
        asignada[i] = j
        j = DE[i][j]

    # Reparto dentro de cada frase, en proporcion a la duracion escrita.
    porFrase = {}
    for i, j in enumerate(asignada):
        porFrase.setdefault(j, []).append(i)

    arranque = [0.0] * N
    for j, idxs in porFrase.items():
        tramo = fin[j] - ini[j]
        pesos = [planos[i][1] for i in idxs]
        total = sum(pesos)
        t = ini[j]
        for i, p in zip(idxs, pesos):
            arranque[i] = t
            t += tramo * p / total

    # SUAVIZADO. Los arranques que salen de la alineacion son los DESEADOS; hay
    # que acercarlos a algo montable sin romper el orden. Se proyectan sobre el
    # conjunto de tiempos validos (cada hueco entre MIN y MAX, extremos fijos)
    # alternando una pasada hacia delante y otra hacia atras hasta que deja de
    # moverse. Cada plano se aparta lo justo de donde lo puso la alineacion.
    arranque.append(DURACION)
    for _ in range(60):
        antes = list(arranque)
        arranque[0] = 0.0
        for i in range(1, N + 1):
            arranque[i] = min(max(arranque[i], arranque[i - 1] + MIN),
                              arranque[i - 1] + MAX)
        arranque[N] = DURACION
        for i in range(N - 1, 0, -1):
            arranque[i] = min(max(arranque[i], arranque[i + 1] - MAX),
                              arranque[i + 1] - MIN)
        if max(abs(a - b) for a, b in zip(antes, arranque)) < 0.001:
            break
    arranque = arranque[:N]

    # El final de cada plano es el principio del siguiente: asi las frases sin
    # plano propio no dejan hueco.
    filas = []
    for i, (n, _, titulo) in enumerate(planos):
        a = arranque[i]
        b = arranque[i + 1] if i + 1 < N else DURACION
        filas.append({
            "plano": n,
            "archivo": f"{n:03d}.png",
            "in": mmss(a),
            "out": mmss(b),
            "dur": f"{b - a:.2f}",
            "anclado": "sí" if sim[i][asignada[i]] > 0 else "",
            "titulo": titulo,
            "narracion": frases[asignada[i]],
        })

    assert all(filas[i]["in"] <= filas[i + 1]["in"] for i in range(N - 1))
    with open(SALIDA_CSV, "w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=list(filas[0]))
        w.writeheader(); w.writerows(filas)

    dur = [float(f["dur"]) for f in filas]
    conMatch = sum(1 for f in filas if f["anclado"])

    md = [f"""# Hoja de montaje — Vídeo 8 (Kaczynski y el experimento de Harvard)

**Audio:** `david-elevenlabs/david-narracion.mp3` · {DURACION:.2f}s ({mmss(DURACION)})
**Imágenes:** 95, nombradas `001` … `095`
**Duración por plano:** {min(dur):.2f}s la más corta, {max(dur):.2f}s la más larga, {sum(dur)/N:.2f}s de media

## Cómo están calculados los tiempos

Los tiempos de las frases son **medidos**, no estimados: salen de transcribir
el audio real y alinear la transcripción con el guion palabra a palabra.

Los planos se reparten sobre esas frases con una alineación global en orden
({conMatch} de {N} planos coinciden por texto con su frase). No hay anclas
sueltas ni tramos interpolados, que es de donde venía la deriva de la versión
anterior: cada plano caía dos frases por delante de su narración.

Después se acotan las duraciones entre {MIN}s y {MAX}s, porque la alineación
sola dejaba planos de 0,3s y de 16s.

La columna **Narración** es la frase que suena sobre cada plano: sirve para
verificar el sincronismo sin abrir el editor.

| # | Archivo | IN | OUT | Dur | Plano | Narración |
|---:|---|---|---|---:|---|---|"""]
    for f in filas:
        narr = f["narracion"]
        if len(narr) > 80:
            narr = narr[:77] + "…"
        md.append(f"| {f['plano']} | `{f['archivo']}` | {f['in']} | {f['out']} | "
                  f"{f['dur']}s | {f['titulo']} | {narr} |")
    open(SALIDA_MD, "w", encoding="utf-8").write("\n".join(md) + "\n")
    print(f"{N} planos sobre {M} frases · {conMatch} con coincidencia de texto")
    print(f"duraciones: {min(dur):.2f}s a {max(dur):.2f}s, media {sum(dur)/N:.2f}s")
    print(f"cierra en {float(filas[-1]['out'].split(':')[0])*60 + float(filas[-1]['out'].split(':')[1]):.2f}s")


if __name__ == "__main__":
    main()
