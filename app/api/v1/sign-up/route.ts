import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { signUpSchema } from "@/lib/validation/sign-up";

export const runtime = "nodejs";

function jsonError(error: string, status: number) {
  return NextResponse.json(
    { error },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("O corpo da requisição deve conter um JSON válido.", 400);
  }

  const parsed = signUpSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return jsonError(
      firstIssue?.message ?? "Os dados informados são inválidos.",
      400,
    );
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      "Sign-up is not configured: Supabase environment variables are missing.",
    );
    return jsonError("O cadastro está temporariamente indisponível.", 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const { error } = await supabase.from("accounts").insert({
    id: nanoid(),
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    email: parsed.data.email,
    password: passwordHash,
    active: true,
  });

  if (error?.code === "23505") {
    return jsonError("Já existe uma conta cadastrada com este e-mail.", 409);
  }
  if (error) {
    console.error("Sign-up database insert failed.", { code: error.code });
    return jsonError("Não foi possível criar sua conta. Tente novamente.", 500);
  }

  return NextResponse.json(
    { message: "Conta criada com sucesso." },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
