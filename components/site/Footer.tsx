import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { IconPin, IconTruck } from "@/components/ui/icons";

export function Footer() {
  return (
    <footer className="border-t border-maroon-100 bg-maroon-600 text-cream-100">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-gold-400 font-serif text-lg font-bold text-gold-400">
              M
            </span>
            <span className="font-serif text-xl font-bold tracking-wide text-cream-50">
              MOMENTIA
            </span>
          </span>
          <p className="mt-3 max-w-xs text-sm text-cream-100/80">
            Inspiramos momentos, creamos recuerdos. Regalos que continúan
            después de abrirlos.
          </p>
          <a
            href="https://instagram.com/momentia.pe"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-sm font-medium text-gold-400 hover:text-gold-300"
          >
            @momentia.pe
          </a>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gold-400">
            Tienda
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-cream-100/85">
            <li>
              <Link href="/tienda" className="hover:text-cream-50">
                Momentia Esencial
              </Link>
            </li>
            <li>
              <Link href="/tienda" className="hover:text-cream-50">
                Momentia Historia
              </Link>
            </li>
            <li>
              <Link href="/tienda" className="hover:text-cream-50">
                Momentia Corporate
              </Link>
            </li>
            <li>
              <Link href="/crear" className="hover:text-cream-50">
                Crear mi regalo
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gold-400">
            Experiencia digital
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-cream-100/85">
            <li>Mensaje personalizado</li>
            <li>Galería de fotos</li>
            <li>Video especial</li>
            <li>Playlist personalizada</li>
            <li>Carta digital</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gold-400">
            Entregamos momentos
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-cream-100/85">
            <li className="flex items-center gap-2">
              <IconPin width={16} height={16} />
              Lima y Callao
            </li>
            <li className="flex items-center gap-2">
              <IconTruck width={16} height={16} />
              Envíos a todo el Perú
            </li>
            <li>hola@momentia.pe</li>
            <li>+51 917 654 321</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream-50/10 py-5">
        <p className="container-page text-center text-xs text-cream-100/60">
          © {new Date().getFullYear()} Momentia. Hecho con amor en cada
          detalle.
        </p>
      </div>
    </footer>
  );
}
