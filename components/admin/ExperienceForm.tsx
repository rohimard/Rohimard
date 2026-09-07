"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { saveExperience } from "@/lib/actions/admin-experiences";
import type { ExperienceFormInput } from "@/lib/validations/experience";

export function ExperienceForm({ initial }: { initial: ExperienceFormInput }) {
  const router = useRouter();
  const [values, setValues] = useState<ExperienceFormInput>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof ExperienceFormInput>(key: K, value: ExperienceFormInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await saveExperience(values);
    setSaving(false);

    if (!res.success) {
      setError(res.error ?? "Ocurrió un error.");
      return;
    }
    if (!values.id && res.id) {
      router.push(`/admin/experiencias/${res.id}`);
    } else {
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card-premium grid gap-5 p-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input id="slug" required value={values.slug} onChange={(e) => update("slug", e.target.value.toLowerCase())} />
          <p className="text-xs text-ink/40">momentia.pe/m/{values.slug || "..."}</p>
        </div>
        <div className="space-y-2">
          <Label>Estado</Label>
          <Select value={values.status} onValueChange={(v) => update("status", v as ExperienceFormInput["status"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="borrador">Borrador</SelectItem>
              <SelectItem value="publicada">Publicada</SelectItem>
              <SelectItem value="archivada">Archivada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipientName">Para (nombre de quien recibe)</Label>
          <Input id="recipientName" required value={values.recipientName} onChange={(e) => update("recipientName", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="senderName">De parte de</Label>
          <Input id="senderName" value={values.senderName} onChange={(e) => update("senderName", e.target.value)} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="introMessage">Mensaje de introducción</Label>
          <Input id="introMessage" value={values.introMessage} onChange={(e) => update("introMessage", e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="welcomeMessage">Mensaje de bienvenida</Label>
          <Textarea id="welcomeMessage" value={values.welcomeMessage} onChange={(e) => update("welcomeMessage", e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="story">Nuestra historia</Label>
          <Textarea id="story" value={values.story} onChange={(e) => update("story", e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="letter">Carta para ti</Label>
          <Textarea id="letter" className="min-h-[140px]" value={values.letter} onChange={(e) => update("letter", e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="finalMessage">Mensaje final</Label>
          <Input id="finalMessage" required value={values.finalMessage} onChange={(e) => update("finalMessage", e.target.value)} />
        </div>
      </div>

      <div className="card-premium grid gap-5 p-6 sm:grid-cols-2">
        <h3 className="heading-display text-lg sm:col-span-2">Privacidad</h3>
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select value={values.privacy} onValueChange={(v) => update("privacy", v as ExperienceFormInput["privacy"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Pública</SelectItem>
              <SelectItem value="private">Privada (con PIN)</SelectItem>
              <SelectItem value="temporal">Temporal (con expiración)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {values.privacy === "private" && (
          <div className="space-y-2">
            <Label htmlFor="pin">PIN {values.id && "(dejar vacío para no cambiarlo)"}</Label>
            <Input id="pin" value={values.pin} onChange={(e) => update("pin", e.target.value)} />
          </div>
        )}
        {values.privacy === "temporal" && (
          <div className="space-y-2">
            <Label htmlFor="expiresAt">Fecha de expiración</Label>
            <Input id="expiresAt" type="datetime-local" value={values.expiresAt} onChange={(e) => update("expiresAt", e.target.value)} />
          </div>
        )}
      </div>

      <div className="card-premium grid gap-5 p-6 sm:grid-cols-2">
        <h3 className="heading-display text-lg sm:col-span-2">Música</h3>
        <div className="space-y-2">
          <Label>Opción</Label>
          <Select value={values.musicOption} onValueChange={(v) => update("musicOption", v as ExperienceFormInput["musicOption"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cancion">Canción especial</SelectItem>
              <SelectItem value="playlist">Playlist</SelectItem>
              <SelectItem value="spotify">Link de Spotify</SelectItem>
              <SelectItem value="sin_musica">Sin música</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {values.musicOption !== "sin_musica" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="musicTitle">Título</Label>
              <Input id="musicTitle" value={values.musicTitle} onChange={(e) => update("musicTitle", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="musicArtist">Artista</Label>
              <Input id="musicArtist" value={values.musicArtist} onChange={(e) => update("musicArtist", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="musicSpotifyEmbedUrl">URL embed de Spotify (opcional)</Label>
              <Input
                id="musicSpotifyEmbedUrl"
                placeholder="https://open.spotify.com/embed/track/..."
                value={values.musicSpotifyEmbedUrl}
                onChange={(e) => update("musicSpotifyEmbedUrl", e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      {error && <p className="text-sm text-rubi-600">{error}</p>}

      <Button type="submit" size="lg" disabled={saving}>
        <Save className="h-4 w-4" /> {saving ? "Guardando..." : "Guardar experiencia"}
      </Button>
    </form>
  );
}
