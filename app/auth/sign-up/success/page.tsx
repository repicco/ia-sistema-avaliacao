import Link from "next/link";

export default function SignUpSuccessPage() {
  return (
    <main className="min-h-screen bg-[#f5f6fa] lg:grid lg:grid-cols-[1.04fr_0.96fr]">
      <aside className="relative flex min-h-[360px] flex-col overflow-hidden bg-[#334ed8] px-7 py-7 text-white sm:px-11 sm:py-9 lg:min-h-screen lg:px-[clamp(3rem,8vw,8rem)] lg:py-11">
        <Link
          href="/"
          className="relative z-10 inline-flex w-fit items-center gap-2.5 rounded-sm text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffd166]"
          aria-label="Avalia — página inicial"
        >
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-xl bg-[#ffd166] text-lg font-bold text-[#24379b]"
          >
            a
          </span>
          <span className="text-lg font-bold tracking-[-0.04em]">avalia</span>
        </Link>

        <div className="relative z-10 my-auto max-w-[35rem] pb-10 pt-12 lg:pb-20 lg:pt-24">
          <p className="max-w-[12ch] text-[clamp(2.75rem,5.4vw,5.25rem)] leading-[1.04] font-semibold tracking-[-0.055em] text-balance">
            Uma boa escolha começa com uma experiência compartilhada.
          </p>
          <p className="mt-6 max-w-md text-base leading-7 text-[#e0e5ff] sm:text-lg sm:leading-8">
            Agora você também faz parte dessa conversa.
          </p>
        </div>

        <p className="relative z-10 hidden text-sm text-[#e0e5ff] lg:block">
          Experiências reais fazem diferença.
        </p>

        <svg
          aria-hidden="true"
          viewBox="0 0 300 300"
          fill="none"
          className="pointer-events-none absolute -right-16 -bottom-24 size-64 opacity-75 sm:-right-8 sm:size-72 lg:right-[7%] lg:bottom-[8%] lg:size-80"
        >
          <circle cx="150" cy="150" r="123" stroke="#8FA0FF" strokeWidth="1" />
          <circle cx="150" cy="150" r="101" stroke="#8FA0FF" strokeWidth="1" />
          <path
            d="m150 47 26.8 68.2 73.2 3.8-56.8 46.3 18.9 70.8-62.1-39.9-62.1 39.9 18.9-70.8L50 119l73.2-3.8L150 47Z"
            fill="#ffd166"
          />
          <path
            d="m150 83 17 43.3 46.5 2.4-36.1 29.4 12 45-39.4-25.3-39.4 25.3 12-45-36.1-29.4 46.5-2.4L150 83Z"
            stroke="#334ed8"
            strokeWidth="2"
          />
          <circle cx="150" cy="150" r="5" fill="#334ed8" />
        </svg>
      </aside>

      <section className="flex items-center justify-center px-6 py-12 sm:px-10 sm:py-16 lg:px-12 lg:py-20">
        <div className="w-full max-w-[440px]">
          <div
            aria-hidden="true"
            className="mb-8 flex size-14 items-center justify-center rounded-full bg-[#fff0c7] text-[#24379b]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-7"
            >
              <path
                d="m5 12.5 4.5 4.5L19 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p className="mb-3 text-sm font-semibold text-[#334ed8]">
            Cadastro confirmado
          </p>
          <h1 className="text-[2rem] leading-tight font-semibold tracking-[-0.045em] text-[#192342] sm:text-4xl">
            Conta criada!
          </h1>
          <p className="mt-3 max-w-sm text-[15px] leading-6 text-[#68738a]">
            Seu cadastro foi concluído com sucesso. Obrigado por fazer parte da
            comunidade Avalia.
          </p>

          <Link
            href="/auth/sign-up"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-[#334ed8] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#293fbe] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334ed8]"
          >
            Voltar ao cadastro
          </Link>
        </div>
      </section>
    </main>
  );
}
