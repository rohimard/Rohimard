import { z } from "zod";

export const createOrderSchema = z.object({
  occasion: z.enum(["pareja", "mama", "cumpleanos", "amistad", "agradecimiento", "empresa", "otra"]),
  productSlug: z.enum(["esencial", "historia", "corporate"]),
  recipientName: z.string().min(2, "Cuéntanos el nombre de quien recibe el regalo"),
  senderName: z.string().min(2, "Cuéntanos tu nombre"),
  specialDate: z.string().optional(),
  message: z.string().max(600).optional(),
  letter: z.string().max(3000).optional(),
  specialPhrase: z.string().max(200).optional(),
  mediaPaths: z.array(z.string()).max(20).default([]),
  musicOption: z.enum(["cancion", "playlist", "spotify", "sin_musica"]),
  musicValue: z.string().max(300).optional(),
  delivery: z.object({
    contactName: z.string().min(2, "Ingresa el nombre de contacto"),
    phone: z.string().min(6, "Ingresa un teléfono válido"),
    district: z.string().min(2, "Selecciona un distrito"),
    address: z.string().min(4, "Ingresa la dirección"),
    reference: z.string().max(300).optional(),
    deliveryDate: z.string().optional(),
    deliveryTime: z.string().optional(),
  }),
  couponCode: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const corporateLeadSchema = z.object({
  company: z.string().min(2, "Ingresa el nombre de la empresa"),
  contactName: z.string().min(2, "Ingresa tu nombre"),
  position: z.string().optional(),
  email: z.string().email("Ingresa un correo válido"),
  phone: z.string().min(6, "Ingresa un teléfono válido"),
  approxQuantity: z.coerce.number().int().positive().optional(),
  budget: z.string().optional(),
  eventType: z.string().optional(),
  message: z.string().max(1500).optional(),
});

export type CorporateLeadInput = z.infer<typeof corporateLeadSchema>;
