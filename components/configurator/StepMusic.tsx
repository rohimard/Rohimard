"use client";

import { Music, ListMusic, Link2, VolumeX } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { MusicOption } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

const OPTIONS: { value: MusicOption; label: string; icon: typeof Music; placeholder: string }[] = [
  { value: "cancion", label: "Canción especial", icon: Music, placeholder: "Ej. Perfect - Ed Sheeran" },
  { value: "playlist", label: "Playlist", icon: ListMusic, placeholder: "Nombre de la playlist" },
  { value: "spotify", label: "Link de Spotify", icon: Link2, placeholder: "https://open.spotify.com/..." },
  { value: "sin_musica", label: "Sin música", icon: VolumeX, placeholder: "" },
];

export function StepMusic({
  option,
  value,
  onOptionChange,
  onValueChange,
}: {
  option: MusicOption;
  value: string;
  onOptionChange: (v: MusicOption) => void;
  onValueChange: (v: string) => void;
}) {
  const current = OPTIONS.find((o) => o.value === option);

  return (
    <div>
      <h2 className="heading-display text-2xl sm:text-3xl">La música de tu historia</h2>
      <p className="mt-2 text-sm text-ink/60">Elige cómo quieres darle banda sonora a este momento.</p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onOptionChange(opt.value)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-2xl border-2 bg-blanco px-3 py-6 text-center transition-all",
              option === opt.value ? "border-borgona-500 bg-borgona-50" : "border-ink/10 hover:border-borgona-200",
            )}
          >
            <opt.icon className="h-5 w-5 text-borgona-700" strokeWidth={1.6} />
            <span className="text-xs font-semibold text-ink/75">{opt.label}</span>
          </button>
        ))}
      </div>

      {current && current.value !== "sin_musica" && (
        <div className="mt-6 max-w-md space-y-2">
          <Label htmlFor="musicValue">{current.label}</Label>
          <Input id="musicValue" placeholder={current.placeholder} value={value} onChange={(e) => onValueChange(e.target.value)} />
        </div>
      )}
    </div>
  );
}
