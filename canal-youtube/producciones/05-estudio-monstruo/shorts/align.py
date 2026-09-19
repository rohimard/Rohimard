import re, json, difflib, unicodedata

GUION = open('guion-short.txt', encoding='utf-8').read().strip()

CHUNKS = [
    {"start": 0.0, "dur": 5.02, "text": "Imagina que tienes seis años, vives en un orfanato y un día una mujer te dice que hablas mal. No"},
    {"start": 5.02, "dur": 4.99, "text": "Es tu profesora. Es un experimento. 1939, Universidad de Iowa"},
    {"start": 10.01, "dur": 5.02, "text": "Veintidós niños huérfanos divididos en dos grupos sin saberlo. A la mitad la elogiaron"},
    {"start": 15.03, "dur": 4.99, "text": "Por todo. A la otra la humillaban por cada palabra dudada, aunque casi ninguno tartamudeara de verdad"},
    {"start": 20.02, "dur": 5.02, "text": "El responsable, Wendell Johnson, tartamudeó de niño y quería probar que el problema nace"},
    {"start": 25.04, "dur": 4.99, "text": "En cómo te habla la gente, no en tu garganta. Nunca publicó los resultados"},
    {"start": 30.03, "dur": 4.99, "text": "Sabía que no se podían defender. El estudio quedó oculto 62 años hasta"},
    {"start": 35.02, "dur": 5.02, "text": "Hasta que un periodista encontró los archivos en 2001. Esos niños, ya ancianos"},
    {"start": 40.04, "dur": 4.99, "text": "Seguían arrastrando el daño seis décadas después. La universidad pidió perdón en público"},
    {"start": 45.03, "dur": 5.02, "text": "público. Pero lo más inquietante no es lo que le hicieron, es que su hipótesis tenía"},
    {"start": 50.05, "dur": 4.99, "text": "Tenía razón. Solo la usó para destruir, no para entender. Y te sigue pasando"},
    {"start": 55.04, "dur": 4.99, "text": "Cada vez que un profesor o un jefe decide qué etiqueta llevas puesta. La historia"},
    {"start": 60.03, "dur": 2.35, "text": "completa en el video"},
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
