import re, json, difflib, unicodedata

GUION = open('guion-short.txt', encoding='utf-8').read().strip()

CHUNKS = [
    {"start": 0.0, "dur": 15.020408, "text": "En 1971 encerraron a veinticuatro estudiantes en una cárcel falsa. Unos, guardias, otros, presos. En seis días todo se salió de control y se volvió el experimento más citado de la psicología. Pero grabaciones ocultas por"},
    {"start": 15.020408, "dur": 14.994286, "text": "Décadas muestran que Zimbardo le decía a los guardias cómo comportarse. Uno confesó después que solo actuaba copiando una película y el preso de la crisis nerviosa más famosa admitió que la fingió para salir. No midieron que cualquiera se vuelve un monstruo con poder. Midieron algo"},
    {"start": 30.014694, "dur": 10.422857, "text": "Peor, que tu cerebro sigue un guion social sin que nadie dé la orden. Y te pasa cada vez que cambias con un uniforme o un cargo sin darte cuenta. La investigación completa en el video"},
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

# Build transcript norm tokens with their real time, chunk by chunk
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
anchors = {}  # script_index -> time
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

# interpolate unmatched
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
    for k in range(i, j):
        times[i - i + k - i + i] = None  # placeholder, real calc below
    for k, idx in enumerate(range(i, j)):
        times[idx] = left + (right - left) * (k + 1) / (span)
    i = j

# enforce monotonicity
for i in range(1, n):
    if times[i] < times[i - 1]:
        times[i] = times[i - 1] + 0.001

match_pct = 100.0 * len(anchors) / n
print(f"matched {len(anchors)}/{n} = {match_pct:.1f}%")

out = {"words": [{"w": script_words[i], "t": round(times[i], 3)} for i in range(n)], "match_pct": round(match_pct, 1)}
json.dump(out, open('word_times.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print("wrote word_times.json")
