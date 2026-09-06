import json, re

GUION = open('guion-short.txt', encoding='utf-8').read().strip()
words = re.findall(r"\S+", GUION)
wt = json.load(open('word_times.json', encoding='utf-8'))['words']
times = [w['t'] for w in wt]
assert len(times) == len(words)

TOTAL = 62.35

ranges = [
    (0, 8, '01.jpg', 'GANCHO', 'Dormitorio del orfanato'),
    (9, 18, '02.jpg', 'GANCHO', 'La mujer con la libreta'),
    (19, 25, '03.jpg', 'REVELACION', 'Gesto frío y calculado'),
    (26, 33, '04.jpg', 'DATOS', 'Orfanato de los años treinta'),
    (34, 42, '05.jpg', 'DATOS', 'Grupo de niños del orfanato'),
    (43, 49, '06.jpg', 'EXPERIMENTO', 'Elogio cálido'),
    (50, 58, '07.jpg', 'EXPERIMENTO', 'Reprimenda con el dedo'),
    (59, 64, '08.jpg', 'EXPERIMENTO', 'Manos tensas del niño'),
    (65, 71, '09.jpg', 'JOHNSON', 'Retrato de Johnson'),
    (72, 79, '10.jpg', 'JOHNSON', 'Johnson mirando por la ventana'),
    (80, 88, '11.jpg', 'JOHNSON', 'Johnson junto a la ventana'),
    (89, 92, '12.jpg', 'ENCUBRIMIENTO', 'Cerrando el cajón'),
    (93, 98, '13.jpg', 'ENCUBRIMIENTO', 'Mirando el cajón cerrado'),
    (99, 106, '14.jpg', 'ENCUBRIMIENTO', 'Archivador polvoriento'),
    (107, 117, '15.jpg', 'DESCUBRIMIENTO', 'Periodista revisando archivos'),
    (118, 121, '16.jpg', 'CONSECUENCIAS', 'Manos temblando'),
    (122, 128, '17.jpg', 'CONSECUENCIAS', 'Taza derramándose'),
    (129, 134, '18.jpg', 'CONSECUENCIAS', 'Documento oficial sellado'),
    (135, 144, '19.jpg', 'GIRO', 'Espejo en sala vacía'),
    (145, 150, '20.jpg', 'GIRO', 'Modelo de cerebro'),
    (151, 158, '21.jpg', 'GIRO', 'Silla infantil volcada'),
    (159, 167, '22.jpg', 'CONEXION', 'Aula moderna'),
    (168, 175, '23.jpg', 'CONEXION', 'Oficina moderna'),
    (176, 181, '24.jpg', 'CIERRE', 'Cierre del canal'),
]

n = len(words)
def boundary(a, b):
    return (times[a] + times[b]) / 2

segments = []
for idx, (lo, hi, img, block, cue) in enumerate(ranges):
    t_start = 0.0 if lo == 0 else boundary(lo - 1, lo)
    t_end = TOTAL if hi == n - 1 else boundary(hi, hi + 1)
    segments.append({
        "id": idx + 1,
        "block": block,
        "cue": cue,
        "text": " ".join(words[lo:hi + 1]),
        "t_start": round(t_start, 3),
        "t_end": round(t_end, 3),
        "imagen": img,
    })

# sanity: concatenation matches guion-short.txt exactly
concat = " ".join(s["text"] for s in segments)
assert concat == " ".join(words), "MISMATCH:\n" + concat + "\n---\n" + " ".join(words)

for s in segments:
    dur = s["t_end"] - s["t_start"]
    print(s["id"], s["imagen"], f"{s['t_start']:.2f}-{s['t_end']:.2f}", f"({dur:.2f}s)", s["text"][:50])

json.dump(segments, open('segments.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print("\nwrote segments.json —", len(segments), "planos, total", segments[-1]["t_end"], "s")
