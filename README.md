# 🎬 Agente de IA experto en YouTube

Un agente que, a partir de un **nicho**, hace todo el trabajo pesado de un canal de YouTube:

1. **Investiga** el nicho: competencia, tendencias, palabras clave y — lo más
   interesante — **canales pequeños con muchas vistas** (los llamamos *canales joya*),
   ranqueados por un **Viral Score** = `vistas ÷ suscriptores`.
2. **Escribe el guion** completo y optimizado (hook, retención, CTA), **listo para
   copiar y pegar**.
3. **Genera los prompts de imágenes** para cada escena del guion (Midjourney/DALL·E/SD).
4. **Descarga imágenes de stock** reales desde Pexels que encajan con cada escena.

Además te entrega el **paquete SEO**: títulos (varias opciones), descripción,
etiquetas, hashtags, texto de miniatura y capítulos con timestamps.

---

## 🚀 Instalación

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env             # y rellena tus claves
```

### Claves de API

| Variable | ¿Obligatoria? | Para qué sirve | Dónde conseguirla |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | **Sí** | Motor del agente (guion, prompts, SEO) | https://console.anthropic.com |
| `YOUTUBE_API_KEY` | Recomendada | Datos reales de vistas/suscriptores y *canales joya* | Google Cloud → "YouTube Data API v3" |
| `PEXELS_API_KEY` | Opcional | Descargar fotos de stock gratis | https://www.pexels.com/api/ |

> El agente **funciona aunque falten** `YOUTUBE_API_KEY` o `PEXELS_API_KEY`:
> - Sin YouTube → usa la **búsqueda web de Claude** como respaldo.
> - Sin Pexels → genera igual **los prompts** de imágenes (solo no descarga las fotos).

---

## 🧑‍💻 Uso

Flujo completo (investigación → guion → prompts → imágenes):

```bash
python -m src.agent "finanzas personales"
```

Con un tema específico y duración:

```bash
python -m src.agent "finanzas personales" --tema "3 errores al invertir tu primer sueldo" --duracion 10
```

Solo investigar el nicho:

```bash
python -m src.agent "recetas fáciles" --solo-investigacion
```

Opciones:

| Opción | Descripción |
|---|---|
| `--tema` | Tema exacto del video. Si lo omites, el agente elige el de mayor potencial. |
| `--duracion` | Duración objetivo en minutos (por defecto 8). |
| `--imagenes-por-escena` | Cuántas fotos de stock bajar por escena (por defecto 1). |
| `--solo-investigacion` | Solo hace la etapa 1. |

---

## 📦 Qué obtienes

Cada ejecución crea una carpeta en `salidas/<tema>-<fecha>/`:

```
salidas/3-errores-al-invertir-20260806-101500/
├── investigacion.md      # competencia, tendencias, palabras clave, canales joya
├── guion.md              # guion + títulos + descripción + tags + hashtags + miniatura
├── prompts_imagenes.md   # prompt por escena + consulta de stock
├── imagenes/             # fotos de stock descargadas (escena_1_1.jpg, ...)
└── proyecto.json         # todo lo anterior en JSON, por si quieres automatizar
```

---

## ⚙️ Cómo funciona (arquitectura)

```
src/
├── agent.py            # orquestador + CLI (une las 4 etapas y escribe el paquete)
├── config.py           # lee .env / entorno
├── claude_client.py    # envoltorio del SDK de Anthropic (texto, JSON, búsqueda web)
├── youtube_research.py # etapa 1 — API de YouTube o respaldo web
├── script_generator.py # etapa 2 — guion + SEO
├── image_prompts.py    # etapa 3 — prompts de imágenes
└── stock_images.py     # etapa 4 — descarga desde Pexels
```

---

## ⚠️ Notas y límites

- **Cuota de YouTube API**: la investigación consume varias unidades por consulta.
  El agente limita las llamadas, pero si ves errores de cuota, espera o reduce
  el número de consultas del nicho.
- El **Viral Score** es una heurística útil, no una garantía: un canal con pocos
  subs y muchas vistas suele indicar un tema con demanda que la competencia aún
  no domina.
- Respeta los **derechos de las imágenes**: Pexels es de uso libre, pero conviene
  dar crédito al autor (se incluye en `prompts_imagenes.md` y `proyecto.json`).
- Los guiones son un punto de partida excelente; revísalos y dales tu voz antes
  de grabar.
