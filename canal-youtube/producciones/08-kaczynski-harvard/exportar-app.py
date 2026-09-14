"""Convierte hoja-montaje.csv al formato que lee la app "Mesa de Montaje".

La app parte por punto y coma y espera estas columnas exactas:
    plano;bloque;entra;sale;duración;escena

La hoja de trabajo usa comas y otras columnas (archivo, ancla, narración), asi
que no cargaba. Aqui se traduce: los tiempos ya calculados se copian tal cual
-- la app entiende el formato M:SS.ss -- y el bloque de cada plano sale de
cruzar su segundo de entrada con los capitulos de seo.txt, que son los mismos
que van en la descripcion del video. Asi cada imagen aparece en la app dentro
del capitulo al que pertenece.
"""
import csv
import re

ENTRADA = "hoja-montaje.csv"
SEO = "seo.txt"
SALIDA = "hoja-montaje-app.csv"


def seg(t):
    m, s = t.split(":")
    return int(m) * 60 + float(s)


def main() -> None:
    capitulos = [
        (seg(t + ".00"), nombre.strip())
        for t, nombre in re.findall(r"(?m)^(\d+:\d{2})\s+(.+)$",
                                    open(SEO, encoding="utf-8").read())
    ]
    assert capitulos and capitulos[0][0] == 0.0, "seo.txt sin capitulo en 0:00"

    filas = list(csv.DictReader(open(ENTRADA, encoding="utf-8")))
    salida = []
    for f in filas:
        e = seg(f["in"])
        bloque = capitulos[0][1]
        for t0, nombre in capitulos:
            if t0 <= e:
                bloque = nombre
            else:
                break
        # La app parte por ';', asi que ningun campo puede llevarlo dentro.
        salida.append([f["plano"], bloque.replace(";", ","), f["in"],
                       f["out"], f["dur"], f["titulo"].replace(";", ",")])

    with open(SALIDA, "w", encoding="utf-8", newline="") as fh:
        w = csv.writer(fh, delimiter=";")
        w.writerow(["plano", "bloque", "entra", "sale", "duración", "escena"])
        w.writerows(salida)

    # Verificacion con las reglas de la app: cabecera en minusculas, indices de
    # columna encontrados, y numero inicial extraible de cada nombre de fichero.
    lineas = open(SALIDA, encoding="utf-8").read().strip().split("\n")
    cab = [h.strip().lower() for h in lineas[0].split(";")]
    for c in ("plano", "bloque", "entra", "sale", "escena"):
        assert c in cab, f"la app no encontraria la columna {c}"
    assert len(lineas) == len(filas) + 1
    for ln in lineas[1:]:
        assert len(ln.split(";")) == 6, f"fila con numero de campos raro: {ln}"

    cuenta = {}
    for p, b, *_ in salida:
        cuenta[b] = cuenta.get(b, 0) + 1
    print(f"{SALIDA}: {len(salida)} planos en {len(cuenta)} bloques")
    for t0, nombre in capitulos:
        print(f"  {int(t0)//60}:{int(t0)%60:02d}  {cuenta.get(nombre, 0):>2} planos  {nombre}")


if __name__ == "__main__":
    main()
