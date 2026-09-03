# IDEAS.md — Análisis de 5 productos digitales y decisión

> Generado el 2026-09-03. Criterio de selección: **máximo retorno con mínimo
> esfuerzo en las próximas 2 horas**.

## 1. Análisis comparativo

| # | Idea | Nicho (quién paga) | Coste mensual | Tiempo a MVP | Precio potencial | Veredicto |
|---|------|--------------------|---------------|--------------|------------------|-----------|
| 1 | **Auditoría SEO técnica → informe PDF** | Agencias, freelancers web, negocios locales con web | **0 €** (Render free + `requests`; sin APIs de pago) | **1,5–2 h** | 19–39 € / informe · 49 €/mes ilimitado · 99 €/mes marca blanca | ✅ **GANADORA** |
| 2 | Generador de políticas legales (Privacidad/Cookies/Términos RGPD) | SaaS y ecommerce de la UE | 0 € (plantillas deterministas) | 2–3 h | 29–79 € pago único | Alta demanda, pero mercado saturado (Termly, iubenda) y responsabilidad legal |
| 3 | Extractor de facturas PDF → CSV/Excel con IA | Gestorías, autónomos, pymes | 40–150 € (OCR + LLM por página) | 4–6 h | 0,10 €/página · 49 €/mes | Gran valor B2B, pero coste variable y margen negativo si falla el parsing |
| 4 | Generador de propuestas comerciales / contratos | Freelancers y consultoras | 0–10 € | 3–4 h | 15–29 €/mes | Sólido, pero **canibaliza CotizaPro**, que ya está en este repo |
| 5 | Pack de prompts + plantillas en PDF (Gumroad) | Creadores, marketers | 0 € | 30 min | 9–19 € pago único | Se construye rapidísimo, pero sin foso: precio a la baja y cero recurrencia |

### Cómo se puntuó

| Criterio (peso) | #1 | #2 | #3 | #4 | #5 |
|---|---|---|---|---|---|
| Coste marginal por venta (25 %) | 10 | 10 | 3 | 9 | 10 |
| Velocidad a un MVP vendible (25 %) | 9 | 7 | 4 | 6 | 10 |
| Disposición a pagar B2B (25 %) | 9 | 8 | 10 | 7 | 3 |
| Distribución / gancho viral (15 %) | 9 | 5 | 5 | 5 | 6 |
| Defensibilidad y recurrencia (10 %) | 7 | 5 | 8 | 7 | 2 |
| **Total ponderado** | **8,95** | **7,45** | **5,90** | **6,90** | **6,75** |

## 2. La ganadora: **AuditaWeb** — auditoría SEO técnica en 30 segundos

Un servicio web donde pegas una URL y en menos de un minuto obtienes una
puntuación 0–100 sobre **30 comprobaciones técnicas reales** (metadatos,
encabezados, imágenes, Open Graph, datos estructurados, rendimiento,
indexación y seguridad) y un **informe PDF con el plan de acción priorizado**.

### Por qué gana bajo el criterio "máximo retorno / mínimo esfuerzo en 2 h"

1. **Coste marginal cero.** Todo el análisis es `requests` + `BeautifulSoup`
   sobre HTML público. Sin tokens de IA, sin OCR, sin base de datos gestionada.
   Cada venta es margen casi puro y el free tier de Render lo aguanta.
2. **El valor se demuestra antes de pagar.** El gancho freemium es natural:
   la puntuación y los 3 primeros fallos se ven **gratis** en pantalla; el
   informe completo (los 30 checks, el detalle y el cómo se arregla) va detrás
   del pago. El usuario ya ha visto que su web tiene problemas reales.
3. **Motor de conversión propio.** El resultado es una cifra concreta
   ("tu web saca 54/100") que provoca urgencia sin tener que argumentar nada.
4. **B2B con presupuesto.** Una agencia que factura auditorías a sus clientes
   ahorra 2–3 horas por informe: el precio se justifica solo. La marca blanca
   (99 €/mes) es la vía de recurrencia obvia.
5. **Se construye en el plazo.** Es un único servicio Flask sin estado
   compartido: parseo + puntuación + render de PDF. Cero infraestructura.
6. **Cubre las dos rutas del encargo a la vez:** es un servicio web con
   Stripe Checkout **y** genera un PDF dinámico como entregable.

### Modelo de precios

| Plan | Precio | Qué incluye |
|---|---|---|
| Escaneo | Gratis | Puntuación global + 3 problemas principales |
| Informe | **29 €** | PDF completo: 30 checks, impacto y solución paso a paso |
| Agencia | 99 €/mes | Informes ilimitados + marca blanca (logo del cliente) |

### Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| Comparación con Lighthouse/Ahrefs gratuitos | No competimos en datos: vendemos el **informe entregable al cliente final**, ya priorizado y en PDF con marca |
| Webs que bloquean el bot (403/Cloudflare) | Timeout corto, `User-Agent` real y mensaje de error accionable en vez de página en blanco |
| Precio único de 29 € no es recurrente | El plan Agencia con marca blanca es el objetivo real; el pago único es la puerta de entrada |

## 3. Descartadas: el porqué en una línea

- **#2 Legales:** el mercado ya está resuelto por incumbentes con respaldo jurídico.
- **#3 Facturas IA:** el único de la lista con coste marginal alto; necesita validar precio antes de construir.
- **#4 Propuestas:** ya existe **CotizaPro** en este mismo repositorio; duplicar esfuerzo sería restar.
- **#5 Pack PDF:** se vende una vez, a precio bajo, y no genera activo.
