import "server-only";
import { cookies } from "next/headers";
export type Member = { id: number; username: string; admin: boolean };

export async function memberRead(path: "/api/v1/member/me" | "/api/v1/member/favorites/universities" | "/api/v1/member/favorites/units" | "/api/v1/admin/overview" | `/api/v1/member/history?page=${number}`) {
  const token = process.env.MEMBER_FRONTEND_TOKEN;
  const api = process.env.MEMBER_API_INTERNAL_URL;
  if (process.env.MEMBER_FRONTEND_ENABLED!=="true" || !api || !token || token.length<32) return null;
  const session = (await cookies()).get("kunirank_member")?.value;
  if (!session || !/^[A-Za-z0-9_.-]{1,1024}$/.test(session)) return new Response(null,{status:401});
  try {
    return await fetch(new URL(path,api), {cache:"no-store",headers:{Accept:"application/json",Cookie:`kunirank_member=${session}`,"X-Member-Frontend-Token":token},signal:AbortSignal.timeout(10_000)});
  } catch { return null; }
}
