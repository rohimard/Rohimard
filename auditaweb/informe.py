"""Generacion del informe PDF con ReportLab.

Recibe el diccionario que devuelve auditor.auditar() y produce un PDF de varias
paginas: portada con la puntuacion, plan de accion priorizado y el detalle
completo de las comprobaciones, agrupado por categoria.
"""

from __future__ import annotations

import io
from datetime import datetime
from xml.sax.saxutils import escape as _escapar_xml

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, Flowable, Frame, KeepTogether, PageBreak, PageTemplate,
    Paragraph, Spacer, Table, TableStyle,
)

TINTA = colors.HexColor("#0F172A")
GRIS = colors.HexColor("#64748B")
LINEA = colors.HexColor("#E2E8F0")
MARCA = colors.HexColor("#4F46E5")
VERDE = colors.HexColor("#16A34A")
AMBAR = colors.HexColor("#D97706")
ROJO = colors.HexColor("#DC2626")

COLOR_ESTADO = {"ok": VERDE, "aviso": AMBAR, "error": ROJO, "info": GRIS}
ETIQUETA_ESTADO = {"ok": "CORRECTO", "aviso": "MEJORABLE", "error": "FALLO", "info": "INFO"}

ANCHO_UTIL = A4[0] - 40 * mm


def t(valor) -> str:
    """Escapa texto para el mini-HTML de ReportLab.

    Los textos de las comprobaciones incluyen fragmentos de codigo real
    (<img alt="...">, <meta ...>) que el parser de Paragraph intentaria
    interpretar como marcado y haria fallar el render.
    """
    return _escapar_xml(str(valor or ""))


def _color_puntuacion(valor: int):
    if valor >= 75:
        return VERDE
    if valor >= 50:
        return AMBAR
    return ROJO


def _estilos():
    base = getSampleStyleSheet()
    return {
        "h1": ParagraphStyle("h1", parent=base["Heading1"], fontName="Helvetica-Bold",
                             fontSize=20, leading=25, textColor=TINTA, spaceAfter=4),
        "h2": ParagraphStyle("h2", parent=base["Heading2"], fontName="Helvetica-Bold",
                             fontSize=13, leading=17, textColor=TINTA,
                             spaceBefore=14, spaceAfter=6),
        "cuerpo": ParagraphStyle("cuerpo", parent=base["BodyText"], fontName="Helvetica",
                                 fontSize=9.5, leading=13.5, textColor=TINTA, alignment=TA_LEFT),
        "tenue": ParagraphStyle("tenue", parent=base["BodyText"], fontName="Helvetica",
                                fontSize=8.5, leading=12, textColor=GRIS),
        "celda": ParagraphStyle("celda", parent=base["BodyText"], fontName="Helvetica",
                                fontSize=8.5, leading=11.5, textColor=TINTA),
        "celda_bold": ParagraphStyle("celda_bold", parent=base["BodyText"],
                                     fontName="Helvetica-Bold", fontSize=8.5,
                                     leading=11.5, textColor=TINTA),
        "portada_titulo": ParagraphStyle("pt", parent=base["Heading1"], fontName="Helvetica-Bold",
                                         fontSize=26, leading=31, textColor=TINTA,
                                         alignment=TA_CENTER),
        "portada_sub": ParagraphStyle("ps", parent=base["BodyText"], fontName="Helvetica",
                                      fontSize=11, leading=16, textColor=GRIS,
                                      alignment=TA_CENTER),
    }


class Medidor(Flowable):
    """Circulo con la puntuacion global."""

    def __init__(self, puntuacion: int, nivel: str, radio: float = 34 * mm):
        super().__init__()
        self.puntuacion = puntuacion
        self.nivel = nivel
        self.radio = radio
        self.width = ANCHO_UTIL
        self.height = radio * 2 + 10 * mm

    def draw(self):
        c = self.canv
        cx, cy, r = self.width / 2, self.radio + 8 * mm, self.radio
        color = _color_puntuacion(self.puntuacion)

        c.setStrokeColor(LINEA)
        c.setLineWidth(9)
        c.circle(cx, cy, r, stroke=1, fill=0)

        c.setStrokeColor(color)
        c.setLineWidth(9)
        extension = -359.9 * (max(0, min(100, self.puntuacion)) / 100.0)
        if extension:
            camino = c.beginPath()
            camino.arc(cx - r, cy - r, cx + r, cy + r, 90, extension)
            c.drawPath(camino, stroke=1, fill=0)

        c.setFillColor(color)
        c.setFont("Helvetica-Bold", 46)
        c.drawCentredString(cx, cy - 6, str(self.puntuacion))
        c.setFillColor(GRIS)
        c.setFont("Helvetica", 10)
        c.drawCentredString(cx, cy - 22, "sobre 100")
        c.setFillColor(color)
        c.setFont("Helvetica-Bold", 13)
        c.drawCentredString(cx, 0, self.nivel.upper())


class BarraCategoria(Flowable):
    """Barra horizontal con el porcentaje de una categoria."""

    def __init__(self, etiqueta: str, valor: int, ancho: float = ANCHO_UTIL):
        super().__init__()
        self.etiqueta, self.valor, self.width, self.height = etiqueta, valor, ancho, 15 * mm

    def draw(self):
        c = self.canv
        x_barra, ancho_barra = 62 * mm, self.width - 62 * mm - 14 * mm
        c.setFillColor(TINTA)
        c.setFont("Helvetica", 9)
        c.drawString(0, 4, self.etiqueta)

        c.setFillColor(LINEA)
        c.roundRect(x_barra, 2, ancho_barra, 8, 4, stroke=0, fill=1)
        util = ancho_barra * max(0, min(100, self.valor)) / 100.0
        if util > 1:
            c.setFillColor(_color_puntuacion(self.valor))
            c.roundRect(x_barra, 2, max(util, 8), 8, 4, stroke=0, fill=1)

        c.setFillColor(_color_puntuacion(self.valor))
        c.setFont("Helvetica-Bold", 9)
        c.drawRightString(self.width, 4, f"{self.valor}%")


def _pie(marca: str):
    def dibujar(canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(LINEA)
        canvas.setLineWidth(0.5)
        canvas.line(20 * mm, 15 * mm, A4[0] - 20 * mm, 15 * mm)
        canvas.setFillColor(GRIS)
        canvas.setFont("Helvetica", 7.5)
        canvas.drawString(20 * mm, 10 * mm, marca)
        canvas.drawRightString(A4[0] - 20 * mm, 10 * mm, f"Pagina {doc.page}")
        canvas.restoreState()
    return dibujar


def _tabla_prioridades(prioridades, e):
    filas = [[
        Paragraph("<b>#</b>", e["celda"]),
        Paragraph("<b>Problema</b>", e["celda"]),
        Paragraph("<b>Por que importa</b>", e["celda"]),
        Paragraph("<b>Como se arregla</b>", e["celda"]),
    ]]
    estilo = [
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
        ("GRID", (0, 0), (-1, -1), 0.4, LINEA),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    for indice, check in enumerate(prioridades, start=1):
        filas.append([
            Paragraph(str(indice), e["celda_bold"]),
            Paragraph(t(check["titulo"]), e["celda_bold"]),
            Paragraph(t(check["detalle"]), e["celda"]),
            Paragraph(t(check["arreglo"]) or "-", e["celda"]),
        ])
        color = COLOR_ESTADO.get(check["estado"], GRIS)
        estilo.append(("TEXTCOLOR", (0, indice), (0, indice), color))
        estilo.append(("BACKGROUND", (0, indice), (0, indice),
                       colors.HexColor("#FEF2F2") if check["estado"] == "error"
                       else colors.HexColor("#FFFBEB")))
    tabla = Table(filas, colWidths=[9 * mm, 34 * mm, 66 * mm, 61 * mm], repeatRows=1)
    tabla.setStyle(TableStyle(estilo))
    return tabla


def _tabla_categoria(checks, e):
    filas = [[
        Paragraph("<b>Estado</b>", e["celda"]),
        Paragraph("<b>Comprobacion</b>", e["celda"]),
        Paragraph("<b>Resultado</b>", e["celda"]),
    ]]
    estilo = [
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F8FAFC")),
        ("GRID", (0, 0), (-1, -1), 0.4, LINEA),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]
    for indice, check in enumerate(checks, start=1):
        color = COLOR_ESTADO.get(check["estado"], GRIS)
        texto = t(check["detalle"])
        if check["arreglo"]:
            texto += f'<br/><font color="#4F46E5"><b>Solucion:</b> {t(check["arreglo"])}</font>'
        filas.append([
            Paragraph(f'<b>{ETIQUETA_ESTADO.get(check["estado"], "-")}</b>', e["celda"]),
            Paragraph(t(check["titulo"]), e["celda_bold"]),
            Paragraph(texto, e["celda"]),
        ])
        estilo.append(("TEXTCOLOR", (0, indice), (0, indice), color))
    tabla = Table(filas, colWidths=[22 * mm, 38 * mm, 110 * mm], repeatRows=1)
    tabla.setStyle(TableStyle(estilo))
    return tabla


def construir_pdf(datos: dict, marca: str = "AuditaWeb") -> bytes:
    """Devuelve los bytes del informe PDF completo."""
    e = _estilos()
    buffer = io.BytesIO()
    doc = BaseDocTemplate(
        buffer, pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm,
        topMargin=18 * mm, bottomMargin=22 * mm,
        title=f"Auditoria SEO — {datos['dominio']}",
        author=marca, subject="Informe de auditoria SEO tecnica",
    )
    marco = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="principal")
    pie = f"{marca} · Informe generado el {_fecha(datos['fecha'])} · {datos['dominio']}"
    doc.addPageTemplates([PageTemplate(id="normal", frames=[marco], onPage=_pie(pie))])

    h = []
    # ---------------------------------------------------------------- portada
    h.append(Spacer(1, 6 * mm))
    h.append(Paragraph(t(marca).upper(), ParagraphStyle(
        "marca", fontName="Helvetica-Bold", fontSize=10, textColor=MARCA,
        alignment=TA_CENTER, spaceAfter=14)))
    h.append(Paragraph("Auditoria SEO tecnica", e["portada_titulo"]))
    h.append(Paragraph(t(datos["dominio"]), ParagraphStyle(
        "dom", parent=e["portada_sub"], fontSize=13, textColor=TINTA, spaceBefore=4)))
    h.append(Paragraph(_fecha(datos["fecha"]), e["portada_sub"]))
    h.append(Spacer(1, 8 * mm))
    h.append(Medidor(datos["puntuacion"], datos["nivel"]))
    h.append(Spacer(1, 6 * mm))

    r = datos["resumen"]
    resumen = Table(
        [[f"{r['correctos']}", f"{r['avisos']}", f"{r['errores']}", f"{r['total']}"],
         ["Correctos", "Mejorables", "Fallos", "Comprobaciones"]],
        colWidths=[ANCHO_UTIL / 4.0] * 4,
    )
    resumen.setStyle(TableStyle([
        ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 22),
        ("FONT", (0, 1), (-1, 1), "Helvetica", 8.5),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("TEXTCOLOR", (0, 0), (0, 0), VERDE),
        ("TEXTCOLOR", (1, 0), (1, 0), AMBAR),
        ("TEXTCOLOR", (2, 0), (2, 0), ROJO),
        ("TEXTCOLOR", (3, 0), (3, 0), TINTA),
        ("TEXTCOLOR", (0, 1), (-1, 1), GRIS),
        ("TOPPADDING", (0, 1), (-1, 1), 0),
        ("LINEABOVE", (0, 0), (-1, 0), 0.5, LINEA),
        ("LINEBELOW", (0, 1), (-1, 1), 0.5, LINEA),
        ("TOPPADDING", (0, 0), (-1, 0), 8),
        ("BOTTOMPADDING", (0, 1), (-1, 1), 8),
    ]))
    h.append(resumen)
    h.append(Spacer(1, 8 * mm))
    h.append(Paragraph(
        f"Analisis de <b>{datos['resumen']['total']} comprobaciones tecnicas</b> sobre "
        f"<b>{t(datos['url_final'])}</b>. El servidor respondio en {datos['ms']} ms. "
        "Las paginas siguientes contienen el plan de accion ordenado por impacto y el "
        "detalle de cada comprobacion.", e["cuerpo"]))
    h.append(PageBreak())

    # --------------------------------------------------- puntuacion por area
    h.append(Paragraph("Puntuacion por area", e["h1"]))
    h.append(Paragraph("Cada area pondera segun el impacto real de sus comprobaciones "
                       "en el posicionamiento.", e["tenue"]))
    h.append(Spacer(1, 5 * mm))
    for nombre, datos_cat in datos["categorias"].items():
        h.append(BarraCategoria(nombre, datos_cat["puntuacion"]))

    # ------------------------------------------------------- plan de accion
    h.append(Spacer(1, 6 * mm))
    h.append(Paragraph("Plan de accion priorizado", e["h1"]))
    if datos["prioridades"]:
        h.append(Paragraph(
            f"{len(datos['prioridades'])} puntos a corregir, del mayor al menor impacto. "
            "Resolviendo los primeros se recupera la mayor parte de la puntuacion perdida.",
            e["tenue"]))
        h.append(Spacer(1, 4 * mm))
        h.append(_tabla_prioridades(datos["prioridades"], e))
    else:
        h.append(Paragraph("No se ha detectado ningun problema. La pagina supera las "
                           f"{datos['resumen']['total']} comprobaciones.", e["cuerpo"]))

    # ------------------------------------------------------ detalle completo
    h.append(PageBreak())
    h.append(Paragraph("Detalle de las comprobaciones", e["h1"]))
    h.append(Paragraph("Resultado literal de cada prueba, agrupado por area.", e["tenue"]))
    for nombre in datos["categorias"]:
        propios = [c for c in datos["checks"] if c["categoria"] == nombre]
        if not propios:
            continue
        h.append(KeepTogether([
            Paragraph(f"{t(nombre)} · {datos['categorias'][nombre]['puntuacion']}%", e["h2"]),
            _tabla_categoria(propios, e),
        ]))

    h.append(Spacer(1, 10 * mm))
    h.append(Paragraph(
        f"Informe generado automaticamente por {t(marca)}. Las recomendaciones se basan en "
        "las guias publicas de Google Search Central y en las metricas de Core Web Vitals.",
        e["tenue"]))

    doc.build(h)
    return buffer.getvalue()


def _fecha(iso: str) -> str:
    try:
        return datetime.fromisoformat(iso).strftime("%d/%m/%Y a las %H:%M UTC")
    except (ValueError, TypeError):
        return iso
