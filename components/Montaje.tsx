const PASOS = [
  {
    titulo: "Un notebook, varias generaciones",
    detalle:
      "No hace falta duplicar el notebook por bloque. Genera un Video Overview, cambia la instrucción y genera el siguiente: se acumulan en el panel Studio.",
  },
  {
    titulo: "Formato Explainer y longitud Longer",
    detalle:
      "Es la combinación que más dura. Cinematic es más vistoso pero se queda en dos o tres minutos, y Short está fijado en sesenta segundos.",
  },
  {
    titulo: "Descarga y comprueba la duración real",
    detalle:
      "Si un bloque sale corto, no repitas la instrucción tal cual: súbele el número de palabras y añade un punto más al alcance antes de regenerar.",
  },
  {
    titulo: "Une los bloques en un editor",
    detalle:
      "CapCut, Descript, Premiere o el que uses. Corta el saludo repetido de cada bloque y deja medio segundo de aire entre ellos.",
  },
  {
    titulo: "Si necesitas pasar de quince minutos",
    detalle:
      "Cambia de herramienta. El Audio Overview sí llega a durar mucho más y puedes montarle imágenes encima, pero ya no es un Video Overview.",
  },
];

export default function Montaje() {
  return (
    <section className="mt-14">
      <h2 className="text-lg font-semibold">Del plan al vídeo</h2>
      <p className="mt-1.5 text-sm text-muted">
        El plan resuelve el guion y las instrucciones. Esto es lo que pasa después, dentro de NotebookLM.
      </p>

      <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PASOS.map((paso, i) => (
          <li key={paso.titulo} className="rounded-xl border border-line bg-surface p-4">
            <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-2 text-sm font-medium">{paso.titulo}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{paso.detalle}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
