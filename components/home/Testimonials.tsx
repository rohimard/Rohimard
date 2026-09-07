const quotes = [
  "No es solo un regalo, es un momento que recordarás siempre.",
  "Detalles que hablan del corazón.",
  "Los mejores momentos merecen ser celebrados.",
];

export function Testimonials() {
  return (
    <section className="py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Momentia</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Inspiramos momentos, creamos recuerdos.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {quotes.map((q) => (
            <blockquote
              key={q}
              className="card flex h-full flex-col justify-between gap-6 bg-maroon-600 p-7 text-cream-50"
            >
              <span className="script-accent text-4xl text-gold-400">“</span>
              <p className="font-serif text-lg leading-snug">{q}</p>
              <span className="text-xs uppercase tracking-wide text-cream-100/70">
                Momentia
              </span>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
