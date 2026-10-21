import { z } from "zod";

export const MUSEO_EMAIL = "casamuseonicolosi@gmail.com";

export const contactMessageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Inserisci il tuo nome." })
    .max(80, { message: "Il nome non può superare 80 caratteri." }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Inserisci un indirizzo email." })
    .max(160, { message: "L'email non può superare 160 caratteri." })
    .email({ message: "Indirizzo email non valido." }),
  phone: z
    .string()
    .trim()
    .max(30, { message: "Il telefono non può superare 30 caratteri." })
    .optional()
    .or(z.literal("")),
  subject: z
    .string()
    .trim()
    .max(120, { message: "L'oggetto non può superare 120 caratteri." })
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, { message: "Scrivi almeno 10 caratteri." })
    .max(4000, { message: "Il messaggio non può superare 4000 caratteri." }),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

/** Trims and normalises a validated message so only the expected fields reach the database. */
export function buildContactMessage(input: ContactMessageInput) {
  return {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || null,
    subject: input.subject?.trim() || null,
    message: input.message.trim(),
  };
}
