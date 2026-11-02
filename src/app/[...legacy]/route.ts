import {NextRequest,NextResponse} from "next/server";
import {legacyTarget} from "@/lib/legacy-target.mjs";
import {proxyMember} from "@/lib/member-proxy";
export async function GET(request:NextRequest){
 const target=legacyTarget(request.nextUrl.pathname);
 if(!target)return new NextResponse(null,{status:404});
 return NextResponse.redirect(new URL(target+request.nextUrl.search,request.url),308);
}
export const HEAD=GET;
export async function POST(request:NextRequest){
 const path=request.nextUrl.pathname;
 if(path==="/accounts/logout/"){
  const result=await proxyMember(request,"/api/v1/member/logout","POST");
  if(!result.ok)return result;
  const response=NextResponse.redirect(new URL("/login/",request.url),303);
  for(const value of result.headers.getSetCookie())response.headers.append("Set-Cookie",value);
  return response;
 }
 const favorite=path.match(/^\/accounts\/favorites\/(university|recruitment-unit)\/([1-9][0-9]*)\/toggle\/$/);
 if(favorite){
  const type=favorite[1]==="university"?"universities":"units";
  const list=await proxyMember(request,`/api/v1/member/favorites/${type}`,"GET");
  if(!list.ok)return list;
  const rows=await list.json() as {id:number}[];
  const result=await proxyMember(request,`/api/v1/member/favorites/${type}/${favorite[2]}`,rows.some(x=>x.id===Number(favorite[2]))?"DELETE":"PUT");
  return result.ok?NextResponse.redirect(new URL("/mypage/",request.url),303):result;
 }
 return NextResponse.json({detail:"새 페이지를 열어 다시 시도해 주세요."},{status:405});
}
