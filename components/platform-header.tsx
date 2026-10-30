import Image from "next/image";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { getCurrentAccount } from "@/lib/auth/session";
import { getAccountAvatarUrl } from "@/lib/avatar";

export async function PlatformHeader() {
  const account = await getCurrentAccount();
  const fullName = account
    ? `${account.firstName} ${account.lastName}`.trim()
    : "";

  return (
    <header className="border-b border-line bg-white">
      <nav
        aria-label="Navegação principal"
        className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-8"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 rounded-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          aria-label="Avalia — página inicial"
        >
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-xl bg-mark text-lg font-bold text-accent"
          >
            a
          </span>
          <span className="text-lg font-bold tracking-[-0.04em]">avalia</span>
        </Link>

        {account ? (
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src={getAccountAvatarUrl(fullName || account.email)}
              alt=""
              width={40}
              height={40}
              unoptimized
              className="size-10 shrink-0 rounded-full bg-[#e9edff]"
            />
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-semibold text-ink">
                {fullName}
              </p>
              <p className="truncate text-xs text-muted">{account.email}</p>
              <SignOutButton />
            </div>
          </div>
        ) : (
          <Link
            href="/auth/sign-in"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-accent px-4 text-sm font-semibold text-white transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
          >
            Entrar
          </Link>
        )}
      </nav>
    </header>
  );
}
