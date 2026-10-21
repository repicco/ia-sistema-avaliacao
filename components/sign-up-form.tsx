"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { signUpSchema } from "@/lib/validation/sign-up";

const formSchema = signUpSchema
  .extend({
    confirmPassword: z.string().min(1, "Confirme sua senha."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

type SignUpResponse = {
  error?: string;
};

const inputClassName =
  "mt-2 block min-h-12 w-full rounded-lg border border-[#d9deea] bg-white px-4 text-sm text-[#192342] outline-none transition-colors placeholder:text-[#929aab] focus-visible:border-[#334ed8] focus-visible:ring-2 focus-visible:ring-[#334ed8]/15";

export function SignUpForm() {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      let response: Response;
      try {
        response = await fetch("/api/v1/sign-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            password: values.password,
          }),
        });
      } catch {
        throw new Error(
          "Não foi possível conectar ao servidor. Tente novamente.",
        );
      }
      const result = (await response.json()) as SignUpResponse;

      if (!response.ok) {
        throw new Error(result.error ?? "Não foi possível criar sua conta.");
      }
    },
    onSuccess: () => router.push("/auth/sign-up/success"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function submit(values: FormValues) {
    mutation.reset();
    mutation.mutate(values);
  }

  const pending = isSubmitting || mutation.isPending;

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
      {mutation.isError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800"
        >
          {mutation.error.message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="firstName"
            className="text-sm font-medium text-[#35415e]"
          >
            Primeiro nome
          </label>
          <input
            id="firstName"
            autoComplete="given-name"
            placeholder="Seu nome"
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
            className={cn(inputClassName, errors.firstName && "border-red-400")}
            {...register("firstName")}
          />
          {errors.firstName && (
            <p id="firstName-error" className="mt-1.5 text-xs text-red-700">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="text-sm font-medium text-[#34423a]"
          >
            Sobrenome
          </label>
          <input
            id="lastName"
            autoComplete="family-name"
            placeholder="Seu sobrenome"
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
            className={cn(inputClassName, errors.lastName && "border-red-400")}
            {...register("lastName")}
          />
          {errors.lastName && (
            <p id="lastName-error" className="mt-1.5 text-xs text-red-700">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-medium text-[#35415e]">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={cn(inputClassName, errors.email && "border-red-400")}
          {...register("email")}
        />
        {errors.email && (
          <p id="email-error" className="mt-1.5 text-xs text-red-700">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-sm font-medium text-[#35415e]"
        >
          Senha
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
          className={cn(inputClassName, errors.password && "border-red-400")}
          {...register("password")}
        />
        {errors.password && (
          <p id="password-error" className="mt-1.5 text-xs text-red-700">
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-[#35415e]"
        >
          Confirme sua senha
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Digite a senha novamente"
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-describedby={
            errors.confirmPassword ? "confirmPassword-error" : undefined
          }
          className={cn(
            inputClassName,
            errors.confirmPassword && "border-red-400",
          )}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p id="confirmPassword-error" className="mt-1.5 text-xs text-red-700">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#334ed8] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#293fbe] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334ed8] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Criando sua conta..." : "Criar conta"}
      </button>
    </form>
  );
}
