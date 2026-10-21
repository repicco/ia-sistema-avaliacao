import type { Metadata } from "next";
import { PlatformHeader } from "@/components/platform-header";
import { ProductCatalog } from "@/components/product-catalog";

export const metadata: Metadata = {
  title: "Descubra produtos | Avalia",
  description: "Conheça produtos e veja o que merece uma avaliação.",
};

export default function HomePage() {
  return (
    <>
      <PlatformHeader />
      <main className="mx-auto w-full max-w-7xl px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:px-12">
        <section
          aria-labelledby="catalog-title"
          className="mb-12 grid gap-7 border-b border-[#d9ded8] pb-10 md:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)] md:items-end md:gap-12"
        >
          <div>
            <p className="mb-4 text-sm font-medium text-[#334ed8]">
              Um catálogo feito por pessoas
            </p>
            <h1
              id="catalog-title"
              className="max-w-3xl font-serif text-5xl leading-[1.04] tracking-[-0.045em] text-[#202a25] sm:text-6xl lg:text-7xl"
            >
              Encontre seu próximo favorito.
            </h1>
          </div>
          <p className="max-w-md pb-1 text-base leading-7 text-[#5f6b64] md:justify-self-end">
            Descubra produtos que fazem parte do dia a dia e conheça o que
            outras pessoas têm a dizer sobre eles.
          </p>
        </section>

        <ProductCatalog />
      </main>
    </>
  );
}
