import type {Metadata} from "next";
import Link from "next/link";
import {memberRead,type Member} from "@/lib/member-server";
import {AdminDashboard,type AdminOverview,type AdminListing} from "@/components/AdminDashboard";
import {adminServiceHealth} from "@/lib/admin-server";
export const metadata:Metadata={title:"관리자",robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
export default async function AdminPage({searchParams}:{searchParams?:Promise<Record<string,string|string[]|undefined>>}={}) {
  const result=await memberRead("/api/v1/member/me");
  if(!result?.ok)return <section className="account-gate panel"><p className="eyebrow">ADMIN CONSOLE</p><h1>관리자 로그인</h1><p>운영 현황과 데이터 점검은 관리자 계정으로만 확인할 수 있습니다.</p><Link className="button primary" href="/login/?next=%2Fadmin%2F">관리자 계정으로 로그인 →</Link></section>;
  const member=await result.json() as Member;
  if(!member.admin)return <section className="account-gate panel"><p className="eyebrow">ACCESS RESTRICTED</p><h1>관리자 권한이 필요합니다</h1><p>이 계정으로는 운영 정보를 조회할 수 없습니다.</p><Link className="button" href="/mypage/">마이페이지로 돌아가기</Link></section>;
  const params=await searchParams??{};
  const value=(key:string)=>typeof params[key]==="string"?params[key] as string:"";
  const tab=["overview","ai","members","quality"].includes(value("tab"))?value("tab"):"overview";
  const q=value("q").slice(0,80),state=["active","inactive","admin"].includes(value("state"))?value("state"):"all";
  const kind=["sentinel","shingyeongju","range"].includes(value("kind"))?value("kind"):"sentinel";
  const page=Math.min(10000,Math.max(0,Number.parseInt(value("page"))||0));
  const [response,services]=await Promise.all([memberRead("/api/v1/admin/overview"),adminServiceHealth()]);
  if(!response?.ok)return <section className="account-gate panel"><h1>관리자</h1><p>운영 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p><Link className="button" href="/admin/">다시 확인하기</Link></section>;
  let listing:AdminListing|null=null;
  if(tab==="members"||tab==="quality") {
    const search=new URLSearchParams(tab==="members"?{q,state,page:String(page)}:{kind,page:String(page)});
    const rows=await memberRead(`/api/v1/admin/${tab}?${search}`);
    if(rows?.ok)listing=await rows.json() as AdminListing;
  }
  return <AdminDashboard data={await response.json() as AdminOverview} services={services} listing={listing} tab={tab} q={q} state={state} kind={kind}/>;
}
