"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatPrice } from "@/lib/money";

type Product = {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
  external_link: string | null;
  price: number | null;
  created_at: string;
  updated_at: string;
  score: boolean;
};

type ProductPage = {
  items: Product[];
  nextCursor: string | null;
};

function isProductPage(value: unknown): value is ProductPage {
  if (!value || typeof value !== "object") return false;
  const page = value as Partial<ProductPage>;
  return (
    Array.isArray(page.items) &&
    (typeof page.nextCursor === "string" || page.nextCursor === null)
  );
}

async function fetchProductPage({
  pageParam,
}: {
  pageParam: string | null;
}): Promise<ProductPage> {
  const params = new URLSearchParams();
  if (pageParam) params.set("cursor", pageParam);
  const query = params.size ? `?${params.toString()}` : "";
  const response = await fetch(`/api/v1/products${query}`);
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Não foi possível carregar os produtos.";
    throw new Error(message);
  }

  if (!isProductPage(payload)) {
    throw new Error("A resposta recebida não está no formato esperado.");
  }

  return payload;
}

export function ProductCatalog() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchNextPageError,
    isFetchingNextPage,
    isPending,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["products"],
    queryFn: fetchProductPage,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const products = data?.pages.flatMap((page) => page.items) ?? [];
  const loaded = Boolean(data);
  const loading = isPending || isFetchingNextPage;
  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "Não foi possível carregar os produtos."
        : null;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || loading || errorMessage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void fetchNextPage();
        }
      },
      { rootMargin: "320px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [errorMessage, fetchNextPage, hasNextPage, loading]);

  if (loaded && products.length === 0) {
    return (
      <section className="py-16 text-center" aria-live="polite">
        <h2 className="font-serif text-3xl tracking-tight text-ink">
          Ainda não há produtos por aqui
        </h2>
        <p className="mx-auto mt-3 max-w-md text-base leading-7 text-muted">
          Volte em breve para descobrir novidades no catálogo.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Produtos">
      {products.length > 0 && (
        <ul className="grid list-none grid-cols-1 gap-x-7 gap-y-11 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.id} className="min-w-0">
              <div className="relative mb-5 aspect-[4/3] overflow-hidden bg-[#e8ebe6]">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <h2 className="font-serif text-2xl leading-tight tracking-[-0.02em] text-ink">
                <Link
                  href={`/products/${encodeURIComponent(product.id)}`}
                  className="rounded-sm underline decoration-transparent underline-offset-4 transition-colors hover:text-accent hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  {product.name}
                </Link>
              </h2>
              {product.price !== null && (
                <p className="mt-1 text-sm font-semibold text-ink">
                  {formatPrice(product.price)}
                </p>
              )}
              <p className="mt-2 line-clamp-3 max-w-prose text-sm leading-6 text-muted">
                {product.description || "Uma novidade para conhecer."}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div
        ref={sentinelRef}
        className="flex min-h-28 flex-col items-center justify-center gap-3 py-8"
      >
        {errorMessage ? (
          <>
            <p role="alert" className="text-sm text-danger">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={() =>
                void (isFetchNextPageError ? fetchNextPage() : refetch())
              }
              disabled={loading}
              className="rounded-sm px-3 py-2 text-sm font-medium text-accent underline underline-offset-4 hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
            >
              Tentar novamente
            </button>
          </>
        ) : loading ? (
          <p role="status" className="text-sm text-muted">
            Carregando produtos…
          </p>
        ) : hasNextPage && products.length > 0 ? (
          <button
            type="button"
            onClick={() => void fetchNextPage()}
            className="rounded-sm px-3 py-2 text-sm font-medium text-accent underline underline-offset-4 hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Carregar mais produtos
          </button>
        ) : loaded ? (
          <p className="text-sm text-muted">Você chegou ao fim do catálogo.</p>
        ) : null}
      </div>
    </section>
  );
}
