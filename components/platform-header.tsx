import Link from "next/link";
import { getCurrentAccount } from "@/lib/auth/session";

export async function PlatformHeader() {
  const account = await getCurrentAccount();

  return (
    <header className="border-b border-[#e4e8f2] bg-white">
      <nav
        aria-label="Navegação principal"
        className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-8"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 rounded-sm text-[#192342] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#334ed8]"
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

        {account ? (
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e9edff] text-sm font-semibold text-[#334ed8]"
            >
              {`${account.firstName[0] ?? ""}${account.lastName[0] ?? ""}`.toUpperCase()}
            </span>
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-semibold text-[#192342]">
                {account.firstName} {account.lastName}
              </p>
              <p className="truncate text-xs text-[#68738a]">{account.email}</p>
            </div>
          </div>
        ) : (
          <Link
            href="/auth/sign-in"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#334ed8] px-4 text-sm font-semibold text-white transition hover:bg-[#293fb8] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#334ed8]"
          >
            Entrar
          </Link>
        )}
      </nav>
    </header>
  );
}
