import re, json, difflib, unicodedata

GUION = open('guion.txt', encoding='utf-8').read().strip()

CHUNKS = [
    {"start": 0.00, "dur": 15.02, "text": "Imagina que tienes seis años y vives en un orfanato. Un día te sientan frente a una mujer joven que dice ser tu nueva profesora de conversación. Te pide que le cuentes tu día. Cada vez que te trabas, aunque sea un poco, ella te corrige, te llama tartamudo, te dice que hables mejor si no"},
    {"start": 15.02, "dur": 14.99, "text": "Quieres que la gente se ría de ti. No sabes que esa mujer no es tu profesora. No sabes que estás dentro de un experimento científico y que nadie te va a decir la verdad durante los próximos sesenta años. Esto pasó de verdad en 1939, en un orfanato de"},
    {"start": 30.01, "dur": 14.99, "text": "Davenport, en el estado de Iowa. El responsable fue un psicólogo llamado Wendell Johnson. La razón por la que le obsesionaba la tartamudez no era solo académica. Él mismo había tartamudeado desde niño y quería demostrar algo muy concreto: que"},
    {"start": 45.00, "dur": 14.99, "text": "La tartamudez no nace en la garganta, nace en la cabeza de quien te escucha. Para probarlo, necesitaba niños sanos que hablaran con normalidad y ver si podía convertirlos en tartamudos solo con palabras. Johnson no hizo el experimento con su propia mano"},
    {"start": 59.99, "dur": 15.02, "text": "Se lo encargó a una estudiante de posgrado, Mary Tudor, y eligió el orfanato de Davenport porque esos niños no tenían padres que preguntaran qué les estaban haciendo. Veintidós niños fueron divididos en dos grupos sin que ninguno supiera que participaba en nada. Al primer grupo, Tudor los"},
    {"start": 75.01, "dur": 14.99, "text": "Los cortaba con elogios constantes. Les decía que hablaban de maravilla pasara lo que pasara. Al segundo grupo lo sometía a lo contrario. Cada palabra dudada, cada pausa normal de un niño de seis años se convertía en una humillación. Los llamaba tartamudos una y otra vez, aunque casi"},
    {"start": 90.00, "dur": 14.99, "text": "ninguno lo fuera de verdad. Los resultados llegaron rápido y fueron peores de lo que Johnson esperaba. Varios de los niños del segundo grupo empezaron a hablar menos por miedo a equivocarse. Algunos dejaron de participar en clase. Uno se negaba a decir su propio nombre en voz alta. No estaban"},
    {"start": 104.99, "dur": 14.99, "text": "Actuando un papel para un experimento que entendieran. Estaban aprendiendo a los seis años que su forma de hablar era motivo de vergüenza, y esa idea se les quedó pegada mucho después de que Tudor dejara de visitarlos. Johnson nunca publicó estos resultados en una revista"},
    {"start": 119.98, "dur": 14.99, "text": "científica. Sabía exactamente lo que había hecho y sabía que no se podía defender. El estudio quedó guardado en un cajón durante más de sesenta años, mencionado solo por encima en algún trabajo posterior, hasta que un periodista del estado de Iowa consiguió acceso"},
    {"start": 134.97, "dur": 15.02, "text": "A los archivos originales de la universidad en 2001. Cuando la noticia salió, ya no había forma de esconderla. Varios de aquellos niños, entonces ancianos, seguían arrastrando problemas de habla y de autoestima seis décadas después. La Universidad de Iowa tuvo que"},
    {"start": 149.99, "dur": 14.99, "text": "Pedir perdón en público y terminó pagando una indemnización a los supervivientes por un daño que nunca debió existir. Aquí está la parte que de verdad importa. Y no es solo que un científico se pasara de la raya, es que la hipótesis de Johnson, en el fondo, tenía razón. Solo que"},
    {"start": 164.98, "dur": 14.99, "text": "La usó para hacer daño en vez de para entender algo real. Una persona no necesita tener ningún problema de verdad para empezar a comportarse como si lo tuviera. Basta con que alguien con autoridad, un profesor, un padre, un jefe, te repita las veces suficientes que eres"},
    {"start": 179.97, "dur": 14.99, "text": "Torpe, que eres lento, que hablas mal, para que tu cerebro deje de confiar en lo que hacía bien de forma natural y empiece a vigilarse a sí mismo todo el rato. Esa vigilancia constante es precisamente lo que produce el tropiezo que se supone que estabas evitando. Esto no"},
    {"start": 194.96, "dur": 15.02, "text": "Quedó en un orfanato de Iowa en 1939. Te sigue pasando cada vez que alguien con poder sobre ti decide qué etiqueta llevas puesta. El niño al que un profesor le dice que es malo en matemáticas deja de intentarlo en serio y años después"},
    {"start": 209.98, "dur": 14.99, "text": "Creyendo que simplemente no se le dan los números. El empleado al que un jefe le repite que es desorganizado empieza a olvidar cosas que antes recordaba sin esfuerzo. No es que la etiqueta describa lo que ya eras, es que repetida lo suficiente por la persona"},
    {"start": 224.97, "dur": 14.99, "text": "Equivocada, la etiqueta te construye. Saber esto no borra las etiquetas que ya cargas, pero sí cambia la pregunta que te tienes que hacer la próxima vez que sientas que algo se te da mal de forma innata. Pregúntate quién te lo dijo primero, cuántas veces te lo repitió"},
    {"start": 239.96, "dur": 14.99, "text": "Y si alguna vez comprobaste si era verdad o si simplemente dejaste de intentarlo. En el próximo video vas a conocer un experimento todavía más difícil de creer, el de un profesor universitario que pidió a sus alumnos que decapitaran una rata viva delante de una cámara"},
    {"start": 254.95, "dur": 9.82, "text": "Solo para fotografiar la cara que ponían. Suscríbete si quieres seguir entendiendo hasta dónde llega la traición de tu propio cerebro. Nos vemos en el siguiente"},
]

def norm(w):
    w = w.lower()
    w = ''.join(c for c in unicodedata.normalize('NFD', w) if unicodedata.category(c) != 'Mn')
    w = re.sub(r'[^a-z0-9]', '', w)
    return w

def tokenize(text):
    return re.findall(r"\S+", text)

script_words = tokenize(GUION)
script_norm = [norm(w) for w in script_words]

trans_words = []
trans_times = []
for c in CHUNKS:
    words = tokenize(c["text"])
    n = len(words)
    for i, w in enumerate(words):
        trans_words.append(w)
        t = c["start"] + (i + 0.5) / n * c["dur"]
        trans_times.append(t)
trans_norm = [norm(w) for w in trans_words]

sm = difflib.SequenceMatcher(None, script_norm, trans_norm, autojunk=False)
anchors = {}
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    if tag == 'equal':
        for k in range(i2 - i1):
            anchors[i1 + k] = trans_times[j1 + k]
    elif tag == 'replace' and (i2 - i1) == (j2 - j1):
        for k in range(i2 - i1):
            anchors[i1 + k] = trans_times[j1 + k]

n = len(script_words)
times = [None] * n
for idx, t in anchors.items():
    times[idx] = t

i = 0
while i < n:
    if times[i] is not None:
        i += 1
        continue
    j = i
    while j < n and times[j] is None:
        j += 1
    left = times[i - 1] if i > 0 else 0.0
    right = times[j] if j < n else CHUNKS[-1]["start"] + CHUNKS[-1]["dur"]
    span = j - i + 1
    for k, idx in enumerate(range(i, j)):
        times[idx] = left + (right - left) * (k + 1) / span
    i = j

for i in range(1, n):
    if times[i] < times[i - 1]:
        times[i] = times[i - 1] + 0.001

match_pct = 100.0 * len(anchors) / n
print(f"matched {len(anchors)}/{n} = {match_pct:.1f}%")

out = {"words": [{"w": script_words[i], "t": round(times[i], 3)} for i in range(n)], "match_pct": round(match_pct, 1)}
json.dump(out, open('word_times.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print("wrote word_times.json")
