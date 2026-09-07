"use client";

import type { Experience } from "./types";

const STORAGE_KEY = "momentia:experiences";

function readAll(): Record<string, Experience> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, Experience>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Almacenamiento lleno o no disponible (modo privado): la experiencia
    // igual se muestra en esta misma sesión de navegación.
  }
}

export function saveDemoExperience(experience: Experience): void {
  const all = readAll();
  all[experience.slug] = experience;
  writeAll(all);
}

export function getDemoExperience(slug: string): Experience | null {
  return readAll()[slug] ?? null;
}

export function isDemoSlugTaken(slug: string): boolean {
  return Boolean(readAll()[slug]);
}

function randomToken(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function generateEditToken(): string {
  return randomToken();
}
