import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// The browser never receives the Railway private hostname or service token.
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin
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
    const payload: unknown = await request.json();
    const question = payload && typeof payload === "object"
      ? (payload as { question?: unknown }).question : undefined;
    if (typeof question !== "string" || question.trim().length < 8 || question.length > 500) {
      return NextResponse.json({ detail: "8~500자로 질문을 입력해 줘." }, { status: 422 });
    }
    const result = await fetch(new URL("/api/v1/ai/questions", api), {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Frontend-Service-Token": token },
      body: JSON.stringify({ question, limit: 5 }),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    return new NextResponse(await result.text(), {
      status: result.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ detail: "AI 입결 API 서버에 연결하지 못했습니다." }, { status: 502 });
  }
}
