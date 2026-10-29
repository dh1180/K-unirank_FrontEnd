import { NextRequest, NextResponse } from "next/server";
import { pagePolicy, legacyPath } from "@/lib/site-policy.mjs";
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  const path = request.nextUrl.pathname;
  headers.set("x-site-path", path);
  headers.set("x-site-query", request.nextUrl.search ? "1" : "0");
  const policy = pagePolicy(
    request.headers.get("host"),
    path,
    !!request.nextUrl.search,
    process.env.SITE_MODE,
  );
  const response =
    policy.production && legacyPath(path)
      ? NextResponse.rewrite(
          new URL(
            `/legacy-bridge${path}${request.nextUrl.search}`,
            request.url,
          ),
          { request: { headers } },
        )
      : NextResponse.next({ request: { headers } });
  if (!policy.index)
    response.headers.set(
      "X-Robots-Tag",
      `noindex, ${policy.follow ? "follow" : "nofollow"}`,
    );
  return response;
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|brand/|university/|fonts/|ads.txt|favicon.ico|icon.png).*)",
  ],
};
