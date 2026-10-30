import { describe, expect, it } from "bun:test";
import { formatPrice } from "@/lib/money";

describe("formatPrice", () => {
  it("formats BRL in pt-BR", () => {
    expect(formatPrice(129.9)).toMatch(/129/);
    expect(formatPrice(129.9)).toMatch(/R\$/);
  });
});
