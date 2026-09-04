# 🖼️ Prompts para las 2 muestras de portafolio del gig

> Sigue exactamente el método del **Capítulo 4** de la guía (las 4 anclas de consistencia). Elegí dos estilos distintos a propósito — un **mascota Pixar 3D** y un **avatar de creador estilo pictórico** — porque cubren los dos tipos de comprador más comunes en Fiverr: marcas que buscan una mascota, y creadores/streamers que buscan un avatar de canal. Esa variedad en la galería del gig demuestra rango sin que parezca que solo sabes hacer una cosa.

---

## ⚙️ Cómo usar `--cref` (paso que no puedes saltarte)

`--cref` necesita una **URL de imagen**, no un archivo de tu disco. El camino más simple:

1. Genera la hoja canon (el prompt de abajo).
2. Entre las 4 variantes que te da Midjourney, **elige la mejor** y pulsa `U1`–`U4` para ampliarla — dedica tiempo a esto, es la base de todo lo demás.
3. Haz clic derecho sobre la imagen ampliada → **Copy Link** (o **Copiar enlace**).
4. Pega esa URL donde dice `[URL_CANON_...]` en cada uno de los 5 prompts de pose.

---
<br>

## 🦊 Personaje A · Mascota de marca — "Nova" (Pixar 3D)

**Ancla textual (las 6 claves que nunca cambian):**
`chibi-proportioned fox mascot character, copper-orange fur, big round amber eyes, small white heart-shaped patch on chest, red plaid bandana around neck, round chubby body`

### 1. Hoja canon

```
/imagine character reference sheet, chibi-proportioned fox mascot character,
copper-orange fur, big round amber eyes, small white heart-shaped patch on
chest, red plaid bandana around neck, round chubby body, 3D render, matte
clay material, soft three-point studio lighting, neutral expression, front
view, three-quarter view and side view arranged side by side, plain light
grey background --ar 16:9 --stylize 200 --seed 8851
```

### 2. Las 5 poses (usa la URL de la hoja canon)

```
/imagine same fox mascot character, copper-orange fur, big round amber eyes,
white heart-shaped patch on chest, red plaid bandana, waving one paw,
cheerful expression, plain light grey background, soft studio lighting
--cref [URL_CANON_NOVA] --cw 100 --ar 1:1
```

```
/imagine same fox mascot character, copper-orange fur, amber eyes, heart
patch on chest, red bandana, sitting thoughtfully with paw on chin,
curious expression, plain light grey background, soft studio lighting
--cref [URL_CANON_NOVA] --cw 100 --ar 1:1
```

```
/imagine same fox mascot character running joyfully, copper-orange fur,
amber eyes, red bandana flowing, full body, side view, soft pastel
gradient background, dynamic pose, 3D render, matte clay material
--cref [URL_CANON_NOVA] --cw 90 --ar 4:5
```

```
/imagine same fox mascot character jumping with arms up celebrating,
copper-orange fur, amber eyes, red bandana, big smile, full body,
pastel background, 3D render, matte clay material
--cref [URL_CANON_NOVA] --cw 90 --ar 1:1
```

```
/imagine same fox mascot character sitting at a desk holding a coffee mug,
copper-orange fur, amber eyes, red bandana, warm cozy office background
softly blurred, friendly expression, 3D render, matte clay material,
soft warm lighting --cref [URL_CANON_NOVA] --cw 75 --ar 4:5
```

---
<br>

## 🎨 Personaje B · Avatar de creador — "Rhea" (ilustración pictórica)

**Ancla textual:**
`26-year-old woman, short choppy silver-blue bob haircut, sharp violet eyes, thin scar through right eyebrow, asymmetric silver ear cuff, oversized olive green utility jacket, slim angular build`

> ### 💡 Por qué no es fotorrealista
> Un rostro humano fotorrealista en un portafolio de muestra puede generar dudas de "¿es una persona real?" y complicaciones de derechos de imagen. La ilustración pictórica estilizada evita eso, se genera con más consistencia y vende igual de bien para avatares de streaming y contenido.

### 1. Hoja canon

```
/imagine character reference sheet, digital painterly illustration,
26-year-old woman, short choppy silver-blue bob haircut, sharp violet eyes,
thin scar through right eyebrow, asymmetric silver ear cuff, oversized
olive green utility jacket, slim angular build, neutral expression, front
view, three-quarter view and side view side by side, plain warm grey
background, soft even lighting --ar 16:9 --style raw --stylize 150 --seed 4417
```

### 2. Las 5 poses

```
/imagine same character, 26-year-old woman, silver-blue bob, violet eyes,
scar through right eyebrow, olive utility jacket, confident smile,
three-quarter view, plain warm grey background, soft even lighting,
digital painterly illustration --cref [URL_CANON_RHEA] --cw 100 --ar 1:1
```

```
/imagine same character close-up portrait laughing, silver-blue bob,
violet eyes, scar through eyebrow, warm grey background, digital
painterly illustration, soft even lighting
--cref [URL_CANON_RHEA] --cw 100 --ar 1:1
```

```
/imagine same character sitting at a streaming desk wearing headphones,
silver-blue bob, violet eyes, olive utility jacket, neon-lit background
with soft cyan and magenta glow, digital painterly illustration, medium shot
--cref [URL_CANON_RHEA] --cw 85 --ar 4:5
```

```
/imagine same character walking through a rainy neon city street at night,
silver-blue bob, violet eyes, olive utility jacket, full body, side view,
cyberpunk neon lighting, digital painterly illustration
--cref [URL_CANON_RHEA] --cw 80 --ar 9:16
```

```
/imagine same character taking a selfie with a vintage camera, silver-blue
bob, violet eyes, playful expression, warm golden hour lighting outdoors,
digital painterly illustration, medium shot
--cref [URL_CANON_RHEA] --cw 80 --ar 1:1
```

---
<br>

## 📸 Imagen de portada del gig (bonus)

Con estos mismos 10 resultados ya tienes material de sobra. Para la portada:

1. Monta un grid de **4 poses de Nova** en cuadrícula 2×2.
2. Al lado, monta un grid de **4 poses de Rhea** en cuadrícula 2×2.
3. Une ambos con el texto superpuesto **"Consistent AI Characters"** en Montserrat Bold, sobre una franja `#0A192F`.

Eso comunica en 2 segundos exactamente lo que vendes: el mismo personaje, muchas veces, sin que cambie.

---

## ✅ Checklist de esta sesión de generación

- [ ] Generar y ampliar la hoja canon de **Nova**, copiar su URL.
- [ ] Generar las 5 poses de Nova con esa URL en `--cref`.
- [ ] Generar y ampliar la hoja canon de **Rhea**, copiar su URL.
- [ ] Generar las 5 poses de Rhea con esa URL en `--cref`.
- [ ] Descartar y regenerar cualquier pose donde la cara "derive" (Capítulo 4.6) — siempre desde la URL del canon, nunca desde otra pose.
- [ ] Montar la imagen de portada 2×2 + 2×2.
- [ ] Subir las 10 imágenes finales + la portada a la galería del gig de `FIVERR_GIG.md`.
