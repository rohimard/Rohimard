"use client";

import { useState } from "react";
import { IconMail } from "@/components/ui/icons";

export function EnvelopeReveal({
  recipientName,
  message,
}: {
  recipientName: string;
  message: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center text-center">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex flex-col items-center gap-4"
          style={{ perspective: "800px" }}
        >
          <span className="grid h-28 w-36 place-items-center rounded-xl border-2 border-gold-400 bg-maroon-700 text-cream-50 shadow-card transition-transform group-hover:-translate-y-1">
            <IconMail width={40} height={40} />
          </span>
          <span className="text-sm font-semibold text-maroon-700">
            Toca para abrir tu mensaje
          </span>
        </button>
      ) : (
        <div className="animate-fade-up max-w-lg rounded-2xl border border-gold-300 bg-white p-8 shadow-card">
          <span className="script-accent text-3xl">Para ti, {recipientName}</span>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-ink-800">
            {message}
          </p>
        </div>
      )}
    </div>
  );
}
