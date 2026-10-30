import { sessionCookie } from "@/lib/auth/session";
import { jsonOk } from "@/lib/http";

export const runtime = "nodejs";

export async function POST() {
  const response = jsonOk({ message: "Sessão encerrada." });
  response.cookies.set(sessionCookie.name, "", {
    ...sessionCookie.options,
    maxAge: 0,
  });
  return response;
}
