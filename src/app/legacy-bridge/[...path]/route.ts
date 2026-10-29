import { NextRequest, NextResponse } from "next/server";
import { SITE_ORIGIN, legacyPath, productionHost } from "@/lib/site-policy.mjs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
async function bridge(request: NextRequest, context: Context) {
  const path = "/" + (await context.params).path.join("/") + "/";
  if (
    !legacyPath(path) ||
    !productionHost(request.headers.get("host"), process.env.SITE_MODE)
  )
    return new NextResponse(null, { status: 404 });
  const base =
    process.env.LEGACY_INTERNAL_URL || "http://web.railway.internal:8000";
  const target = new URL(
    path.replace(/\/$/, request.nextUrl.pathname.endsWith("/") ? "/" : ""),
    base,
  );
  target.search = request.nextUrl.search;
  const headers = new Headers(request.headers);
  for (const key of [
    "connection",
    "transfer-encoding",
    "content-length",
    "accept-encoding",
    "x-nextjs-data",
    "rsc",
    "next-router-state-tree",
  ])
    headers.delete(key);
  headers.set("host", new URL(SITE_ORIGIN).host);
  headers.set("x-forwarded-proto", "https");
  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
      ...(["GET", "HEAD"].includes(request.method)
        ? {}
        : { body: await request.arrayBuffer() }),
    });
    const resultHeaders = new Headers(upstream.headers);
    for (const key of [
      "connection",
      "transfer-encoding",
      "content-length",
      "content-encoding",
      "set-cookie",
    ])
      resultHeaders.delete(key);
    for (const cookie of upstream.headers.getSetCookie())
      resultHeaders.append("set-cookie", cookie);
    resultHeaders.set("cache-control", "private, no-store");
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: resultHeaders,
    });
  } catch {
    return new NextResponse(
      "기존 서비스 연결이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.",
      { status: 502 },
    );
  }
}
export const GET = bridge,
  HEAD = bridge,
  POST = bridge;
