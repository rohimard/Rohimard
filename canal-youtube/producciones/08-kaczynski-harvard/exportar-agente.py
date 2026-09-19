"""Exporta los prompts en el formato de lote del video 7 (prompts-agente.txt).

Ese formato factoriza fuera todo lo repetido -- estilo, personajes y epoca se
declaran UNA vez en la cabecera -- y deja las escenas como una lista numerada
de una linea cada una. El documento de produccion, en cambio, repite el bloque
de estilo y la ambientacion dentro de los 95 prompts: son ~55.000 caracteres
de los cuales la mayoria es la misma frase noventa y cinco veces.

Las epocas del video 8 NO se pueden resumir en "las primeras N son de esta
epoca y el resto de esta otra" como en el video 7. Aqui el guion salta entre
el experimento de 1960, el pasado de Murray en la OSS de los cuarenta, la
campana de paquetes del 78-95 y el archivo del presente, asi que los grupos
van intercalados y se listan por numero de escena. Los rangos se calculan
leyendo la ambientacion real de cada prompt, no a mano.
"""
import re
from collections import defaultdict

ENTRADA = "prompts-imagenes.txt"
SALIDA = "prompts-agente.txt"
PREAMBULO = (
    "Crea una imagen fotorrealista cinematográfica en formato horizontal "
    "16:9, sin ningún texto: "
)
ESTILO = "fotografía cinematográfica hiperrealista, full frame"

# Como nombrar cada ambientacion en la cabecera. La clave es el texto tal cual
# aparece en los prompts; el valor, la redaccion para la seccion ÉPOCA.
EPOCAS = {
    "estadounidense de los años ochenta, sin ningún objeto posterior a esa década en el encuadre":
        "Estados Unidos de los años ochenta, sin ningún objeto posterior a esa década",
    "rural de Montana, sin ningún objeto moderno en el encuadre":
        "Montana rural, sin ningún objeto moderno",
    "estrictamente universitaria estadounidense de mil novecientos sesenta, sin ningún objeto posterior a esa década en el encuadre":
        "universidad estadounidense de mil novecientos sesenta, sin ningún objeto posterior a esa década",
    "de laboratorio de psicología estadounidense de mil novecientos sesenta, instrumental de la época, sin ningún objeto moderno en el encuadre":
        "laboratorio de psicología estadounidense de mil novecientos sesenta, instrumental de la época, sin ningún objeto moderno",
    "estadounidense de los años ochenta y noventa, sin ningún objeto posterior al año dos mil en el encuadre":
        "Estados Unidos de los años ochenta y noventa, sin ningún objeto posterior al año dos mil",
    "de archivo institucional actual, sobria y neutra":
        "archivo institucional actual, sobrio y neutro",
    "de despacho institucional estadounidense de mil novecientos cuarenta, época de la Segunda Guerra Mundial, sin ningún objeto posterior":
        "despacho institucional estadounidense de mil novecientos cuarenta, Segunda Guerra Mundial, sin ningún objeto posterior",
}


def rangos(nums):
    """[1,2,3,7,9,10] -> '1 a 3, 7, 9 a 10'"""
    out, ini, prev = [], nums[0], nums[0]
    for x in nums[1:]:
        if x == prev + 1:
            prev = x
        else:
            out.append((ini, prev))
            ini = prev = x
    out.append((ini, prev))
    return ", ".join(f"{a} a {b}" if a != b else str(a) for a, b in out)


def main() -> None:
    txt = open(ENTRADA, encoding="utf-8").read()
    bloques = re.split(r"(?m)^(?=\d+\s+\[)", txt)[1:]

    escenas, porEpoca = {}, defaultdict(list)
    for b in bloques:
        cab, cuerpo = b.split("\n", 1)
        n = int(re.match(r"(\d+)", cab).group(1))
        p = cuerpo.strip()
        assert p.startswith(PREAMBULO), f"escena {n} con otro preámbulo"
        p = p[len(PREAMBULO):]
        # Cortar el bloque de estilo (va a la cabecera) y la ambientación
        # (va a la sección ÉPOCA).
        p = p[: p.index(ESTILO)].strip()
        trozos = p.split(". ambientación ")
        assert len(trozos) == 2, f"escena {n} sin ambientación reconocible"
        escena, amb = trozos[0].strip(), trozos[1].rstrip(". ")
        assert amb in EPOCAS, f"ambientación no catalogada en {n}: {amb[:60]}"
        porEpoca[amb].append(n)

        # Personaje recurrente: donde el prompt describe al chico, se sustituye
        # por el token para que el agente use siempre la misma descripción.
        escena = escena.replace(
            "de espaldas de un chico de dieciséis años con abrigo de lana y libros bajo el brazo",
            "de espaldas de EL CHICO con libros bajo el brazo",
        ).replace(
            "de espaldas del chico de dieciséis años con abrigo",
            "de espaldas de EL CHICO",
        )
        escenas[n] = escena

    bloqueEpocas = "\n".join(
        f"{'Escena' if len(ns) == 1 else 'Escenas'} {rangos(sorted(ns))}: "
        f"{EPOCAS[a]}."
        for a, ns in sorted(porEpoca.items(), key=lambda x: sorted(x[1])[0])
    )

    cabecera = f"""Genera 95 imágenes, una por cada escena numerada de la lista.
Cada imagen en formato horizontal 16:9 y SIN NINGÚN TEXTO dentro de la imagen.
LA ÚNICA EXCEPCIÓN es la escena 56: ahí la palabra LAWFUL SÍ tiene que leerse.

ESTILO, aplícalo a las 95 sin excepción:
fotografía cinematográfica hiperrealista, full frame treinta y cinco milímetros, luz natural, colorimetría sobria y ligeramente desaturada, profundidad de campo real, grano fílmico sutil, estilo documental contemporáneo, máximo detalle, 8K, sin texto en pantalla, 16:9.

ROSTROS, es una regla dura y no la relajes en ninguna escena:
ninguna persona real aparece con cara reconocible. Ni Theodore Kaczynski ni
Henry Murray tienen rostro en ningún plano. Las personas se resuelven siempre
por manos, nucas, siluetas, contraluces y objetos. Donde una escena mencione
figuras, déjalas de espaldas, a contraluz o fuera de foco.

PERSONAJE RECURRENTE. Donde una escena diga EL CHICO, usa exactamente esta
descripción, sin variarla, para que sea siempre la misma persona:
EL CHICO = un chico de dieciséis años, complexión delgada, abrigo de lana oscuro sobre camisa blanca y corbata estrecha, pelo corto peinado a un lado, SIEMPRE de espaldas o con el rostro fuera de encuadre, nunca se le ve la cara.

ÉPOCA, es importante y no la deduzcas de la escena. Aquí no hay un corte
limpio entre dos épocas: el relato salta entre el experimento de mil
novecientos sesenta, el pasado militar del profesor en los cuarenta, la
campaña de paquetes de los ochenta y noventa, y el archivo del presente.
{bloqueEpocas}

ESCENAS

"""

    cuerpo = "\n".join(f"{n}. {escenas[n]}" for n in sorted(escenas))
    open(SALIDA, "w", encoding="utf-8").write(cabecera + cuerpo + "\n")

    hecho = open(SALIDA, encoding="utf-8").read()
    assert ESTILO not in cuerpo, "el bloque de estilo se coló en las escenas"
    assert "ambientación" not in cuerpo, "quedó una ambientación en las escenas"
    assert len(re.findall(r"(?m)^\d+\. ", hecho)) == 95
    viejo = len(txt)
    print(f"{SALIDA}: 95 escenas, {len(hecho)} caracteres "
          f"({100 * len(hecho) / viejo:.0f}% del documento de producción)")


if __name__ == "__main__":
    main()
