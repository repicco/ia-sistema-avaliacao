import "server-only";

import { createProductFeedbackSummary } from "@/lib/ai/product-summary-agent";
import type { getFeedbackDatabase } from "@/lib/feedback/database";

type ProductFeedback = {
  score: number;
  comment: string;
};

export async function updateProductFeedbackSummary(
  database: ReturnType<typeof getFeedbackDatabase>,
  productId: string,
  productName: string,
  feedbacks: ProductFeedback[],
) {
  const summary = await createProductFeedbackSummary(productName, feedbacks);
  const { error } = await database
    .from("products")
    .update({
      ai_summary: summary,
      ai_summary_updated_at: new Date().toISOString(),
      ai_summary_feedback_count: feedbacks.length,
    })
    .eq("id", productId);

  if (error) {
    throw new Error("Could not save the product feedback summary.", {
      cause: error,
    });
  }

  return summary;
}
