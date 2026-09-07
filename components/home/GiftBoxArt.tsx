import { IconHeart, IconQr } from "@/components/ui/icons";

/** Ilustración decorativa de una caja de regalo con su QR, hecha en CSS/SVG. */
export function GiftBoxArt() {
  return (
    <div className="relative mx-auto flex h-80 w-full max-w-sm items-end justify-center sm:h-96">
      <div
        className="absolute inset-x-6 top-4 h-64 rounded-[2rem] bg-rose-200/40 blur-2xl sm:h-80"
        aria-hidden
      />

      {/* Caja */}
      <div className="relative w-56 sm:w-64">
        <div className="relative h-40 rounded-b-xl rounded-t-sm bg-maroon-600 shadow-card sm:h-48">
          <div className="absolute inset-x-0 top-0 h-full">
            <div className="absolute left-1/2 top-0 h-full w-6 -translate-x-1/2 bg-gold-400/90" />
          </div>
          <div className="absolute -top-6 left-1/2 h-14 w-56 -translate-x-1/2 rounded-t-xl bg-maroon-700 shadow-soft sm:w-64" />
          <div className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rounded-full bg-gold-400" />
        </div>

        {/* Tarjeta QR asomando de la caja */}
        <div className="absolute -right-6 -top-16 w-28 rotate-6 rounded-xl border border-maroon-100 bg-white p-2 shadow-card sm:-right-10 sm:-top-20 sm:w-32">
          <div className="grid place-items-center rounded-lg bg-cream-50 p-2 text-maroon-600">
            <IconQr width={44} height={44} />
          </div>
          <p className="mt-1 text-center text-[9px] font-semibold uppercase tracking-wide text-maroon-600">
            Escanéame
          </p>
        </div>

        <div className="absolute -left-8 -top-10 grid h-14 w-14 place-items-center rounded-full bg-rose-500 text-cream-50 shadow-card">
          <IconHeart width={22} height={22} />
        </div>
      </div>
    </div>
  );
}
