import { NextRequest } from "next/server";
import { proxyMember } from "@/lib/member-proxy";

type Route = { params: Promise<{ id: string }> };
export async function PUT(request: NextRequest, ctx: Route) {
  const { id } = await ctx.params;
  return proxyMember(request, `/api/v1/member/favorites/universities/${id}`, "PUT");
}
export async function DELETE(request: NextRequest, ctx: Route) {
  const { id } = await ctx.params;
  return proxyMember(request, `/api/v1/member/favorites/universities/${id}`, "DELETE");
}
