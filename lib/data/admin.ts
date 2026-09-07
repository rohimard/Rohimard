import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentAdminProfile() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile || profile.role !== "admin") return null;

  return { user, profile };
}
