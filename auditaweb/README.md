# AuditaWeb

Auditoría SEO técnica de cualquier página web en menos de un minuto.
Pegas una dirección, obtienes una puntuación sobre 100 y **29 comprobaciones
reales**; el informe completo en PDF se vende a 29 € con Stripe Checkout.

> Producto elegido y justificado en [`../IDEAS.md`](../IDEAS.md).
> Plan de lanzamiento en [`../LANZAMIENTO.md`](../LANZAMIENTO.md).

## Arrancar en 30 segundos

```bash
pip install -r requirements.txt
python app.py
```

Abre <http://127.0.0.1:5000>. **No hace falta configurar nada**: sin
`STRIPE_SECRET_KEY` la aplicación corre en **modo demo** y el botón de compra
desbloquea el informe al instante, para que puedas recorrer el flujo completo.

## Cómo gana dinero

| Momento | Qué ve el usuario |
|---|---|
| Escaneo | Puntuación global, nota de las 7 áreas y **los 3 problemas más graves** — gratis |
| Muro de pago | El resto de problemas, difuminados, con el contador de cuántos quedan |
| Compra | Stripe Checkout, pago único de 29 € |
| Entrega | PDF de 5–6 páginas: plan de acción priorizado + cómo se arregla cada punto |

El gancho es que la puntuación se ve **antes** de pagar: el usuario ya sabe
que su web tiene problemas reales cuando llega al botón.

## Qué se comprueba (29 pruebas, 7 áreas)

- **Metadatos** — `title`, meta description, canonical, idioma, meta robots, favicon
- **Contenido** — H1 único, jerarquía de encabezados, volumen de texto, ratio texto/HTML, enlazado interno
- **Imágenes y accesibilidad** — texto alternativo, dimensiones (CLS), carga diferida, viewport móvil
- **Redes sociales** — Open Graph completo, Twitter Card
- **Datos estructurados** — JSON-LD de Schema.org, detección de microdatos antiguos
- **Rendimiento** — tiempo de respuesta, peso del HTML, compresión, scripts bloqueantes, hojas de estilo
- **Indexación y seguridad** — HTTPS, contenido mixto, `robots.txt`, `sitemap.xml`, cabeceras, redirecciones

Cada prueba tiene un peso según su impacto real, y la puntuación es la suma
ponderada (correcto = 100 %, mejorable = 50 %, fallo = 0 %).

## Activar el cobro real

```bash
cp .env.example .env
```

Rellena `STRIPE_SECRET_KEY` (empieza por `sk_test_` en pruebas) y
`APP_BASE_URL`. Al reiniciar, el botón pasa por Stripe Checkout de verdad.
Tarjeta de prueba: `4242 4242 4242 4242`, cualquier fecha futura y CVC.

El acceso al PDF **nunca** se concede por un parámetro de la URL: la
aplicación consulta a Stripe el `payment_status` de la sesión y comprueba que
el `metadata.informe` coincida con el informe solicitado.

## Estructura

```
app.py               Rutas Flask, integración con Stripe y muro de pago
auditor.py           Motor de análisis: descarga, parseo y puntuación
informe.py           Generación del PDF con ReportLab
almacen.py           Persistencia en JSON (escritura atómica y con cerrojo)
templates/           Landing, informe, gracias y errores (Jinja + Bootstrap)
static/vendor/       Bootstrap 5.3.8 servido en local, sin depender de un CDN
data/                informes.json y suscriptores.json (lista de espera)
tests/prueba_humo.py Prueba de extremo a extremo sin necesidad de internet
```

## Pruebas

```bash
python tests/prueba_humo.py
```

Levanta un servidor local con dos páginas de ejemplo (una mal hecha y otra
bien hecha), audita ambas y recorre el flujo completo hasta la descarga del
PDF. No necesita conexión a internet y no toca los datos reales.

## Captura de correos

Se guardan en `data/suscriptores.json` desde dos sitios: el formulario de
lista de espera de la landing y el campo de email del propio checkout. Se
deduplican por dirección y se anota el origen.

## Notas de arquitectura

- **Sin base de datos.** Ficheros JSON con escritura atómica; suficiente hasta
  las primeras ventas. El historial se recorta a los 500 informes más recientes
  para no llenar el disco del plan gratuito.
- **Límite conocido del almacenamiento.** El cerrojo protege dentro de un
  proceso, así que con varios *workers* de gunicorn dos escrituras simultáneas
  podrían pisarse (el fichero nunca se corrompe, pero se puede perder un
  registro). Con el tráfico de un lanzamiento no pasa; en cuanto haya ventas
  constantes, migra `almacen.py` a SQLite o Postgres — es el único fichero que
  habría que tocar.
- **Sin APIs de pago.** Todo el análisis sale del HTML público y de las
  cabeceras de la respuesta, así que el coste marginal por auditoría es cero.
- **Sin CDN.** Bootstrap se sirve desde `static/vendor/`, de modo que la app
  funciona igual sin salida a internet y no depende de terceros.
