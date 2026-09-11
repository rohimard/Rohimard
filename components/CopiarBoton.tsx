"use client";

import { useEffect, useState } from "react";

export default function CopiarBoton({ texto, etiqueta = "Copiar" }: { texto: string; etiqueta?: string }) {
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!copiado) return;
    const id = setTimeout(() => setCopiado(false), 1800);
    return () => clearTimeout(id);
  }, [copiado]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
    } catch {
      // Navegadores sin permiso de portapapeles: seleccionar es mejor que nada.
      const campo = document.createElement("textarea");
      campo.value = texto;
      document.body.appendChild(campo);
      campo.select();
      document.execCommand("copy");
      document.body.removeChild(campo);
      setCopiado(true);
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="shrink-0 rounded-md border border-line bg-ink px-2.5 py-1 text-xs font-medium
                 text-slate-200 transition hover:border-accent hover:text-accent"
    >
      {copiado ? "Copiado ✓" : etiqueta}
    </button>
  );
}
