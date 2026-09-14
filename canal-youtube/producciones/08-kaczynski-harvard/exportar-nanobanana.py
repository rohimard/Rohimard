"""Exporta los prompts en formato pegable para Nano Banana Lite.

prompts-imagenes.txt es el documento de produccion. Cada prompt abre con
"Crea una imagen fotorrealista cinematografica en formato horizontal 16:9, sin
ningun texto:" y ESO YA ESTA repetido al final, dentro del bloque de estilo
("...sin texto en pantalla, 16:9."). Se comprobo en los 95: todos terminan en
"16:9." y todos contienen "sin texto en pantalla". Quitar el preambulo no
pierde ninguna restriccion, solo deja de decirla dos veces.

MAQUETACION: se conserva exactamente la del documento original
("N   [X.Xs]   Titulo", dos lineas en blanco entre bloques). Una version
anterior de este export usaba separadores de rayas y cabeceras con relleno de
ceros; el usuario prefirio la original, que es mas compacta y ya conoce.
"""
import re

ENTRADA = "prompts-imagenes.txt"
SALIDA = "prompts-nanobanana.txt"
PREAMBULO = (
    "Crea una imagen fotorrealista cinematográfica en formato horizontal "
    "16:9, sin ningún texto: "
)

CABECERA = """PROMPTS PARA NANO BANANA LITE — IMÁGENES FIJAS
Vídeo 8 · Kaczynski y el experimento de Harvard · 95 planos

Copia solo el párrafo del prompt. La línea de cabecera (número, duración y
título) es para el montaje, no va en el generador.

Guarda cada imagen con el número del plano a tres dígitos — el plano 1 es
001.png, el 95 es 095.png — para que al importarlas al editor entren ya en
orden de montaje.

Todos los prompts piden 16:9 y sin texto en pantalla. LA ÚNICA EXCEPCIÓN es
el plano 56 ("Lawful"), donde la palabra LAWFUL SÍ debe leerse: es el corazón
del vídeo. Nano Banana Lite suele fallar en tipografía legible, así que ese
plano conviene generarlo con el modelo completo, o generarlo sin texto y
añadir la etiqueta en el montaje.

Ningún plano muestra el rostro de una persona real. Ni Kaczynski ni Murray
aparecen con cara reconocible: se resuelven por manos, nucas, siluetas y
objetos. No es solo una decisión legal, funciona mejor.

===================================================================

"""


def main() -> None:
    txt = open(ENTRADA, encoding="utf-8").read()
    bloques = re.split(r"(?m)^(?=\d+\s+\[)", txt)[1:]

    salida = [CABECERA]
    for b in bloques:
        cabeza, cuerpo = b.split("\n", 1)
        n, dur, titulo = re.match(r"(\d+)\s+\[([\d.]+)s\]\s+(.+)", cabeza).groups()
        prompt = cuerpo.strip()
        assert prompt.startswith(PREAMBULO), f"plano {n} con otro preámbulo"
        prompt = prompt[len(PREAMBULO):]
        prompt = prompt[0].upper() + prompt[1:]

        if "LAWFUL" in prompt:
            titulo += "   ← ÚNICO PLANO CON TEXTO VISIBLE"
        # Mismo espaciado que el documento original.
        salida.append(f"{n:<3} [{dur}s]   {titulo}\n\n{prompt}\n\n\n")

    open(SALIDA, "w", encoding="utf-8").write("".join(salida).rstrip() + "\n")

    hecho = open(SALIDA, encoding="utf-8").read()
    assert PREAMBULO not in hecho, "quedó algún preámbulo sin quitar"
    planos = re.findall(r"(?m)^(\d+)\s+\[", hecho)
    assert [int(x) for x in planos] == list(range(1, len(bloques) + 1))
    print(f"{SALIDA}: {len(planos)} planos, {len(hecho)} caracteres")


if __name__ == "__main__":
    main()
