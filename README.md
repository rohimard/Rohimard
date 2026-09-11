# VideoLargo

Planificador de vídeos largos para **NotebookLM**. Traduce una duración objetivo
—8 minutos, por ejemplo— a un plan de bloques y escribe las instrucciones
personalizadas listas para pegar en el panel Studio.

## El problema

NotebookLM no tiene control de duración. Los Video Overviews salen de donde
salen: el formato **Short** está fijado en ~60 s, **Cinematic** ronda los 2-3
minutos y **Explainer** es el único que llega a 5-10, con mucha varianza. Pedir
«hazlo más largo» en las instrucciones añade un par de minutos y poco más.

Lo que sí mueve la aguja es escribir la instrucción con dos cosas dentro:

- **a quién le habla el vídeo**, que obliga a explicar en vez de resumir, y
- **un presupuesto de palabras explícito**, que es la única forma de expresar
  una duración que el modelo entiende.

Y cuando la duración objetivo supera lo que el formato da de sí, repartirla en
bloques y unirlos después.

## Qué hace la app

1. Lees tu duración objetivo y tu índice (un punto por línea).
2. Calcula el presupuesto de palabras a 145 palabras/minuto, el ritmo de
   narración medido sobre Video Overviews reales.
3. Reparte los puntos en tantos bloques como el formato puede sostener.
4. Escribe la instrucción de cada bloque **dentro del límite de caracteres de tu
   plan** (500 en gratis, 10.000 en Plus), priorizando lo que no puede faltar y
   añadiendo las frases que alargan la narración mientras quepan.
5. Te avisa cuando el plan que has pedido no es realista.

Todo ocurre en el navegador. No hay backend, ni base de datos, ni claves.

## Arrancar

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Estructura

| Ruta | Qué contiene |
| --- | --- |
| `lib/plan.ts` | Toda la lógica: presupuesto de palabras, reparto en bloques, redacción de instrucciones y avisos. |
| `components/Planificador.tsx` | Formulario y resultados, en cliente. |
| `components/Montaje.tsx` | Los pasos posteriores, dentro de NotebookLM y en el editor. |

## Límites conocidos

El plan hace la duración probable, no exacta: NotebookLM puede devolver un vídeo
más corto del pedido y conviene generar un par de veces y quedarse con la toma
más larga. Por encima de ~15 minutos el camino deja de ser el Video Overview —
el Audio Overview aguanta mucho más metraje y se le pueden montar imágenes
encima.
