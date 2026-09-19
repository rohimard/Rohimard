# Prompts de imágenes fotorrealistas (Flow / Imagen de Google)

El objetivo es que **lo que se escucha se vea**: cada imagen ilustra literalmente la frase
que se narra en ese momento, en estilo **fotorrealista cinematográfico** (no ilustración,
no 3D de stock). El espectador tiene que sentir que mira un documental real.

## Reglas que no cambian

1. **Una imagen por escena**, y cada escena cubre un trozo concreto de la narración.
   Las imágenes se suceden cada ~3–12 s (lo decide la hoja de montaje), así que tiene
   que haber suficientes para que no se repita ninguna demasiado tiempo.
2. **Sin texto en la imagen.** Los generadores escriben letras y cifras mal. Todo número
   del guión (95 %, 1.856 €, +150 %, 480 €→1.856 €) se añade **animado en el editor**,
   nunca se pide al generador.
3. **Formato 16:9** para YouTube horizontal (9:16 solo si el proyecto es Short/Reel).
4. **Personaje recurrente** en los planos personales, para dar continuidad. Se define una
   vez y se repite su descripción literal en cada escena donde aparezca. Si el generador
   permite imagen de referencia ("Ingredients" en Flow), generar al personaje una vez y
   reutilizar esa referencia en lugar de fiarse solo del texto.
5. **Nada de la estética "de canal"** ni looks genéricos de IA: buscamos foto real,
   con luz motivada, profundidad de campo real y grano fílmico sutil.
6. **Cada prompt es AUTÓNOMO.** El generador (Flow/Imagen) no tiene memoria de la
   conversación ni de los otros planos: cada bloque se copia y se pega solo. Por eso
   **nunca** escribas "el mismo hombre", "como antes" o "la misma escena" — no significan
   nada fuera de contexto. Repite la **descripción completa del personaje** (edad, pelo,
   barba, complexión, ropa) en **cada** plano donde aparece, y describe cada escena entera
   por sí misma. Incluye siempre en cada prompt el formato (16:9) y el "sin texto".

## Bloque de estilo base (se pega al final de CADA prompt)

> `fotografía cinematográfica hiperrealista, full frame 35mm, luz natural, colorimetría
> sobria y ligeramente desaturada, profundidad de campo real, grano fílmico sutil, estilo
> documental contemporáneo, máximo detalle, 8K, sin texto en pantalla, 16:9`

Para **planos de vídeo (Veo/Flow)** se añade además un movimiento de cámara concreto
(*lento push-in, dolly lateral, tilt-up, travelling, dron avanzando*) y una acción viva
dentro del plano. Para **imágenes fijas** se omite el movimiento de cámara y se cuida la
composición (regla de tercios, espacio negativo donde luego irá el texto si hace falta).

## Cómo escribir cada prompt

Estructura mental: **sujeto + acción/emoción + entorno + luz + (movimiento si es vídeo) + estilo base.**

Anclar el prompt a la emoción de la frase. Ejemplos de correspondencia guión→imagen:
- Dato frío ("el 95 % se lo lleva el techo") → metáfora física real: persona diminuta
  bajo la sombra enorme de un tejado; billetes que se escapan de la mano.
- Contraste temporal ("en 2006 / en 2026") → misma escena con dos colorimetrías (cálida
  nostálgica vs. fría contemporánea), con detalles de época reales.
- Concepto abstracto ("las reglas están escritas", "entender la máquina") → objeto real
  que lo simboliza (tablero de ajedrez, engranajes metálicos, un manual que se abre).
- Momento personal ("revisas tu cuenta", "no llegas a fin de mes") → el personaje
  recurrente, primer plano, emoción legible en la cara.

Los objetos cotidianos fotografían de maravilla y mantienen el realismo: nóminas,
facturas, app del banco en el móvil, calculadora, llaves, huchas, carteles de "Se Alquila",
escaparates de inmobiliaria, monedas y billetes de euro, calendarios.

## Formato de salida (para pegar en Flow)

El creador copia y pega **una orden por imagen**. Entrega cada prompt como **una sola frase
imperativa corrida** que empieza por **"Crea una imagen…"** y lo describe todo de seguido
(estilo, personaje completo, escena, luz, técnica, "sin texto", 16:9). **No** separes un
título de la descripción, ni pongas "PLANO 3 — …" pegado al prompt: eso confunde qué hay que
copiar. Si numeras, deja el número **en su propia línea**, y el prompt debajo como un único
párrafo que se selecciona de un tirón. En un archivo `.txt`, un número por prompt + línea en
blanco entre ellos.

Ejemplo de una orden lista para pegar:
> Crea una imagen fotorrealista cinematográfica en formato horizontal 16:9, sin ningún texto:
> un hombre español de unos 32 años, pelo castaño corto, barba corta, en camiseta gris, de
> pie frente a una nevera abierta casi vacía en una cocina a oscuras; la luz fría de la
> nevera le ilumina la cara cansada, encuadre lateral íntimo, 35mm, colorimetría sobria,
> grano fílmico sutil.

## Continuidad del personaje (plantilla)

> `hombre español de 32 años, pelo castaño corto, barba corta descuidada, complexión
> normal, ropa de calle sencilla (camiseta gris, vaqueros)`

Ajustar edad/aspecto/país al guión (p. ej. padres o mayores de 40 en flashbacks). Mantener
la misma descripción palabra por palabra en todas sus apariciones.

## Ejemplo (frase → prompt de imagen fija)

Frase: *"Son las ocho de la tarde. Abres la nevera y está vacía."*

> `Interior de un piso pequeño español al anochecer. El hombre español de 32 años, pelo
> castaño corto, barba corta, camiseta gris, de pie frente a una nevera abierta casi vacía;
> la luz fría de la nevera ilumina su cara cansada en una cocina a oscuras, expresión de
> agotamiento. Encuadre lateral íntimo, sombras profundas. fotografía cinematográfica
> hiperrealista, full frame 35mm, luz natural, colorimetría sobria y ligeramente
> desaturada, profundidad de campo real, grano fílmico sutil, estilo documental
> contemporáneo, máximo detalle, 8K, sin texto en pantalla, 16:9`

## Cobertura completa del guión

Antes de cerrar la lista, comprobar que **todas las frases del guión tienen imagen**. Es
fácil dejar un tramo sin cubrir; si eso pasa, el editor tendría que estirar una imagen de
más y se nota. La forma segura de verificarlo es la misma segmentación que alimenta la
hoja de montaje (ver `timing.md`): si cada palabra del guión pertenece a una escena, no hay
huecos.
