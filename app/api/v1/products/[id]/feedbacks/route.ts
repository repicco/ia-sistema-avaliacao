import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/session";
import { getFeedbackDatabase } from "@/lib/feedback/database";
import { updateProductFeedbackSummary } from "@/lib/feedback/product-summary";
import { feedbackSchema } from "@/lib/validation/feedback";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

function jsonError(error: string, status: number) {
  return NextResponse.json(
    { error },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  try {
    const database = getFeedbackDatabase();
    const { data: product, error: productError } = await database
      .from("products")
      .select(
        "id, name, ai_summary, ai_summary_updated_at, ai_summary_feedback_count",
      )
      .eq("id", id)
      .maybeSingle();

    if (productError) {
      console.error("Feedback product lookup failed.", {
        code: productError.code,
      });
      return jsonError("Não foi possível carregar as avaliações.", 500);
    }
    if (!product) {
      return jsonError("Produto não encontrado.", 404);
    }

    const { data: feedbacks, error: feedbackError } = await database
      .from("products_feedbacks")
      .select("id, score, comment, created_at, created_by")
      .eq("product_id", id)
      .order("created_at", { ascending: false });

    if (feedbackError) {
      console.error("Feedback list query failed.", {
        code: feedbackError.code,
      });
      return jsonError("Não foi possível carregar as avaliações.", 500);
    }

    let aiSummary = product.ai_summary;
    let aiSummaryUpdatedAt = product.ai_summary_updated_at;
    let summaryError = false;
    if (!aiSummary && feedbacks && feedbacks.length > 0) {
      try {
        aiSummary = await updateProductFeedbackSummary(
          database,
          product.id,
          product.name,
          feedbacks.map(({ score, comment }) => ({ score, comment })),
        );
        aiSummaryUpdatedAt = new Date().toISOString();
      } catch (error) {
        console.error("Initial product feedback summary generation failed.", {
          productId: product.id,
          error,
        });
        summaryError = true;
      }
    }

    const accountIds = [
      ...new Set((feedbacks ?? []).map((item) => item.created_by)),
    ];
    const { data: accounts, error: accountsError } = accountIds.length
      ? await database
          .from("accounts")
          .select("id, first_name, last_name")
          .in("id", accountIds)
      : { data: [], error: null };

    if (accountsError) {
      console.error("Feedback author lookup failed.", {
        code: accountsError.code,
      });
      return jsonError("Não foi possível carregar as avaliações.", 500);
    }

    const authors = new Map(
      (accounts ?? []).map((account) => [
        account.id,
        `${account.first_name} ${account.last_name}`.trim(),
      ]),
    );

    return NextResponse.json(
      {
        items: (feedbacks ?? []).map(({ created_by: createdBy, ...item }) => ({
          ...item,
          author: authors.get(createdBy) || "Pessoa avaliadora",
        })),
        aiSummary,
        aiSummaryUpdatedAt,
        summaryCount:
          product.ai_summary_feedback_count ??
          (aiSummary ? (feedbacks?.length ?? 0) : 0),
        summaryError,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Feedback list request failed.", error);
    return jsonError("Não foi possível carregar as avaliações.", 500);
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  let account: Awaited<ReturnType<typeof getCurrentAccount>>;
  try {
    account = await getCurrentAccount();
  } catch (error) {
    console.error("Feedback session lookup failed.", error);
    return jsonError("Não foi possível verificar sua sessão.", 500);
  }
  if (!account) {
    return jsonError("Entre na sua conta para avaliar este produto.", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("O corpo da requisição deve conter um JSON válido.", 400);
  }

  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      parsed.error.issues[0]?.message ?? "Os dados informados são inválidos.",
      400,
    );
  }

  const { id: productId } = await params;
  try {
    const database = getFeedbackDatabase();
    const { data: product, error: productError } = await database
      .from("products")
      .select(
        "id, name, ai_summary, ai_summary_updated_at, ai_summary_feedback_count",
      )
      .eq("id", productId)
      .maybeSingle();

    if (productError) {
      console.error("Feedback product lookup failed.", {
        code: productError.code,
      });
      return jsonError("Não foi possível salvar sua avaliação.", 500);
    }
    if (!product) {
      return jsonError("Produto não encontrado.", 404);
    }

    const { data: createdFeedback, error: insertError } = await database
      .from("products_feedbacks")
      .insert({
        id: nanoid(),
        score: parsed.data.score,
        comment: parsed.data.comment,
        created_by: account.id,
        product_id: productId,
      })
      .select("id, score, comment, created_at")
      .single();

    if (insertError) {
      console.error("Feedback insert failed.", { code: insertError.code });
      return jsonError("Não foi possível salvar sua avaliação.", 500);
    }

    let aiSummary = product.ai_summary;
    let aiSummaryUpdatedAt = product.ai_summary_updated_at;
    let summaryError = false;
    let summaryCount = product.ai_summary_feedback_count;
    try {
      const { data: feedbacks, error: feedbackError } = await database
        .from("products_feedbacks")
        .select("score, comment")
        .eq("product_id", productId);

      if (feedbackError) {
        throw new Error("Could not load product feedback for summarization.", {
          cause: feedbackError,
        });
      }

      const allFeedbacks = feedbacks ?? [];
      aiSummary = await updateProductFeedbackSummary(
        database,
        product.id,
        product.name,
        allFeedbacks,
      );
      summaryCount = allFeedbacks.length;
      aiSummaryUpdatedAt = new Date().toISOString();
    } catch (error) {
      console.error("Product feedback summary update failed.", {
        productId,
        error,
      });
      summaryError = true;
    }

    return NextResponse.json(
      {
        item: {
          ...createdFeedback,
          author: `${account.firstName} ${account.lastName}`.trim(),
        },
        aiSummary,
        aiSummaryUpdatedAt,
        summaryCount,
        summaryError,
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Feedback create request failed.", error);
    return jsonError("Não foi possível salvar sua avaliação.", 500);
  }
}
