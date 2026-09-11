import Planificador from "@/components/Planificador";
import Montaje from "@/components/Montaje";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
      <header className="mb-10 max-w-2xl">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          NotebookLM · Video Overviews
        </p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Ocho minutos no se piden: se reparten.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          NotebookLM no tiene control de duración. Lo que sí tiene es un campo de
          instrucciones personalizadas que casi nadie usa bien. VideoLargo traduce tu
          duración objetivo a un presupuesto de palabras, lo reparte en bloques que el
          formato sí sabe producir y te escribe la instrucción de cada uno, dentro del
          límite de caracteres de tu plan.
        </p>
      </header>

      <Planificador />
      <Montaje />

      <footer className="mt-16 border-t border-line pt-6 text-xs text-muted">
        Las duraciones parten de un ritmo de narración de 145 palabras por minuto,
        medido sobre Video Overviews reales. NotebookLM no garantiza la duración: el
        plan la hace probable, no exacta.
      </footer>
    </main>
  );
}
