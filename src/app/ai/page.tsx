import type { Metadata } from "next";
import Link from "next/link";
import AiAdmissionsClient from "@/components/AiAdmissionsClient";
import { memberRead } from "@/lib/member-server";

export const metadata: Metadata = { title: "AI 입결 검색", robots: { index: false, follow: true } };

export default async function AiPage() {
  if (process.env.AI_FRONTEND_ENABLED === "true") {
    const profile=await memberRead("/api/v1/member/me");
    if(profile?.ok)return <AiAdmissionsClient />;
    return <section className="account-gate panel"><p className="eyebrow">AI ADMISSIONS</p><h1>로그인하고 AI 입결을 찾아보세요</h1>
      <p>내신 등급과 관심 대학·학과를 입력하면 공개된 입시결과와 비교해 드립니다.</p>
      <div className="actions"><Link className="button primary" href="/login/?next=%2Fai%2F">로그인하고 이용하기 →</Link><Link className="button" href="/register/?next=%2Fai%2F">회원가입</Link></div>
      {profile?.status!==401&&<p className="help">회원 정보를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.</p>}</section>;
  }
  return <section className="page-header panel">
    <p className="eyebrow">AI ADMISSIONS</p>
    <h1>AI 입결 검색을 준비하고 있습니다</h1>
    <p>지금은 공개된 입결을 검색하거나 내 점수와 직접 비교할 수 있습니다.</p>
    <div className="actions">
      <Link className="button primary" href="/">입결 찾기</Link>
      <Link className="button" href="/admissions/compare/">내 점수로 학과 찾기</Link>
    </div>
  </section>;
}
