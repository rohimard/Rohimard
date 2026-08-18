"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { IconArrowRight } from "@/components/ui/icons";

type Mode = "login" | "register";

/** Traduce los errores de Supabase Auth a mensajes claros en español. */
function translateAuthError(err: unknown): string {
  const msg = err instanceof Error ? err.message.toLowerCase() : "";
  if (msg.includes("invalid login credentials"))
    return "Correo o contraseña incorrectos.";
  if (msg.includes("email not confirmed"))
    return "Confirma tu correo antes de iniciar sesión.";
  if (msg.includes("user already registered") || msg.includes("already been registered"))
    return "Ese correo ya tiene una cuenta. Inicia sesión.";
  if (msg.includes("password should be at least"))
    return "La contraseña debe tener al menos 6 caracteres.";
  if (msg.includes("unable to validate email") || msg.includes("invalid email"))
    return "El correo no es válido.";
  if (msg.includes("rate limit") || msg.includes("too many"))
    return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  return "Ocurrió un error. Inténtalo otra vez.";
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const isRegister = mode === "register";

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const supabase = getSupabaseBrowserClient();

    // Modo demo: sin Supabase configurado entramos directo al dashboard.
    if (!supabase) {
      setLoading(true);
      router.push("/dashboard");
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: nombre } },
        });
        if (error) throw error;

        // Si Supabase pide confirmación de email, no hay sesión todavía.
        if (data.session) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setNotice(
            "Cuenta creada. Revisa tu correo para confirmar tu cuenta y luego inicia sesión.",
          );
          setLoading(false);
        }
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(translateAuthError(err));
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold tracking-tight text-ink-900">
        {isRegister ? "Crea tu cuenta" : "Bienvenido de vuelta"}
      </h1>
      <p className="mt-1.5 text-sm text-ink-500">
        {isRegister
          ? "Empieza a crear cotizaciones profesionales gratis."
          : "Inicia sesión para continuar con tus cotizaciones."}
      </p>

      {!isSupabaseConfigured && (
        <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <strong className="font-semibold">Modo demo:</strong> Supabase aún no
          está configurado, así que este formulario te llevará directo al
          dashboard de ejemplo.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {isRegister && (
          <div>
            <label htmlFor="nombre" className="input-label">
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              autoComplete="name"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="input"
              placeholder="Carlos Ramírez"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="input-label">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="tucorreo@ejemplo.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="input-label">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">
            {notice}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading
            ? "Un momento…"
            : isRegister
              ? "Crear cuenta"
              : "Iniciar sesión"}
          {!loading && <IconArrowRight width={18} height={18} />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        {isRegister ? (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="font-semibold text-brand-600 hover:text-brand-700"
            >
              Inicia sesión
            </Link>
          </>
        ) : (
          <>
            ¿Aún no tienes cuenta?{" "}
            <Link
              href="/register"
              className="font-semibold text-brand-600 hover:text-brand-700"
            >
              Crea una gratis
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
