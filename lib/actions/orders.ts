"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createOrderSchema, type CreateOrderInput } from "@/lib/validations/order";
import { getProductBySlug } from "@/lib/data/products";
import { getDeliveryCost } from "@/lib/data/delivery";
import { buildWhatsAppUrl } from "@/lib/config/site";

export interface CreateOrderResult {
  success: boolean;
  demo?: boolean;
  error?: string;
  orderNumber?: string;
  total?: number;
  whatsappUrl?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario." };
  }

  const data = parsed.data;
  const product = getProductBySlug(data.productSlug);
  if (!product) {
    return { success: false, error: "El producto seleccionado ya no está disponible." };
  }

  const subtotal = product.priceFrom;
  const deliveryCost = getDeliveryCost(data.delivery.district, subtotal);
  const total = subtotal + deliveryCost;

  const whatsappMessage = `Hola, quiero crear una experiencia MOMENTIA ❤️\n\nProducto: ${product.name}\nPara: ${data.recipientName}\nDe: ${data.senderName}\nDistrito: ${data.delivery.district}\nTotal estimado: S/ ${total.toFixed(2)}`;
  const whatsappUrl = buildWhatsAppUrl(whatsappMessage);

  if (!isSupabaseConfigured) {
    // Modo demo: no hay base de datos conectada todavía. Devolvemos una
    // confirmación simulada para que el flujo completo se pueda probar.
    return {
      success: true,
      demo: true,
      orderNumber: `MMT-DEMO-${Date.now().toString().slice(-6)}`,
      total,
      whatsappUrl,
    };
  }

  try {
    const supabase = createClient();

    const { data: orderNumberData, error: rpcError } = await supabase.rpc("generate_order_number");
    if (rpcError) throw rpcError;
    const orderNumber = orderNumberData as string;

    const { data: productRow } = await supabase
      .from("products")
      .select("id")
      .eq("slug", data.productSlug)
      .maybeSingle();

    const { data: orderRow, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: data.senderName,
        customer_phone: data.delivery.phone,
        occasion: data.occasion,
        product_id: productRow?.id ?? null,
        recipient_name: data.recipientName,
        sender_name: data.senderName,
        special_date: data.specialDate || null,
        message: data.message || null,
        letter: data.letter || null,
        special_phrase: data.specialPhrase || null,
        music_option: data.musicOption,
        music_value: data.musicValue || null,
        media_paths: data.mediaPaths,
        subtotal,
        delivery_cost: deliveryCost,
        discount: 0,
        total,
        coupon_code: data.couponCode || null,
        status: "nuevo",
      })
      .select("id, order_number")
      .single();

    if (orderError) throw orderError;

    const { error: deliveryError } = await supabase.from("delivery_addresses").insert({
      order_id: orderRow.id,
      contact_name: data.delivery.contactName,
      phone: data.delivery.phone,
      district: data.delivery.district,
      address: data.delivery.address,
      reference: data.delivery.reference || null,
      delivery_date: data.delivery.deliveryDate || null,
      delivery_time: data.delivery.deliveryTime || null,
      delivery_cost: deliveryCost,
    });

    if (deliveryError) throw deliveryError;

    return { success: true, orderNumber: orderRow.order_number, total, whatsappUrl };
  } catch (error) {
    console.error("createOrder error", error);
    return {
      success: false,
      error: "No pudimos registrar tu pedido. Escríbenos por WhatsApp y lo resolvemos al toque.",
      whatsappUrl,
    };
  }
}
