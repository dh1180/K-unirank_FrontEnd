import { NextRequest } from "next/server";
import { proxyMember } from "@/lib/member-proxy";

type Route = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: Route) {
  const { id } = await context.params;
  return proxyMember(request, `/api/v1/member/favorites/units/${id}`, "PUT");
}

export async function DELETE(request: NextRequest, context: Route) {
  const { id } = await context.params;
  return proxyMember(request, `/api/v1/member/favorites/units/${id}`, "DELETE");
}
