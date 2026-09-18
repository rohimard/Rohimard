# PhotoBrush

App móvil (iOS/Android) para editar fotos con una **brocha de texto**: eliges
una foto, escribes una frase y la deslizas con el dedo sobre la imagen — el
texto sigue exactamente el trazo, repitiéndose a lo largo del recorrido
(inspirado en la herramienta "Brocha de texto" de la app coreana N×N).

## Funcionalidad

- Elegir una foto de la galería.
- Dibujar sobre la foto deslizando el dedo: el texto sigue el trazo en tiempo real.
- Cambiar el texto, color y tamaño de fuente antes de dibujar cada trazo.
- Deshacer el último trazo o borrar todos.
- Guardar la foto editada en la galería del dispositivo.

## Tecnología

- [Expo](https://expo.dev/) + React Native + TypeScript
- `react-native-svg` — renderiza el texto siguiendo el trazo (`<TextPath>`)
- `expo-image-picker` — seleccionar foto
- `expo-media-library` — guardar el resultado
- `react-native-view-shot` — exportar la vista (foto + texto) como imagen

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
eas build --platform android
eas build --platform ios
```

## Estructura

```
App.tsx                          Punto de entrada, navegación simple
src/
  screens/
    HomeScreen.tsx                Selector de foto
    EditorScreen.tsx              Editor: foto + toolbar + guardado
  components/
    TextBrushCanvas.tsx           La brocha de texto (captura el trazo y
                                   renderiza el texto siguiéndolo con SVG)
```

## Cómo funciona la brocha de texto

`TextBrushCanvas` usa `PanResponder` para capturar los puntos del dedo
mientras se desliza sobre la foto, arma un `<Path>` de SVG con esos puntos, y
coloca un `<Text>` con `<TextPath href="#idDelPath">` para que el texto
recorra exactamente esa curva. La frase se repite varias veces para cubrir
trazos largos.
