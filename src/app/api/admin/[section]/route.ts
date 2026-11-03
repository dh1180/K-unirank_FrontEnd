import {NextRequest,NextResponse} from "next/server";
import {proxyMember} from "@/lib/member-proxy";
export const dynamic="force-dynamic";
export async function GET(request:NextRequest,context:{params:Promise<{section:string}>}) {
  const {section}=await context.params;
  if(!["members","quality"].includes(section))return NextResponse.json({detail:"지원하지 않는 요청입니다."},{status:404});
  return proxyMember(request,`/api/v1/admin/${section}`,"GET");
}
