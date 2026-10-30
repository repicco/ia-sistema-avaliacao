import bcrypt from "bcryptjs";
import { createSessionToken, sessionCookie } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/http";
import { getServiceClient } from "@/lib/supabase/server";
import { signInSchema } from "@/lib/validation/sign-in";

export const runtime = "nodejs";

const DUMMY_PASSWORD_HASH =
  "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6D3zH1r8a4M5d7o9W8j2pK6nQ1u3S";

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

  const supabase = getServiceClient();
  const sessionSecret = process.env.AUTH_SESSION_SECRET;
  if (
    !supabase ||
    !sessionSecret ||
    Buffer.byteLength(sessionSecret, "utf8") < 32
  ) {
    const missingSettings = [
      !supabase && "SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY",
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
    const response = jsonOk({ message: "Acesso realizado com sucesso." });
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
