"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QrCodeCard({ slug }: { slug: string }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const url = `${window.location.origin}/${slug}`;
    setLink(url);
    QRCode.toDataURL(url, {
      width: 480,
      margin: 2,
      color: { dark: "#6b0f1a", light: "#f7e7dbff" },
    }).then(setQrDataUrl);
  }, [slug]);

  async function handleCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="card mx-auto max-w-sm p-6 text-center">
      <div className="mx-auto grid aspect-square w-56 place-items-center rounded-2xl bg-cream-100 p-4">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt={`Código QR de ${link}`} className="rounded-lg" />
        ) : (
          <span className="text-sm text-ink-400">Generando QR…</span>
        )}
      </div>

      <p className="mt-4 break-all text-sm font-medium text-maroon-700">
        {link}
      </p>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <a
          href={qrDataUrl ?? undefined}
          download={`momentia-qr-${slug}.png`}
          className="btn-primary flex-1"
        >
          Descargar QR
        </a>
        <button type="button" onClick={handleCopy} className="btn-secondary flex-1">
          {copied ? "¡Copiado!" : "Copiar enlace"}
        </button>
      </div>

      <p className="mt-4 text-xs text-ink-500">
        Imprime este código y colócalo dentro de la caja para que la persona
        lo escanee al abrirla.
      </p>
    </div>
  );
}
