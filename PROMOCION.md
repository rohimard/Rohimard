# PROMOCIÓN.md — De 0 a las primeras 10 ventas

Plan de ejecución para **AuditaWeb**. No es teoría de marketing: son los
textos que tienes que copiar, a quién mandarlos y en qué orden.

---

## La idea que sostiene todo el plan

**El producto es su propio anuncio.** Una auditoría es contenido que se
comparte solo: nadie discute un "tu web saca 41/100", y a nadie le da igual.

Por eso todas las tácticas son la misma jugada repetida en sitios distintos:
**regalar auditorías en público**. No explicas lo que hace la herramienta: la
usas delante de la gente, sobre webs suyas, y el producto se explica solo.

Corolario incómodo: **no hables de tu herramienta, habla de webs concretas.**
En el momento en que un mensaje tuyo empieza con "he creado una herramienta
que…", has perdido.

---

## Antes de promocionar nada: que se pueda pagar (2 horas)

Mandar tráfico a algo que no cobra es quemar tu única oportunidad con esa
gente. **No pases de aquí sin completarlo.**

- [ ] Desplegado en Render con URL pública (pasos en `LANZAMIENTO.md`)
- [ ] Disco persistente montado en `auditaweb/data` — si no, pierdes los
      correos en cada despliegue
- [ ] Ping cada 10 min con UptimeRobot para que no se duerma
- [ ] Stripe en **modo live** y `APP_BASE_URL` apuntando al dominio real
- [ ] **Te has comprado un informe a ti mismo, con dinero real, y ha llegado**
- [ ] Dominio propio (12 €/año). `auditaweb.onrender.com` resta credibilidad
      justo cuando pides una tarjeta

Cuando puedas cobrar, sigue.

---

## Fase 1 · Días 1–7 — Auditorías públicas donde ya piden ayuda

**Objetivo:** 100 escaneos gratis y entender qué pregunta la gente.

Hay hilos recurrentes de "revisad mi web" que nadie atiende bien, porque
hacerlo a mano cuesta 20 minutos. Tú tardas 30 segundos.

**Dónde:** r/emprendedores, r/AutonomosES, r/SEO (en inglés), r/juststart,
grupos de Facebook de autónomos y pequeños negocios, foros de nicho.

**Ritmo:** 10 comentarios útiles al día. Es media hora.

### Texto para comentar

> He echado un vistazo a **[dominio]** y hay tres cosas que te están costando
> visitas ahora mismo:
>
> 1. **[Problema 1]** — [por qué importa, una línea]
> 2. **[Problema 2]** — [por qué importa]
> 3. **[Problema 3]** — [por qué importa]
>
> Lo primero lo arreglas en diez minutos: [solución concreta del problema 1].
>
> Lo he sacado con una herramienta que estoy montando ([enlace]); el escaneo
> es gratis por si quieres pasarle el resto de tus páginas.

**La regla que no se salta:** el valor va **en el comentario**, no detrás del
enlace. Si solo pegas el enlace, te expulsan y con razón. El enlace es la
firma, no el mensaje.

**Qué anotar cada día:** qué te preguntan después. Esas preguntas son las
objeciones que te impedirán vender, y salen aquí gratis.

---

## Fase 2 · Días 3–14 — El informe regalado (aquí salen las primeras ventas)

**Objetivo:** las 3–5 primeras ventas.

Ésta es la táctica que convierte, y casi nadie la hace porque parece
demasiado generosa. **Le mandas el PDF completo, gratis, sin que lo pida.**

Funciona por dos razones: te cuesta cero (coste marginal cero, por eso se
eligió este producto) y elimina de golpe la pregunta "¿valdrá 29 € esto?",
porque ya lo ha visto.

### Cómo se ejecuta

1. Reúne 50 webs de un nicho local concreto — *clínicas dentales de Valencia*,
   *asesorías fiscales de Málaga*, *tiendas online de moda española*. Sácalas
   de Google Maps a mano; una hora.
2. Guárdalas en `auditaweb/nichos/dentistas.txt`, una por línea.
3. Lánzalas de golpe:

   ```bash
   cd auditaweb
   python prospectar.py nichos/dentistas.txt --nicho "clínicas dentales de Valencia"
   ```

   Te deja `estudio-prospectos.csv` (a quién escribir, de peor a mejor) y
   `estudio-resumen.txt` (los datos para la Fase 3).
4. Coge las **5 peores**, genera su informe en la web, descarga el PDF y
   **envíalo adjunto** al correo de contacto de cada una.

### Texto del correo

> **Asunto:** La web de [Negocio] tiene 3 fallos que la esconden en Google
>
> Hola:
>
> He analizado [dominio] y saca **[X]/100** en las comprobaciones técnicas que
> Google usa para posicionar. Te adjunto el informe completo, sin coste.
>
> Lo más urgente: **[peor problema]**. En la práctica significa que
> [consecuencia en dinero o clientes, no en jerga].
>
> El informe trae las [N] cosas que hay que tocar y cómo se arregla cada una.
> Pásaselo a quien te lleve la web y que empiece por la primera.
>
> No te vendo nada con esto. Si te sirve y quieres el de otra página, se hace
> en un minuto: [enlace].
>
> Un saludo,
> [Tu nombre]

**Por qué convierte:** no le pides nada. Un porcentaje incómodamente alto
responde, y de los que responden salen las primeras ventas — normalmente para
*otras* páginas suyas, o porque se lo pasan a su desarrollador.

**Ritmo:** 5 al día, 5 días. Son 25 envíos.

### El seguimiento (aquí está la mitad de las ventas)

A los 4 días, a quien no contestó:

> ¿Pudiste ver el informe de [dominio]? Si te cuadra, te digo por dónde
> empezaría yo. Y si no es el momento, me lo dices y no insisto más.

**Una sola vez.** Un seguimiento es profesional; dos es spam.

---

## Fase 3 · Semanas 2–3 — El estudio de nicho en LinkedIn

**Objetivo:** llegar a las agencias, que son quien acaba pagando de verdad
(y quien comprará el plan Agencia de 99 €/mes).

LinkedIn no premia productos, premia **datos propios**. Y tú ahora los tienes,
porque `prospectar.py` te los acaba de generar en la Fase 2.

### Texto del post

> He analizado las webs de **[N] [nicho]** de **[ciudad]**.
>
> El resultado, en tres datos:
>
> → Puntuación media: **[media]/100**
> → **[X] de cada 10** no tienen [el fallo más repetido]
> → **[Y]%** no tiene sitemap, así que Google va a ciegas por su web
>
> Lo que más me ha sorprendido: **[hallazgo concreto e inesperado]**.
>
> No es un problema de presupuesto. Casi todo lo de la lista se arregla en una
> tarde y no cuesta nada — pero nadie lo mira porque no lo ve.
>
> Si te dedicas a [nicho] y quieres saber cómo sale la tuya, dímelo en
> comentarios y te la paso.

**Reglas de LinkedIn:**
- El enlace va **en el primer comentario**, nunca en el cuerpo (penaliza el
  alcance de los posts con enlaces externos).
- **Los números son los tuyos, los que te dé `prospectar.py`.** No inventes
  cifras: si alguien te pregunta de dónde salen, tienes que poder enseñar el
  CSV.
- Un nicho distinto cada semana. Es una serie, no un post suelto.

### El mensaje privado a agencias

A quien comente o reaccione y trabaje en una agencia:

> Vi que te dedicas a [X]. Te paso la auditoría de una web de tu cartera por
> si te sirve como ejemplo de lo que entrego: [PDF].
>
> Estoy montando un plan para agencias — informes ilimitados con vuestro logo
> en lugar del mío. ¿Lo usaríais para presentar propuestas a clientes nuevos?

Esa última pregunta vale más que la venta: te dice si el plan de 99 €/mes
tiene mercado antes de que lo construyas.

---

## Fase 4 · Semana 4 — Product Hunt, ya con el producto rodado

**No lo hagas antes.** Un lanzamiento con el producto verde son 40 visitas y
una bala gastada; con el producto rodado son 500–2.000 y enlaces permanentes.

- **Dos semanas antes:** crea el perfil y comenta a diario en otros
  lanzamientos. Las cuentas nuevas sin historial se hunden.
- **Materiales:** GIF de 15 s (pegar URL → nota → PDF), 4 capturas, y un
  titular sin adjetivos: *"Auditoría SEO técnica y plan de acción en PDF, en
  30 segundos"*.
- **Cuándo:** martes o miércoles a las 00:01 hora del Pacífico.
- **Ese día:** informe gratis a todo el que comente. Te cuesta cero y los
  comentarios son lo que mueve el ranking.
- **Contesta todos los comentarios** en las primeras 6 horas. Bloquea la
  mañana.

---

## Qué medir (solo cuatro números)

Apúntalos a mano en una hoja. Cada día.

| Número | Qué te dice |
|---|---|
| Escaneos gratis | Si el mensaje atrae |
| Escaneos → compras | **El único que importa de verdad** |
| Correos en la lista | Tu activo cuando aún no compran |
| De dónde vino cada venta | Dónde doblar la apuesta |

### Cómo leer el resultado

- **Nadie escanea** → el problema es el mensaje, no el producto. Cambia el
  gancho antes que nada.
- **Escanean pero no compran** → el problema es el precio o lo que promete el
  informe. Prueba a bajar a 19 €, o enseña una página de muestra del PDF antes
  de pagar.
- **100 escaneos y 0 ventas** → para. No es tráfico lo que falta. Habla con
  cinco personas que escanearon y no compraron, y pregúntales por qué.
- **Compran** → pregunta a cada comprador **una sola cosa**: *"¿eres agencia o
  es tu propia web?"* Si la mayoría son agencias, tu negocio no son los 29 €:
  es el plan de 99 €/mes, y ahí es donde va tu tiempo.

---

## Calendario

| Cuándo | Qué haces | Cuánto tarda |
|---|---|---|
| Hoy | Desplegar, Stripe live, comprarte un informe | 2 h |
| Días 1–7 | 10 auditorías públicas al día | 30 min/día |
| Días 3–7 | Reunir 50 webs y lanzar `prospectar.py` | 1 h + 5 min |
| Días 3–14 | 5 informes regalados al día + seguimiento | 30 min/día |
| Semana 2 | Primer estudio de nicho en LinkedIn | 2 h |
| Semana 3 | Segundo nicho + privados a agencias | 2 h |
| Semana 4 | Product Hunt | 1 día completo |

---

## Expectativas realistas

Estas son **hipótesis de planificación, no promesas** — sirven para saber si
vas bien o mal, y para decidir cuándo parar:

- De cada comentario útil en un foro salen **20–50 visitas**.
- De cada 100 escaneos gratis, en un producto nuevo y desconocido, compra
  entre **1 y 3**. Puede ser 0 las primeras semanas.
- Por tanto: **las primeras ventas salen del correo directo (Fase 2), no del
  tráfico frío.**

Si al llegar a 100 escaneos no ha comprado nadie, el problema no es que
necesites más tráfico. Es el precio o la promesa. Averígualo hablando con
gente antes de gastar un solo euro en publicidad.

---

## Tres cosas que no debes hacer

1. **Publicidad de pago antes de la venta número 10.** No sabes aún cuánto
   vale un cliente; pagar por tráfico ahora es tirar dinero a ciegas.
2. **Construir el plan Agencia antes de que te lo pidan.** Es el siguiente
   producto, pero se decide con las respuestas de la Fase 3, no con una
   corazonada.
3. **Tocar el código en lugar de vender.** Cuando la promoción se ponga
   incómoda, te vas a descubrir "mejorando la herramienta". Esa es la trampa.
   El producto ya funciona: lo que falta ahora son clientes.
