# -*- coding: utf-8 -*-
"""Busca vídeos que revientan en el nicho y guarda cómo empiezan.

La idea: un canal pequeño con muchas vistas ha ganado por el contenido, no
por la audiencia que ya tenía. Esos son los que enseñan algo. Se mide con
vistas dividido entre suscriptores, que es la señal de que un vídeo salió
del canal y lo empujó el algoritmo.

De cada ganador se guardan los primeros veinte segundos de la transcripción,
que es donde vive el gancho y donde se decide si el espectador se queda.

Hace falta yt-dlp y salida a internet, así que esto corre en un runner de
GitHub, no en el entorno de Claude.
"""
import json
import os
import re
import subprocess
import sys
from pathlib import Path

# Lo que compite con Historia Incómoda. Conviene mezclar el tema (historia,
# casos reales) con el formato (documental narrado, psicología).
BUSQUEDAS = [
    "historia oscura documental español",
    "casos reales que parecen inventados",
    "experimento psicologico perturbador",
    "la historia que no te contaron",
    "el caso mas perturbador de la historia",
    "documental historia narrada español",
    "misterios historicos sin resolver",
    "psicologia oscura comportamiento humano",
]

POR_BUSQUEDA = 25
SEGUNDOS_GANCHO = 20.0

# Un vídeo interesa si superó a su propio canal. Por debajo de esto, lo más
# probable es que solo lo vieran los suscriptores de siempre.
RATIO_MIN = 3.0
VISTAS_MIN = 50_000
SUBS_MAX = 200_000


def buscar(consulta: str) -> list:
    """Metadatos de los resultados, sin descargar vídeo."""
    cmd = [
        "yt-dlp",
        f"ytsearch{POR_BUSQUEDA}:{consulta}",
        "--flat-playlist", "--skip-download",
        "--dump-json", "--ignore-errors", "--no-warnings",
    ]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    salida = []
    for linea in r.stdout.splitlines():
        try:
            salida.append(json.loads(linea))
        except json.JSONDecodeError:
            continue
    return salida


# YouTube bloquea el cliente web desde IP de centros de datos, que es lo que
# es un runner. Pedir el cliente de televisor suele esquivarlo.
CLIENTES = ["--extractor-args", "youtube:player_client=tv,web_safari,android"]


def detalles(video_id: str, ruidoso: bool = False) -> dict:
    """La búsqueda plana no trae suscriptores; hay que pedir el vídeo."""
    cmd = [
        "yt-dlp", f"https://www.youtube.com/watch?v={video_id}",
        "--skip-download", "--dump-json", "--no-warnings", *CLIENTES,
    ]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    try:
        return json.loads(r.stdout)
    except json.JSONDecodeError:
        if ruidoso:
            print(f"    [{video_id}] sin datos: "
                  f"{(r.stderr or 'sin stderr').strip()[:300]}")
        return {}


def subtitulos(video_id: str, carpeta: Path) -> str:
    """Baja los subtítulos en español, automáticos si no hay manuales."""
    cmd = [
        "yt-dlp", f"https://www.youtube.com/watch?v={video_id}",
        "--skip-download", "--write-subs", "--write-auto-subs",
        "--sub-langs", "es.*", "--sub-format", "vtt",
        "--convert-subs", "vtt", "--no-warnings", *CLIENTES,
        "-o", str(carpeta / "%(id)s.%(ext)s"),
    ]
    subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    for vtt in carpeta.glob(f"{video_id}*.vtt"):
        return vtt.read_text(encoding="utf-8", errors="ignore")
    return ""


def marca_a_segundos(m: str) -> float:
    h, mi, s = m.split(":")
    return int(h) * 3600 + int(mi) * 60 + float(s.replace(",", "."))


def gancho(vtt: str, tope: float = SEGUNDOS_GANCHO) -> str:
    """Texto hablado hasta el segundo `tope`, sin duplicados."""
    lineas, vistas = [], set()
    bloques = re.split(r"\n\n+", vtt)
    for b in bloques:
        m = re.search(r"(\d+:\d+:[\d.,]+)\s*-->", b)
        if not m or marca_a_segundos(m.group(1)) > tope:
            continue
        for linea in b.splitlines()[1:]:
            # Las etiquetas de tiempo palabra a palabra de los subtítulos
            # automáticos ensucian el texto.
            t = re.sub(r"<[^>]+>", "", linea).strip()
            if t and not t.startswith("WEBVTT") and t not in vistas:
                vistas.add(t)
                lineas.append(t)
    return " ".join(lineas)


def main():
    salida = Path(sys.argv[1] if len(sys.argv) > 1 else "ganchos")
    salida.mkdir(parents=True, exist_ok=True)
    tmp = salida / "subs"
    tmp.mkdir(exist_ok=True)

    candidatos, vistos = [], set()
    for consulta in BUSQUEDAS:
        print(f"\n=== {consulta} ===")
        for v in buscar(consulta):
            vid = v.get("id")
            vistas = v.get("view_count") or 0
            if not vid or vid in vistos or vistas < VISTAS_MIN:
                continue
            vistos.add(vid)
            candidatos.append({"id": vid, "titulo": v.get("title", ""),
                               "vistas": vistas, "busqueda": consulta})
        print(f"  {len(candidatos)} candidatos acumulados")

    print(f"\n{len(candidatos)} candidatos con más de {VISTAS_MIN} vistas\n")

    ganadores, sin_datos = [], 0
    for n, c in enumerate(sorted(candidatos, key=lambda x: -x["vistas"])[:60]):
        # Los primeros fallos se cuentan en voz alta: si YouTube está
        # bloqueando al runner, hay que verlo en el log y no achacarlo
        # a que el nicho no tenga ganadores.
        d = detalles(c["id"], ruidoso=(n < 3))
        if not d:
            sin_datos += 1
            continue
        subs = d.get("channel_follower_count") or 0
        if not subs or subs > SUBS_MAX:
            continue
        ratio = c["vistas"] / subs
        if ratio < RATIO_MIN:
            continue
        c.update({
            "canal": d.get("channel", ""),
            "suscriptores": subs,
            "ratio": round(ratio, 1),
            "duracion": d.get("duration"),
            "fecha": d.get("upload_date"),
        })
        vtt = subtitulos(c["id"], tmp)
        if not vtt:
            continue
        c["gancho"] = gancho(vtt)
        if len(c["gancho"]) < 40:
            continue
        ganadores.append(c)
        print(f"  x{c['ratio']:<6} {c['vistas']:>9,} vistas / "
              f"{subs:>8,} subs  {c['titulo'][:55]}")

    ganadores.sort(key=lambda x: -x["ratio"])
    (salida / "ganchos.json").write_text(
        json.dumps(ganadores, ensure_ascii=False, indent=2), encoding="utf-8")

    with open(salida / "ganchos.md", "w", encoding="utf-8") as f:
        f.write("# Cómo empiezan los vídeos que revientan en el nicho\n\n")
        f.write(f"{len(ganadores)} vídeos que superaron a su canal por "
                f"{RATIO_MIN}x o más.\n\n")
        for g in ganadores:
            f.write(f"## {g['titulo']}\n\n")
            f.write(f"- **{g['ratio']}x** su canal — {g['vistas']:,} vistas "
                    f"con {g['suscriptores']:,} suscriptores\n")
            f.write(f"- {g['canal']} · {g.get('duracion','?')} s · "
                    f"{g.get('fecha','?')}\n")
            f.write(f"- `youtube.com/watch?v={g['id']}`\n\n")
            f.write(f"> {g['gancho']}\n\n---\n\n")

    print(f"\n{len(ganadores)} ganadores guardados")
    if sin_datos:
        print(f"{sin_datos} vídeos sin datos: si son casi todos, "
              f"YouTube está bloqueando al runner, no es el nicho")


if __name__ == "__main__":
    main()
