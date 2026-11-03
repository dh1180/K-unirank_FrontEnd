import type { NextRequest } from "next/server";

/** Validate the server-side session on every AI request, including logout/revocation. */
export async function authenticateAiMember(request:NextRequest):Promise<Response> {
  const cookie=request.cookies.get("kunirank_member")?.value;
  if(!cookie || !/^[A-Za-z0-9_.-]{1,1024}$/.test(cookie)) return Response.json({detail:"AI 입결은 로그인 후 이용할 수 있습니다."},{status:401});
  const api=process.env.MEMBER_API_INTERNAL_URL,token=process.env.MEMBER_FRONTEND_TOKEN;
  if(process.env.MEMBER_FRONTEND_ENABLED!=="true" || !api || !token || token.length<32)
    return Response.json({detail:"회원 인증을 확인할 수 없습니다. 잠시 후 다시 시도해 주세요."},{status:503});
  try {
    const response=await fetch(new URL("/api/v1/member/me",api),{cache:"no-store",headers:{Accept:"application/json",Cookie:`kunirank_member=${cookie}`,"X-Member-Frontend-Token":token},signal:AbortSignal.timeout(8000)});
    if(response.ok)return response;
    return Response.json({detail:response.status===401?"로그인이 만료되었습니다. 다시 로그인해 주세요.":"회원 인증을 확인할 수 없습니다."},{status:response.status===401?401:503});
  }catch{return Response.json({detail:"회원 인증을 확인할 수 없습니다."},{status:503});}
}

export async function recordAiUsage(request:NextRequest,requestId:string,statusCode:number,elapsedMs:number) {
  try {
    await fetch(new URL("/api/v1/member/ai/usage",process.env.MEMBER_API_INTERNAL_URL!),{
      method:"POST",cache:"no-store",headers:{"Content-Type":"application/json","X-Member-Frontend-Token":process.env.MEMBER_FRONTEND_TOKEN!,
      Cookie:`kunirank_member=${request.cookies.get("kunirank_member")!.value}`,Origin:request.headers.get("origin")!},
      body:JSON.stringify({requestId,statusCode,elapsedMs:Math.min(120000,Math.max(0,elapsedMs))}),signal:AbortSignal.timeout(3000),
    });
  }catch{/* An audit store outage must not discard a completed AI response. */}
}
