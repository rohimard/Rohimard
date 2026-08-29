# El granjero que capturó a 132 soldados él solo

Animación 3D low-poly de 4:52 sobre Alvin C. York y el 8 de octubre de 1918 en
el bosque de Argonne. Todo se genera por código: no hay modelos, texturas ni
imágenes externas.

```
GUION.md                 guion narrado (4.978 caracteres), un bloque por plano
render_video.py          renderiza los 34 planos y codifica el MP4
lowpoly/
  math3d.py              vectores, matrices, curvas de interpolación, ruido
  mesh.py                malla low-poly y primitivas (caja, cilindro, cono…)
  props.py               modelos de la historia: figuras, armas, edificios
  render.py              rasterizador, cámara, luz, niebla, cielo
  overlay.py             rótulos con franja oscura y fundidos
  escenas_base.py        cámaras animadas, paletas por tono, utilidades
  scenes.py              los 34 planos, en orden
tools/
  vista_previa.py        fotogramas sueltos para revisar un plano
  contacto.py            hoja de contactos con los 34 planos
  partir.py              trocea el MP4 por frontera de plano, sin recodificar
  contar_guion.py        recuento de caracteres del guion
```

## Uso

```bash
pip install numpy pillow imageio-ffmpeg

python3 render_video.py                        # salida/alvin_york_132.mp4
python3 render_video.py --escala 0.5 --fps 12  # prueba rápida
python3 render_video.py --planos 15 16 17      # sólo esos planos

python3 tools/contacto.py --u 0.5 --rotulos    # revisar los 34 encuadres
python3 tools/vista_previa.py -p 19 -n 3       # tres momentos del plano 19
python3 tools/partir.py --partes 3             # trocear para subir o enviar
```

`partir.py` corta por frontera de plano copiando el flujo, sin recodificar, así
que las partes se unen en edición sin pérdida.

Salida por defecto: 1920×1080, 24 fps, H.264 (CRF 19). El render completo son
7.008 fotogramas y tarda del orden de una hora en una CPU normal; el decorado
denso sube los planos a 18.000-30.000 triángulos.

## Cómo funciona el render

No hay GPU ni motor 3D. El rasterizador es propio y está en `render.py`:

1. Los vértices pasan a espacio de cámara y se recortan contra el plano cercano.
2. Cada triángulo recibe **un solo color** (sombreado plano): clave direccional
   cálida + relleno frío opuesto + ambiente hemisférico + realce de canto +
   niebla exponencial por distancia.
3. Se ordenan de lejos a cerca y se pintan con `ImageDraw.polygon`, que es
   código C y resulta mucho más rápido que un z-buffer en numpy con esta
   cantidad de polígonos.
4. Se renderiza al doble de resolución y se reduce con Lanczos (suavizado).
5. Viñeta y grano, y el fotograma se envía por tubería a ffmpeg.

Un plano típico son 8.000-30.000 triángulos y 0,4-0,9 s por fotograma.

### Las tres trampas del algoritmo del pintor

Ordenar por profundidad del centroide falla en tres casos, y los tres aparecen
en este vídeo. Están resueltos así:

- **Láminas finas** (papel sobre una mesa): la cara superior y la inferior
  tienen casi la misma profundidad y se alternaban, partiendo la hoja en
  triángulos sueltos. Se corrige con un sesgo de orden que adelanta las caras
  orientadas hacia la cámara (`orden_prof` en `render.py`).
- **Superficies grandes bajo objetos pequeños**: el centroide de una tapa de
  mesa hecha de dos triángulos enormes puede quedar por delante de la carta
  apoyada encima. Por eso existe `props.tablero()`, que subdivide la superficie.
- **Vistas muy oblicuas**: los insertos de mesa usan cámara casi cenital, donde
  todas las caras del tablero quedan a la misma profundidad y el orden es
  estable.

### El color: clave cálida contra sombra fría

El sombreado plano no tiene medios tonos, así que todo el modelado visual sale
del color de la luz. El esquema es el de la referencia de estilo:

- **Clave cálida** (`luz_color`, dorada) desde el lado de la cámara.
- **Relleno frío** (`relleno_color`, azul) desde el lado opuesto, para que las
  caras en sombra no queden en un gris plano.
- **Ambiente hemisférico** azul por arriba y terroso por abajo.
- **Realce de canto** (`borde_color`) en ángulos rasantes, que dibuja la silueta
  de la geometría low-poly.

Dos límites que hay que respetar al retocarlo:

- **Saturación por encima de ~1,15 vuelve fosforitos los verdes.** El terreno
  ya sale de una base saturada y la clave la multiplica.
- **El azul del ambiente no puede exceder mucho al verde.** Sobre un color
  oscuro el ambiente pesa más que la difusa, y los uniformes caqui viraban a
  azul marino.

El suelo lleva manchas de color (`color2` en `_suelo`) y jitter alto por cara:
una extensión de un solo verde se lee como plana por muy buena que sea la luz.
Y como el sombreado plano no genera contraste en terreno llano, las escenas
necesitan relieve real para tener luces y sombras.

### Densidad de decorado

`escenas_base.decorado()` reparte matas, flores, arbustos y piedras. El claro
central (`libre`, `centro_libre`) debe abrirse **sobre la trayectoria de la
cámara**, no sobre el origen: un arbusto a dos metros del objetivo tapa medio
encuadre.

La niebla se calibra para cámaras a ras de suelo. Los planos aéreos miran a
40 unidades o más y con esa densidad salen en blanco, por eso el plano 12 usa
`PAL_ARGONNE_AEREO`, una variante con menos niebla.

### Otras decisiones que costaron iteraciones

- **El terreno se ancla a 0 en el origen** (`escenas_base.alturas`). Las escenas
  se escenifican en el origen y tanto las cámaras como las figuras se colocan a
  alturas absolutas; sin ese anclaje, la cámara de los planos de combate quedaba
  *bajo tierra* y se veía el suelo desde abajo.
- **Trincheras y terraplenes son terreno deformado**, no cajas apoyadas encima
  (`props.trinchera`, `props.berma`), y reciben la función de altura del suelo
  para conformarse a él. Una caja sobre terreno ondulado se lee como una losa
  flotante.
- **Caras emisivas** (`Mesh.emisivo`): niebla, fogonazos, luna y bengalas
  conservan su color base. Iluminadas por la direccional, la bruma del amanecer
  se teñía de rosa intenso.
- **La niebla es sólo atmosférica**, por distancia. Las láminas translúcidas de
  bruma se retiraron: desde arriba se leían como losas y desde el suelo tapaban
  el decorado.
- **La luz clave viene del lado de la cámara** en las paletas sin disco solar.
  Con la luz hacia el fondo, los personajes eran siluetas negras.

## Los 34 planos

Ningún plano tiene la cámara fija: todos usan `dolly`, `orbita` o `grua`, y la
mayoría van envueltos en `deriva()` (micro-flotación) o `temblor()` (cámara en
mano, sólo en los planos de combate). Las duraciones coinciden con `GUION.md`.

| # | Plano | s | Cámara | Paleta |
|---|-------|---|--------|--------|
| 01 | Montañas de Tennessee | 11 | general, push-in | amanecer |
| 02 | La granja de los York | 10 | general, paneo | día claro |
| 03 | Juventud y conversión | 9 | medio, dolly | atardecer |
| 04 | La carta de reclutamiento | 9 | cenital, zoom | interior |
| 05 | La objeción denegada | 8 | cenital, push | interior |
| 06 | Campamento Gordon | 10 | general, órbita | encapotado |
| 07 | La montaña | 8 | contrapicado, grúa | amanecer |
| 08 | Campo de tiro | 7 | medio lateral, push | encapotado |
| 09 | Travesía del Atlántico | 7 | aéreo, paneo | mar frío |
| 10 | Francia devastada | 8 | general, dolly | gris desaturado |
| 11 | Las trincheras, de noche | 9 | contrapicado, grúa | noche |
| 12 | El bosque de Argonne | 10 | cenital descendente | niebla |
| 13 | El avance en la niebla | 9 | travelling | niebla |
| 14 | El puesto de mando alemán | 9 | medio, órbita | niebla |
| 15 | La emboscada | 6 | cámara en mano | combate |
| 16 | Seis muertos, tres heridos | 8 | tres cuartos alto | tensión |
| 17 | York queda al mando | 8 | primer plano, push | tensión |
| 18 | Solo, frente a la colina | 8 | órbita lenta | tensión |
| 19 | El cazador | 9 | medio lateral, push | tensión |
| 20 | El truco del pavo | 9 | picado | tensión |
| 21 | La carga de bayoneta | 8 | contrapicado, temblor | combate |
| 22 | La pistola | 9 | primer plano, push | combate |
| 23 | El silencio | 6 | medio, retroceso | tensión |
| 24 | La rendición | 10 | medio, dolly | luz que rompe |
| 25 | Salen de las trincheras | 9 | cenital, grúa | luz que rompe |
| 26 | La columna | 8 | travelling lateral | luz que rompe |
| 27 | Más prisioneros | 9 | aéreo, paneo | luz que rompe |
| 28 | El recuento | 8 | medio, push | luz que rompe |
| 29 | Ciento treinta y dos | 9 | rótulo grande | luz que rompe |
| 30 | La Medalla de Honor | 9 | cenital, órbita | oscuro y dorado |
| 31 | El regreso | 9 | general, paneo | día claro |
| 32 | La escuela | 9 | general, dolly | día claro |
| 33 | Epílogo | 9 | general, retroceso | hora dorada |
| 34 | Cierre | 8 | aéreo ascendente | hora dorada |

## Rótulos

`overlay.py` dibuja el texto sobre un rectángulo redondeado oscuro (alfa 0,66-0,74)
con un filete dorado inferior, sombra bajo el texto y entrada/salida por fundido.
Los tamaños están definidos para 1080p y se reescalan a la altura real del
lienzo, de modo que una previsualización en baja representa el encuadre final.
Tipografías: Big Shoulders Bold (rótulos) y Work Sans Bold (subtítulos).

## Sonido

El vídeo se entrega **sin audio**. El guion de `GUION.md` está pensado para
locutarse encima; cada bloque corresponde a un plano, así que la voz se puede
montar plano a plano sin recortar la imagen.

## Nota histórica

Los hechos siguen las fuentes habituales sobre York: el rechazo de su solicitud
de objetor de conciencia, la patrulla de 17 hombres del 328.º de Infantería, las
seis bajas que lo dejaron al mando, el uso de la técnica de caza de pavos, la
rendición ofrecida por el teniente Paul Vollmer y los 132 prisioneros que la
patrulla entregó en las líneas aliadas. La cifra se atribuye a la patrulla
entera, con York al mando, no a un solo hombre en sentido literal.
