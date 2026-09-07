"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { corporateLeadSchema, type CorporateLeadInput } from "@/lib/validations/order";

export interface SubmitCorporateLeadResult {
  success: boolean;
  demo?: boolean;
  error?: string;
}

export async function submitCorporateLead(input: CorporateLeadInput): Promise<SubmitCorporateLeadResult> {
  const parsed = corporateLeadSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario." };
  }

  if (!isSupabaseConfigured) {
    return { success: true, demo: true };
  }

  const data = parsed.data;
  const supabase = createClient();

  const { error } = await supabase.from("corporate_leads").insert({
    company: data.company,
    contact_name: data.contactName,
    position: data.position || null,
    email: data.email,
    phone: data.phone,
    approx_quantity: data.approxQuantity ?? null,
    budget: data.budget || null,
    event_type: data.eventType || null,
    message: data.message || null,
  });

  if (error) {
    console.error("submitCorporateLead error", error);
    return { success: false, error: "No pudimos enviar tu solicitud. Intenta nuevamente o escríbenos por WhatsApp." };
  }

  return { success: true };
}
