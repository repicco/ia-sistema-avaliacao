"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { feedbackSchema } from "@/lib/validation/feedback";

type Feedback = {
  id: string;
  score: number;
  comment: string;
  created_at: string;
  author: string;
};

type FeedbackListResponse = {
  items?: Feedback[];
  aiSummary?: string | null;
  aiSummaryUpdatedAt?: string | null;
  summaryCount?: number | null;
  summaryError?: boolean;
  error?: string;
};

type FeedbackCreateResponse = FeedbackListResponse & {
  item?: Feedback;
};

type FeedbackFields = {
  score: number;
  comment: string;
};

type ProductFeedbackProps = {
  productId: string;
  isAuthenticated: boolean;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
  }).format(new Date(value));
}

function feedbackQueryKey(productId: string) {
  return ["product-feedbacks", productId] as const;
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

async function fetchFeedbacks(
  productId: string,
): Promise<FeedbackListResponse> {
  const response = await fetch(
    `/api/v1/products/${encodeURIComponent(productId)}/feedbacks`,
    { cache: "no-store" },
  );
  const result = await readJson<FeedbackListResponse>(response);
  if (!response.ok) {
    throw new Error(result.error ?? "Não foi possível carregar as avaliações.");
  }
  return result;
}

export function ProductFeedback({
  productId,
  isAuthenticated,
}: ProductFeedbackProps) {
  const queryClient = useQueryClient();
  const queryKey = feedbackQueryKey(productId);
  const signInHref = `/auth/sign-in?next=${encodeURIComponent(`/products/${productId}`)}`;

  const {
    data,
    error,
    isPending: isLoading,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => fetchFeedbacks(productId),
  });

  const form = useForm<FeedbackFields>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { score: 0, comment: "" },
  });
  const score = form.watch("score");
  const [hoveredScore, setHoveredScore] = useState(0);
  const filledScore = hoveredScore || score;

  const mutation = useMutation({
    mutationFn: async (values: FeedbackFields) => {
      const response = await fetch(
        `/api/v1/products/${encodeURIComponent(productId)}/feedbacks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );
      const result = await readJson<FeedbackCreateResponse>(response);
      if (!response.ok || !result.item) {
        throw new Error(
          result.error ?? "Não foi possível salvar sua avaliação.",
        );
      }
      return result;
    },
    onSuccess: (result) => {
      queryClient.setQueryData<FeedbackListResponse>(queryKey, (current) => ({
        items: [result.item as Feedback, ...(current?.items ?? [])],
        aiSummary: result.aiSummary ?? null,
        aiSummaryUpdatedAt: result.aiSummaryUpdatedAt ?? null,
        summaryCount:
          result.summaryCount ??
          (result.aiSummary
            ? (current?.summaryCount ?? current?.items?.length ?? 0)
            : (current?.items?.length ?? 0) + 1),
        summaryError: Boolean(result.summaryError),
      }));
      form.reset({ score: 0, comment: "" });
    },
  });

  const items = data?.items ?? [];
  const aiSummary = data?.aiSummary ?? null;
  const summaryCount = data?.summaryCount ?? items.length;
  const summaryError = Boolean(data?.summaryError);
  const loadError =
    error instanceof Error
      ? error.message
      : error
        ? "Não foi possível carregar as avaliações."
        : "";
  const validationError =
    form.formState.errors.score?.message ??
    form.formState.errors.comment?.message ??
    "";
  const submitError =
    mutation.error instanceof Error ? mutation.error.message : "";

  return (
    <>
      <aside
        aria-labelledby="ai-summary-heading"
        className="mt-10 border-l-4 border-accent bg-[#eef1ff] px-5 py-5 sm:px-7 sm:py-6"
      >
        <div className="flex flex-wrap items-center gap-3">
          <h2
            id="ai-summary-heading"
            className="text-xl font-semibold tracking-[-0.03em] text-ink"
          >
            O que as avaliações revelam
          </h2>
          <span className="rounded-sm bg-accent px-2 py-1 text-xs font-semibold text-white">
            Resumo por IA
          </span>
        </div>
        {aiSummary ? (
          <>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-ink">
              {aiSummary}
            </p>
            {summaryError && (
              <p className="mt-3 text-sm leading-6 text-danger" role="status">
                Este resumo ainda não inclui a avaliação mais recente.
              </p>
            )}
          </>
        ) : summaryError ? (
          <p className="mt-3 text-sm leading-6 text-danger" role="status">
            Não foi possível atualizar o resumo agora. As avaliações foram
            salvas; atualize a página para tentar novamente.
          </p>
        ) : isLoading ? (
          <p className="mt-3 text-sm leading-6 text-muted" role="status">
            Analisando as avaliações…
          </p>
        ) : (
          <p className="mt-3 text-sm leading-6 text-muted">
            {summaryCount === 0
              ? "O resumo aparecerá aqui quando houver avaliações."
              : "O resumo é atualizado quando uma nova avaliação é publicada."}
          </p>
        )}
        {aiSummary && (
          <p className="mt-3 text-xs text-muted">
            Síntese baseada em {summaryCount}{" "}
            {summaryCount === 1 ? "avaliação" : "avaliações"}.
          </p>
        )}
      </aside>

      <section aria-labelledby="feedback-heading" className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
          <div>
            <h2
              id="feedback-heading"
              className="text-2xl font-semibold tracking-[-0.04em] text-ink sm:text-3xl"
            >
              Opiniões de quem já usou
            </h2>
            <p className="mt-2 text-sm text-muted">
              {isLoading
                ? "Buscando avaliações..."
                : `${items.length} ${items.length === 1 ? "avaliação" : "avaliações"}`}
            </p>
          </div>
        </div>

        {loadError && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-danger-line bg-danger-bg px-5 py-4 text-sm leading-6 text-danger"
          >
            <p>{loadError}</p>
            <button
              type="button"
              className="mt-2 font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              onClick={() => void refetch()}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loadError && !isLoading && items.length === 0 && (
          <p className="mt-6 rounded-xl border border-dashed border-line bg-white/70 px-5 py-6 text-sm leading-6 text-muted">
            Ainda não há avaliações para este produto. Conte como foi sua
            experiência e ajude a próxima pessoa a escolher.
          </p>
        )}

        {!loadError && items.length > 0 && (
          <ol className="divide-y divide-line">
            {items.map((item) => (
              <li
                key={item.id}
                className="grid gap-3 py-6 sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-semibold text-ink">{item.author}</p>
                  <p className="mt-1 whitespace-pre-wrap text-[15px] leading-7 text-ink">
                    {item.comment}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                  <span className="text-sm font-semibold text-[#a56c00]">
                    <span aria-hidden="true">
                      {"★".repeat(item.score)}
                      <span className="text-line">
                        {"★".repeat(5 - item.score)}
                      </span>
                    </span>
                    <span className="sr-only">Nota {item.score} de 5</span>
                  </span>
                  <time
                    dateTime={item.created_at}
                    className="text-xs text-muted"
                  >
                    {formatDate(item.created_at)}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-10 border-t border-line pt-8">
          {isAuthenticated ? (
            <form
              className="max-w-2xl"
              onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
              noValidate
              aria-labelledby="new-feedback-heading"
            >
              <h3
                id="new-feedback-heading"
                className="text-xl font-semibold tracking-[-0.03em] text-ink"
              >
                Conte sua experiência
              </h3>
              <fieldset className="mt-5">
                <legend className="text-sm font-medium text-ink">
                  Sua nota
                </legend>
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-label={`${value} ${value === 1 ? "estrela" : "estrelas"}`}
                      aria-pressed={value <= score}
                      className={`rounded-sm px-1 text-3xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${value <= filledScore ? "text-[#d59a19]" : "text-line"}`}
                      onMouseEnter={() => setHoveredScore(value)}
                      onMouseLeave={() => setHoveredScore(0)}
                      onClick={() => {
                        form.setValue("score", value, { shouldValidate: true });
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </fieldset>
              <label
                htmlFor="feedback-comment"
                className="mt-5 block text-sm font-medium text-ink"
              >
                Comentário
              </label>
              <textarea
                id="feedback-comment"
                maxLength={2000}
                rows={5}
                placeholder="O que alguém deveria saber antes de escolher este produto?"
                aria-invalid={Boolean(validationError)}
                aria-describedby={
                  validationError
                    ? "feedback-validation-error"
                    : "feedback-hint"
                }
                className="mt-2 block w-full resize-y rounded-lg border border-line bg-white px-4 py-3 text-sm leading-6 text-ink outline-none transition-colors placeholder:text-muted focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/15"
                {...form.register("comment")}
              />
              <p id="feedback-hint" className="mt-2 text-xs text-muted">
                Até 2.000 caracteres.
              </p>
              {validationError && (
                <p
                  id="feedback-validation-error"
                  className="mt-2 text-sm text-danger"
                  role="alert"
                >
                  {validationError}
                </p>
              )}
              {submitError && (
                <p
                  className="mt-4 rounded-lg border border-danger-line bg-danger-bg px-4 py-3 text-sm text-danger"
                  role="alert"
                >
                  {submitError}
                </p>
              )}
              {mutation.isSuccess && (
                <p
                  className="mt-4 text-sm font-medium text-[#315c4b]"
                  role="status"
                >
                  Sua avaliação foi publicada.
                </p>
              )}
              <button
                type="submit"
                disabled={mutation.isPending}
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                {mutation.isPending ? "Publicando..." : "Publicar avaliação"}
              </button>
            </form>
          ) : (
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-line bg-white px-5 py-5 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-semibold text-ink">
                  Quer avaliar este produto?
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Entre na sua conta para compartilhar sua experiência.
                </p>
              </div>
              <Link
                href={signInHref}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Entrar
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
