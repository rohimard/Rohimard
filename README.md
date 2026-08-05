# 🐣 Pixelmon — Mascota Virtual (Tamagotchi)

Una mascota virtual estilo **Tamagotchi** hecha con HTML, CSS y JavaScript puro.
Sin dependencias, sin build: solo abre `index.html` en el navegador.

![estilo tamagotchi](https://img.shields.io/badge/estilo-Tamagotchi-7ec8a8) ![sin_dependencias](https://img.shields.io/badge/dependencias-0-brightgreen)

## ✨ Características

- 🐾 **Mascota animada** dibujada 100% con CSS (parpadea, respira, salta, come…).
- 📊 **5 estadísticas** que cambian en tiempo real: hambre, felicidad, energía, limpieza y salud.
- 🎮 **Acciones**: alimentar 🍔, jugar 🎾, dormir 💤, limpiar 🧼 y curar 💊.
- 😀 **Estados de ánimo** y reacciones: feliz, triste, enfermo, dormido… ¡y muere si la descuidas!
- 🌙 **Ciclo día/noche** según tu reloj real y modo sueño con estrellas.
- 💾 **Guardado automático** en `localStorage`, incluyendo el tiempo que la app estuvo cerrada.
- 🎂 **Envejece** con el tiempo: bebé → niño → joven → adulto (cambia de tamaño).
- 💩 Genera suciedad que debes limpiar o afectará su salud.
- 🔊 **Efectos de sonido** generados con WebAudio (sin archivos), con botón de silencio.
- ⌨️ **Atajos de teclado** y soporte para `prefers-reduced-motion`.

## 🚀 Cómo usar

1. Clona o descarga este repositorio.
2. Abre `index.html` en cualquier navegador moderno.

O sírvelo localmente:

```bash
python3 -m http.server 8000
# luego abre http://localhost:8000
```

## 🎯 Controles

| Botón | Acción   | Tecla |
|-------|----------|-------|
| 🍔    | Alimentar | `F`   |
| 🎾    | Jugar     | `P`   |
| 💤    | Dormir / Despertar | `S` |
| 🧼    | Limpiar   | `C`   |
| 💊    | Curar     | `H`   |

- **Toca a la mascota** para mimarla y subir su felicidad.
- **↺ Reiniciar** empieza de cero con una nueva mascota.

## 🧠 Cómo funciona

- Las estadísticas decaen con el **tiempo real** (`DECAY` en `game.js`).
- Si hambre, felicidad, energía o limpieza caen demasiado, la **salud baja** y la mascota puede enfermar.
- Si la salud llega a 0, la mascota muere y puedes adoptar una nueva.
- Todo el progreso se guarda solo; al volver, se simula lo ocurrido mientras estuvo cerrada (máx. 12 h).

## 🛠️ Personalización

Edita las constantes al inicio de `game.js`:

```js
const DECAY = { hunger: 0.9/60, happy: 0.7/60, energy: 0.5/60, clean: 0.4/60 };
const AGE_PER_DAY = 24*60*60*1000; // duración de un "día" de vida
```

Sube los valores de `DECAY` para una mascota más exigente, o baja `AGE_PER_DAY`
para que envejezca más rápido y ver antes las etapas de vida.

## 📁 Estructura

```
├── index.html   # Estructura y carcasa del dispositivo
├── style.css    # Estilos, mascota en CSS y animaciones
├── game.js      # Lógica del juego, estado y persistencia
└── README.md
```

---

Hecho con 💚 para cuidar mascotas pixeladas.
