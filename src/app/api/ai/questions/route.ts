import { NextRequest, NextResponse } from "next/server";
import { sameOrigin } from "@/lib/request-origin.mjs";
import { createHash } from "node:crypto";

export const dynamic = "force-dynamic";
const windows = new Map<string, { until: number; count: number }>();

function allowRequest(request: NextRequest) {
  const address = request.headers.get("x-real-ip") || "unknown";
  const key = createHash("sha256").update(address).digest("hex");
  const now = Date.now();
  for (const [id, row] of windows) if (row.until <= now) windows.delete(id);
  const row = windows.get(key) || { until: now + 60_000, count: 0 };
  if (row.count >= 2 || windows.size >= 10_000) return false;
  row.count++;
  windows.set(key, row);
  return true;
}

// The browser never receives the Railway private hostname or service token.
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!sameOrigin(origin, request.headers.get("host") || request.nextUrl.host, process.env.NODE_ENV !== "production")
      || request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ detail: "요청 출처가 올바르지 않습니다." }, { status: 403 });
  }
  if (!(request.headers.get("content-type") ?? "").startsWith("application/json")) {
    return NextResponse.json({ detail: "JSON 요청만 허용합니다." }, { status: 415 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > 2048) {
    return NextResponse.json({ detail: "요청이 너무 큽니다." }, { status: 413 });
  }
  const api = process.env.API_INTERNAL_URL;
  const token = process.env.AI_FRONTEND_TOKEN;
  if (process.env.AI_FRONTEND_ENABLED !== "true" || !api || !token || token.length < 32) {
    return NextResponse.json({ detail: "AI 입결 기능은 연결 준비 중입니다." }, { status: 503 });
  }
  try {
    const reader = request.body?.getReader();
    if (!reader) return NextResponse.json({ detail: "질문을 입력해 주세요." }, { status: 422 });
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 2048) {
        await reader.cancel();
        return NextResponse.json({ detail: "요청이 너무 큽니다." }, { status: 413 });
      }
      chunks.push(value);
    }
    const payload: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    const question = payload && typeof payload === "object"
      ? (payload as { question?: unknown }).question : undefined;
    if (typeof question !== "string" || question.trim().length < 8 || question.length > 500) {
      return NextResponse.json({ detail: "8~500자로 질문을 입력해 주세요." }, { status: 422 });
    }
    if (!allowRequest(request)) return NextResponse.json({ detail: "잠시 후 다시 검색해 주세요. 1분에 두 번 검색할 수 있습니다." }, { status: 429, headers: { "Retry-After": "60" } });
    const result = await fetch(new URL("/api/v1/ai/questions", api), {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Frontend-Service-Token": token },
      body: JSON.stringify({ question, limit: 5 }),
      cache: "no-store",
      signal: AbortSignal.timeout(45_000),
    });
    if (!result.ok) {
      const detail = result.status === 422
        ? "내신 평균등급을 포함하여 질문해 주세요. 예: 내신 3.0등급 서울 간호학과"
        : result.status === 429
          ? "무료 AI 검색 한도에 도달했습니다. 잠시 후 다시 시도하거나 일반 입결 검색을 이용해 주세요."
          : "AI 검색을 처리하지 못했습니다. 잠시 후 다시 시도하거나 일반 입결 검색을 이용해 주세요.";
      return NextResponse.json({ detail }, { status: result.status, headers: { "Cache-Control": "no-store" } });
    }
    return new NextResponse(await result.text(), {
      status: result.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ detail: "JSON 형식을 확인해 주세요." }, { status: 400 });
    return NextResponse.json({ detail: "AI 입결 API 서버에 연결하지 못했습니다." }, { status: 502 });
  }
}
