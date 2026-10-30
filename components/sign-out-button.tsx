"use client";

import { useState } from "react";

export function SignOutButton() {
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    try {
      await fetch("/api/v1/sign-out", { method: "POST" });
    } finally {
      window.location.assign("/");
    }
  }

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      disabled={pending}
      className="rounded-sm px-2 py-1 text-xs font-medium text-muted underline-offset-4 hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
    >
      {pending ? "Saindo…" : "Sair"}
    </button>
  );
}
