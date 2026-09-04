# Preparar el guión para que la voz suene natural

Se entregan **dos archivos** por producción:

| Archivo | Para qué | Ortografía |
|---|---|---|
| `guion.txt` | Leer, subtítulos, referencia | Correcta |
| `guion-voz.txt` | Pegar en ElevenLabs | Adaptada a la pronunciación |

El segundo se genera del primero. Los subtítulos se siguen sacando del
primero: el espectador tiene que leer "déjà vu", no "deyavú".

## 1. Los párrafos son pausas, no decoración

Es el error que más delata a una voz sintética. **Cada salto de línea en
blanco genera un silencio largo.** Un guión con una frase por párrafo suena a
alguien leyendo una lista de la compra.

Regla: un párrafo es **un bloque de sentido completo**, de tres a seis
frases. El punto y seguido ya da la pausa corta que hace falta dentro del
bloque. Deja línea en blanco solo donde de verdad quieres que el narrador
respire y cambie de tema.

Referencia: un guión de unos 4.500 caracteres debería tener entre **quince y
veinte párrafos**, no cuarenta.

## 2. Palabras extranjeras: se escriben como suenan

Un modelo leyendo en español no sabe francés ni inglés. Se reescriben
fonéticamente **solo en el archivo de voz**:

| Original | En `guion-voz.txt` |
|---|---|
| déjà vu | deyavú |
| déjà vécu | deyavecú |
| Penfield | Penfild |

Criterio: escribe lo que quieres oír, con la tilde puesta donde debe caer el
acento. Si dudas de cómo lo va a leer, reescríbelo.

## 3. Números: con letras, no con dígitos

Los dígitos son ambiguos para un modelo, y los símbolos más todavía.

| Evitar | Escribir |
|---|---|
| 1219 | mil doscientos diecinueve |
| 37 y 60 millones | treinta y siete y sesenta millones |
| 0,5 % | cero coma cinco por ciento |
| 24 millones de km² | veinticuatro millones de kilómetros cuadrados |
| a. C. | antes de Cristo |

Excepción: años muy conocidos que se leen bien igual. Ante la duda, letras.

## 4. Puntuación que estropea el ritmo

- **Dos puntos**: alargan la pausa más de lo que parece. Antes de una cita
  hablada, mejor una coma. `dice: esto ya lo he vivido` → `dice, esto ya lo
  he vivido`
- **Puntos suspensivos**: producen un final de frase apagado y raro. Usa
  punto o coma.
- **Rayas y paréntesis**: parten la entonación. Reescribe la frase.
- **MAYÚSCULAS**: algunos modelos las deletrean o las gritan. Nunca.
- **Signos de admiración**: fuerzan un énfasis teatral. Este canal no los usa.

## 5. Diferencias de acento que sí cambian la tónica

Con audiencia latinoamericana:

| España | Latinoamérica |
|---|---|
| vídeo | video |

No es un detalle menor: `vídeo` desplaza la tónica y suena inmediatamente a
locutor español.

## 6. Comprobación antes de generar

1. Cuenta párrafos: entre quince y veinte.
2. Busca dígitos y símbolos: no debe quedar ninguno.
3. Busca palabras que no sean españolas: reescríbelas.
4. Cuenta caracteres: el archivo de voz también debe caer en 4.500-5.000.

## 7. Sobre las etiquetas de emoción

Siguen **desactivadas por defecto** (ver `guion.md`). La emoción va en las
palabras y en el ritmo. Las etiquetas fuerzan interpretaciones que suenan
peor que no poner nada, y además consumen caracteres del límite.
