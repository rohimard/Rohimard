"""Exporta los prompts en formato pegable para Nano Banana Lite.

prompts-imagenes.txt es el documento de produccion: lleva numero de plano,
duracion y titulo en la cabecera de cada bloque, util para el montaje pero
ruido si se pega en el campo de prompt de un generador.

Ademas cada prompt abre con "Crea una imagen fotorrealista cinematografica en
formato horizontal 16:9, sin ningun texto:" y ESO YA ESTA repetido al final,
dentro del bloque de estilo ("...sin texto en pantalla, 16:9."). Se comprobo
en los 95: todos terminan en "16:9." y todos contienen "sin texto en
pantalla". Asi que quitar el preambulo no pierde ninguna restriccion, solo
deja de decirla dos veces.

Salida: un fichero con un separador por plano (numero, titulo, nombre de
fichero sugerido) y debajo el prompt a pelo, listo para copiar.
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

Cómo usarlo: copia solo el bloque de texto que va debajo de cada separador.
El separador NO es parte del prompt.

Guarda cada imagen con el nombre sugerido (001.png, 002.png...) para que al
importarlas al editor queden ya en orden de montaje.

Todos los prompts piden 16:9 y sin texto en pantalla. LA ÚNICA EXCEPCIÓN es
el plano 56 ("Lawful"), donde la palabra LAWFUL SÍ debe leerse: es el corazón
del vídeo. Si el generador no escribe texto legible, genera ese plano aparte
o añade la etiqueta en el montaje.

Ningún plano muestra el rostro de una persona real. Ni Kaczynski ni Murray
aparecen con cara reconocible: se resuelven por manos, nucas, siluetas y
objetos. No es solo una decisión legal, funciona mejor.

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

        aviso = ""
        if "LAWFUL" in prompt:
            aviso = "   ← ÚNICO PLANO CON TEXTO VISIBLE"
        salida.append(
            f"{'─' * 70}\n"
            f"{int(n):03d} · {titulo} · {dur}s · guardar como {int(n):03d}.png{aviso}\n"
            f"{'─' * 70}\n\n{prompt}\n\n"
        )

    open(SALIDA, "w", encoding="utf-8").write("".join(salida))

    hecho = open(SALIDA, encoding="utf-8").read()
    assert PREAMBULO not in hecho, "quedó algún preámbulo sin quitar"
    assert hecho.count("guardar como") == len(bloques)
    print(f"{SALIDA}: {len(bloques)} planos, {len(hecho)} caracteres")


if __name__ == "__main__":
    main()
