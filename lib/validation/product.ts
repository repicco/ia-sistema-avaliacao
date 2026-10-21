import { z } from "zod";

export const productCreateSchema = z.object({
  name: z
    .string({ error: "Informe o nome do produto." })
    .trim()
    .min(1, "Informe o nome do produto.")
    .max(120, "O nome deve ter no máximo 120 caracteres."),
  image: z
    .url({
      error: "Informe uma URL de imagem HTTPS válida.",
      protocol: /^https$/,
    })
    .max(2048, "A URL da imagem deve ter no máximo 2048 caracteres."),
  price: z
    .number({ error: "Informe o preço como um número." })
    .min(0, "O preço não pode ser negativo.")
    .max(99_999_999.99, "O preço excede o limite permitido.")
    .refine(
      (price) => /^\d+(?:\.\d{1,2})?$/.test(price.toString()),
      "O preço deve ter no máximo duas casas decimais.",
    ),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
