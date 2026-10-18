import { NextRequest, NextResponse } from "next/server";

/** Trusted internal API endpoint paths only. No user-controlled proxy destination. */
const permitted = new Set([
  "/api/v1/member/login",
  "/api/v1/member/logout",
  "/api/v1/member/me",
  "/api/v1/member/favorites/universities",
  "/api/v1/member/favorites/units",
]);

function error(detail: string, status: number) {
  return NextResponse.json({ detail }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function proxyMember(request: NextRequest, destination: string,
                                  method: "GET" | "POST" | "PUT" | "DELETE") {
  if (process.env.MEMBER_FRONTEND_ENABLED !== "true") {
    return error("회원 기능은 아직 이전 검증 중입니다.", 503);
  }
  const isFavoriteId = /^\/api\/v1\/member\/favorites\/universities\/[1-9]\d*$/.test(destination);
  const isFavoriteUnitId = /^\\/api\\/v1\\/member\\/favorites\\/units\\/[1-9]\\d*$/.test(destination);
  if (!permitted.has(destination) && !isFavoriteId && !isFavoriteUnitId) return error("지원하지 않는 요청입니다.", 404);
  if (method !== "GET") {
    const origin = request.headers.get("origin");
    if (!origin || origin !== request.nextUrl.origin
        || request.headers.get("sec-fetch-site") === "cross-site") {
      return error("요청 출처를 확인할 수 없습니다.", 403);
    }
  }
  const api = process.env.API_INTERNAL_URL;
  if (!api) return error("Spring Boot 연결 설정이 없습니다.", 503);
  let body: string | undefined;
  if (destination === "/api/v1/member/login") {
    if (method !== "POST" || !(request.headers.get("content-type") ?? "").startsWith("application/json")) {
      return error("로그인은 JSON POST 요청만 허용합니다.", 415);
    }
    if (Number(request.headers.get("content-length") ?? 0) > 2048) return error("요청이 너무 큽니다.", 413);
    try {
      const payload = await request.text();
      if (new TextEncoder().encode(payload).length > 2048) return error("요청이 너무 큽니다.", 413);
      const input: unknown = JSON.parse(payload);
      if (!input || typeof input !== "object") return error("로그인 입력이 잘못되었습니다.", 422);
      const { username, password } = input as { username?: unknown; password?: unknown };
      if (typeof username !== "string" || !username.trim() || username.length > 150
          || typeof password !== "string" || password.length < 1 || password.length > 256) {
        return error("아이디와 비밀번호를 확인해 주세요.", 422);
      }
      body = JSON.stringify({ username, password });
    } catch { return error("로그인 JSON 형식이 잘못되었습니다.", 422); }
  }
  try {
    const session = request.cookies.get("kunirank_member")?.value;
    const target = new URL(destination, api);
    const upstream = await fetch(target, {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(session ? { Cookie: `kunirank_member=${session}` } : {}),
      },
      ...(body ? { body } : {}),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const response = new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
    for (const value of upstream.headers.getSetCookie()) response.headers.append("Set-Cookie", value);
    return response;
  } catch {
    return error("회원 API 연결에 실패했습니다.", 502);
  }
}
