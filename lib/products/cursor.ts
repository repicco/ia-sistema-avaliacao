export type ProductCursor = {
  createdAt: string;
  id: string;
};

const ISO_TIMESTAMP =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/;
const PRODUCT_ID = /^[A-Za-z0-9_-]{1,64}$/;

export function encodeProductCursor(cursor: ProductCursor) {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

export function decodeProductCursor(value: string): ProductCursor | null {
  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    );
    if (!parsed || typeof parsed !== "object") return null;

    const cursor = parsed as Partial<ProductCursor>;
    if (typeof cursor.createdAt !== "string" || typeof cursor.id !== "string") {
      return null;
    }

    if (
      !ISO_TIMESTAMP.test(cursor.createdAt) ||
      Number.isNaN(new Date(cursor.createdAt).getTime()) ||
      !PRODUCT_ID.test(cursor.id)
    ) {
      return null;
    }

    return { createdAt: cursor.createdAt, id: cursor.id };
  } catch {
    return null;
  }
}
