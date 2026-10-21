"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { signInSchema } from "@/lib/validation/sign-in";

type SignInFields = z.input<typeof signInSchema>;

export function SignInForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFields>({
    resolver: zodResolver(signInSchema),
    mode: "onBlur",
  });

  async function onSubmit(values: SignInFields) {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/v1/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const result: unknown = await response.json().catch(() => null);
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Não foi possível entrar. Tente novamente.";
        setServerError(message);
        return;
      }

      window.location.assign("/");
    } catch {
      setServerError(
        "Não foi possível conectar. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Entrar na plataforma"
    >
      {serverError && (
        <p
          role="alert"
          className="rounded-lg border border-[#f1b6b6] bg-[#fff0f0] px-4 py-3 text-sm leading-6 text-[#a52e36]"
        >
          {serverError}
        </p>
      )}

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-[#192342]"
        >
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          className="w-full rounded-lg border border-[#d9deeb] bg-white px-4 py-3 text-[15px] text-[#192342] outline-none transition focus-visible:border-[#334ed8] focus-visible:ring-4 focus-visible:ring-[#334ed8]/15 aria-invalid:border-[#c8464d]"
          {...register("email")}
        />
        {errors.email && (
          <p id="email-error" className="mt-2 text-sm text-[#a52e36]">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-[#192342]"
        >
          Senha
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
          className="w-full rounded-lg border border-[#d9deeb] bg-white px-4 py-3 text-[15px] text-[#192342] outline-none transition focus-visible:border-[#334ed8] focus-visible:ring-4 focus-visible:ring-[#334ed8]/15 aria-invalid:border-[#c8464d]"
          {...register("password")}
        />
        {errors.password && (
          <p id="password-error" className="mt-2 text-sm text-[#a52e36]">
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex min-h-12 w-full items-center justify-center rounded-lg bg-[#334ed8] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-[#293fb8] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#334ed8] disabled:cursor-wait disabled:opacity-65"
      >
        {isSubmitting ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
