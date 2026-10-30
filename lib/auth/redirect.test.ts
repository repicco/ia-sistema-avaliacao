import { describe, expect, it } from "bun:test";
import { getSafeInternalPath } from "@/lib/auth/redirect";

describe("getSafeInternalPath", () => {
  it("returns the fallback when the value is missing", () => {
    expect(getSafeInternalPath(null)).toBe("/");
    expect(getSafeInternalPath(undefined)).toBe("/");
    expect(getSafeInternalPath("")).toBe("/");
  });

  it("keeps an internal product path", () => {
    expect(getSafeInternalPath("/products/abc")).toBe("/products/abc");
  });

  it("rejects protocol-relative and external URLs", () => {
    expect(getSafeInternalPath("//evil.example/phish")).toBe("/");
    expect(getSafeInternalPath("https://evil.example")).toBe("/");
    expect(getSafeInternalPath("/\\evil")).toBe("/");
  });

  it("does not bounce back to sign-in", () => {
    expect(getSafeInternalPath("/auth/sign-in")).toBe("/");
    expect(getSafeInternalPath("/auth/sign-in?next=/")).toBe("/");
  });
});
