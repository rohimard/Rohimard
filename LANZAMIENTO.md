# LANZAMIENTO.md — De local a cobrando

Plan concreto para **AuditaWeb** (`auditaweb/`). Tres bloques: desplegar,
cobrar y conseguir los primeros usuarios.

---

## 1. Desplegar gratis en Render

Render tiene plan gratuito y despliega desde GitHub. El proyecto ya trae
`Procfile`, `runtime.txt` y `requirements.txt`, así que no hay que tocar nada.

### Pasos

1. **Sube el repositorio** (ya está en esta rama):
   ```bash
   git push -u origin claude/digital-product-mvp-vq7jz5
   ```
2. Entra en [render.com](https://render.com) → **New +** → **Web Service** →
   conecta tu GitHub y elige este repositorio.
3. Configura el servicio:

   | Campo | Valor |
   |---|---|
   | Root Directory | `auditaweb` |
   | Environment | `Python 3` |
   | Build Command | `pip install -r requirements.txt` |
   | Start Command | `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 60` |
   | Instance Type | `Free` |

4. En **Environment** añade las variables:

   | Clave | Valor |
   |---|---|
   | `SECRET_KEY` | genérala con `python -c "import secrets;print(secrets.token_hex(32))"` |
   | `APP_BASE_URL` | `https://TU-SERVICIO.onrender.com` (rellénala tras el primer despliegue) |
   | `PRECIO_CENTIMOS` | `2900` |
   | `MARCA` | `AuditaWeb` |

5. **Deploy**. En ~2 minutos tienes URL pública. Compruébalo en
   `https://TU-SERVICIO.onrender.com/salud` → debe responder
   `{"estado":"ok","modo":"demo",...}`.

### Alternativa: Railway

Igual de válido y sin dormirse. `railway up` desde `auditaweb/`, o conectando
el repo desde la web. Railway detecta el `Procfile` solo; únicamente hay que
definir las mismas variables de entorno.

### Dos avisos importantes del plan gratuito

- **El servicio se duerme** tras 15 minutos sin tráfico y el primer visitante
  espera ~30 s. Antes de mandar tráfico de verdad, ponle un ping cada 10
  minutos (UptimeRobot, gratis) o pasa al plan de 7 $/mes.
- **El disco es efímero.** `data/*.json` se borra en cada despliegue: perderías
  la lista de correos. En cuanto entren los primeros suscriptores, monta un
  **disco persistente** en Render apuntando a `/opt/render/project/src/auditaweb/data`,
  o vuelca los correos a una hoja de cálculo. **No dejes esto para después.**

---

## 2. Configurar Stripe

### Fase de pruebas

1. Crea la cuenta en [stripe.com](https://stripe.com) y quédate en **modo test**.
2. *Developers → API keys* → copia la **Secret key** (`sk_test_…`).
3. Añádela en Render como `STRIPE_SECRET_KEY` y redespliega.
4. Prueba una compra con la tarjeta `4242 4242 4242 4242`, fecha futura y
   cualquier CVC. Debes acabar en la página de gracias con el PDF descargable.

### Pasar a producción

1. Activa la cuenta en Stripe: datos fiscales, IBAN e identidad. Suele
   aprobarse en 24–48 h.
2. Cambia a **modo live** y copia la clave `sk_live_…`.
3. Sustituye `STRIPE_SECRET_KEY` en Render y confirma que `APP_BASE_URL`
   apunta al dominio definitivo (Stripe rechaza URLs de retorno que no
   coincidan).
4. Haz **una compra real de 29 €** contigo mismo y compruébala de punta a
   punta. Es la única forma de saber que funciona.
5. En Stripe: activa los recibos automáticos por email
   (*Settings → Customer emails*) y configura el IVA en *Tax settings* si
   facturas dentro de la UE.

### Endurecer antes de escalar

- **Webhook de `checkout.session.completed`.** Ahora el informe se desbloquea
  cuando el usuario vuelve a la página de gracias; si cierra la pestaña justo
  después de pagar, ha pagado y no tiene el PDF. Un webhook lo arregla y es lo
  primero que hay que añadir tras las primeras ventas.
- **Enviar el PDF por email** (Resend o Brevo, ambos con plan gratuito). Hoy el
  enlace es la única copia: si lo pierde, escribe a soporte.
- **Política de reembolso visible.** Reduce las disputas, que en Stripe cuestan
  15 € cada una además del importe.

---

## 3. Las 3 tácticas de marketing gratuitas que funcionan aquí

El producto tiene una ventaja rara: **el gancho es el propio resultado**. Una
puntuación baja sobre la web de alguien es contenido que se comparte solo. Las
tres tácticas la explotan.

### Táctica 1 — Auditorías no solicitadas en r/SEO, r/juststart y r/emprendedores

**Por qué funciona:** en esas comunidades hay hilos recurrentes del tipo
"rate my site" / "reviso tu web". Nadie los atiende bien porque revisar a mano
cuesta 20 minutos. Tú tardas 30 segundos.

**Cómo ejecutarlo:**
1. Busca los hilos de feedback recientes y ordena por actividad.
2. Audita las webs que la gente pega y **responde con los hallazgos concretos
   en el propio comentario** — el número, los tres fallos, la solución.
3. Cierra con una línea: *"lo he sacado con una herramienta que estoy
   construyendo, [enlace], el escaneo es gratis"*.
4. Objetivo realista: 10 comentarios de valor al día durante una semana.

**Regla que no se salta:** el valor va **en el comentario**, no detrás del
enlace. Si solo pegas el enlace, te banean y con razón.

### Táctica 2 — LinkedIn: el post de "he auditado 50 webs de X"

**Por qué funciona:** es el canal donde están las agencias y los freelancers
web, que son quien paga 29 € sin pensarlo (y quien acabará en el plan Agencia
de 99 €/mes).

**Cómo ejecutarlo:**
1. Elige un nicho concreto y local: *clínicas dentales de Valencia*,
   *asesorías fiscales de Madrid*, *tiendas online de moda española*.
2. Audita 50 webs del nicho con la herramienta y agrega los datos.
3. Publica el hallazgo, no el producto: *"He auditado 50 webs de clínicas
   dentales. El 68 % no tiene meta description. Puntuación media: 47/100."*
4. Tres o cuatro conclusiones concretas, y el enlace **en el primer
   comentario** (LinkedIn penaliza los enlaces externos en el cuerpo).
5. Repítelo cada semana cambiando de nicho. Es contenido con datos propios,
   que es lo único que se comparte en LinkedIn.

**Bonus de alta conversión:** a las 5 peores del estudio, escríbeles por
privado con su informe **gratis**. Un porcentaje incómodamente alto contesta.

### Táctica 3 — Product Hunt, pero preparado

**Por qué funciona:** un lanzamiento decente son 500–2.000 visitas en un día y
backlinks permanentes. Un lanzamiento improvisado son 40 visitas.

**Cómo ejecutarlo:**
1. **Dos semanas antes:** crea el perfil y participa a diario. Los lanzamientos
   de cuentas nuevas sin historial se hunden.
2. **Prepara los materiales:** GIF de 15 s (pegar URL → puntuación → PDF), 4
   capturas y un tagline sin adjetivos: *"Auditoría SEO técnica y plan de
   acción en PDF, en 30 segundos"*.
3. **Lanza un martes o miércoles a las 00:01 PST.** Es cuando arranca el ciclo
   de votación del día.
4. **Ofrece algo real ese día:** informe gratis para todo el que comente. Sale
   barato (coste marginal cero) y dispara los comentarios, que es lo que
   mueve el ranking.
5. **Contesta todos los comentarios** en las primeras 6 horas.

**Antes de lanzar, comprueba:** que el servicio no esté dormido (ping activo),
que Stripe esté en modo live y que hayas hecho una compra real de prueba.

---

## Orden de ejecución realista

| Cuándo | Qué |
|---|---|
| Hoy | Desplegar en Render + Stripe en modo test + compra de prueba |
| Día 2 | Táctica 1 (Reddit): 10 auditorías al día. Escuchar qué preguntan |
| Día 3–5 | Activar Stripe live. Añadir el webhook y el envío por email |
| Semana 2 | Táctica 2 (LinkedIn): primer estudio de nicho |
| Semana 3–4 | Táctica 3 (Product Hunt) con el producto ya rodado |

**La métrica que importa al principio no es el dinero, es la tasa
escaneo → compra.** Si de 100 escaneos gratis no compra ninguno, el problema
no es el tráfico: es el precio o lo que promete el informe. Averígualo con los
primeros 100 antes de gastar un solo euro en publicidad.
