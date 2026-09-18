# 50 Prompts Listos para Servicios de Agencia de IA

Organizados por categoría de servicio. Cada prompt está pensado para adaptarse en minutos: reemplaza los campos entre `[corchetes]` con los datos del cliente.

## Atención al cliente / WhatsApp

1. "Eres el asistente virtual de [NOMBRE_NEGOCIO], un [TIPO_NEGOCIO]. Responde de forma breve y cálida. Si preguntan por precios, da el rango de [PRECIO_MIN] a [PRECIO_MAX] y ofrece agendar una llamada. Si preguntan algo que no sabes, di que un miembro del equipo responderá en menos de [X] horas."
2. "Clasifica el siguiente mensaje de un cliente en una de estas categorías: [consulta de precio, queja, agendar cita, información general, urgente]. Responde solo con la categoría."
3. "Redacta una respuesta empática para un cliente que se queja de [PROBLEMA]. Reconoce el problema, no te disculpes en exceso, y ofrece [SOLUCIÓN_CONCRETA] como siguiente paso."
4. "Genera 5 respuestas rápidas predefinidas para las preguntas más frecuentes de un negocio de [RUBRO]: horario, ubicación, precios, métodos de pago, garantía."
5. "Eres un agente de soporte de nivel 1. Determina si esta consulta puede resolverse con la información del [DOCUMENTO/FAQ] adjunto o si debe escalarse a un humano. Responde 'RESOLVER' o 'ESCALAR' con una razón breve."

## Calificación de leads

6. "Analiza esta conversación con un lead y califícalo como CALIENTE, TIBIO o FRÍO según: presupuesto mencionado, urgencia expresada, y si pidió más información activamente."
7. "Redacta 3 preguntas de calificación para un chatbot de [NICHO] que ayuden a determinar si el visitante es un comprador serio antes de pasarlo a un vendedor humano."
8. "Genera un resumen de 2 líneas de esta conversación de lead para enviarlo al equipo de ventas por Slack/WhatsApp, incluyendo nombre, necesidad y nivel de urgencia."
9. "Basado en estas respuestas del formulario [RESPUESTAS], asigna un score de 1 a 10 de qué tan listo está este lead para comprar [PRODUCTO/SERVICIO]."
10. "Escribe un mensaje de seguimiento automático para un lead que llenó el formulario pero no respondió en 24 horas."

## Generación de contenido para clientes

11. "Escribe 5 variantes de un anuncio de Facebook/Instagram para [NEGOCIO] promocionando [OFERTA], dirigido a [PÚBLICO_OBJETIVO], tono [FORMAL/CERCANO/DIVERTIDO]."
12. "Genera un calendario de 10 publicaciones para redes sociales de un [TIPO_NEGOCIO] durante el mes de [MES], alternando contenido educativo, promocional y de comunidad."
13. "Convierte esta reseña de cliente en un post de redes sociales atractivo, manteniendo el mensaje original: [RESEÑA]."
14. "Escribe un email de bienvenida para nuevos suscriptores de [NEGOCIO] que explique en 100 palabras qué pueden esperar y un primer paso claro."
15. "Genera 10 ideas de contenido para un negocio de [RUBRO] que responda las objeciones más comunes de sus clientes antes de comprar."

## Automatización de ventas y seguimiento

16. "Escribe una secuencia de 4 emails de seguimiento post-cotización para un cliente que no ha respondido, espaciados en 2, 5, 8 y 14 días, sin sonar desesperado."
17. "Redacta un mensaje de recuperación de carrito abandonado para una tienda de [RUBRO], ofreciendo [INCENTIVO] si completa la compra en las próximas 24 horas."
18. "Genera un mensaje de confirmación de cita que incluya recordatorio automático 24 horas antes, con opción de reagendar por el mismo canal."
19. "Escribe un script de llamada de bienvenida para un cliente nuevo que acaba de contratar [SERVICIO], estableciendo expectativas de entrega."
20. "Redacta una encuesta de satisfacción post-servicio de 3 preguntas para enviar automáticamente al cerrar un ticket."

## Análisis y reportes para clientes

21. "Resume estas 50 conversaciones de soporte en los 5 problemas más frecuentes reportados por clientes, ordenados por frecuencia."
22. "A partir de estos datos de ventas [DATOS], genera un resumen ejecutivo de 5 líneas destacando la tendencia principal y una recomendación accionable."
23. "Analiza estos comentarios de redes sociales y clasifica el sentimiento general en positivo/neutral/negativo con 2 ejemplos de cada uno."
24. "Genera un reporte semanal automático que resuma: mensajes atendidos por el bot, mensajes escalados a humano, y tiempo promedio de respuesta."
25. "A partir de este historial de compras de un cliente, sugiere 3 productos/servicios adicionales que probablemente le interesen (cross-sell)."

## Propuestas y ventas (para uso interno de la agencia)

26. "Redacta una propuesta comercial breve para un [TIPO_NEGOCIO] ofreciendo [SERVICIO], incluyendo problema, solución, alcance, precio y próximo paso."
27. "Genera 3 objeciones comunes que un [TIPO_NEGOCIO] tendría para no contratar automatización con IA, y una respuesta breve para cada una."
28. "Escribe un mensaje de LinkedIn de primer contacto (no genérico) para un dueño de [TIPO_NEGOCIO], mencionando un problema específico de su industria."
29. "Redacta un caso de éxito ficticio pero realista de una implementación de [SERVICIO] en un negocio de [RUBRO], con métricas de antes/después."
30. "Genera 5 preguntas de descubrimiento para la primera llamada con un prospecto de [NICHO], enfocadas en encontrar dónde pierden tiempo o dinero hoy."

## Configuración técnica (para pasar a n8n/Make/prompts de sistema)

31. "Actúa como router de intenciones. Clasifica el mensaje del usuario en: [AGENDAR, PRECIO, QUEJA, INFO, OTRO] y devuelve solo un JSON con el campo 'intencion'."
32. "Extrae de este mensaje el nombre, fecha y hora solicitada para una cita, en formato JSON. Si falta algún dato, indícalo como null."
33. "Genera una respuesta en el tono de marca de [NEGOCIO] (descripción de tono: [TONO]) para el siguiente mensaje del cliente: [MENSAJE]."
34. "Valida si este mensaje contiene una queja grave que requiere escalamiento inmediato a un humano. Responde SI o NO con una razón de una línea."
35. "Convierte esta conversación completa en un resumen tipo ticket para el CRM, con campos: cliente, problema, solución aplicada, estado."

## Onboarding y documentación para el cliente final de la agencia

36. "Escribe un manual de uso de 1 página para que el dueño del negocio entienda cómo funciona su nuevo asistente de IA y cómo pedir cambios."
37. "Genera una lista de 10 preguntas frecuentes que el dueño del negocio podría tener sobre su nuevo sistema automatizado, con respuestas simples."
38. "Redacta un email de entrega de proyecto que resuma qué se construyó, cómo probarlo, y los próximos pasos de soporte."
39. "Escribe instrucciones paso a paso para que un empleado no técnico pueda actualizar la información básica del bot (horarios, precios, FAQ)."
40. "Genera un checklist de QA de 10 puntos para probar un asistente de WhatsApp antes de entregarlo al cliente."

## Escalamiento de la agencia (uso interno, crecimiento)

41. "Redacta una descripción de puesto para un 'especialista en automatización con IA' junior que pueda ayudar a escalar la agencia."
42. "Genera un SOP (procedimiento estándar) de 8 pasos para implementar el servicio 'Agente de WhatsApp con IA' de forma repetible con cualquier cliente nuevo."
43. "Escribe un email de referidos para enviar a clientes satisfechos ofreciendo un incentivo por cada cliente nuevo que refieran."
44. "Genera 5 ideas de servicios adicionales (upsell) que se le puedan ofrecer a un cliente que ya tiene el paquete Starter, después de 3 meses."
45. "Redacta el guion de un video de 60 segundos explicando en lenguaje simple qué hace tu agencia, para usar en redes sociales."

## Prompts de investigación de nicho

46. "Lista los 10 problemas operativos más comunes que enfrentan los negocios de [NICHO] relacionados con atención al cliente y seguimiento de ventas."
47. "¿Qué herramientas de software usa típicamente un negocio de [NICHO] hoy, y dónde hay fricción que la IA podría resolver?"
48. "Genera 5 preguntas para validar por qué un [TIPO_NEGOCIO] específico estaría dispuesto a pagar por automatización antes de construir nada."
49. "¿Cuál es el rango de precio razonable que un negocio pequeño de [NICHO] pagaría mensualmente por un servicio que le ahorre [X] horas a la semana?"
50. "Compara los pros y contras de ofrecer el servicio de IA como pago único vs. suscripción mensual para un negocio de [NICHO]."
