# PhotoBrush

Editor de fotos cuya herramienta principal es el **Text Brush**: escribes una
palabra o frase, activas la brocha, y al deslizar el dedo sobre la foto el
texto se estampa repetidas veces siguiendo exactamente la dirección del
trazo (línea recta, curva o círculo), rotando cada instancia según el tramo
local del recorrido.

## Funcionalidad

- Pantalla principal: "Nueva imagen" (cámara o galería), "Abrir de galería" y
  proyectos recientes.
- Editor con zoom (pellizcar) y desplazamiento sobre la foto, preservando su
  relación de aspecto.
- **Text Brush**: arrastra el dedo y el texto se estampa en tiempo real
  siguiendo el trazo, rotado según su dirección.
- **Texto**: toca una vez para colocar una sola instancia de texto (sin
  arrastrar).
- Controles de color, tamaño, fuente (varias tipografías), espaciado entre
  instancias y opacidad.
- Deshacer / Rehacer por trazo completo (cada arrastre o toque cuenta como
  una operación), y Borrar todo.
- Exportar el resultado a la galería del dispositivo, preservando la
  resolución nativa de la foto original.

## Tecnología

- [Expo](https://expo.dev/) + React Native + TypeScript + **Expo Router**
  (navegación basada en archivos, `app/`)
- `react-native-gesture-handler` + `react-native-reanimated` — gestos de
  dibujo, pellizco (zoom) y desplazamiento
- `react-native-svg` — renderiza cada instancia de texto rotada
  (`<Text transform="rotate(...)">`), no un único `<TextPath>` continuo
- `expo-image-picker` — cámara / galería
- `expo-font` + `@expo-google-fonts/*` — tipografías del selector de fuente
- `@react-native-async-storage/async-storage` — proyectos recientes
- `expo-media-library` + `react-native-view-shot` — exportar a la galería

## Puesta en marcha

```bash
npm install
npx expo start
```

Escanea el código QR con la app **Expo Go** (disponible en App Store y Google
Play) desde tu iPhone o Android para probarla al instante, sin necesidad de
compilar nada.

### Generar una app instalable (.ipa / .apk)

Para producir un binario real de tienda se necesita
[EAS Build](https://docs.expo.dev/build/introduction/) (compila en la nube,
no requiere Xcode/Android Studio locales):

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview   # APK instalable
eas build --platform ios
```

### Calidad

```bash
npm run typecheck   # tsc --noEmit
npm run lint         # eslint .
```

## Estructura

```
app/                                Rutas (Expo Router)
  _layout.tsx                       Providers globales, carga de fuentes
  index.tsx                         HomeScreen
  editor.tsx                        EditorScreen
src/
  types/index.ts                    ImageDocument, BrushSettings, TextStroke,
                                     TextElement, EditorState, ...
  lib/
    strokeMath.ts                   Resamplea el trazo crudo en instancias
                                     de texto espaciadas y rotadas (el
                                     algoritmo del Text Brush)
    fonts.ts                        Registro de fuentes (Google Fonts)
    storage.ts                      Proyectos recientes (AsyncStorage)
  state/
    EditorContext.tsx                Estado del editor (reducer + contexto)
    HistoryManager.ts                Undo/Redo puro, por trazo
    ExportManager.ts                 Captura + guardado en galería
  components/
    ImageCanvas.tsx                  Foto + zoom/pan (pellizcar, desplazar)
    TextBrush.tsx                    Captura el gesto y dibuja en vivo
    TextElementGlyph.tsx             Una instancia de texto (SVG)
    ExportCanvas.tsx                 Copia oculta sin zoom, para exportar
    BrushToolbar.tsx                 Barra inferior de herramientas
    BrushSettings.tsx                Panel contextual (tamaño/espaciado/opacidad)
    ColorPicker.tsx / FontPicker.tsx
    RecentProjects.tsx
```

## Cómo funciona el Text Brush

`TextBrush` captura los puntos del dedo con `react-native-gesture-handler`
(con un umbral de distancia mínima entre puntos, para no saturar el estado
de React en un arrastre rápido). En cada actualización, `strokeMath.ts`
recorre la polilínea cruda y la re-muestrea a intervalos fijos (el
"espaciado" configurable): en cada punto de muestreo calcula el ángulo local
del segmento y coloca ahí una instancia del texto rotada exactamente a ese
ángulo — son estampas independientes, no un único texto fluyendo por un
`<textPath>`, lo que permite controlar espaciado y rotación por instancia
igual que pide una herramienta de "brocha de texto". Al soltar el dedo, el
trazo completo (todas sus instancias) se confirma como una sola operación de
historial.
