import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlatformHeader } from "@/components/platform-header";
import { ProductFeedback } from "@/components/product-feedback";
import { getCurrentAccount } from "@/lib/auth/session";
import { getFeedbackDatabase } from "@/lib/feedback/database";

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

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const database = getFeedbackDatabase();
    const { data } = await database
      .from("products")
      .select("name, description")
      .eq("id", id)
      .maybeSingle();

    return {
      title: data ? `${data.name} | Avalia` : "Produto | Avalia",
      description: data?.description ?? "Detalhes e avaliações do produto.",
    };
  } catch {
    return { title: "Produto | Avalia" };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const account = await getCurrentAccount();

  let product: Product | null = null;
  let unavailable = false;
  try {
    const database = getFeedbackDatabase();
    const { data, error } = await database
      .from("products")
      .select(
        "id, name, description, image_url, external_link, price, created_at, updated_at, score",
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Product detail lookup failed.", { code: error.code });
      unavailable = true;
    } else {
      product = data as Product | null;
    }
  } catch (error) {
    console.error("Product detail request failed.", error);
    unavailable = true;
  }

  if (!product && !unavailable) {
    notFound();
  }

  return (
    <>
      <PlatformHeader />
      <main className="mx-auto min-h-screen w-full max-w-6xl px-5 pb-20 pt-8 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="inline-flex min-h-10 items-center rounded-sm text-sm font-medium text-[#47536e] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#334ed8]"
        >
          ← Voltar aos produtos
        </Link>

        {unavailable ? (
          <section
            className="mt-8 rounded-xl border border-[#efc6bf] bg-[#fff6f4] px-6 py-8"
            role="alert"
          >
            <h1 className="text-2xl font-semibold text-[#192342]">
              Não foi possível carregar este produto
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#68738a]">
              O serviço está temporariamente indisponível. Tente novamente em
              instantes.
            </p>
          </section>
        ) : product ? (
          <>
            <article className="mt-5 grid overflow-hidden rounded-2xl border border-[#e0e4ed] bg-white lg:grid-cols-[1.04fr_0.96fr]">
              <div className="relative aspect-[4/3] min-h-64 bg-[#eef0f6] lg:aspect-auto lg:min-h-[430px]">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12">
                <h1 className="max-w-[18ch] text-[clamp(2.25rem,4vw,4rem)] leading-[1.04] font-semibold tracking-[-0.055em] text-[#192342]">
                  {product.name}
                </h1>
                {product.description && (
                  <p className="mt-5 max-w-xl text-base leading-7 text-[#59647e]">
                    {product.description}
                  </p>
                )}
                {product.external_link && (
                  <a
                    href={product.external_link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-8 inline-flex min-h-12 w-fit items-center justify-center rounded-lg bg-[#334ed8] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#293fbe] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334ed8]"
                  >
                    Ver produto
                  </a>
                )}
              </div>
            </article>

            <ProductFeedback
              productId={product.id}
              isAuthenticated={Boolean(account)}
            />
          </>
        ) : null}
      </main>
    </>
  );
}
