#!/usr/bin/env python3
"""
construir-short.py — emite los planos y los prompts del short del vídeo 7.

Igual que en el vídeo largo, el texto de cada plano se RECORTA del guion en vez
de escribirse a mano: así la cobertura es exacta por construcción y no se
pierde ni se duplica una frase al reordenar.

Lo que cambia respecto al vídeo largo:
  - Encuadre vertical 9:16 declarado en cada prompt. Recortar un 16:9 a 9:16 se
    come el 68% del ancho, así que las imágenes se generan verticales de origen.
  - Composición pensada para móvil: sujeto centrado y grande, y el tercio
    inferior despejado, porque ahí van los subtítulos y la interfaz de Shorts.
  - Planos más cortos: en un short el ritmo no puede decaer en ningún tramo.

  python3 construir-short.py
"""
import json
import pathlib
import re

AQUI = pathlib.Path(__file__).parent

ESTILO = ("fotografía cinematográfica hiperrealista, full frame treinta y cinco "
          "milímetros, luz natural, colorimetría sobria y ligeramente "
          "desaturada, profundidad de campo real, grano fílmico sutil, estilo "
          "documental contemporáneo, máximo detalle, 8K, sin texto en pantalla, "
          "vertical 9:16, 1080x1920, sujeto centrado y grande en el encuadre, "
          "tercio inferior despejado y sin elementos importantes")

VICTORIA = ("la reina Victoria del Reino Unido, mujer de unos cuarenta y dos "
            "años, rostro ovalado y pálido, cabello oscuro con raya al medio "
            "recogido en un moño bajo, vestido negro victoriano de luto de "
            "cuello alto y mangas largas, expresión de dolor contenido")
ALBERTO = ("el príncipe Alberto de Sajonia-Coburgo-Gota, hombre de unos "
           "cuarenta y dos años, bigote y patillas discretas, uniforme militar "
           "victoriano oscuro con condecoraciones")

# La época hay que decirla, no darla por supuesta: si no se nombra, el
# generador mezcla atrezo de los dos siglos en el mismo encuadre.
EPOCA_VICT = ("ambientación estrictamente victoriana de mil ochocientos "
              "sesenta, sin ningún objeto moderno en el encuadre")
EPOCA_HOY = ("ambientación estrictamente contemporánea actual, sin ningún "
             "elemento de época")

# (texto recortado del guion, escena, prompt, época)
PLANOS = [
    ("Imagina enterrar a tu marido", "Un ataúd bajando",
     "plano cenital de un ataúd de madera oscura descendiendo a una fosa, "
     "manos enguantadas de negro soltando una rosa blanca", EPOCA_VICT),
    ("y no volver a quitarte el negro en cuarenta años.", "Cuarenta años de negro",
     f"plano medio de {VICTORIA} de pie, sola, en un pasillo de palacio vacío "
     "y en penumbra, la figura pequeña contra la arquitectura enorme", EPOCA_VICT),
    ("Eso hizo la mujer más poderosa del mundo.", "La mujer más poderosa",
     f"primer plano cerrado del rostro de {VICTORIA}, mirada directa a cámara, "
     "luz lateral dura que deja media cara en sombra", EPOCA_VICT),
    ("Reino Unido, mil ochocientos sesenta y uno:", "Windsor, mil ochocientos sesenta y uno",
     "plano general vertical del castillo de Windsor al amanecer de invierno, "
     "silueta de piedra gótica contra cielo gris, niebla baja", EPOCA_VICT),
    ("el príncipe Alberto muere de fiebre tifoidea", "Alberto enfermo",
     f"plano medio de {ALBERTO} tendido en una cama con dosel, rostro "
     "demacrado y sudoroso, luz de vela, frascos de medicina en la mesilla",
     EPOCA_VICT),
    ("con cuarenta y dos años.", "Retrato de Alberto",
     f"retrato de estudio victoriano de {ALBERTO}, expresión serena, fondo de "
     "cortinaje pesado, iluminación cálida de fotografía de época", EPOCA_VICT),
    ("Su viuda, la reina Victoria, se viste de luto", "Se viste de luto",
     f"detalle de las manos de {VICTORIA} abotonando el cuello alto de un "
     "vestido negro de luto frente a un espejo de marco dorado", EPOCA_VICT),
    ("y no se lo quita nunca más,", "Nunca más",
     "detalle de un armario victoriano abierto lleno solo de vestidos negros "
     "idénticos colgados en fila, ni una sola prenda de color", EPOCA_VICT),
    ("hasta su propia muerte en mil novecientos uno.", "Mil novecientos uno",
     f"primer plano de {VICTORIA} muy anciana, unos ochenta años, mismo "
     "vestido negro de luto, rostro surcado de arrugas, mirada apagada",
     EPOCA_VICT),
    ("Se negó a aparecer en público casi una década.", "Una década sin salir",
     f"plano general de {VICTORIA} de espaldas mirando por un ventanal alto "
     "de palacio, cortinas pesadas medio cerradas, habitación a oscuras",
     EPOCA_VICT),
    ("El pueblo empezó a preguntarse", "El pueblo pregunta",
     "plano medio de una multitud victoriana de clase trabajadora agolpada "
     "ante las verjas de un palacio, rostros mirando hacia arriba, expectación "
     "y desconcierto", EPOCA_VICT),
    ("si su reina seguía gobernando.", "¿Sigue gobernando?",
     "detalle de un trono de madera tallada y terciopelo rojo completamente "
     "vacío en un salón enorme, un rayo de luz cayendo sobre el asiento",
     EPOCA_VICT),
    ("Tardó años en volver a abrir el Parlamento en persona.", "El Parlamento sin ella",
     "plano general vertical del interior de la Cámara de los Lores vacía, "
     "bancos rojos desiertos, luz entrando por los ventanales góticos",
     EPOCA_VICT),
    ("Y usó papel de carta con el borde negro", "Papel con borde negro",
     "detalle macro de una hoja de papel de carta crema con un grueso borde "
     "negro de luto, pluma de acero y tintero al lado, sobre un escritorio de "
     "caoba", EPOCA_VICT),
    ("el resto de su vida, décadas después,", "Décadas después",
     "plano cenital de un montón alto de cartas con el borde negro atadas con "
     "cinta, apiladas por décadas, el papel de las de abajo amarilleado",
     EPOCA_VICT),
    ("en cartas que no tenían nada que ver con Alberto.", "Cartas de cualquier cosa",
     "detalle de una mano anciana escribiendo con pluma en un papel de borde "
     "negro, manga de encaje negro, luz de lámpara de aceite", EPOCA_VICT),
    ("Durante siglo y medio esto se contó como amor eterno.", "La versión bonita",
     f"retrato doble de época de {VICTORIA} y {ALBERTO} juntos en un marco "
     "ovalado dorado sobre una repisa, la foto un poco inclinada y con polvo",
     EPOCA_VICT),
    ("Pero en dos mil veintidós", "Dos mil veintidós",
     "plano cenital de un manual médico moderno de tapa azul abierto sobre una "
     "mesa blanca de consulta, junto a unas gafas y un bolígrafo", EPOCA_HOY),
    ("entró en el manual de diagnóstico", "El manual",
     "detalle macro de un dedo recorriendo una línea de una página de un "
     "manual clínico, el texto deliberadamente desenfocado e ilegible",
     EPOCA_HOY),
    ("con un nombre propio: duelo prolongado.", "Tiene nombre",
     "primer plano de un hombre de treinta y cinco años, pelo castaño corto, "
     "barba de tres días, jersey de lana gris, sentado en una consulta "
     "escuchando, expresión de reconocerse en algo", EPOCA_HOY),
    ("Y la clave no es cuánto duele.", "No es cuánto duele",
     "detalle macro de un puño apretado sobre una mesa de madera clara, "
     "nudillos blancos", EPOCA_HOY),
    ("Es que doce meses después siga doliendo igual.", "Doce meses",
     "plano cenital de un calendario de pared de papel sobre una mesa de "
     "madera clara, la rejilla de casillas nítida y vacía pero los números "
     "deliberadamente ilegibles, impresos diminutos en gris claro y algo "
     "desenfocados, doce hojas pasadas dobladas hacia atrás", EPOCA_HOY),
    ("A ella nadie pudo ofrecerle tratamiento, porque no existía.", "Ella no lo tuvo",
     f"plano medio de {VICTORIA} sentada sola en una butaca enorme de un salón "
     "vacío, manos en el regazo, la luz de la ventana cayendo lejos de ella",
     EPOCA_VICT),
    ("Hoy sí existe. La historia completa, en el vídeo.", "Hoy sí existe",
     "plano medio de dos personas sentadas frente a frente en una consulta "
     "luminosa y moderna, una escuchando a la otra con atención, sin que se "
     "vean las caras con claridad", EPOCA_HOY),
]


def main() -> None:
    guion = " ".join(AQUI.joinpath("guion-short.txt").read_text(
        encoding="utf-8").split())

    # Comprobación de cobertura: los textos de los planos, pegados, tienen que
    # reconstruir el guion entero. Si no, alguien ha editado uno de los dos y
    # los tiempos saldrían corridos.
    pegado = " ".join(p[0] for p in PLANOS)
    norm = lambda s: re.sub(r"\s+", " ", s).strip()
    if norm(pegado) != norm(guion):
        print("AVISO: los planos no reconstruyen el guion exactamente.")
        print(f"  guion  {len(guion)} caracteres")
        print(f"  planos {len(pegado)} caracteres")

    seg = [{"id": i, "cue": c, "text": t, "epoca": e}
           for i, (t, c, _, e) in enumerate(PLANOS, 1)]
    json.dump(seg, open(AQUI / "segments.json", "w"),
              ensure_ascii=False, indent=1)

    # Formato para pegar de una vez en modo agente: el estilo y los personajes
    # se declaran una sola vez y cada escena queda en una línea.
    corto = {VICTORIA: "VICTORIA", ALBERTO: "ALBERTO"}
    lineas = [
        f"Genera {len(PLANOS)} imágenes VERTICALES 9:16, una por escena numerada.",
        "SIN NINGÚN TEXTO dentro de la imagen.",
        "",
        f"ESTILO, aplícalo a las {len(PLANOS)} sin excepción:",
        ESTILO,
        "",
        "PERSONAJES. Donde una escena diga VICTORIA o ALBERTO, usa exactamente",
        "esta descripción sin variarla, para que sea siempre la misma persona:",
        f"VICTORIA = {VICTORIA}.",
        f"ALBERTO = {ALBERTO}.",
        "",
        "ÉPOCA, es importante y no la deduzcas de la escena: cada línea la dice.",
        "",
        "ESCENAS",
    ]
    for i, (_, _, prompt, epoca) in enumerate(PLANOS, 1):
        p = prompt
        for largo, breve in corto.items():
            p = p.replace(largo, breve)
        lineas.append(f"{i}. {p}, {epoca}.")
    (AQUI / "prompts-short.txt").write_text("\n".join(lineas) + "\n",
                                            encoding="utf-8")

    print(f"{len(PLANOS)} planos · cobertura "
          f"{'exacta' if norm(pegado) == norm(guion) else 'REVISAR'}")
    print(f"prompts-short.txt — {len(chr(10).join(lineas))} caracteres")


if __name__ == "__main__":
    main()
