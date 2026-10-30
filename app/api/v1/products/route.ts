import { nanoid } from "nanoid";
import { getCurrentAccount } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/http";
import {
  decodeProductCursor,
  encodeProductCursor,
} from "@/lib/products/cursor";
import { getServiceClient } from "@/lib/supabase/server";
import { productCreateSchema } from "@/lib/validation/product";

export const runtime = "nodejs";

const PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 24;
const PRODUCT_FIELDS =
  "id,name,description,image_url,external_link,price,created_at,updated_at,score";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawLimit = url.searchParams.get("limit");
  const requestedLimit = rawLimit === null ? PAGE_SIZE : Number(rawLimit);
  if (
    !Number.isInteger(requestedLimit) ||
    requestedLimit < 1 ||
    requestedLimit > MAX_PAGE_SIZE
  ) {
    return jsonError(
      `O limite deve ser um número entre 1 e ${MAX_PAGE_SIZE}.`,
      400,
    );
  }

  const rawCursor = url.searchParams.get("cursor");
  const cursor = rawCursor ? decodeProductCursor(rawCursor) : null;
  if (rawCursor && !cursor) {
    return jsonError("O cursor informado é inválido.", 400);
  }

  const supabase = getServiceClient();
  if (!supabase) {
    console.error(
      "Product catalog is not configured: Supabase environment variables are missing.",
    );
    return jsonError("O catálogo está temporariamente indisponível.", 500);
  }

  let query = supabase
    .from("products")
    .select(PRODUCT_FIELDS)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(requestedLimit + 1);

  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`,
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("Product catalog query failed.", { code: error.code });
    return jsonError("Não foi possível carregar os produtos.", 500);
  }

  const rows = data ?? [];
  const hasNextPage = rows.length > requestedLimit;
  const items = rows.slice(0, requestedLimit);
  const lastItem = items.at(-1);
  const nextCursor =
    hasNextPage && lastItem
      ? encodeProductCursor({ createdAt: lastItem.created_at, id: lastItem.id })
      : null;

  return jsonOk({ items, nextCursor });
}

export async function POST(request: Request) {
  let account: Awaited<ReturnType<typeof getCurrentAccount>>;
  try {
    account = await getCurrentAccount();
  } catch (error) {
    console.error("Product creation session lookup failed.", error);
    return jsonError("Não foi possível verificar sua sessão.", 500);
  }
  if (!account) {
    return jsonError("Entre na sua conta para cadastrar um produto.", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("O corpo da requisição deve conter um JSON válido.", 400);
  }

  const parsed = productCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      "Os dados do produto são inválidos.",
      400,
      parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  const supabase = getServiceClient();
  if (!supabase) {
    console.error(
      "Product creation is not configured: Supabase environment variables are missing.",
    );
    return jsonError(
      "O cadastro de produtos está temporariamente indisponível.",
      500,
    );
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      id: nanoid(),
      name: parsed.data.name,
      image_url: parsed.data.image,
      external_link: null,
      price: parsed.data.price,
    })
    .select(PRODUCT_FIELDS)
    .single();

  if (error) {
    console.error("Product insert failed.", { code: error.code });
    return jsonError("Não foi possível cadastrar o produto.", 500);
  }

  return jsonOk({ item: data }, 201);
}
