import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Readiness checks the same private Spring API used by server-rendered pages. */
export async function GET() {
  const base = process.env.API_INTERNAL_URL;
  if (base) {
    try {
      const response = await fetch(new URL("/actuator/health", base), {
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      });
      if (response.ok && (await response.json()).status === "UP") {
        return NextResponse.json({ status: "UP" }, { headers: { "Cache-Control": "no-store" } });
      }
    } catch {
      // Never expose the private URL or upstream error details to browsers.
    }
  }
  return NextResponse.json({ status: "DOWN" }, {
    status: 503, headers: { "Cache-Control": "no-store" },
  });
}
