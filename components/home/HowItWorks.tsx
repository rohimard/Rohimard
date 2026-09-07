const pasos = [
  {
    n: "01",
    title: "Elige tu caja",
    text: "Escoge la línea Momentia que se ajuste al momento que quieres celebrar.",
  },
  {
    n: "02",
    title: "Cuéntanos su historia",
    text: "Sube fotos, un video, tu playlist y escribe un mensaje o una carta en /crear.",
  },
  {
    n: "03",
    title: "Armamos tu caja con su QR",
    text: "Imprimimos y colocamos un código QR único dentro del regalo físico.",
  },
  {
    n: "04",
    title: "Entregamos el momento",
    text: "Envíos en Lima y Callao, y a todo el Perú.",
  },
  {
    n: "05",
    title: "La persona escanea y revive el momento",
    text: "Descubre su página personalizada con fotos, video, playlist y carta.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-maroon-50/50 py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Cómo funciona</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            De tu idea a un momento inolvidable.
          </h2>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-5">
          {pasos.map((p, i) => (
            <div key={p.n} className="relative">
              {i < pasos.length - 1 && (
                <div
                  className="absolute left-[1.6rem] top-6 hidden h-px w-[calc(100%-1rem)] bg-gradient-to-r from-maroon-200 to-transparent md:block"
                  aria-hidden
                />
              )}
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-maroon-200 bg-white font-serif text-lg font-bold text-maroon-600 shadow-soft">
                {p.n}
              </span>
              <h3 className="mt-5 text-sm font-semibold text-ink-900">
                {p.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-600">
                {p.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
