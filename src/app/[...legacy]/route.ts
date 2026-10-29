import { NextRequest, NextResponse } from "next/server";
import { SITE_ORIGIN, legacyPath } from "@/lib/site-policy.mjs";
function legacy(request: NextRequest) {
  if (!legacyPath(request.nextUrl.pathname))
    return new NextResponse(null, { status: 404 });
  const target = new URL(
    request.nextUrl.pathname + request.nextUrl.search,
    SITE_ORIGIN,
  );
  return NextResponse.redirect(target, 307);
}
export const GET = legacy,
  HEAD = legacy,
  POST = legacy;
