"""Audita una lista de dominios de golpe: saca a quien escribir y que publicar.

Es la herramienta que alimenta el plan de promocion (ver ../PROMOCION.md):

  - Un CSV de prospectos ordenado de peor a mejor: a los de arriba les escribes.
  - Un resumen con los datos agregados del nicho: es el contenido del post.

Uso:

    python prospectar.py nichos/dentistas.txt
    python prospectar.py nichos/dentistas.txt --nicho "clinicas dentales de Valencia"

El fichero de entrada lleva un dominio por linea. Las lineas vacias y las que
empiezan por # se ignoran.
"""

from __future__ import annotations

import argparse
import csv
import sys
import time
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from auditor import AuditError, auditar

# Ni muy agresivo (nos bloquearian) ni tan lento que aburra.
HILOS = 4

# Por debajo de esta nota la web tiene problemas visibles que ensenar.
UMBRAL_CONTACTO = 55


def leer_dominios(ruta: Path) -> list[str]:
    if not ruta.exists():
        sys.exit(f"No encuentro el fichero '{ruta}'. Crea uno con un dominio por linea.")
    dominios = []
    for linea in ruta.read_text(encoding="utf-8").splitlines():
        limpia = linea.strip()
        if limpia and not limpia.startswith("#"):
            dominios.append(limpia)
    if not dominios:
        sys.exit(f"'{ruta}' no tiene ningun dominio.")
    return dominios


def auditar_uno(dominio: str) -> dict:
    inicio = time.perf_counter()
    try:
        datos = auditar(dominio)
        return {"dominio": dominio, "ok": True, "datos": datos,
                "segundos": round(time.perf_counter() - inicio, 1)}
    except AuditError as error:
        return {"dominio": dominio, "ok": False, "motivo": str(error),
                "segundos": round(time.perf_counter() - inicio, 1)}
    except Exception as error:  # noqa: BLE001 — un fallo raro no debe parar el lote
        return {"dominio": dominio, "ok": False, "motivo": f"error inesperado: {error}",
                "segundos": round(time.perf_counter() - inicio, 1)}


def escribir_csv(resultados: list[dict], ruta: Path) -> None:
    validos = sorted([r for r in resultados if r["ok"]],
                     key=lambda r: r["datos"]["puntuacion"])
    with ruta.open("w", newline="", encoding="utf-8") as fichero:
        escritor = csv.writer(fichero)
        escritor.writerow([
            "dominio", "puntuacion", "nivel", "fallos", "mejorables",
            "problema_1", "problema_2", "problema_3", "url_analizada",
        ])
        for r in validos:
            d = r["datos"]
            top = [c["titulo"] for c in d["prioridades"][:3]]
            top += [""] * (3 - len(top))
            escritor.writerow([
                d["dominio"], d["puntuacion"], d["nivel"],
                d["resumen"]["errores"], d["resumen"]["avisos"],
                *top, d["url_final"],
            ])


def escribir_resumen(resultados: list[dict], ruta: Path, nicho: str) -> str:
    validos = [r for r in resultados if r["ok"]]
    fallidos = [r for r in resultados if not r["ok"]]
    if not validos:
        sys.exit("Ninguna web se pudo analizar. Revisa la lista de dominios.")

    puntuaciones = [r["datos"]["puntuacion"] for r in validos]
    media = sum(puntuaciones) / len(puntuaciones)
    ordenadas = sorted(puntuaciones)
    mitad = len(ordenadas) // 2
    mediana = (ordenadas[mitad] if len(ordenadas) % 2
               else (ordenadas[mitad - 1] + ordenadas[mitad]) / 2)

    # Cuantas webs fallan cada comprobacion concreta: esto es el titular del post.
    fallan = Counter()
    titulos = {}
    for r in validos:
        for check in r["datos"]["checks"]:
            titulos[check["id"]] = check["titulo"]
            if check["estado"] == "error":
                fallan[check["id"]] += 1

    lineas = []
    a = lineas.append
    a(f"ESTUDIO DE NICHO: {nicho}")
    a("=" * 60)
    a(f"Webs analizadas con exito : {len(validos)}")
    if fallidos:
        a(f"No se pudieron analizar   : {len(fallidos)}")
    a(f"Puntuacion media          : {media:.0f}/100")
    a(f"Puntuacion mediana        : {mediana:.0f}/100")
    a(f"Suspenden (por debajo de 55): {sum(1 for p in puntuaciones if p < 55)}"
      f" de {len(validos)} ({sum(1 for p in puntuaciones if p < 55) / len(validos) * 100:.0f}%)")
    a("")
    a("DATOS PARA EL POST — porcentaje de webs que FALLA cada punto:")
    a("-" * 60)
    for id_check, cuantas in fallan.most_common(10):
        porcentaje = cuantas / len(validos) * 100
        a(f"  {porcentaje:5.0f}%  {titulos[id_check]}  ({cuantas} de {len(validos)})")
    a("")
    # Solo tiene sentido escribir a quien de verdad tiene un problema que ensenar:
    # ofrecerle una auditoria a una web que saca 80/100 es una venta debil.
    candidatos = sorted([r for r in validos if r["datos"]["puntuacion"] < UMBRAL_CONTACTO],
                        key=lambda r: r["datos"]["puntuacion"])[:5]
    a(f"A QUIEN ESCRIBIR PRIMERO — peores por debajo de {UMBRAL_CONTACTO}/100:")
    a("-" * 60)
    if candidatos:
        for r in candidatos:
            d = r["datos"]
            peor = d["prioridades"][0]["titulo"] if d["prioridades"] else "-"
            a(f"  {d['puntuacion']:3d}/100  {d['dominio']:<38} peor fallo: {peor}")
    else:
        a("  Ninguna suspende. Este nicho ya tiene los deberes hechos:")
        a("  busca otro sector o una ciudad mas pequena.")
    a("")
    a("LAS 3 MEJORES (utiles como ejemplo de 'asi se hace bien'):")
    a("-" * 60)
    for r in sorted(validos, key=lambda r: -r["datos"]["puntuacion"])[:3]:
        a(f"  {r['datos']['puntuacion']:3d}/100  {r['datos']['dominio']}")
    if fallidos:
        a("")
        a("NO ANALIZADAS (caidas, bloqueadas o mal escritas):")
        a("-" * 60)
        for r in fallidos:
            a(f"  {r['dominio']}: {r['motivo'][:70]}")

    texto = "\n".join(lineas)
    ruta.write_text(texto + "\n", encoding="utf-8")
    return texto


def main() -> int:
    analizador = argparse.ArgumentParser(
        description="Audita una lista de dominios y prepara el estudio de nicho.")
    analizador.add_argument("fichero", type=Path, help="fichero con un dominio por linea")
    analizador.add_argument("--nicho", default="", help="nombre del nicho para el informe")
    analizador.add_argument("--salida", type=Path, default=Path("estudio"),
                            help="prefijo de los ficheros de salida (por defecto: estudio)")
    args = analizador.parse_args()

    dominios = leer_dominios(args.fichero)
    nicho = args.nicho or args.fichero.stem.replace("_", " ").replace("-", " ")
    print(f"\nAnalizando {len(dominios)} webs de '{nicho}' con {HILOS} hilos...\n")

    resultados = []
    with ThreadPoolExecutor(max_workers=HILOS) as ejecutor:
        tareas = {ejecutor.submit(auditar_uno, d): d for d in dominios}
        for hecho, tarea in enumerate(as_completed(tareas), start=1):
            r = tarea.result()
            resultados.append(r)
            if r["ok"]:
                d = r["datos"]
                print(f"  [{hecho:3d}/{len(dominios)}] {d['puntuacion']:3d}/100  "
                      f"{d['dominio']}")
            else:
                print(f"  [{hecho:3d}/{len(dominios)}]   --   {r['dominio']}  "
                      f"({r['motivo'][:45]})")

    csv_ruta = args.salida.with_name(args.salida.name + "-prospectos.csv")
    txt_ruta = args.salida.with_name(args.salida.name + "-resumen.txt")
    escribir_csv(resultados, csv_ruta)
    resumen = escribir_resumen(resultados, txt_ruta, nicho)

    print("\n" + resumen)
    print(f"\nGuardado en:\n  {csv_ruta}  (lista de prospectos)\n"
          f"  {txt_ruta}  (datos para el post)\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
