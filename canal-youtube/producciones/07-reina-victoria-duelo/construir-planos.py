# -*- coding: utf-8 -*-
"""Construye segments.json y prompts-imagenes.txt a partir del guión.

El texto de cada plano no se escribe a mano: lo trocea trocear_planos.py
directamente del guión, de modo que la cobertura es exacta por construcción
y no hay forma de perder una frase al reeditar. Aquí solo se escribe lo que
pide criterio, que es qué se ve en cada plano.

El tipo de plano alterna a propósito (general, medio, primer plano, detalle
macro, punto de vista). Ochenta y nueve planos del mismo tamaño cansan;
alternarlos es lo que hace que el montaje se sienta vivo.

Uso:  python construir-planos.py
"""
import json
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parent.parent / "kit-produccion" / "scripts"))
from trocear_planos import trocear_parrafo  # noqa: E402

GUION = AQUI / "guion-voz.txt"
DURACION = 270.2
MAX_SEGUNDOS = 4.0

VICTORIA = ("la reina Victoria del Reino Unido, mujer de unos cuarenta y dos "
            "años, rostro ovalado y pálido, cabello oscuro con raya al medio "
            "recogido en un moño bajo, vestido negro victoriano de luto de "
            "cuello alto y mangas largas, expresión de dolor contenido")

ALBERTO = ("el príncipe Alberto de Sajonia-Coburgo-Gota, hombre de unos "
           "cuarenta y dos años, bigote y patillas discretas, uniforme "
           "militar victoriano oscuro con condecoraciones")

# Tiene que ser inequívoco. La primera versión decía "una persona adulta" y
# el generador resolvía el sexo a cara o cruz en cada plano: salían hombres
# en unos y mujeres en otros, y el bloque entero dejaba de leerse como la
# misma persona.
MODERNO = ("un hombre de treinta y cinco años, pelo castaño corto y liso, "
           "barba corta de tres días, complexión media, jersey de lana gris "
           "de cuello redondo sobre camisa blanca, vaqueros oscuros, sin "
           "gafas, siempre el mismo hombre")

ESTILO = ("fotografía cinematográfica hiperrealista, full frame treinta y "
          "cinco milímetros, luz natural, colorimetría sobria y ligeramente "
          "desaturada, profundidad de campo real, grano fílmico sutil, "
          "estilo documental contemporáneo, máximo detalle, 8K, sin texto "
          "en pantalla, 16:9")

# La época hay que decirla, no darla por supuesta: si no se nombra, el
# generador mezcla atrezo de los dos siglos en el mismo encuadre.
EPOCA_VICTORIANA = ("ambientación estrictamente victoriana de mil ochocientos "
                    "sesenta, sin ningún objeto moderno en el encuadre")
EPOCA_ACTUAL = ("ambientación estrictamente contemporánea actual, mobiliario "
                "y ropa de hoy, sin ningún elemento de época")

# Qué época le toca a cada bloque. Los que aparecen como "mixto" son planos
# divididos que contraponen las dos a propósito.
EPOCA_POR_BLOQUE = {
    "GANCHO": EPOCA_VICTORIANA,
    "HECHO": EPOCA_VICTORIANA,
    "REENCUADRE": EPOCA_VICTORIANA,
    "REVELACION": EPOCA_ACTUAL,
    "PUENTE": EPOCA_ACTUAL,
    "TITULO": EPOCA_ACTUAL,
    "DATOS": EPOCA_ACTUAL,
    "LEGADO": EPOCA_ACTUAL,
    "CTA": EPOCA_ACTUAL,
}

# Planos que contraponen las dos épocas en un encuadre partido, y por tanto
# no llevan la coletilla de época única.
PLANOS_MIXTOS = {29, 36, 48, 83}

CABECERA = f"""Personaje histórico (repetir palabra por palabra en cada plano donde aparece):
"{VICTORIA}"

Personaje secundario (solo donde se indica):
"{ALBERTO}"

Personaje moderno (repetir palabra por palabra en los planos del bloque de autodiagnóstico):
"{MODERNO}"

Bloque de estilo base (ya incluido al final de cada prompt):
"{ESTILO}"

Nota de ritmo: ningún plano pasa de cuatro segundos. El tipo de plano
alterna a propósito para que el montaje no se sienta plano.

IMPORTANTE para que los planos casen entre sí:
- El hombre moderno es SIEMPRE el mismo. Si tu generador tiene función de
  personajes (en Flow se llama "Caracteres"), créalo una vez con esa
  descripción y reutilízalo; sale mucho más consistente que repetir el
  texto en cada prompt.
- Cada prompt dice ya de qué época es. No quites esa parte: sin ella el
  generador mezcla atrezo victoriano y actual en el mismo encuadre.
- Los planos 29, 36, 48 y 83 son los únicos que contraponen las dos épocas
  en un encuadre partido. Son los más difíciles de acertar; si alguno sale
  raro, genera las dos mitades por separado y júntalas en el montaje.

==================================================================="""

# (bloque, cue, qué se ve). El estilo y los personajes se pegan solos.
PLANOS = [
    # --- GANCHO ---
    ("GANCHO", "El agua caliente sube",
     "detalle macro de unas manos de doncella victoriana sosteniendo una "
     "jarra de porcelana blanca con agua humeante, subiendo una escalera de "
     "piedra en penumbra, vapor visible en el aire frío de la mañana"),
    ("GANCHO", "La navaja de un muerto",
     "primer plano cenital de un lavabo de porcelana victoriano con una "
     "navaja de afeitar abierta, brocha de tejón y jabonera, todo dispuesto "
     "con precisión milimétrica, la habitación vacía y oscura al fondo"),
    ("GANCHO", "La ropa y la toalla",
     "detalle de un uniforme militar victoriano oscuro doblado con precisión "
     "sobre una silla de madera tallada, junto a una toalla blanca impecable "
     "perfectamente alineada, luz de ventana alta, nadie en la habitación"),
    ("GANCHO", "El castillo de Windsor",
     "plano general amplio del castillo de Windsor al amanecer de invierno, "
     "silueta de piedra gótica contra un cielo gris, niebla baja sobre el "
     "césped, una sola ventana iluminada"),
    ("GANCHO", "La mujer más poderosa del mundo",
     f"primer plano cerrado de perfil de {VICTORIA}, mandíbula apretada, "
     "mirada fija al frente, luz lateral dura de ventana que deja media cara "
     "en sombra, sensación de poder y de encierro a la vez"),

    # --- HECHO ---
    ("HECHO", "Esto pasó de verdad",
     "plano general de un archivo histórico real, estanterías de documentos "
     "encuadernados en piel del siglo diecinueve, luz tenue de lámpara de "
     "lectura sobre una mesa de madera"),
    ("HECHO", "La reina Victoria",
     f"retrato de estudio victoriano de {VICTORIA}, erguida y solemne, fondo "
     "de cortinaje pesado, iluminación de fotografía de época"),
    ("HECHO", "El príncipe Alberto",
     f"retrato de estudio victoriano de {ALBERTO}, expresión serena, fondo de "
     "cortinaje pesado, iluminación cálida de fotografía de época"),
    ("HECHO", "Diciembre de mil ochocientos sesenta y uno",
     "detalle de un calendario de pared victoriano de diciembre, papel "
     "amarillento, junto a una vela consumida hasta el final, penumbra"),
    ("HECHO", "Cuarenta y dos años",
     "plano medio de una cama con dosel vacía y deshecha en una habitación de "
     "palacio en penumbra, sábanas revueltas, un frasco de medicina sobre la "
     "mesilla, luz gris de ventana"),
    ("HECHO", "Cuarenta años por delante",
     "plano general de un pasillo de palacio larguísimo y desierto, suelo de "
     "mármol reflejando ventanales, perspectiva que se pierde en el fondo, "
     "sensación de tiempo interminable"),
    ("HECHO", "Vestida de negro cada día",
     f"plano medio de {VICTORIA} de espaldas frente a un armario abierto "
     "lleno únicamente de vestidos negros idénticos colgados en fila, luz "
     "fría de la mañana"),
    ("HECHO", "Hasta su propia muerte",
     "detalle macro de unas manos ancianas con anillos de luto abrochando el "
     "último botón de un cuello alto negro, piel arrugada, luz de vela"),
    ("HECHO", "Una década sin aparecer",
     "plano general de un balcón de palacio vacío con las cortinas cerradas, "
     "visto desde abajo, cielo plomizo, ninguna figura asomada"),
    ("HECHO", "El pueblo empieza a preguntar",
     "plano general de una multitud victoriana de clase trabajadora reunida "
     "frente a las verjas de un palacio, rostros mirando hacia arriba con "
     "expectación y desconcierto, niebla de Londres, luz gris"),
    ("HECHO", "¿Sigue gobernando su reina?",
     "detalle de un periódico victoriano arrugado sobre un adoquín mojado, "
     "titulares ilegibles y borrosos, gotas de lluvia sobre el papel"),
    ("HECHO", "El Parlamento sin abrir",
     "plano general del interior de la Cámara de los Lores victoriana vacía, "
     "bancos de cuero rojo desiertos, el trono vacío al fondo iluminado por "
     "un haz de luz cenital"),
    ("HECHO", "Papel con borde negro",
     "detalle macro de una hoja de papel de carta con un grueso borde negro "
     "de luto, pluma estilográfica apoyada encima, tinta fresca, luz lateral "
     "rasante que marca la textura del papel"),
    ("HECHO", "Décadas de luto en el papel",
     "detalle cenital de un montón de sobres con borde negro apilados y "
     "atados con una cinta, el papel amarilleado por los años, polvo"),
    ("HECHO", "Cartas que nada tenían que ver",
     f"plano medio de {VICTORIA} anciana escribiendo en un escritorio, "
     "concentrada, rodeada de papel de luto, ventana con lluvia detrás"),
    ("HECHO", "Vuelve a mostrarse",
     "plano general de una carroza real victoriana avanzando entre una "
     "multitud, vista desde la altura de la calle, gente asomada, luz de "
     "tarde nublada"),
    ("HECHO", "Seguía de negro",
     f"primer plano de {VICTORIA} dentro de la carroza, vista a través del "
     "cristal de la ventanilla con reflejos de la multitud superpuestos, "
     "rostro impasible"),
    ("HECHO", "Treinta años más",
     "plano secuencia conceptual de cuatro vestidos negros victorianos "
     "idénticos colgados en fila, cada uno más gastado y desvaído que el "
     "anterior, fondo neutro oscuro, luz de museo"),
    ("HECHO", "Mil novecientos uno",
     "detalle de una lápida de mármol blanco recién tallada con laureles, sin "
     "texto legible, flores blancas marchitas a los pies, luz de invierno"),

    # --- REENCUADRE ---
    ("REENCUADRE", "La historia lo contó como amor",
     "plano medio de un libro de historia antiguo abierto sobre un atril, "
     "ilustración grabada de una pareja victoriana, luz cálida de biblioteca"),
    ("REENCUADRE", "La viuda fiel",
     "pintura al óleo victoriana idealizada de una viuda de luto junto a un "
     "retrato de su marido, estilo romántico del siglo diecinueve, marco "
     "dorado, iluminación de galería"),
    ("REENCUADRE", "Es una versión bonita",
     "plano medio de un cuadro romántico colgado en una pared de museo, "
     "visitantes desenfocados delante, luz de sala expositiva"),
    ("REENCUADRE", "Pero no es la completa",
     "detalle de una pintura antigua con una grieta o craquelado atravesando "
     "el rostro retratado, macro extremo, iluminación rasante"),
    ("REENCUADRE", "Y la completa es más incómoda",
     "plano cenital de un expediente clínico moderno abierto sobre una mesa "
     "junto a un grabado victoriano, contraste de épocas, luz de escritorio"),

    # --- REVELACION ---
    ("REVELACION", "Tiene nombre clínico",
     "detalle macro de una página de manual médico moderno con un término "
     "subrayado a mano, texto borroso salvo el subrayado, luz de flexo"),
    ("REVELACION", "Duelo prolongado",
     "plano medio de un psicólogo contemporáneo tomando notas en una consulta "
     "de luz suave, sillón vacío enfrente, ambiente sobrio"),
    ("REVELACION", "No se reconoció hasta hace poco",
     "plano general de una biblioteca médica moderna, estanterías de manuales "
     "de diagnóstico, una figura pequeña consultando un volumen, luz fría"),
    ("REVELACION", "El año dos mil veintidós",
     "detalle de la portada de un manual de diagnóstico psiquiátrico moderno "
     "sobre una mesa blanca, sin texto legible, luz clínica cenital"),
    ("REVELACION", "El manual que usan los psicólogos",
     "plano cenital de varias manos de profesionales alrededor de una mesa de "
     "reunión con documentos y un manual grueso abierto, luz de oficina"),
    ("REVELACION", "Siglo y medio llamándolo amor",
     "plano dividido conceptual entre un salón victoriano en penumbra a la "
     "izquierda y una consulta moderna iluminada a la derecha, misma "
     "composición en ambos lados, transición visual entre épocas"),
    ("REVELACION", "Una condición identificable",
     "detalle macro de un diagrama médico dibujado a mano en un cuaderno, "
     "líneas y anotaciones ilegibles, luz de escritorio lateral"),
    ("REVELACION", "Señales concretas, nombre propio",
     # Nada de cantidades: al pedir siete casillas dibujó seis. Los
     # generadores de imagen no cuentan.
     "plano medio de una pizarra blanca de consulta con una fila de casillas "
     "vacías dibujadas a mano, sin texto legible, luz de ventana de "
     "despacho"),

    # --- PUENTE ---
    ("PUENTE", "No solo una reina del diecinueve",
     "plano general de una calle contemporánea concurrida a la hora punta, "
     "gente caminando con movimiento borroso, luz de tarde"),
    ("PUENTE", "Están pasando ahora mismo",
     f"plano medio de {MODERNO} sentada sola en un banco de un parque "
     "moderno, mirando al vacío, gente pasando desenfocada alrededor, luz de "
     "atardecer"),
    ("PUENTE", "Puede que también en ti",
     "primer plano cerrado del reflejo parcial de un rostro adulto en la "
     "pantalla apagada de un teléfono móvil, mirada directa, penumbra de "
     "habitación"),

    # --- TITULO ---
    ("TITULO", "Siete señales",
     "plano cenital limpio de siete objetos cotidianos idénticos alineados "
     "sobre una superficie neutra de hormigón, luz suave y uniforme, estética "
     "editorial minimalista"),
    ("TITULO", "Un duelo sin terminar de procesar",
     f"plano medio de {MODERNO} de pie frente a una ventana grande de un piso "
     "moderno, de espaldas, silueta recortada contra la luz gris del "
     "exterior"),

    # --- SEÑAL 1 ---
    ("SEÑAL 1", "Una parte de ti murió",
     # "Reflejo desalineado" le hizo triplicar la cara. Mejor un encuadre
     # fotográfico normal y que la idea la ponga la narración.
     f"primer plano de {MODERNO} mirándose en el espejo del baño, un solo "
     "reflejo nítido, rostro cansado y sin expresión, luz fría de mañana"),
    ("SEÑAL 1", "No es una metáfora bonita",
     "plano medio de una silla vacía en un comedor moderno con la mesa puesta "
     "para dos, uno de los platos intacto, luz de lámpara colgante"),
    ("SEÑAL 1", "Perdió su propia identidad",
     "detalle macro de una fotografía de dos personas en la que una de las "
     "caras está desgastada por el roce de los dedos, papel gastado, luz "
     "lateral"),
    ("SEÑAL 1", "No solo a la otra persona",
     f"plano cenital de {MODERNO} tumbada en el suelo de un salón vacío, "
     "brazos extendidos, mirando al techo, luz natural desde una ventana "
     "fuera de cuadro"),

    # --- SEÑAL 2 ---
    ("SEÑAL 2", "Cuesta creer que pasó",
     f"plano medio de {MODERNO} de pie en el umbral de una habitación, con la "
     "mano aún en el pomo, sin llegar a entrar, luz cálida dentro y fría "
     "fuera"),
    ("SEÑAL 2", "La ropa de Alberto, otra vez",
     "plano dividido conceptual entre una doncella victoriana dejando un "
     "uniforme sobre una silla y una persona actual doblando un jersey ajeno "
     "sobre una cama, misma composición en ambos lados"),
    ("SEÑAL 2", "Sigues actuando como si volviera",
     # "Un cepillo de más" no se entiende en imagen. Dos juntos, uno seco y
     # sin usar, sí cuenta la historia.
     "detalle macro de dos cepillos de dientes juntos en un vaso de baño, uno "
     "visiblemente usado y el otro seco e intacto, azulejos modernos "
     "desenfocados al fondo, luz suave de espejo"),
    ("SEÑAL 2", "Aunque sepas que no",
     f"primer plano de {MODERNO} mirando el móvil con una conversación "
     "abierta sin respuesta, pantalla iluminando el rostro en la oscuridad"),
    ("SEÑAL 2", "No es negación pasajera",
     "plano general de un armario abierto con ropa de dos personas mezclada, "
     "una de las mitades intacta y sin tocar, habitación en penumbra"),

    # --- SEÑAL 3 ---
    ("SEÑAL 3", "Evitas lo que te lo recuerde",
     f"plano medio de {MODERNO} cruzando la calle bruscamente para no pasar "
     "frente a un local, visto desde el otro lado, luz de tarde urbana"),
    ("SEÑAL 3", "Cambias de acera",
     "punto de vista a la altura de los ojos de una acera concreta que se "
     "queda atrás, desenfoque de movimiento, farolas encendidas, hora azul"),
    ("SEÑAL 3", "Borras fotos, o no puedes",
     "detalle macro de un dedo suspendido sobre el botón de borrar de una "
     "galería de fotos en un móvil, sin llegar a tocarlo, pantalla brillante "
     "en la oscuridad"),

    # --- SEÑAL 4 ---
    ("SEÑAL 4", "Duele como si fuera ayer",
     f"primer plano cerrado del rostro de {MODERNO} con los ojos cerrados y "
     "la mandíbula tensa, lágrima contenida, luz lateral dura"),
    ("SEÑAL 4", "Rabia y amargura",
     "detalle macro de un puño apretado sobre una mesa de madera, nudillos "
     "blancos, un vaso de agua vibrando ligeramente al lado"),
    ("SEÑAL 4", "Una tristeza que no se suaviza",
     "plano general de una figura pequeña sentada al borde de una cama en una "
     "habitación grande y ordenada, luz de ventana que va cayendo, sensación "
     "de tiempo detenido"),

    # --- SEÑAL 5 ---
    ("SEÑAL 5", "No te reenganchas con tu vida",
     f"plano medio de {MODERNO} sentada frente a un portátil abierto sin "
     "escribir, tazas acumuladas al lado, luz azulada de pantalla"),
    ("SEÑAL 5", "Planes, relaciones, proyectos",
     "plano cenital de un calendario de pared moderno con todas las casillas "
     "vacías salvo una marcada, junto a invitaciones sin abrir"),
    ("SEÑAL 5", "Se siente como una traición",
     f"plano medio de {MODERNO} en una cena con amigos, sonriendo a "
     "destiempo, el resto de la mesa desenfocada y animada, luz cálida de "
     "restaurante"),
    ("SEÑAL 5", "Ya no consigues que importen",
     "detalle de un móvil sobre una mesa con notificaciones acumuladas sin "
     "leer, pantalla encendida, entorno oscuro"),

    # --- SEÑAL 6 ---
    ("SEÑAL 6", "Una insensibilidad extraña",
     f"primer plano de {MODERNO} con expresión completamente neutra, mirada "
     "sin foco, fondo desenfocado de una habitación iluminada"),
    ("SEÑAL 6", "Detrás de un cristal",
     "plano medio de una persona vista a través de una ventana con "
     "condensación y gotas de lluvia, rostro parcialmente borroso por el "
     "cristal, luz gris del exterior"),
    ("SEÑAL 6", "Sin la intensidad de antes",
     "plano conceptual de una habitación moderna con los colores casi "
     "completamente desaturados salvo un objeto pequeño que conserva color, "
     "luz plana"),
    ("SEÑAL 6", "Ni siquiera lo bueno",
     f"plano medio de {MODERNO} en una fiesta con luces de colores y gente "
     "riendo, quieta en el centro, expresión ausente, movimiento borroso "
     "alrededor"),

    # --- SEÑAL 7 ---
    ("SEÑAL 7", "Tu vida ya no tiene el mismo sentido",
     f"plano general amplio de {MODERNO} de pie en medio de un espacio "
     "urbano enorme y vacío, aparcamiento o plaza, escala que empequeñece a "
     "la figura, luz de amanecer"),
    ("SEÑAL 7", "Sin esa persona",
     "plano cenital de dos sillas de terraza, una ocupada por un abrigo y la "
     "otra vacía, mesa con dos cafés, uno intacto y frío"),
    ("SEÑAL 7", "No es que quieras hacerte daño",
     f"primer plano de las manos de {MODERNO} sosteniendo una taza fría, sin "
     "beber, dedos entrelazados alrededor, luz suave de cocina"),
    ("SEÑAL 7", "El para qué se apagó",
     "detalle macro de una bombilla apagada en una lámpara de mesa encendida "
     "el resto de la habitación, filamento frío, fondo desenfocado"),

    # --- DATOS ---
    ("DATOS", "Si algo de esto te suena",
     f"primer plano de {MODERNO} mirando directamente a cámara por primera "
     "vez, expresión de reconocimiento, luz frontal suave"),
    ("DATOS", "La clave es un solo dato",
     "detalle macro de un dedo señalando una línea concreta en un documento "
     "impreso, texto ilegible salvo el gesto, luz de flexo"),
    ("DATOS", "No es cuánto sufres",
     "plano conceptual de una balanza antigua de dos platos en equilibrio "
     "desigual sobre una mesa neutra, luz lateral dura, fondo oscuro"),
    ("DATOS", "Es cuánto tiempo sigue igual",
     "plano medio de un reloj de pared moderno en una habitación vacía, "
     "manecillas nítidas, luz cambiando de día a noche en la pared"),
    ("DATOS", "Doce meses, en adultos",
     "plano cenital de doce hojas de calendario arrancadas y esparcidas sobre "
     "una mesa oscura, luz rasante"),
    ("DATOS", "La señal de alarma",
     "plano medio de una consulta de psicología con dos sillones enfrentados, "
     "uno ocupado por una figura inclinada hacia delante, luz cálida y "
     "sobria"),
    ("DATOS", "Antes de esa fecha",
     f"plano medio de {MODERNO} llorando abiertamente y sin contención en un "
     "sofá, luz natural de tarde, imagen sin dramatismo, humana y normal"),
    ("DATOS", "Es normal que duela así",
     "plano medio de dos personas abrazadas en un salón, una consolando a la "
     "otra, luz cálida de lámpara, encuadre íntimo"),
    ("DATOS", "Existe tratamiento específico",
     "plano medio de una consulta luminosa con un profesional y un paciente "
     "conversando, ambos relajados, luz natural abundante"),
    ("DATOS", "Y funciona de verdad",
     f"plano medio de {MODERNO} saliendo por la puerta de un edificio a una "
     "calle iluminada, expresión de alivio leve, contraluz de sol"),

    # --- LEGADO ---
    ("LEGADO", "A ella nadie se lo ofreció",
     f"plano medio de {VICTORIA} anciana sentada sola en un salón de palacio "
     "enorme, rodeada de sillas vacías, luz de ventanal lejano"),
    ("LEGADO", "Porque todavía no existía",
     "plano general de un gabinete médico victoriano con instrumental "
     "primitivo sobre una mesa de madera, ninguna figura presente, luz de "
     "vela"),
    ("LEGADO", "Cuarenta años atrapada",
     f"plano conceptual de {VICTORIA} de espaldas frente a una puerta cerrada "
     "de palacio, mano apoyada en la madera sin abrirla, penumbra"),
    ("LEGADO", "Tú tienes algo que ella no tuvo",
     "plano dividido conceptual entre un salón victoriano en penumbra a la "
     "izquierda y una consulta moderna luminosa a la derecha, misma "
     "composición, la mitad moderna claramente más iluminada"),
    ("LEGADO", "La palabra exacta",
     "detalle macro de una palabra subrayada en un cuaderno moderno escrito a "
     "mano, letra clara pero ilegible, luz de ventana"),
    ("LEGADO", "Gente preparada para ayudarte",
     "plano medio de un grupo pequeño de personas sentadas en círculo en una "
     "sala luminosa, postura de escucha, luz natural"),
    ("LEGADO", "No para juzgarte",
     f"primer plano de {MODERNO} con expresión serena por primera vez, "
     "hombros bajados, luz cálida frontal, fondo desenfocado luminoso"),

    # --- CTA ---
    ("CTA", "Alguien que sí encontró la salida",
     "plano general de una silueta caminando por un pasillo hacia una puerta "
     "abierta con luz intensa al fondo, contraluz marcado"),
    ("CTA", "Y cómo lo hizo",
     "plano medio de una puerta entreabierta a una habitación iluminada, "
     "vista desde un pasillo oscuro, invitación visual a entrar"),
    ("CTA", "Lo que pasa dentro de tu cabeza",
     "plano conceptual de una silueta humana de perfil sobre fondo neutro "
     "oscuro, con una luz cálida y suave iluminando la zona de la cabeza, "
     "estética editorial sobria, sin texto"),
]


def escribir_version_agente(trozos: list) -> None:
    """Versión para pegar de una vez en un agente generador.

    El archivo largo repite el bloque de estilo y la descripción de los
    personajes en cada uno de los ochenta y nueve prompts. Para una persona
    eso es cómodo, porque puede copiar un prompt suelto; para un agente son
    veinticinco mil caracteres de lastre que además invitan a que se salte
    los últimos. Aquí el estilo y los personajes se declaran una sola vez y
    cada escena queda en una línea.
    """
    corto = {VICTORIA: "VICTORIA", ALBERTO: "ALBERTO", MODERNO: "HOMBRE"}

    victorianos = [i for i, (b, _, _) in enumerate(PLANOS, 1)
                   if EPOCA_POR_BLOQUE.get(b) == EPOCA_VICTORIANA
                   and i not in PLANOS_MIXTOS]
    mixtos = ", ".join(str(i) for i in sorted(PLANOS_MIXTOS))

    cabecera = f"""Genera {len(PLANOS)} imágenes, una por cada escena numerada de la lista.
Cada imagen en formato horizontal 16:9 y SIN NINGÚN TEXTO dentro de la imagen.

ESTILO, aplícalo a las {len(PLANOS)} sin excepción:
{ESTILO}.

PERSONAJES RECURRENTES. Donde una escena diga VICTORIA, ALBERTO o HOMBRE,
usa exactamente esta descripción, sin variarla, para que sea siempre la
misma persona en todas las imágenes donde aparezca:
VICTORIA = {VICTORIA}.
ALBERTO = {ALBERTO}.
HOMBRE = {MODERNO}.

ÉPOCA, es importante y no la deduzcas de la escena:
Las escenas {victorianos[0]} a {victorianos[-1]} son victorianas de mil ochocientos sesenta,
sin ningún objeto moderno en el encuadre.
El resto son contemporáneas actuales, sin ningún elemento de época.
Las escenas {mixtos} son la excepción: contraponen las dos épocas en un
encuadre partido por la mitad.

ESCENAS"""

    lineas = [cabecera, ""]
    for i, (_, _, escena) in enumerate(PLANOS, 1):
        for largo, etiqueta in corto.items():
            escena = escena.replace(largo, etiqueta)
        lineas.append(f"{i}. {escena}.")

    (AQUI / "prompts-agente.txt").write_text(
        "\n".join(lineas) + "\n", encoding="utf-8")


def main():
    texto = GUION.read_text(encoding="utf-8").strip()
    parrafos = [p.strip() for p in texto.split("\n\n") if p.strip()]
    ritmo = len(texto.split()) / DURACION
    max_palabras = int(MAX_SEGUNDOS * ritmo)

    trozos = []
    for p in parrafos:
        trozos.extend(trocear_parrafo(p, max_palabras))

    if len(trozos) != len(PLANOS):
        sys.exit(f"el guión da {len(trozos)} planos pero hay "
                 f"{len(PLANOS)} descritos; ajusta la lista")

    # Sin esto, un retoque del guión desplaza todos los prompts en silencio.
    if " ".join(trozos).split() != texto.split():
        sys.exit("el troceo no cubre el guión exactamente")

    segmentos = [
        {"id": i, "block": bloque, "cue": cue, "text": t}
        for i, ((bloque, cue, _), t) in enumerate(zip(PLANOS, trozos), 1)
    ]
    (AQUI / "segments.json").write_text(
        json.dumps({"segments": segmentos}, ensure_ascii=False, indent=2),
        encoding="utf-8")

    lineas = [CABECERA, ""]
    for i, ((bloque, cue, escena), t) in enumerate(zip(PLANOS, trozos), 1):
        seg = len(t.split()) / ritmo
        # Los bloques de señales son todos actuales; van por defecto.
        epoca = "" if i in PLANOS_MIXTOS else EPOCA_POR_BLOQUE.get(
            bloque, EPOCA_ACTUAL)
        lineas.append(f"{i}   [{seg:.1f}s]   {cue}\n")
        lineas.append(
            f"Crea una imagen fotorrealista cinematográfica en formato "
            f"horizontal 16:9, sin ningún texto: {escena}. "
            f"{epoca + '. ' if epoca else ''}{ESTILO}.\n")
    (AQUI / "prompts-imagenes.txt").write_text(
        "\n".join(lineas), encoding="utf-8")

    escribir_version_agente(trozos)

    largos = [(i, len(t.split()) / ritmo)
              for i, t in enumerate(trozos, 1)
              if len(t.split()) / ritmo > MAX_SEGUNDOS]
    print(f"{len(segmentos)} planos · cobertura exacta")
    print(f"planos por encima de {MAX_SEGUNDOS} s: "
          f"{largos if largos else 'ninguno'}")


if __name__ == "__main__":
    main()
