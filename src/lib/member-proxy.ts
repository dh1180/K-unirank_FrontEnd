import { NextRequest, NextResponse } from "next/server";
import { sameOrigin } from "@/lib/request-origin.mjs";
import { createHmac } from "node:crypto";

/** Trusted internal API endpoint paths only. No user-controlled proxy destination. */
const permitted = new Set([
  "/api/v1/member/login",
  "/api/v1/member/register",
  "/api/v1/member/history",
  "/api/v1/member/logout",
  "/api/v1/member/me",
  "/api/v1/member/favorites/universities",
  "/api/v1/member/favorites/units",
  "/api/v1/admin/overview",
  "/api/v1/admin/members",
  "/api/v1/admin/quality",
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
  const isFavoriteUnitId = /^\/api\/v1\/member\/favorites\/units\/[1-9]\d*$/.test(destination);
  if (!permitted.has(destination) && !isFavoriteId && !isFavoriteUnitId) return error("지원하지 않는 요청입니다.", 404);
  if (method !== "GET") {
    const origin = request.headers.get("origin");
    if (!sameOrigin(origin, request.headers.get("host") || request.nextUrl.host, process.env.NODE_ENV !== "production")
        || request.headers.get("sec-fetch-site") === "cross-site") {
      return error("요청 출처를 확인할 수 없습니다.", 403);
    }
  }
  const api = process.env.MEMBER_API_INTERNAL_URL;
  const serviceToken = process.env.MEMBER_FRONTEND_TOKEN;
  if (!api || !serviceToken || serviceToken.length < 32) return error("회원 서비스 연결을 준비하고 있습니다.", 503);
  let body: string | undefined;
  if (["/api/v1/member/login","/api/v1/member/register"].includes(destination)) {
    if (method !== "POST" || !(request.headers.get("content-type") ?? "").startsWith("application/json")) {
      return error("로그인은 JSON POST 요청만 허용합니다.", 415);
    }
    if (Number(request.headers.get("content-length") ?? 0) > 2048) return error("요청이 너무 큽니다.", 413);
    try {
      const reader = request.body?.getReader();
      if (!reader) return error("로그인 입력이 필요합니다.",422);
      const chunks: Uint8Array[] = []; let bytes = 0;
      while (true) {
        const {value,done}=await reader.read(); if (done) break;
        bytes+=value.byteLength;
        if (bytes>2048) {await reader.cancel();return error("요청이 너무 큽니다.",413);}
        chunks.push(value);
      }
      const payload = Buffer.concat(chunks).toString("utf8");
      const input: unknown = JSON.parse(payload);
      if (!input || typeof input !== "object") return error("로그인 입력이 잘못되었습니다.", 422);
      const { username, password } = input as { username?: unknown; password?: unknown };
      if (typeof username !== "string" || !username.trim() || username.length > 150
          || typeof password !== "string" || password.length < 1 || password.length > 256) {
        return error("아이디와 비밀번호를 확인해 주세요.", 422);
      }
      if(destination.endsWith("/register")) {
        const {email,passwordConfirm}=input as {email?:unknown;passwordConfirm?:unknown};
        if(typeof passwordConfirm!=="string" || passwordConfirm.length>256 || typeof email!=="string" || email.length>254)
          return error("회원가입 입력을 확인해 주세요.",422);
        body=JSON.stringify({username,password,email,passwordConfirm});
      } else body = JSON.stringify({ username, password });
    } catch { return error("로그인 JSON 형식이 잘못되었습니다.", 422); }
  }
  try {
    const session = request.cookies.get("kunirank_member")?.value;
    const network = createHmac("sha256", serviceToken).update(request.headers.get("x-real-ip") || "unknown").digest("hex");
    const target = new URL(destination, api);
    if(destination.startsWith("/api/v1/admin/") && method==="GET") {
      for(const key of ["q","page","kind","state"]) {
        const value=request.nextUrl.searchParams.get(key);
        if(value!==null && value.length<=80) target.searchParams.set(key,value);
      }
    }
    if(destination.endsWith("/history")) {
      const page=Number(request.nextUrl.searchParams.get("page")||0);
      target.searchParams.set("page",String(Number.isInteger(page)&&page>=0&&page<=100000?page:0));
    }
    const upstream = await fetch(target, {
      method,
      headers: {
        Accept: "application/json",
        "X-Member-Frontend-Token": serviceToken,
        "X-Member-Network-Key": network,
        ...(method !== "GET" ? { Origin: request.headers.get("origin")! } : {}),
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(session && /^[A-Za-z0-9_.-]{1,1024}$/.test(session) ? { Cookie: `kunirank_member=${session}` } : {}),
      },
      ...(body ? { body } : {}),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const controlled = [400,409,422].includes(upstream.status) ? await upstream.json().catch(()=>({})) : {};
    const detail = typeof controlled.detail==="string" && controlled.detail.length<=200 ? controlled.detail : upstream.status === 401 ? "아이디·비밀번호를 확인하거나 다시 로그인해 주세요."
      : upstream.status === 403 ? "관리자 권한이 필요합니다."
      : upstream.status === 429 ? "로그인 시도가 많습니다. 10분 후 다시 시도해 주세요."
      : upstream.status === 404 ? "대학 또는 모집단위를 찾을 수 없습니다."
      : "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    const response = new NextResponse(upstream.ok ? (upstream.status===204 ? null : await upstream.text()) : JSON.stringify({detail}), {
      status: upstream.status,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
    for (const value of upstream.headers.getSetCookie()) response.headers.append("Set-Cookie", value);
    return response;
  } catch {
    return error("회원 API 연결에 실패했습니다.", 502);
  }
}
