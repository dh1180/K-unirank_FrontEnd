import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ action: string }> };

/**
 * Same-origin BFF: no credentials or Railway private hostname reach the browser.
 * The Spring-issued HttpOnly session cookie passes transparently to the client.
 */
async function proxy(request: NextRequest, method: "GET" | "POST", context: Params) {
  if (process.env.VS_FRONTEND_ENABLED !== "true") {
    return NextResponse.json({ detail: "VS 기능은 이전 준비 중입니다." }, {
      status: 503, headers: { "Cache-Control": "no-store" },
    });
  }
  const { action } = await context.params;
  if ((method === "GET" && action !== "next") || (method === "POST" && action !== "vote")) {
    return NextResponse.json({ detail: "지원하지 않는 VS 요청입니다." }, { status: 404 });
  }
  const internal = process.env.API_INTERNAL_URL;
  if (!internal) {
    return NextResponse.json({ detail: "VS 서버가 아직 연결되지 않았습니다." }, { status: 503 });
  }
  if (method === "POST") {
    const origin = request.headers.get("origin");
    if (!origin || origin !== request.nextUrl.origin
        || request.headers.get("sec-fetch-site") === "cross-site") {
      return NextResponse.json({ detail: "허용되지 않은 요청입니다." }, { status: 403 });
    }
    const ct = request.headers.get("content-type") ?? "";
    if (!ct.startsWith("application/json")) {
      return NextResponse.json({ detail: "JSON만 허용합니다." }, { status: 415 });
    }
    const size = Number(request.headers.get("content-length") ?? "0");
    if (!Number.isFinite(size) || size > 2048) {
      return NextResponse.json({ detail: "요청 크기가 너무 큽니다." }, { status: 413 });
    }
  }
  try {
    const endpoint = new URL(`/api/v1/boards/overall/${action}`, internal);
    const upstream = await fetch(endpoint, {
      method,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
        ...(request.headers.get("cookie") ? { Cookie: request.headers.get("cookie")! } : {}),
      },
      ...(method === "POST" ? { body: await request.text() } : {}),
      signal: AbortSignal.timeout(10_000),
    });
    const result = new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
    // Preserve SameSite, HttpOnly, Secure and Path attributes from Spring.
    for (const cookie of upstream.headers.getSetCookie()) result.headers.append("Set-Cookie", cookie);
    return result;
  } catch {
    return NextResponse.json({ detail: "VS API 서버 응답이 지연되거나 연결되지 않았습니다." }, {
      status: 502, headers: { "Cache-Control": "no-store" },
    });
  }
}

export async function GET(request: NextRequest, context: Params) {
  return proxy(request, "GET", context);
}

export async function POST(request: NextRequest, context: Params) {
  return proxy(request, "POST", context);
}
