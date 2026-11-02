import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function ready(base: string | undefined) {
  if (base) {
    try {
      const response = await fetch(new URL("/actuator/health", base), {
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      });
      if (response.ok && (await response.json()).status === "UP") {
        return true;
      }
    } catch {
      // Never expose the private URL or upstream error details to browsers.
    }
  }
  return false;
}

/** All enabled core services must be ready, including voting after its migration. */
export async function GET() {
  const checks = [ready(process.env.API_INTERNAL_URL)];
  if (process.env.VS_FRONTEND_ENABLED === "true") checks.push(ready(process.env.VS_API_INTERNAL_URL));
  if (process.env.MEMBER_FRONTEND_ENABLED === "true") checks.push(ready(process.env.MEMBER_API_INTERNAL_URL));
  const up = (await Promise.all(checks)).every(Boolean);
  return NextResponse.json({ status: up ? "UP" : "DOWN" }, {
    status: up ? 200 : 503, headers: { "Cache-Control": "no-store" },
  });
}
