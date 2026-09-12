# Kit de producción — adaptado a Historia

El kit completo (guión → prompts de imágenes → miniatura → hoja de montaje →
SEO) vive en `kit-produccion/` (paquete original, sin tocar — es la
referencia técnica de los pasos y los scripts). Este documento adapta el
**rol del narrador** y la estructura de guión de ese kit —pensado
originalmente para un canal de finanzas/vivienda— al nicho de historia.
El resto del pipeline (Pasos 1-6 de `kit-produccion/SKILL.md`) se usa tal
cual: medir audio, segmentar, prompts fotorrealistas, hoja de montaje,
miniatura y SEO no cambian de mecánica, solo de contenido.

## El rol / la voz — versión historia

**Se mantiene la personalidad base**: divulgador cercano, directo y algo
inconformista — voz enérgica, grave y agradable, de tú, que mezcla
**empatía** + **datos reales** + un punto de **denuncia** + **cierre que
empodera**. No es un profesor: es el amigo que te cuenta lo que de verdad
pasó, no la versión resumida del colegio.

**Traducción al nicho** (el mismo esqueleto emocional, otro contenido):

| En el kit original (finanzas) | En este canal (historia) |
|---|---|
| Empatía: "sé por lo que estás pasando" | Empatía: "a ti también te lo contaron así, no es tu culpa" |
| Denuncia: "el sistema está diseñado así" | Denuncia: "la versión que te enseñaron está simplificada/es falsa, y esto es lo que de verdad pasó" |
| Empoderamiento: "pero puedes darle la vuelta" | Empoderamiento: "ahora entiendes por qué el mundo es como es" |
| Segunda persona en el presente del espectador | Segunda persona **dentro del momento histórico** ("Estás en el Senado de Roma...") |

Rasgos de estilo (se mantienen igual que en `references/guion.md`): frases
cortas con ritmo, repetición retórica, preguntas retóricas que abren
bucles, cifras concretas y comparaciones temporales, un dato shock bien
colocado, cierre esperanzador/de comunidad ("lo vamos a entender juntos").

## Estructura de guión — 5 bloques (adaptados)

1. **GANCHO (primeros ~15s):** escena histórica ultra-concreta en 2ª
   persona/presente narrativo + una pregunta incómoda o un dato que no
   cuadra. Nada de "hoy os voy a hablar de...".
2. **EL HECHO + DATOS:** qué pasó exactamente, con cifras reales (años,
   número de personas, magnitud). Cierra con el reencuadre: "esto no fue
   un accidente aislado, fue [estructural/decisivo/inevitable]".
3. **¿POR QUÉ PASÓ / POR QUÉ TE LO CONTARON MAL?:** 2-3 razones numeradas
   ("Primera... Segunda... Tercera..."), y aquí vive la "denuncia": qué
   parte de la versión popular es incompleta o directamente falsa, y por
   qué se simplificó así (propaganda de la época, fuentes perdidas, mito
   posterior más cómodo de contar).
4. **LO QUE REALMENTE CAMBIÓ (legado/reencuadre):** conectar el hecho
   antiguo con algo reconocible hoy — un idioma, una frontera, una
   costumbre, una institución. Aquí vive el "empoderamiento": el
   espectador ahora entiende una pieza real del mundo actual.
5. **CTA/CIERRE:** promesa concreta del próximo video (mismo hecho desde
   otro ángulo, o la civilización/personaje conectado), suscripción,
   compartir con quien le guste la historia real, frase final de cierre
   ("te prometo que la próxima vez que oigas hablar de esto, lo vas a ver
   distinto").

Longitud y formato de entrega: igual que el kit original — **4.500-5.000
caracteres**, texto corrido sin markdown, listo para ElevenLabs, sin
etiquetas de emoción por defecto (ver `kit-produccion/references/guion.md`).

## Imágenes, miniatura y SEO — ajustes de contenido (mecánica igual)

- **Prompts de imágenes** (`kit-produccion/references/image-prompts.md`):
  mismo formato fotorrealista/documental, pero el "personaje recurrente"
  aquí es la **figura histórica o el entorno de época** del video (ropa,
  arquitectura, objetos correctos para el periodo) en vez de un personaje
  moderno — mantener su descripción completa palabra por palabra en cada
  plano donde aparezca, igual que indica el kit.
- **Miniatura** (`kit-produccion/references/thumbnail.md`): mismo criterio
  de CTR (un foco emocional, conflicto visual, espacio negativo, colores
  de alarma amarillo/rojo, número o palabra gigante en Anton) pero la cara
  con emoción extrema es la del personaje histórico o una escena de
  impacto (ruinas, batalla, artefacto), no un rostro contemporáneo.
- **SEO** (`kit-produccion/references/seo.md`): misma fórmula de título
  (palabra clave al principio + gancho + <60 caracteres, 2-3 variantes
  A/B) — ver ejemplos ya adaptados en `06-temas-intrigantes.md`.

## Flujo de trabajo con el usuario

Igual que describe `kit-produccion/SKILL.md`: dame un tema (o ya un guión
o guión+audio) y te entrego, en orden, guión → prompts de imágenes →
miniatura → hoja de montaje (cuando traigas el audio de ElevenLabs) → SEO.
