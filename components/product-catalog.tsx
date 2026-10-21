"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

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

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadNextPage = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (nextCursor) params.set("cursor", nextCursor);
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

      setProducts((current) => {
        const knownIds = new Set(current.map((product) => product.id));
        return [
          ...current,
          ...payload.items.filter((product) => !knownIds.has(product.id)),
        ];
      });
      setNextCursor(payload.nextCursor);
      setHasMore(payload.nextCursor !== null);
      setLoaded(true);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar os produtos.",
      );
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [hasMore, nextCursor]);

  useEffect(() => {
    if (!loaded && !error) void loadNextPage();
  }, [error, loadNextPage, loaded]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loading || error) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadNextPage();
        }
      },
      { rootMargin: "320px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [error, hasMore, loadNextPage, loading]);

  if (loaded && products.length === 0) {
    return (
      <section className="py-16 text-center" aria-live="polite">
        <h2 className="font-serif text-3xl tracking-tight text-[#202a25]">
          Ainda não há produtos por aqui
        </h2>
        <p className="mx-auto mt-3 max-w-md text-base leading-7 text-[#5f6b64]">
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
              <h2 className="font-serif text-2xl leading-tight tracking-[-0.02em] text-[#202a25]">
                <Link
                  href={`/products/${encodeURIComponent(product.id)}`}
                  className="rounded-sm underline decoration-transparent underline-offset-4 transition-colors hover:text-[#334ed8] hover:decoration-[#334ed8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#334ed8]"
                >
                  {product.name}
                </Link>
              </h2>
              <p className="mt-2 line-clamp-3 max-w-prose text-sm leading-6 text-[#5f6b64]">
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
        {error ? (
          <>
            <p role="alert" className="text-sm text-[#8b342b]">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void loadNextPage()}
              disabled={loading}
              className="rounded-sm px-3 py-2 text-sm font-medium text-[#334ed8] underline underline-offset-4 hover:text-[#293fb8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334ed8] disabled:opacity-60"
            >
              Tentar novamente
            </button>
          </>
        ) : loading ? (
          <p role="status" className="text-sm text-[#5f6b64]">
            Carregando produtos…
          </p>
        ) : hasMore && products.length > 0 ? (
          <button
            type="button"
            onClick={() => void loadNextPage()}
            className="rounded-sm px-3 py-2 text-sm font-medium text-[#334ed8] underline underline-offset-4 hover:text-[#293fb8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334ed8]"
          >
            Carregar mais produtos
          </button>
        ) : loaded ? (
          <p className="text-sm text-[#5f6b64]">
            Você chegou ao fim do catálogo.
          </p>
        ) : null}
      </div>
    </section>
  );
}
