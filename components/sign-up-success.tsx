"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const SIGN_IN_HREF = "/auth/sign-in";
const REDIRECT_DELAY_MS = 2000;

export function SignUpSuccess() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace(SIGN_IN_HREF);
    }, REDIRECT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [router]);

  return (
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
        Seu cadastro foi concluído com sucesso. Vamos para o login em instantes.
      </p>

      <Link
        href={SIGN_IN_HREF}
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-[#334ed8] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#293fbe] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334ed8]"
      >
        Entrar
      </Link>
    </div>
  );
}
