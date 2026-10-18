import { NextRequest } from "next/server";
import { proxyMember } from "@/lib/member-proxy";

type Route = { params: Promise<{ action: string }> };

export async function GET(request: NextRequest, ctx: Route) {
  const { action } = await ctx.params;
  return proxyMember(request, `/api/v1/member/${action}`, "GET");
}
export async function POST(request: NextRequest, ctx: Route) {
  const { action } = await ctx.params;
  return proxyMember(request, `/api/v1/member/${action}`, "POST");
}
