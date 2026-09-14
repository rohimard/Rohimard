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

Los subtitulos de la vista previa NO son una transcripcion: se reparten las
frases del guion sobre la duracion real del audio al mismo ritmo con que se
calcularon los tiempos de los planos. Sirven para comprobar el sincronismo en
el movil; los subtitulos finales del video saldran de transcribir el audio.
"""
import csv
import json
import re

ENTRADA = "hoja-montaje.csv"
GUION = "guion-voz.txt"
SEO = "seo.txt"
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
    """Frases del guion repartidas sobre el audio, al ritmo real de la toma."""
    texto = open(GUION, encoding="utf-8").read().strip()
    frases = [f.strip() for f in
              re.findall(r"[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$", texto) if f.strip()]
    wps = len(texto.split()) / DURACION
    cues, t = [], 0.0
    for f in frases:
        d = len(f.split()) / wps
        cues.append({"start": round(t, 2), "end": round(t + d, 2), "text": f})
        t += d
    assert abs(t - DURACION) < 0.01, f"los subtítulos cierran en {t:.2f}s"
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
