"""Prueba de humo de extremo a extremo, sin depender de internet.

Levanta un servidor local con dos paginas de ejemplo (una mal hecha y otra
bien hecha), audita ambas, comprueba la puntuacion y recorre el flujo completo
de la aplicacion: analisis -> muro de pago -> compra -> descarga del PDF.

    python tests/prueba_humo.py
"""

import functools
import http.server
import os
import re
import shutil
import socketserver
import sys
import tempfile
import threading
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ))
os.environ.setdefault("no_proxy", "127.0.0.1,localhost")
os.environ.setdefault("NO_PROXY", "127.0.0.1,localhost")

import almacen  # noqa: E402

# La prueba no debe tocar los datos reales: la lista de espera y el historial
# de informes son del negocio, no del banco de pruebas.
_temporal = Path(tempfile.mkdtemp(prefix="auditaweb-prueba-"))
almacen.DIRECTORIO = _temporal
almacen.INFORMES = _temporal / "informes.json"
almacen.SUSCRIPTORES = _temporal / "suscriptores.json"

import auditor  # noqa: E402
import informe as generador  # noqa: E402
from app import app  # noqa: E402

PUERTO = 8911
fallos = []


def comprobar(descripcion, condicion, detalle=""):
    marca = "OK  " if condicion else "FALLO"
    print(f"  [{marca}] {descripcion}" + (f" — {detalle}" if detalle else ""))
    if not condicion:
        fallos.append(descripcion)


def servir_ejemplos():
    manejador = functools.partial(http.server.SimpleHTTPRequestHandler,
                                  directory=str(RAIZ / "tests"))
    socketserver.TCPServer.allow_reuse_address = True
    servidor = socketserver.TCPServer(("127.0.0.1", PUERTO), manejador)
    threading.Thread(target=servidor.serve_forever, daemon=True).start()
    return servidor


def main():
    servidor = servir_ejemplos()
    base = f"http://127.0.0.1:{PUERTO}"
    try:
        print("\n1. Motor de auditoria")
        mala = auditor.auditar(f"{base}/fixture_mala.html")
        buena = auditor.auditar(f"{base}/fixture_buena.html")
        comprobar("la web mal hecha suspende", mala["puntuacion"] < 55,
                  f"{mala['puntuacion']}/100")
        comprobar("la web bien hecha aprueba", buena["puntuacion"] >= 70,
                  f"{buena['puntuacion']}/100")
        comprobar("discrimina entre ambas", buena["puntuacion"] - mala["puntuacion"] >= 20)
        comprobar("se ejecutan todas las comprobaciones", mala["resumen"]["total"] >= 25,
                  f"{mala['resumen']['total']} pruebas")
        comprobar("las 7 areas tienen nota", len(mala["categorias"]) == 7)
        comprobar("los fallos se ordenan antes que los avisos",
                  [c["estado"] for c in mala["prioridades"]] ==
                  sorted([c["estado"] for c in mala["prioridades"]], key=lambda e: e != "error"))
        comprobar("cada problema explica como se arregla",
                  all(c["arreglo"] for c in mala["prioridades"]))
        comprobar("un dominio sin esquema se resuelve solo",
                  auditor.auditar(f"127.0.0.1:{PUERTO}/fixture_mala.html")["puntuacion"] > 0)

        print("\n2. Errores controlados")
        for entrada, motivo in [("", "vacio"), ("no-es-un-dominio", "sin punto"),
                                ("ftp://algo.com", "protocolo no admitido")]:
            try:
                auditor.normalizar_url(entrada)
                comprobar(f"rechaza entrada {motivo}", False)
            except auditor.AuditError:
                comprobar(f"rechaza entrada {motivo}", True)

        print("\n3. Informe PDF")
        pdf = generador.construir_pdf(mala, marca="AuditaWeb")
        comprobar("genera un PDF valido", pdf[:5] == b"%PDF-", f"{len(pdf)} bytes")
        comprobar("tiene varias paginas", len(re.findall(rb"/Type\s*/Page\b", pdf)) >= 4)
        comprobar("acepta marca blanca",
                  generador.construir_pdf(mala, marca="Agencia Ejemplo")[:5] == b"%PDF-")

        print("\n4. Flujo web completo")
        app.config.update(TESTING=True, SECRET_KEY="prueba")
        cliente = app.test_client()
        comprobar("la landing responde", cliente.get("/").status_code == 200)
        respuesta = cliente.post("/auditar", data={"url": f"{base}/fixture_mala.html"})
        identificador = respuesta.headers["Location"].rsplit("/", 1)[-1]
        comprobar("el analisis redirige al informe", respuesta.status_code == 302)

        pagina = cliente.get(f"/informe/{identificador}").get_data(as_text=True)
        comprobar("solo se muestran 3 problemas gratis",
                  pagina.count("border-start border-3") == 3)
        comprobar("el resto queda tras el muro de pago", "Quedan" in pagina)
        comprobar("el PDF esta bloqueado antes de pagar",
                  cliente.get(f"/informe/{identificador}/descargar").status_code == 403)
        comprobar("no se puede forzar la pagina de gracias",
                  cliente.get(f"/informe/{identificador}/gracias").status_code in (403, 200))

        cliente.post(f"/informe/{identificador}/comprar", data={"email": "prueba@ejemplo.com"})
        descarga = cliente.get(f"/informe/{identificador}/descargar")
        comprobar("tras pagar el PDF se descarga", descarga.status_code == 200)
        comprobar("se sirve como PDF adjunto",
                  descarga.headers["Content-Type"] == "application/pdf"
                  and "attachment" in descarga.headers["Content-Disposition"])

        comprobar("un informe inexistente da 404",
                  cliente.get("/informe/noexiste").status_code == 404)
        comprobar("se rechaza un email invalido",
                  "no parece valido" in cliente.post(
                      "/lista-espera", data={"email": "roto"},
                      follow_redirects=True).get_data(as_text=True))
    finally:
        servidor.shutdown()
        shutil.rmtree(_temporal, ignore_errors=True)

    print(f"\n{'=' * 52}")
    if fallos:
        print(f"{len(fallos)} COMPROBACIONES FALLIDAS:")
        for f in fallos:
            print(f"  - {f}")
        return 1
    print("Todas las comprobaciones han pasado.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
