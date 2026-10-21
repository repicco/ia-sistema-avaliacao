import { z } from "zod";

export const feedbackSchema = z.object({
  score: z
    .number({ error: "Escolha uma nota de 1 a 5." })
    .int("A nota deve ser um número inteiro.")
    .min(1, "A nota mínima é 1.")
    .max(5, "A nota máxima é 5."),
  comment: z
    .string({ error: "Escreva um comentário." })
    .trim()
    .min(1, "Escreva um comentário.")
    .max(2000, "O comentário deve ter no máximo 2.000 caracteres."),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
