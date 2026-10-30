import { describe, expect, it } from "bun:test";
import { feedbackSchema } from "@/lib/validation/feedback";

describe("feedbackSchema", () => {
  it("accepts a score between 1 and 5", () => {
    expect(
      feedbackSchema.parse({ score: 5, comment: "Excelente." }).score,
    ).toBe(5);
  });

  it("rejects a missing score or empty comment", () => {
    expect(feedbackSchema.safeParse({ score: 0, comment: "Ok" }).success).toBe(
      false,
    );
    expect(feedbackSchema.safeParse({ score: 4, comment: "   " }).success).toBe(
      false,
    );
  });
});
