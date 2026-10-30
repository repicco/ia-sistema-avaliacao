import { describe, expect, it } from "bun:test";
import {
  decodeProductCursor,
  encodeProductCursor,
} from "@/lib/products/cursor";

describe("product cursor", () => {
  it("round-trips a valid cursor", () => {
    const cursor = { createdAt: "2026-10-30T14:00:00.000Z", id: "prod_1" };
    expect(decodeProductCursor(encodeProductCursor(cursor))).toEqual(cursor);
  });

  it("rejects tampered or malformed values", () => {
    expect(decodeProductCursor("not-base64")).toBeNull();
    expect(
      decodeProductCursor(
        encodeProductCursor({ createdAt: "yesterday", id: "prod_1" }),
      ),
    ).toBeNull();
  });
});
