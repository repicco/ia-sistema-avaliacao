import { NextResponse } from "next/server";

export function jsonError(error: string, status: number, details?: unknown) {
  return NextResponse.json(details ? { error, details } : { error }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export function jsonOk(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
