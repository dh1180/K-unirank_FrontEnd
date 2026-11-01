import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "node:crypto";

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
  const internal = process.env.VS_API_INTERNAL_URL;
  const token = process.env.VS_FRONTEND_TOKEN?.trim();
  if (!internal || !token || token.length < 32) {
    return NextResponse.json({ detail: "VS 서버가 아직 연결되지 않았습니다." }, { status: 503 });
  }
  if (method === "POST") {
    const origin = request.headers.get("origin");
    // Railway terminates TLS before Next, so nextUrl.origin can be internal HTTP.
    const publicHost = request.headers.get("host") || request.nextUrl.host;
    const sameOrigin = origin === `https://${publicHost}` ||
      (process.env.NODE_ENV !== "production" && origin === `http://${publicHost}`);
    if (!origin || !sameOrigin
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
    const cookie = request.cookies.get("kunirank_vs")?.value;
    const network = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const hash = (value: string) => createHmac("sha256", token).update(value).digest("hex");
    let body: string | undefined;
    if (method === "POST") {
      const reader = request.body?.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      if (reader) while (true) {
        const part = await reader.read();
        if (part.done) break;
        size += part.value.byteLength;
        if (size > 2048) {
          await reader.cancel();
          return NextResponse.json({ detail: "요청 크기가 너무 큽니다." }, { status: 413 });
        }
        chunks.push(part.value);
      }
      body = Buffer.concat(chunks).toString("utf8");
    }
    const endpoint = new URL(`/api/v1/boards/overall/${action}`, internal);
    const upstream = await fetch(endpoint, {
      method,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "X-VS-Frontend-Token": token,
        "X-VS-Client-Key": hash(cookie || `${network}:${request.headers.get("user-agent") || ""}`),
        "X-VS-Network-Key": hash(`network:${network}`),
        ...(method === "POST" ? { "Content-Type": "application/json", Origin: request.headers.get("origin")! } : {}),
        ...(cookie && /^[A-Za-z0-9_-]{20,100}$/.test(cookie) ? { Cookie: `kunirank_vs=${cookie}` } : {}),
      },
      ...(method === "POST" ? { body } : {}),
      signal: AbortSignal.timeout(10_000),
    });
    let responseBody = await upstream.text();
    if (method === "GET" && upstream.ok && process.env.API_INTERNAL_URL) {
      const match = JSON.parse(responseBody);
      if (Array.isArray(match.pair) && match.pair.length === 2) {
        match.pair = await Promise.all(match.pair.map(async (school: { id: number }) => {
          let admissionReference = null;
          try {
            if (Number.isSafeInteger(school.id) && school.id > 0) {
              const reference = await fetch(new URL(`/api/v1/universities/${school.id}/admission-reference`, process.env.API_INTERNAL_URL), {
                next: { revalidate: 300 }, signal: AbortSignal.timeout(4000),
              });
              if (reference.ok) admissionReference = await reference.json();
            }
          } catch { /* A missing reference must not prevent voting. */ }
          return { ...school, admissionReference };
        }));
        responseBody = JSON.stringify(match);
      }
    }
    const result = new NextResponse(responseBody, {
      status: upstream.status,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
    // Preserve SameSite, HttpOnly, Secure and Path attributes from Spring.
    for (const cookie of upstream.headers.getSetCookie()) result.headers.append("Set-Cookie", cookie);
    if (upstream.headers.has("retry-after")) result.headers.set("Retry-After", upstream.headers.get("retry-after")!);
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
