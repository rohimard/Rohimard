# 🎬 Prompts adaptados a Google Flow

> Este archivo sustituye a `PORTFOLIO_MUESTRAS.md` (versión Midjourney) para generar las **2 muestras de portafolio del gig** directamente en Google Flow. La guía principal (`GUIA_COMPLETA_FORMATEADA.md`) sigue basada en Midjourney a propósito — es el estándar del sector y lo que espera el comprador del PDF de $1,99 — pero para tu propio trabajo de portafolio, Flow es una herramienta válida y en algunos aspectos más potente: genera **vídeo**, no solo estáticas.

---

## ⚠️ Por qué esto no es una simple "traducción" de sintaxis

Flow no es un generador de imágenes con parámetros como Midjourney. Es una **herramienta de cine con IA construida sobre Veo (vídeo), Imagen (estáticas) y Gemini (que interpreta tu texto)**. La lógica de consistencia es distinta de raíz:

| | 🎨 Midjourney | 🎬 Google Flow |
| :--- | :--- | :--- |
| **Qué genera** | Imágenes estáticas | Clips de vídeo (4, 6 u 8 segundos) + estáticas vía Imagen |
| **Cómo fijas el personaje** | `--cref [URL]` + `--seed` | **"Ingredient"**: subes o generas la imagen del personaje una vez, y la reutilizas como referencia en cada escena (hasta 3 ingredients por prompt) |
| **Sintaxis del prompt** | Palabras clave separadas por comas + flags (`--ar`, `--stylize`) | **Frases naturales y cinematográficas**, como le hablarías a un director de fotografía |
| **Control de cámara** | Se describe en texto (`85mm lens`, `wide shot`) | Puede describirse en texto **o** elegirse en menús: tipo de plano, ángulo, movimiento, distancia focal |
| **Encadenar varias tomas** | No existe — cada imagen es independiente | **Scenebuilder**: encadenas tomas del mismo personaje en una secuencia continua (hasta ~20 clips) |
| **Coste** | Suscripción plana mensual | **Por segundo generado** — 10 clips cuestan más que 10 imágenes de Midjourney; revisa tu plan antes de generar en bloque |

> ### ⚠️ Verifica esto en tu cuenta antes de empezar
> La consistencia de personaje vía "Ingredients to Video" se documentó primero sobre el modelo **Veo 2**, y Google la está extendiendo a **Veo 3**. Qué modelo tienes disponible depende de tu plan y de cuándo lo estés leyendo — la interfaz de Flow cambia con frecuencia. Antes de generar los 10 clips, haz **una sola prueba** con una acción simple y confirma que el personaje se mantiene reconocible entre tomas.

---

## 🧭 El flujo de trabajo en Flow (4 pasos)

1. **Crea el "Ingredient" del personaje** — generas o subes una imagen fija de referencia (esto sustituye a tu hoja canon de Midjourney).
2. **"Ingredients to Video"** — seleccionas ese ingredient y escribes una escena en lenguaje natural describiendo la acción, el plano y la luz. Repite para cada pose/acción.
3. **Scenebuilder (opcional pero recomendado)** — encadena las 5 tomas de cada personaje en una sola secuencia continua. Esto te da un **showreel de portafolio** que Midjourney no puede producir.
4. **Exporta** — o bien capturas un fotograma de cada clip para tener estáticas (útil para la galería del gig, que en Fiverr son imágenes), o subes los clips de vídeo directamente como muestra — Fiverr permite vídeo en la galería, y un personaje coherente **moviéndose** es un diferenciador frente al 99% de gigs que solo muestran estáticas.

---
<br>

## 🦊 Personaje A · "Nova" (mascota Pixar 3D)

### 1. Prompt del Ingredient (imagen base vía Imagen, dentro de Flow)

```
A 3D-animated fox mascot character, chibi proportions, copper-orange fur,
big round amber eyes, a small white heart-shaped patch on its chest, a
red plaid bandana around its neck, round chubby body, matte clay material,
soft three-point studio lighting, neutral friendly expression, standing
facing camera, plain light grey background, portrait, centered composition
```

Genera 2-3 variantes, elige la que mejor represente al personaje y **guárdala como Ingredient** con el nombre "Nova".

### 2. Las 5 escenas (Ingredients to Video, usando el Ingredient "Nova")

```
Static medium shot of Nova the fox mascot, waving one paw at the camera
with a cheerful expression, soft studio lighting, plain light grey
background, gentle idle motion, 4 seconds
```

```
Static close-up shot of Nova the fox mascot sitting thoughtfully with one
paw on its chin, curious expression, soft studio lighting, plain light
grey background, subtle blinking and ear movement, 4 seconds
```

```
Tracking shot following Nova the fox mascot running joyfully from left to
right, red bandana flowing behind, soft pastel gradient background,
smooth dynamic motion, side view, 6 seconds
```

```
Low static shot of Nova the fox mascot jumping up with both arms raised in
celebration, big smile, pastel background, bouncy playful motion,
6 seconds
```

```
Medium shot of Nova the fox mascot sitting at a small desk holding a
coffee mug with both paws, warm cozy blurred office background, gentle
sipping motion, soft warm lighting, 4 seconds
```

---
<br>

## 🎨 Personaje B · "Rhea" (avatar de creador)

### 1. Prompt del Ingredient

```
Digital painterly illustration portrait of a 26-year-old woman, short
choppy silver-blue bob haircut, sharp violet eyes, a thin scar through
her right eyebrow, an asymmetric silver ear cuff, wearing an oversized
olive green utility jacket, slim angular build, neutral expression,
facing camera, plain warm grey background, soft even lighting, portrait
```

> ### 💡 Por qué sigue sin ser fotorrealista
> Igual que en la versión Midjourney: un rostro humano hiperrealista generado por IA, usado como muestra pública de portafolio, invita a la pregunta "¿es una persona real?". La ilustración pictórica evita esa ambigüedad y en Flow, además, tiende a mantener mejor la coherencia entre tomas que un fotorrealismo extremo.

### 2. Las 5 escenas

```
Medium three-quarter shot of Rhea, silver-blue bob haircut, violet eyes,
confident subtle smile, plain warm grey background, soft even lighting,
gentle head turn toward camera, 4 seconds
```

```
Close-up shot of Rhea laughing, silver-blue bob haircut, violet eyes,
warm grey background, digital painterly illustration style, soft even
lighting, natural laughing motion, 4 seconds
```

```
Medium shot of Rhea sitting at a streaming desk wearing headphones,
speaking animatedly toward a microphone, neon-lit background with soft
cyan and magenta glow, subtle camera push-in, 6 seconds
```

```
Tracking shot of Rhea walking through a rain-slicked neon city street at
night, olive utility jacket, confident stride, reflections on wet
pavement, cinematic cyberpunk lighting, side view, 6 seconds
```

```
Medium shot of Rhea taking a selfie with a vintage camera outdoors, warm
golden hour light, playful expression, slight handheld camera motion,
4 seconds
```

---
<br>

## 🎞️ Montaje final en Scenebuilder

1. Sube las 5 tomas de Nova a Scenebuilder y ordénalas del plano más neutro (saludo) al más expresivo (celebración).
2. Repite con las 5 tomas de Rhea.
3. Usa **Scene Extension** entre tomas consecutivas del mismo personaje si quieres transiciones fluidas en lugar de cortes.
4. Exporta dos secuencias cortas (una por personaje) de ~20-25 segundos cada una: esa es tu **muestra de vídeo** para la galería del gig.
5. Para las **estáticas** que necesitas igualmente en Fiverr, captura un fotograma limpio de cada uno de los 10 clips (el propio Flow suele permitir descargar un frame, o usa cualquier reproductor de vídeo con función de captura).

---

## ✅ Checklist adaptado a Flow

- [ ] Crear el Ingredient de **Nova** y confirmar que se ve como quieres antes de generar las 5 escenas.
- [ ] Generar **una sola** escena de prueba con Nova y verificar que el personaje no cambia de forma perceptible respecto al Ingredient.
- [ ] Generar las 5 escenas completas de Nova.
- [ ] Repetir los 3 pasos anteriores con **Rhea**.
- [ ] Montar ambas secuencias en Scenebuilder.
- [ ] Exportar: 2 vídeos cortos + 10 fotogramas estáticos capturados.
- [ ] Revisar el consumo de créditos/segundos de tu plan de Flow antes de repetir generaciones — a diferencia de Midjourney, cada clip tiene coste variable.
- [ ] Subir tanto las estáticas como los clips de vídeo a la galería del gig en `FIVERR_GIG.md` — el vídeo es tu diferenciador frente a la competencia.

---

## 📚 Fuentes consultadas

- [Introducing Flow: Google's AI filmmaking tool designed for Veo](https://blog.google/innovation-and-ai/products/google-flow-veo-ai-filmmaking-tool/)
- [5 tips for using Flow, Google's AI filmmaking tool](https://blog.google/innovation-and-ai/products/flow-video-tips/)
- [Flow Camera Controls: 15 Ultimate Prompts for Cinematic Veo Videos](https://digiwebinsight.com/flow-camera-controls-explained/)
- [Flow Scenebuilder Extend Shots Guide](https://digiwebinsight.com/flow-scenebuilder-extend-shots/)
- [Generate images using Imagen | Gemini API docs](https://ai.google.dev/gemini-api/docs/imagen)
- [Veo 3.1 Pricing Guide 2026](https://www.veo3gen.app/blog/veo-3-1-pricing-plans)
