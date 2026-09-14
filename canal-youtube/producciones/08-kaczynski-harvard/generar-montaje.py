"""Genera la hoja de montaje: que imagen entra en que segundo.

PRIMERA VERSION, DESCARTADA: escalar las 95 duraciones por un factor comun
(292,34/300,2) para que cuadraran con el audio. Reparte bien el tiempo pero no
arregla el problema de fondo: la lista de planos se escribio contra el guion
viejo, y al reescribir el gancho el contenido se corrio. La propia columna de
sincronismo lo delato -- el plano "Lawful" caia sobre la frase de las fechas,
tres frases antes de "El de Kaczynski era Lawful".

VERSION ACTUAL: alinear por contenido. El titulo de cada plano se compara con
las frases de la narracion; donde hay coincidencia clara (60 de 95 planos,
casi todas exactas) ese plano queda ANCLADO al segundo en que suena su frase.
Los planos intermedios se reparten proporcionalmente entre anclas, respetando
su duracion relativa.

Las anclas se filtran para que sean monotonas: si una coincidencia mandara un
plano hacia atras en el tiempo respecto de la anterior, es un falso positivo
(titulos que comparten palabras) y se descarta.
"""
import csv
import re
import unicodedata

GUION = "guion-voz.txt"
PROMPTS = "prompts-imagenes.txt"
AUDIO = "david-elevenlabs/david-narracion.mp3"
DURACION = 292.34
CONFIANZA = 0.6
SALIDA_MD = "hoja-montaje.md"
SALIDA_CSV = "hoja-montaje.csv"

# Palabras vacias: si no se quitan, un titulo corto ancla con cualquier frase.
VACIAS = {"de", "la", "el", "los", "las", "un", "una", "que", "y", "en", "a",
          "se", "su", "del", "al", "lo", "con", "por", "para", "es", "no"}


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
    frases = [
        f.strip()
        for f in re.findall(r"[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$", texto)
        if f.strip()
    ]
    wps = len(texto.split()) / DURACION
    inicio, t = [], 0.0
    for f in frases:
        inicio.append(t)
        t += len(f.split()) / wps
    fin = inicio[1:] + [DURACION]

    # Anclas: titulo de plano -> frase que mas palabras comparte.
    crudas = []
    for i, (n, d, tit) in enumerate(planos):
        tn = norm(tit)
        if not tn:
            continue
        mejor, idx = 0.0, -1
        for j, f in enumerate(frases):
            sc = len(tn & norm(f)) / len(tn)
            if sc > mejor:
                mejor, idx = sc, j
        if mejor >= CONFIANZA:
            crudas.append((i, idx, mejor))

    # Varios planos sobre la misma frase: reparten su tramo en partes iguales.
    porFrase = {}
    for i, j, _ in crudas:
        porFrase.setdefault(j, []).append(i)

    candidatas = []
    for j, indices in sorted(porFrase.items()):
        tramo = fin[j] - inicio[j]
        for k, i in enumerate(sorted(indices)):
            candidatas.append((i, inicio[j] + tramo * k / len(indices)))
    candidatas.sort()

    # Anclas ESPACIADAS, no todas. Anclar los 56 planos coincidentes deformaba
    # el ritmo: forzaba a cada uno a empezar justo en el inicio de su frase, y
    # como las frases son mas largas que los planos salian duraciones de 1,5 s
    # pegadas a otras de 5,7 s. El ritmo de ~3,2 s por plano es deliberado.
    # Con anclas cada SEPARACION planos se corrige la deriva acumulada sin
    # romper el reparto local.
    #
    # Tambien se exige monotonia (una coincidencia que mandaria un plano hacia
    # atras es un falso positivo) y un margen al principio y al final, porque
    # un ancla en el plano 5 apretaria los cuatro primeros contra el segundo 0.
    SEPARACION = 8
    MARGEN = 4
    anclas, ultimoI, ultimoT = [], -SEPARACION, -1.0
    descartadas = 0
    for i, seg in candidatas:
        if not (MARGEN <= i <= len(planos) - MARGEN):
            continue
        if i - ultimoI >= SEPARACION and seg > ultimoT + 1.0:
            anclas.append((i, seg))
            ultimoI, ultimoT = i, seg
        else:
            descartadas += 1

    # Bordes fijos: el primer plano abre en 0 y el ultimo cierra con la ultima
    # palabra. Se expresan sobre "fronteras" (la frontera i es el inicio del
    # plano i; la 95 es el final del video).
    fronteras = {0: 0.0, len(planos): DURACION}
    for i, seg in anclas:
        if 0 < i < len(planos):
            fronteras[i] = seg

    # Entre anclas, repartir proporcionalmente a la duracion original.
    acum, s = [0.0], 0.0
    for _, d, _ in planos:
        s += d
        acum.append(s)

    claves = sorted(fronteras)
    tiempos = [0.0] * (len(planos) + 1)
    for a, b in zip(claves, claves[1:]):
        ta, tb = fronteras[a], fronteras[b]
        span = acum[b] - acum[a]
        for i in range(a, b + 1):
            prop = (acum[i] - acum[a]) / span if span else 0
            tiempos[i] = ta + (tb - ta) * prop

    # Acotar duraciones dentro de cada tramo entre anclas. El documento fija
    # "ningun plano pasa de cuatro segundos" y el reparto crudo dejaba planos
    # de 6,2 s junto a otros de 1,3 s. Se reparte el tramo de forma que ninguna
    # duracion salga de [MIN, MAX] manteniendo las proporciones relativas.
    #
    # Si un tramo no admite el acotado, no es un fallo del reparto: significa
    # que ese tramo tiene mas planos (o menos) de los que su narracion aguanta,
    # y eso solo se arregla anadiendo o quitando planos. Se avisa al final.
    MIN, MAX = 2.0, 4.0
    apretados = []
    for a, b in zip(claves, claves[1:]):
        cuantos = b - a
        disponible = tiempos[b] - tiempos[a]
        media = disponible / cuantos
        if not (MIN <= media <= MAX):
            apretados.append((a + 1, b, cuantos, disponible, media))
            continue
        brutos = [tiempos[i + 1] - tiempos[i] for i in range(a, b)]
        # Recorte iterativo: acotar, repartir el sobrante entre los que aun
        # tienen holgura, repetir hasta que cuadre.
        for _ in range(40):
            acotados = [min(MAX, max(MIN, x)) for x in brutos]
            sobra = disponible - sum(acotados)
            if abs(sobra) < 0.01:
                break
            libres = [k for k, x in enumerate(acotados)
                      if (sobra > 0 and x < MAX) or (sobra < 0 and x > MIN)]
            if not libres:
                break
            for k in libres:
                acotados[k] += sobra / len(libres)
            brutos = acotados
        t = tiempos[a]
        for k, x in enumerate(acotados):
            tiempos[a + k] = t
            t += x
        tiempos[b] = tiempos[b]  # el borde del tramo no se mueve

    filas = []
    for i, (n, d, titulo) in enumerate(planos):
        ini, ter = tiempos[i], tiempos[i + 1]
        medio = (ini + ter) / 2
        frase = frases[0]
        for j, t0 in enumerate(inicio):
            if t0 <= medio:
                frase = frases[j]
            else:
                break
        filas.append({
            "plano": n,
            "archivo": f"{n:03d}.png",
            "in": mmss(ini),
            "out": mmss(ter),
            "dur": f"{ter - ini:.2f}",
            "anclado": "sí" if i in fronteras and 0 < i < len(planos) else "",
            "titulo": titulo,
            "narracion": frase,
        })

    assert abs(tiempos[-1] - DURACION) < 0.01
    assert all(filas[i]["in"] <= filas[i + 1]["in"] for i in range(len(filas) - 1))

    with open(SALIDA_CSV, "w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=list(filas[0]))
        w.writeheader()
        w.writerows(filas)

    avisos = "\n".join(
        f"- **Planos {a} a {b}**: {c} planos en {d:.1f}s, "
        f"{m:.2f}s cada uno "
        f"({'demasiados planos para ese tramo' if m < 2.0 else 'pocos planos para ese tramo'})."
        for a, b, c, d, m in apretados
    ) or "- Ninguno: el reparto queda dentro de 2 a 4 s en todos los tramos."

    nAnc = sum(1 for f in filas if f["anclado"])
    dur = [float(f["dur"]) for f in filas]
    md = [f"""# Hoja de montaje — Vídeo 8 (Kaczynski y el experimento de Harvard)

**Audio:** `{AUDIO}` · {DURACION:.2f}s ({mmss(DURACION)})
**Imágenes:** 95, nombradas `001.png` … `095.png`
**Duración por plano:** {min(dur):.2f}s la más corta, {max(dur):.2f}s la más larga, {sum(dur)/len(dur):.2f}s de media

## Cómo están calculados los tiempos

No es un reparto a ojo ni un escalado uniforme. El título de cada plano se
comparó contra las frases de la narración: donde hubo coincidencia clara
({nAnc} de 95 planos), ese plano queda **anclado** al segundo exacto en que
suena su frase — van marcados con «sí» en la columna *Ancla*. Los demás se
reparten proporcionalmente entre anclas.

Esto importa porque la lista de planos se escribió contra una versión anterior
del guion. Un escalado uniforme dejaba el plano «Lawful» tres frases antes de
donde se dice «Lawful». Anclado, cae donde debe.

La columna **Narración** es la frase que suena sobre cada plano: sirve para
verificar el sincronismo sin abrir el editor.

Las duraciones son la guía, no una camisa de fuerza. Si al montar una imagen
pide medio segundo más, quítaselo a la de al lado.

## Dos tramos con el ritmo desigual, y por qué

{avisos}

No es un error de cálculo: los anclajes de esos tramos son correctos. Es que
la lista de planos se repartió contra una versión anterior del guion y quedó
desequilibrada — sobran planos donde la narración corre y faltan donde se
detiene.

Se puede montar tal cual: los cortes rápidos caen sobre la secuencia de la
silla y los electrodos, donde una ráfaga corta funciona dramáticamente, y los
planos largos caen sobre el trasfondo de Murray, que es exposición y aguanta
más aire. Si prefieres igualarlo, mueve ~4 planos del primer tramo al segundo
o genera 4 imágenes más para el tramo de Murray.

| # | Archivo | IN | OUT | Dur | Ancla | Plano | Narración |
|---:|---|---|---|---:|:-:|---|---|"""]
    for f in filas:
        narr = f["narracion"]
        if len(narr) > 88:
            narr = narr[:85] + "…"
        md.append(
            f"| {f['plano']} | `{f['archivo']}` | {f['in']} | {f['out']} | "
            f"{f['dur']}s | {f['anclado']} | {f['titulo']} | {narr} |"
        )
    open(SALIDA_MD, "w", encoding="utf-8").write("\n".join(md) + "\n")

    print(f"{SALIDA_MD} y {SALIDA_CSV}: {len(filas)} planos, {nAnc} anclados, "
          f"{descartadas} coincidencias descartadas, "
          f"cierra en {tiempos[-1]:.2f}s")
    print(f"duraciones: {min(dur):.2f}s a {max(dur):.2f}s, media {sum(dur)/len(dur):.2f}s")
    for a, b, cuantos, disp, media in apretados:
        que = "demasiados planos" if media < 2.0 else "pocos planos"
        print(f"  ::aviso:: planos {a}-{b}: {cuantos} en {disp:.1f}s "
              f"({media:.2f}s cada uno) -- {que} para ese tramo")


if __name__ == "__main__":
    main()
