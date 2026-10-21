import { z } from "zod";

export const signUpSchema = z.object({
  firstName: z
    .string({ error: "Informe seu primeiro nome." })
    .trim()
    .min(1, "Informe seu primeiro nome.")
    .max(100),
  lastName: z
    .string({ error: "Informe seu sobrenome." })
    .trim()
    .min(1, "Informe seu sobrenome.")
    .max(100),
  email: z
    .email({ error: "Informe um e-mail válido." })
    .max(254)
    .transform((email) => email.toLowerCase()),
  password: z
    .string({ error: "Informe uma senha." })
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .refine((password) => new TextEncoder().encode(password).length <= 72, {
      message: "A senha deve ter no máximo 72 bytes.",
    }),
});
