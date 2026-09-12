# Gemini TTS: todo lo que da, y lo que cuesta

Inventario honesto tras probar el motor. Escrito para no repetir preguntas.

## 1. Lo que se puede mover

| Palanca | Detalle |
|---|---|
| **Voces** | 30 predefinidas. Cada una trae un descriptor oficial de Google de una palabra (Friendly, Casual, Easy-going, Clear, Smooth, Knowledgeable, Mature, Informative, Firm, Even, Breathy...). Son timbres fijos: no se editan. |
| **Direccion** | Instrucciones en lenguaje natural, en la misma peticion. Esta es la palanca real: es lo unico que ningun otro motor probado ofrece. Azure te daba una lista cerrada de estilos; aqui le describes la interpretacion con palabras. |
| **Modelo** | `gemini-2.5-flash-preview-tts` (rapido) y `gemini-2.5-pro-preview-tts` (mas calidad). **Cuotas diarias separadas**, asi que usar los dos duplica el cupo gratuito. |
| **Dos hablantes** | Hasta dos voces en una peticion, con direccion propia por turno. No hace falta para narracion, pero abre un formato de dialogo. |
| **Idiomas** | 24, español incluido. Se detecta del texto; no hay codigo de idioma que pasar. |
| **Texto largo** | Cabe el guion entero en una peticion (ventana de ~8k tokens). Importa: menos cortes = prosodia mas coherente. |

## 2. Lo que NO se puede mover

- **Timbre**: no hay clonacion ni ajuste de tono. Si ninguna de las 30 sirve, no hay 31.
- **Velocidad y volumen numericos**: no hay `<prosody>`. Todo va por la direccion escrita.
- **Ancho de banda**: sale a 24 kHz nativos, techo real de ~12 kHz. Medido en las
  seis muestras de la primera tanda. Es el mismo techo que tenia Azure DragonHD.
  Para voz sobre imagen no se nota; conviene saberlo y no perseguirlo.

## 3. El coste oculto: se pierden las marcas de palabra

Azure devolvia `word boundary`: el instante exacto de cada palabra en el audio.
Sobre eso se construyeron dos cosas que hoy funcionan:

- `subtitulos.srt` con 0 desfases (antes 25 de 82 fallaban por mas de 0,3 s).
- La hoja de montaje de los 89 planos, cuadrada al milisegundo.

**Gemini no devuelve nada de eso.** Devuelve audio y punto. Si la voz final es de
Gemini, hay que reconstruir las marcas con alineamiento forzado (Whisper sobre
el runner: se le da el audio y el texto que ya conocemos, y devuelve los
tiempos). Es resoluble y no cuesta credito, pero es trabajo a hacer antes de
narrar el guion completo, no despues.

## 4. Cuota y monetizacion

Numeros MEDIDOS, no de folleto (salen del cuerpo de los 429 del 12/09):

| Modelo | Plan gratuito |
|---|---|
| `gemini-2.5-flash-preview-tts` | 3 por minuto, **10 al dia** |
| `gemini-2.5-pro-preview-tts` | **`limit: 0` — no esta en el plan gratuito** |

Lo segundo importa mas de lo que parece: `pro` no es "cuota agotada", es que no
existe sin facturacion. Esperar al reinicio no lo desbloquea. Si se quiere la
calidad de `pro` hay que activar plan de pago; con plan gratuito el techo real
del canal son diez muestras diarias de `flash`.
- El uso comercial de la salida esta permitido por los terminos de la API. Aviso
  honesto: en el plan gratuito Google puede usar las peticiones para mejorar sus
  productos. No bloquea monetizar, pero es la diferencia real con el plan de pago.

## 5. Lo que queda por probar (fase 2)

1. **Direccion por tramo.** Narrar el guion en bloques con direccion distinta en
   cada uno: expositivo en el planteamiento, mas bajo en el giro. Un narrador de
   verdad no lee los 300 s con el mismo tono, y esto es el unico motor que lo
   permite sin cortar la voz.
2. **Guion entero en una peticion** contra guion por bloques, a ver cual mantiene
   mejor la prosodia.
3. **Alineamiento forzado** para recuperar subtitulos y hoja de montaje.
