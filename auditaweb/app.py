"""AuditaWeb — auditoria SEO tecnica con informe PDF de pago.

Arranca sin configurar nada:

    python app.py

Sin STRIPE_SECRET_KEY la aplicacion corre en MODO DEMO: el boton de compra
desbloquea el informe al instante para que puedas probar el flujo completo.
Al definir las claves de Stripe (modo test o produccion) el mismo boton pasa
por Stripe Checkout de verdad.
"""

from __future__ import annotations

import io
import os
import re
import secrets

from flask import (
    Flask, abort, flash, jsonify, redirect, render_template, request,
    send_file, session, url_for,
)

import almacen
from auditor import AuditError, auditar
from informe import construir_pdf

try:  # opcional: solo hace falta si se configura .env
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:  # pragma: no cover
    pass

try:
    import stripe
except ImportError:  # pragma: no cover
    stripe = None

# ------------------------------------------------------------ configuracion

MARCA = os.environ.get("MARCA", "AuditaWeb")
PRECIO_CENTIMOS = int(os.environ.get("PRECIO_CENTIMOS", "2900"))
MONEDA = os.environ.get("MONEDA", "eur")
CLAVE_STRIPE = os.environ.get("STRIPE_SECRET_KEY", "").strip()
CLAVE_PUBLICA_STRIPE = os.environ.get("STRIPE_PUBLISHABLE_KEY", "").strip()
MODO_DEMO = not (CLAVE_STRIPE and stripe is not None)

if not MODO_DEMO:
    stripe.api_key = CLAVE_STRIPE

app = Flask(__name__)
app.config.update(
    SECRET_KEY=os.environ.get("SECRET_KEY") or secrets.token_hex(32),
    MAX_CONTENT_LENGTH=64 * 1024,
)

PATRON_EMAIL = re.compile(r"^[^@\s]+@[^@\s.]+\.[a-z]{2,}$", re.I)


@app.context_processor
def variables_globales():
    return {
        "marca": MARCA,
        "precio": f"{PRECIO_CENTIMOS / 100:.0f}",
        "moneda_simbolo": "€" if MONEDA == "eur" else MONEDA.upper(),
        "modo_demo": MODO_DEMO,
        "suscriptores": almacen.contar_suscriptores(),
    }


def _base_url() -> str:
    return (os.environ.get("APP_BASE_URL") or request.url_root).rstrip("/")


# -------------------------------------------------------------------- rutas

@app.get("/")
def inicio():
    return render_template("index.html")


@app.post("/auditar")
def crear_auditoria():
    url = (request.form.get("url") or "").strip()
    try:
        datos = auditar(url)
    except AuditError as error:
        flash(str(error), "error")
        return redirect(url_for("inicio", _anchor="analizar"))

    identificador = secrets.token_urlsafe(9)
    almacen.guardar_informe(identificador, datos)
    session["ultimo_informe"] = identificador
    return redirect(url_for("ver_informe", identificador=identificador))


@app.get("/informe/<identificador>")
def ver_informe(identificador: str):
    registro = almacen.obtener_informe(identificador)
    if registro is None:
        abort(404)
    auditoria = registro["auditoria"]
    prioridades = auditoria["prioridades"]
    return render_template(
        "informe.html",
        identificador=identificador,
        registro=registro,
        a=auditoria,
        visibles=prioridades[:3],
        bloqueados=max(0, len(prioridades) - 3),
    )


@app.post("/informe/<identificador>/comprar")
def comprar(identificador: str):
    registro = almacen.obtener_informe(identificador)
    if registro is None:
        abort(404)
    if registro["pagado"]:
        return redirect(url_for("gracias", identificador=identificador))

    email = (request.form.get("email") or "").strip()
    if email and PATRON_EMAIL.match(email):
        almacen.guardar_suscriptor(email, origen="checkout",
                                   extra={"dominio": registro["auditoria"]["dominio"]})

    if MODO_DEMO:
        almacen.marcar_pagado(identificador, sesion_stripe="demo", email=email or None)
        flash("Modo demo: pago simulado. Configura STRIPE_SECRET_KEY para cobrar de verdad.",
              "info")
        return redirect(url_for("gracias", identificador=identificador))

    base = _base_url()
    try:
        sesion = stripe.checkout.Session.create(
            mode="payment",
            line_items=[{
                "quantity": 1,
                "price_data": {
                    "currency": MONEDA,
                    "unit_amount": PRECIO_CENTIMOS,
                    "product_data": {
                        "name": f"Informe SEO completo — {registro['auditoria']['dominio']}",
                        "description": (
                            f"{registro['auditoria']['resumen']['total']} comprobaciones "
                            "tecnicas con plan de accion priorizado en PDF."
                        ),
                    },
                },
            }],
            customer_email=email or None,
            success_url=f"{base}/informe/{identificador}/gracias?sesion={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{base}/informe/{identificador}?cancelado=1",
            metadata={"informe": identificador,
                      "dominio": registro["auditoria"]["dominio"]},
        )
    except Exception as error:  # noqa: BLE001 — cualquier fallo de Stripe
        app.logger.exception("Stripe Checkout fallo")
        flash(f"No se pudo abrir la pasarela de pago: {error}", "error")
        return redirect(url_for("ver_informe", identificador=identificador))

    return redirect(sesion.url, code=303)


@app.get("/informe/<identificador>/gracias")
def gracias(identificador: str):
    registro = almacen.obtener_informe(identificador)
    if registro is None:
        abort(404)

    if not registro["pagado"]:
        id_sesion = request.args.get("sesion", "")
        if MODO_DEMO or not id_sesion:
            abort(403)
        try:
            sesion = stripe.checkout.Session.retrieve(id_sesion)
        except Exception:  # noqa: BLE001
            app.logger.exception("No se pudo verificar la sesion de Stripe")
            abort(403)
        # Se confia en Stripe, nunca en el parametro de la URL.
        if sesion.get("payment_status") != "paid" or \
                (sesion.get("metadata") or {}).get("informe") != identificador:
            abort(403)
        registro = almacen.marcar_pagado(
            identificador, sesion_stripe=id_sesion,
            email=(sesion.get("customer_details") or {}).get("email"),
        )

    return render_template("gracias.html", identificador=identificador,
                           registro=registro, a=registro["auditoria"])


@app.get("/informe/<identificador>/descargar")
def descargar(identificador: str):
    registro = almacen.obtener_informe(identificador)
    if registro is None:
        abort(404)
    if not registro["pagado"]:
        abort(403)
    pdf = construir_pdf(registro["auditoria"], marca=MARCA)
    dominio = re.sub(r"[^a-z0-9.-]+", "-", registro["auditoria"]["dominio"].lower())
    return send_file(
        io.BytesIO(pdf),
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"auditoria-seo-{dominio}.pdf",
    )


@app.post("/lista-espera")
def lista_espera():
    email = (request.form.get("email") or "").strip()
    if not PATRON_EMAIL.match(email):
        flash("Ese correo no parece valido. Revisalo e intentalo otra vez.", "error")
        return redirect(url_for("inicio", _anchor="lista"))
    nuevo, total = almacen.guardar_suscriptor(
        email, origen=request.form.get("origen", "landing"))
    flash("Ya estas en la lista. Te avisamos cuando abramos el plan Agencia."
          if nuevo else "Ese correo ya estaba apuntado.", "exito")
    app.logger.info("Suscriptor %s (total %s)", "nuevo" if nuevo else "repetido", total)
    return redirect(url_for("inicio", _anchor="lista"))


@app.get("/salud")
def salud():
    return jsonify(estado="ok", modo="demo" if MODO_DEMO else "stripe",
                   suscriptores=almacen.contar_suscriptores())


@app.errorhandler(403)
def error_403(_):
    return render_template("error.html", codigo=403,
                           titulo="Este informe todavia no esta desbloqueado",
                           mensaje="Completa el pago para acceder al PDF completo."), 403


@app.errorhandler(404)
def error_404(_):
    return render_template("error.html", codigo=404,
                           titulo="No encontramos esta pagina",
                           mensaje="El informe puede haber caducado. Lanza un analisis nuevo."), 404


@app.errorhandler(500)
def error_500(_):
    return render_template("error.html", codigo=500,
                           titulo="Algo se ha roto por nuestra parte",
                           mensaje="Vuelve a intentarlo en unos segundos."), 500


if __name__ == "__main__":
    puerto = int(os.environ.get("PORT", "5000"))
    print(f"\n  {MARCA} escuchando en http://127.0.0.1:{puerto}")
    print(f"  Pagos: {'MODO DEMO (sin Stripe)' if MODO_DEMO else 'Stripe activo'}\n")
    app.run(host="0.0.0.0", port=puerto, debug=os.environ.get("DEBUG") == "1")
