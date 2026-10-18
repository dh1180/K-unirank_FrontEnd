import { NextRequest } from "next/server";
import { proxyMember } from "@/lib/member-proxy";

export async function GET(request: NextRequest) {
  return proxyMember(request, "/api/v1/member/favorites/units", "GET");
}
