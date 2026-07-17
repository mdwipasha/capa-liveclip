import { NextResponse } from "next/server";
import type { ApiErrorCode, ApiResponse } from "@/types/domain";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiResponse<T>>({ ok: true, data }, init);
}

export function fail(
  code: ApiErrorCode,
  message: string,
  status = 400,
  details?: unknown
) {
  return NextResponse.json<ApiResponse<never>>(
    { ok: false, error: { code, message, details } },
    { status }
  );
}

export function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "An unknown error occurred.";
}
