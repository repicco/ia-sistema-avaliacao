import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .email({ error: "Informe um e-mail válido." })
    .max(254)
    .transform((email) => email.toLowerCase()),
  password: z
    .string({ error: "Informe sua senha." })
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .refine((password) => new TextEncoder().encode(password).length <= 72, {
      message: "A senha deve ter no máximo 72 bytes.",
    }),
});
