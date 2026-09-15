"""Prepara el video 8 para la app "Mesa de Montaje".

Escribe dos cosas a partir de la hoja ya calculada:

1. hoja-montaje-app.csv -- la hoja en el formato que lee el importador de la
   app (parte por punto y coma; columnas plano;bloque;entra;sale;duración;escena).
   Solo hace falta si algun dia hay que reimportar el proyecto a mano.

2. proyecto-app.json -- el documento que se siembra directamente en la base de
   datos de la app, igual que se hizo con los videos 2, 4 y 7. Sembrado, el
   proyecto ya aparece en la lista al abrir la pagina y lo unico que queda es
   subir las imagenes en lote. El importador de CSV es para crear proyectos
   nuevos, no para este.

El bloque de cada plano sale de cruzar su segundo de entrada con los capitulos
de seo.txt -- los mismos que van en la descripcion del video -- asi que las 95
imagenes aparecen agrupadas por capitulo. Se usa una etiqueta corta por
capitulo porque la app pinta el nombre del bloque en mayusculas como cabecera
fija, y el titulo entero del capitulo no cabe en una linea de movil.

Los subtitulos de la vista previa salen de subtitulos.srt, que son los
definitivos: tiempos medidos sobre el audio con Whisper y alineados contra el
guion. Antes se estimaban repartiendo las frases a ritmo constante, que es de
donde venia el desfase de 3,3 s en el plano de "Lawful".
"""
import csv
import json
import re

ENTRADA = "hoja-montaje.csv"
GUION = "guion-voz.txt"
SEO = "seo.txt"
SRT = "subtitulos.srt"
SALIDA_CSV = "hoja-montaje-app.csv"
SALIDA_JSON = "proyecto-app.json"
TITULO = "Kaczynski y el experimento de Harvard"
DURACION = 292.34

# Etiqueta corta para la cabecera de la app, por capitulo de seo.txt.
CORTOS = {
    "Dieciséis años y una silla con focos": "GANCHO",
    "Quién era Henry Murray": "MURRAY",
    "La redacción que era munición": "LA REDACCIÓN",
    "Las grabaciones": "LAS GRABACIONES",
    "Lo que vino después": "DESPUÉS",
    "Lo que de verdad incomoda": "LO QUE INCOMODA",
}


def seg(t):
    m, s = t.split(":")
    return int(m) * 60 + float(s)


def capitulos():
    cs = [
        (seg(t + ".00"), nombre.strip())
        for t, nombre in re.findall(r"(?m)^(\d+:\d{2})\s+(.+)$",
                                    open(SEO, encoding="utf-8").read())
    ]
    assert cs and cs[0][0] == 0.0, "seo.txt sin capítulo en 0:00"
    faltan = [n for _, n in cs if n not in CORTOS]
    assert not faltan, f"capítulos sin etiqueta corta: {faltan}"
    return cs


def bloqueDe(cs, t):
    nombre = cs[0][1]
    for t0, n in cs:
        if t0 <= t:
            nombre = n
        else:
            break
    return CORTOS[nombre]


def subtitulos():
    """Los subtitulos definitivos, leidos del SRT ya generado."""
    bruto = open(SRT, encoding="utf-8").read().strip()
    cues = []
    for bloque in re.split(r"\n\s*\n", bruto):
        lineas = [l for l in bloque.strip().split("\n") if l.strip()]
        if len(lineas) < 3:
            continue
        m = re.search(r"(\d\d):(\d\d):(\d\d),(\d+)\s*-->\s*"
                      r"(\d\d):(\d\d):(\d\d),(\d+)", lineas[1])
        assert m, f"línea de tiempos ilegible: {lineas[1]}"
        a = [int(x) for x in m.groups()]
        cues.append({
            "start": round(a[0]*3600 + a[1]*60 + a[2] + a[3]/1000, 2),
            "end": round(a[4]*3600 + a[5]*60 + a[6] + a[7]/1000, 2),
            # La app pinta el texto en una linea sola; el salto del SRT es
            # para el video quemado, aqui sobra.
            "text": " ".join(lineas[2:]),
        })
    assert cues, "el SRT no traía ningún subtítulo"
    assert cues[-1]["end"] <= DURACION + 0.5, "el SRT se pasa del audio"
    return cues


def main() -> None:
    cs = capitulos()
    filas = list(csv.DictReader(open(ENTRADA, encoding="utf-8")))

    planos, tabla = [], []
    for f in filas:
        entra, sale = seg(f["in"]), seg(f["out"])
        b = bloqueDe(cs, entra)
        planos.append({
            "n": int(f["plano"]),
            "bloque": b,
            "entra": round(entra, 2),
            "sale": round(sale, 2),
            "escena": f["titulo"],
        })
        # La app parte el CSV por ';', asi que ningun campo puede llevarlo.
        tabla.append([f["plano"], b.replace(";", ","), f["in"], f["out"],
                      f["dur"], f["titulo"].replace(";", ",")])

    with open(SALIDA_CSV, "w", encoding="utf-8", newline="") as fh:
        w = csv.writer(fh, delimiter=";")
        w.writerow(["plano", "bloque", "entra", "sale", "duración", "escena"])
        w.writerows(tabla)

    cues = subtitulos()
    doc = {"titulo": TITULO, "planos": planos, "cues": cues,
           "total": len(planos), "creado": 1789374619000}
    json.dump(doc, open(SALIDA_JSON, "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    # Verificacion contra las reglas reales del importador de la app.
    lineas = open(SALIDA_CSV, encoding="utf-8").read().strip().split("\n")
    cab = [h.strip().lower() for h in lineas[0].split(";")]
    for c in ("plano", "bloque", "entra", "sale", "escena"):
        assert any(h.startswith(c) for h in cab), f"la app no hallaría {c}"
    assert len(lineas) == len(filas) + 1
    assert all(len(ln.split(";")) == 6 for ln in lineas[1:])

    # Y contra lo que el reproductor da por hecho: planos encadenados sin
    # huecos, porque planoAt() cae al primero si un segundo no cae en ninguno.
    for a, b in zip(planos, planos[1:]):
        assert abs(a["sale"] - b["entra"]) < 0.01, f"hueco tras el plano {a['n']}"
    assert planos[0]["entra"] == 0.0
    assert abs(planos[-1]["sale"] - DURACION) < 0.01

    cuenta = {}
    for p in planos:
        cuenta[p["bloque"]] = cuenta.get(p["bloque"], 0) + 1
    tam = len(json.dumps(doc, ensure_ascii=False))
    print(f"{SALIDA_CSV} y {SALIDA_JSON}: {len(planos)} planos, "
          f"{len(cues)} subtítulos, {tam} caracteres")
    for _, nombre in cs:
        c = CORTOS[nombre]
        print(f"  {c:<16} {cuenta.get(c, 0):>2} planos   ({nombre})")


if __name__ == "__main__":
    main()
