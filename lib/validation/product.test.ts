import { describe, expect, it } from "bun:test";
import { productCreateSchema } from "@/lib/validation/product";

describe("productCreateSchema", () => {
  it("accepts a valid payload", () => {
    const parsed = productCreateSchema.parse({
      name: "Caneca",
      image: "https://cdn.example.com/caneca.jpg",
      price: 49.9,
    });
    expect(parsed.name).toBe("Caneca");
  });

  it("rejects http images and extra decimals", () => {
    expect(
      productCreateSchema.safeParse({
        name: "Caneca",
        image: "http://cdn.example.com/caneca.jpg",
        price: 49.9,
      }).success,
    ).toBe(false);
    expect(
      productCreateSchema.safeParse({
        name: "Caneca",
        image: "https://cdn.example.com/caneca.jpg",
        price: 49.999,
      }).success,
    ).toBe(false);
  });
});
