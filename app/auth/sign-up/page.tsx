import Link from "next/link";
import { SignUpForm } from "@/components/sign-up-form";

export default function SignUpPage() {
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
          <h1 className="max-w-[11ch] text-[clamp(2.75rem,5.4vw,5.25rem)] leading-[1.04] font-semibold tracking-[-0.055em] text-balance">
            O que você viveu pode ajudar alguém a escolher.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-[#e0e5ff] sm:text-lg sm:leading-8">
            Compartilhe sua experiência com produtos e ajude a próxima escolha a
            ser mais segura.
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
          <header className="mb-8 sm:mb-9">
            <h2 className="text-[2rem] leading-tight font-semibold tracking-[-0.045em] text-[#192342] sm:text-4xl">
              Crie sua conta
            </h2>
            <p className="mt-3 text-[15px] leading-6 text-[#68738a]">
              Faça parte de uma comunidade que escolhe com mais informação.
            </p>
          </header>

          <SignUpForm />

          <p className="mt-7 max-w-sm text-xs leading-5 text-[#737d91]">
            Seus dados são protegidos e usados somente para criar sua conta.
          </p>
        </div>
      </section>
    </main>
  );
}
