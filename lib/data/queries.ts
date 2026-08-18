import type {
  Client,
  DashboardStats,
  Profile,
  QuoteItem,
  QuoteWithClient,
} from "@/lib/types";
import {
  demoClients,
  demoProfile,
  demoQuoteItems,
  demoQuotes,
  demoStats,
} from "@/lib/demo";
import type { DataContext } from "./context";

/** Perfil del negocio del usuario actual (o perfil demo). */
export async function getProfile(ctx: DataContext): Promise<Profile> {
  if (ctx.demo) return demoProfile;

  const { data, error } = await ctx.supabase
    .from("profiles")
    .select("*")
    .eq("id", ctx.user.id)
    .maybeSingle();

  if (error) {
    console.error("[getProfile]", error.message);
    throw new Error("No se pudo cargar el perfil.");
  }

  // El trigger crea el perfil al registrarse; si por algún motivo no existe,
  // devolvemos un perfil base con los datos de la sesión.
  if (!data) {
    return {
      ...demoProfile,
      id: ctx.user.id,
      full_name:
        (ctx.user.user_metadata?.full_name as string | undefined) ?? "",
      business_name: "",
      email: ctx.user.email ?? "",
      phone: "",
      address: "",
    };
  }
  return data as Profile;
}

/** Lista de clientes del usuario, opcionalmente filtrada por texto. */
export async function listClients(
  ctx: DataContext,
  search?: string,
): Promise<Client[]> {
  if (ctx.demo) {
    return filterClients(demoClients, search);
  }

  let query = ctx.supabase
    .from("clients")
    .select("*")
    .eq("user_id", ctx.user.id)
    .order("name", { ascending: true });

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    query = query.or(
      `name.ilike.${term},email.ilike.${term},phone.ilike.${term}`,
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("[listClients]", error.message);
    throw new Error("No se pudieron cargar los clientes.");
  }
  return (data as Client[]) ?? [];
}

function filterClients(clients: Client[], search?: string): Client[] {
  if (!search?.trim()) return clients;
  const t = search.trim().toLowerCase();
  return clients.filter(
    (c) =>
      c.name.toLowerCase().includes(t) ||
      c.email.toLowerCase().includes(t) ||
      c.phone.toLowerCase().includes(t),
  );
}

/** Un cliente por id (solo si pertenece al usuario; RLS lo garantiza). */
export async function getClient(
  ctx: DataContext,
  id: string,
): Promise<Client | null> {
  if (ctx.demo) return demoClients.find((c) => c.id === id) ?? null;

  const { data, error } = await ctx.supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getClient]", error.message);
    throw new Error("No se pudo cargar el cliente.");
  }
  return (data as Client | null) ?? null;
}

interface ListQuotesOptions {
  search?: string;
  status?: string;
  limit?: number;
}

/** Cotizaciones del usuario con el nombre de cliente resuelto. */
export async function listQuotes(
  ctx: DataContext,
  opts: ListQuotesOptions = {},
): Promise<QuoteWithClient[]> {
  if (ctx.demo) {
    return filterQuotes(demoQuotes, opts);
  }

  let query = ctx.supabase
    .from("quotes")
    .select("*, clients(name)")
    .eq("user_id", ctx.user.id)
    .order("created_at", { ascending: false });

  if (opts.status) query = query.eq("status", opts.status);
  if (opts.search && opts.search.trim()) {
    const term = `%${opts.search.trim()}%`;
    query = query.or(
      `quote_number.ilike.${term},service_description.ilike.${term}`,
    );
  }
  if (opts.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) {
    console.error("[listQuotes]", error.message);
    throw new Error("No se pudieron cargar las cotizaciones.");
  }

  return (data ?? []).map((row: Record<string, unknown>) => {
    const { clients, ...quote } = row as { clients?: { name?: string } | null };
    return {
      ...(quote as unknown as QuoteWithClient),
      client_name: clients?.name ?? null,
    };
  });
}

function filterQuotes(
  quotes: QuoteWithClient[],
  opts: ListQuotesOptions,
): QuoteWithClient[] {
  let result = quotes;
  if (opts.status) result = result.filter((q) => q.status === opts.status);
  if (opts.search?.trim()) {
    const t = opts.search.trim().toLowerCase();
    result = result.filter(
      (q) =>
        q.quote_number.toLowerCase().includes(t) ||
        q.service_description.toLowerCase().includes(t) ||
        (q.client_name ?? "").toLowerCase().includes(t),
    );
  }
  if (opts.limit) result = result.slice(0, opts.limit);
  return result;
}

/** Estadísticas del dashboard calculadas desde los datos del usuario. */
export async function getDashboardStats(
  ctx: DataContext,
): Promise<DashboardStats> {
  if (ctx.demo) return demoStats();

  const { data, error } = await ctx.supabase
    .from("quotes")
    .select("status, total")
    .eq("user_id", ctx.user.id);

  if (error) {
    console.error("[getDashboardStats]", error.message);
    throw new Error("No se pudieron cargar las estadísticas.");
  }

  const rows = (data as { status: string; total: number }[]) ?? [];
  return {
    creadas: rows.length,
    enviadas: rows.filter((r) => r.status !== "draft").length,
    aceptadas: rows.filter((r) => r.status === "accepted").length,
    totalCotizado: rows.reduce((s, r) => s + Number(r.total), 0),
  };
}

/** Cotización completa (con cliente e ítems) para la página de detalle. */
export async function getQuoteWithItems(
  ctx: DataContext,
  id: string,
): Promise<{
  quote: QuoteWithClient;
  client: Client | null;
  items: QuoteItem[];
} | null> {
  if (ctx.demo) {
    const quote = demoQuotes.find((q) => q.id === id);
    if (!quote) return null;
    const client = demoClients.find((c) => c.id === quote.client_id) ?? null;
    return { quote, client, items: demoQuoteItems[id] ?? [] };
  }

  const { data: quote, error } = await ctx.supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getQuoteWithItems]", error.message);
    throw new Error("No se pudo cargar la cotización.");
  }
  if (!quote) return null;

  const [{ data: items }, client] = await Promise.all([
    ctx.supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", id)
      .order("created_at", { ascending: true }),
    quote.client_id ? getClient(ctx, quote.client_id) : Promise.resolve(null),
  ]);

  return {
    quote: { ...(quote as QuoteWithClient), client_name: client?.name ?? null },
    client,
    items: (items as QuoteItem[]) ?? [],
  };
}
