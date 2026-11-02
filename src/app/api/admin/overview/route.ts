import { NextRequest } from "next/server";
import { proxyMember } from "@/lib/member-proxy";
export const dynamic="force-dynamic";
export async function GET(request:NextRequest) {return proxyMember(request,"/api/v1/admin/overview","GET");}
