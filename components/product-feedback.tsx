"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { feedbackSchema } from "@/lib/validation/feedback";

type Feedback = {
  id: string;
  score: number;
  comment: string;
  created_at: string;
  author: string;
};

type FeedbackResponse = {
  items?: Feedback[];
  item?: Feedback;
  aiSummary?: string | null;
  aiSummaryUpdatedAt?: string | null;
  summaryCount?: number | null;
  summaryError?: boolean;
  error?: string;
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

export function ProductFeedback({
  productId,
  isAuthenticated,
}: ProductFeedbackProps) {
  const [items, setItems] = useState<Feedback[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [summaryCount, setSummaryCount] = useState(0);
  const [summaryError, setSummaryError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [validationError, setValidationError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFeedback() {
      setIsLoading(true);
      setLoadError("");
      try {
        const response = await fetch(
          `/api/v1/products/${encodeURIComponent(productId)}/feedbacks`,
          { cache: "no-store", signal: controller.signal },
        );
        const result = (await response.json()) as FeedbackResponse;
        if (!response.ok) {
          throw new Error(
            result.error ?? "Não foi possível carregar as avaliações.",
          );
        }
        setItems(result.items ?? []);
        setAiSummary(result.aiSummary ?? null);
        setSummaryCount(result.summaryCount ?? result.items?.length ?? 0);
        setSummaryError(Boolean(result.summaryError));
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar as avaliações.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadFeedback();
    return () => controller.abort();
  }, [productId]);

  async function submitFeedback(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setSuccessMessage("");

    const parsed = feedbackSchema.safeParse({ score, comment });
    if (!parsed.success) {
      setValidationError(
        parsed.error.issues[0]?.message ?? "Confira os dados da avaliação.",
      );
      return;
    }

    setValidationError("");
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/v1/products/${encodeURIComponent(productId)}/feedbacks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        },
      );
      const result = (await response.json()) as FeedbackResponse;
      if (!response.ok || !result.item) {
        throw new Error(
          result.error ?? "Não foi possível salvar sua avaliação.",
        );
      }

      setItems((current) => [result.item as Feedback, ...current]);
      setAiSummary(result.aiSummary ?? null);
      setSummaryCount(
        result.summaryCount ??
          (result.aiSummary ? summaryCount : items.length + 1),
      );
      setSummaryError(Boolean(result.summaryError));
      setScore(0);
      setComment("");
      setSuccessMessage("Sua avaliação foi publicada.");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar sua avaliação.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <aside
        aria-labelledby="ai-summary-heading"
        className="mt-10 border-l-4 border-[#334ed8] bg-[#eef1ff] px-5 py-5 sm:px-7 sm:py-6"
      >
        <div className="flex flex-wrap items-center gap-3">
          <h2
            id="ai-summary-heading"
            className="text-xl font-semibold tracking-[-0.03em] text-[#192342]"
          >
            O que as avaliações revelam
          </h2>
          <span className="rounded-sm bg-[#334ed8] px-2 py-1 text-xs font-semibold text-white">
            Resumo por IA
          </span>
        </div>
        {aiSummary ? (
          <>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#35415e]">
              {aiSummary}
            </p>
            {summaryError && (
              <p
                className="mt-3 text-sm leading-6 text-[#8d3025]"
                role="status"
              >
                Este resumo ainda não inclui a avaliação mais recente.
              </p>
            )}
          </>
        ) : summaryError ? (
          <p className="mt-3 text-sm leading-6 text-[#8d3025]" role="status">
            Não foi possível atualizar o resumo agora. As avaliações foram
            salvas; atualize a página para tentar novamente.
          </p>
        ) : isLoading ? (
          <p className="mt-3 text-sm leading-6 text-[#59647e]" role="status">
            Analisando as avaliações…
          </p>
        ) : (
          <p className="mt-3 text-sm leading-6 text-[#59647e]">
            {summaryCount === 0
              ? "O resumo aparecerá aqui quando houver avaliações."
              : "Ainda não há um resumo disponível para estas avaliações."}
          </p>
        )}
        {aiSummary && (
          <p className="mt-3 text-xs text-[#59647e]">
            Síntese baseada em {summaryCount}{" "}
            {summaryCount === 1 ? "avaliação" : "avaliações"}.
          </p>
        )}
      </aside>

      <section aria-labelledby="feedback-heading" className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#dce1ec] pb-5">
          <div>
            <h2
              id="feedback-heading"
              className="text-2xl font-semibold tracking-[-0.04em] text-[#192342] sm:text-3xl"
            >
              Opiniões de quem já usou
            </h2>
            <p className="mt-2 text-sm text-[#68738a]">
              {isLoading
                ? "Buscando avaliações..."
                : `${items.length} ${items.length === 1 ? "avaliação" : "avaliações"}`}
            </p>
          </div>
        </div>

        {loadError && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-[#efc6bf] bg-[#fff6f4] px-5 py-4 text-sm leading-6 text-[#8d3025]"
          >
            <p>{loadError}</p>
            <button
              type="button"
              className="mt-2 font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334ed8]"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loadError && !isLoading && items.length === 0 && (
          <p className="mt-6 rounded-xl border border-dashed border-[#cbd2e1] bg-white/70 px-5 py-6 text-sm leading-6 text-[#68738a]">
            Ainda não há avaliações para este produto. Conte como foi sua
            experiência e ajude a próxima pessoa a escolher.
          </p>
        )}

        {!loadError && items.length > 0 && (
          <ol className="divide-y divide-[#dce1ec]">
            {items.map((item) => (
              <li
                key={item.id}
                className="grid gap-3 py-6 sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-semibold text-[#192342]">{item.author}</p>
                  <p className="mt-1 whitespace-pre-wrap text-[15px] leading-7 text-[#46516b]">
                    {item.comment}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                  <span className="text-sm font-semibold text-[#a56c00]">
                    <span aria-hidden="true">
                      {"★".repeat(item.score)}
                      <span className="text-[#d5d9e2]">
                        {"★".repeat(5 - item.score)}
                      </span>
                    </span>
                    <span className="sr-only">Nota {item.score} de 5</span>
                  </span>
                  <time
                    dateTime={item.created_at}
                    className="text-xs text-[#778198]"
                  >
                    {formatDate(item.created_at)}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-10 border-t border-[#dce1ec] pt-8">
          {isAuthenticated ? (
            <form
              className="max-w-2xl"
              onSubmit={submitFeedback}
              noValidate
              aria-labelledby="new-feedback-heading"
            >
              <h3
                id="new-feedback-heading"
                className="text-xl font-semibold tracking-[-0.03em] text-[#192342]"
              >
                Conte sua experiência
              </h3>
              <fieldset className="mt-5">
                <legend className="text-sm font-medium text-[#35415e]">
                  Sua nota
                </legend>
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-label={`${value} ${value === 1 ? "estrela" : "estrelas"}`}
                      aria-pressed={score === value}
                      className="rounded-sm px-1 text-3xl text-[#b9c0ce] transition-colors hover:text-[#d59a19] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334ed8] aria-pressed:text-[#d59a19]"
                      onClick={() => {
                        setScore(value);
                        setValidationError("");
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </fieldset>
              <label
                htmlFor="feedback-comment"
                className="mt-5 block text-sm font-medium text-[#35415e]"
              >
                Comentário
              </label>
              <textarea
                id="feedback-comment"
                value={comment}
                maxLength={2000}
                rows={5}
                placeholder="O que alguém deveria saber antes de escolher este produto?"
                aria-invalid={Boolean(validationError)}
                aria-describedby={
                  validationError
                    ? "feedback-validation-error"
                    : "feedback-hint"
                }
                className="mt-2 block w-full resize-y rounded-lg border border-[#d9deea] bg-white px-4 py-3 text-sm leading-6 text-[#192342] outline-none transition-colors placeholder:text-[#929aab] focus-visible:border-[#334ed8] focus-visible:ring-2 focus-visible:ring-[#334ed8]/15"
                onChange={(event) => {
                  setComment(event.target.value);
                  setValidationError("");
                }}
              />
              <p id="feedback-hint" className="mt-2 text-xs text-[#778198]">
                Até 2.000 caracteres.
              </p>
              {validationError && (
                <p
                  id="feedback-validation-error"
                  className="mt-2 text-sm text-[#a02e22]"
                  role="alert"
                >
                  {validationError}
                </p>
              )}
              {submitError && (
                <p
                  className="mt-4 rounded-lg border border-[#efc6bf] bg-[#fff6f4] px-4 py-3 text-sm text-[#8d3025]"
                  role="alert"
                >
                  {submitError}
                </p>
              )}
              {successMessage && (
                <p
                  className="mt-4 text-sm font-medium text-[#315c4b]"
                  role="status"
                >
                  {successMessage}
                </p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#334ed8] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#293fbe] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334ed8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Publicando..." : "Publicar avaliação"}
              </button>
            </form>
          ) : (
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#dce1ec] bg-white px-5 py-5 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-semibold text-[#192342]">
                  Quer avaliar este produto?
                </h3>
                <p className="mt-1 text-sm leading-6 text-[#68738a]">
                  Entre na sua conta para compartilhar sua experiência.
                </p>
              </div>
              <Link
                href="/auth/sign-in"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#334ed8] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#293fbe] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334ed8]"
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
