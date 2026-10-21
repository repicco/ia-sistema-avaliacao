import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createSessionToken, sessionCookie } from "@/lib/auth/session";
import { signInSchema } from "@/lib/validation/sign-in";

export const runtime = "nodejs";

const DUMMY_PASSWORD_HASH =
  "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6D3zH1r8a4M5d7o9W8j2pK6nQ1u3S";

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

  const parsed = signInSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return jsonError(
      firstIssue?.message ?? "Os dados informados são inválidos.",
      400,
    );
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const sessionSecret = process.env.AUTH_SESSION_SECRET;
  if (
    !supabaseUrl ||
    !serviceRoleKey ||
    !sessionSecret ||
    Buffer.byteLength(sessionSecret, "utf8") < 32
  ) {
    const missingSettings = [
      !supabaseUrl && "SUPABASE_URL",
      !serviceRoleKey && "SUPABASE_SERVICE_ROLE_KEY",
      !sessionSecret && "AUTH_SESSION_SECRET",
    ].filter((setting): setting is string => Boolean(setting));
    const invalidSettings = [
      sessionSecret &&
        Buffer.byteLength(sessionSecret, "utf8") < 32 &&
        "AUTH_SESSION_SECRET (mínimo de 32 bytes)",
    ].filter((setting): setting is string => Boolean(setting));
    console.error("Sign-in is not configured.", {
      missing: missingSettings,
      invalid: invalidSettings,
    });
    return jsonError("O acesso está temporariamente indisponível.", 500);
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const escapedEmail = parsed.data.email.replace(/[\\%_]/g, "\\$&");
    const { data: account, error } = await supabase
      .from("accounts")
      .select("id, password, active")
      .ilike("email", escapedEmail)
      .maybeSingle();

    if (error) {
      console.error("Sign-in database lookup failed.", { code: error.code });
      return jsonError("O acesso está temporariamente indisponível.", 500);
    }

    const passwordMatches = await bcrypt.compare(
      parsed.data.password,
      account?.password ?? DUMMY_PASSWORD_HASH,
    );
    if (!account?.active || !passwordMatches) {
      return jsonError("E-mail ou senha inválidos.", 401);
    }

    const session = createSessionToken(account.id);
    const response = NextResponse.json(
      { message: "Acesso realizado com sucesso." },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
    response.cookies.set(sessionCookie.name, session.value, {
      ...sessionCookie.options,
      maxAge: session.maxAge,
    });
    return response;
  } catch (error) {
    console.error("Sign-in request failed.", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return jsonError("O acesso está temporariamente indisponível.", 500);
  }
}
