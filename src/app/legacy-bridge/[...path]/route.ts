import { NextRequest, NextResponse } from "next/server";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { Readable } from "node:stream";
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
    const body = ["GET", "HEAD"].includes(request.method)
      ? null
      : Buffer.from(await request.arrayBuffer());
    if (body) headers.set("content-length", String(body.byteLength));
    // Node HTTP preserves the original Host required by Django's existing
    // ALLOWED_HOSTS and CSRF checks; fetch may normalize it to the private host.
    return await new Promise<NextResponse>((resolve, reject) => {
      const transport =
        target.protocol === "https:" ? httpsRequest : httpRequest;
      const outgoing = transport(
        target,
        { method: request.method, headers: Object.fromEntries(headers) },
        (upstream) => {
          const resultHeaders = new Headers();
          for (const [key, value] of Object.entries(upstream.headers)) {
            if (!value || ["connection", "transfer-encoding"].includes(key))
              continue;
            for (const item of Array.isArray(value) ? value : [value])
              resultHeaders.append(key, item);
          }
          if (!path.startsWith("/static/"))
            resultHeaders.set("cache-control", "private, no-store");
          const status = upstream.statusCode || 502;
          const noBody =
            request.method === "HEAD" || [204, 205, 304].includes(status);
          resolve(
            new NextResponse(
              noBody
                ? null
                : (Readable.toWeb(upstream) as ReadableStream<Uint8Array>),
              { status, headers: resultHeaders },
            ),
          );
        },
      );
      outgoing.setTimeout(30000, () =>
        outgoing.destroy(new Error("Legacy timeout")),
      );
      outgoing.on("error", reject);
      outgoing.end(body);
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
