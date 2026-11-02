import type {Metadata} from "next";
import Link from "next/link";
import {memberRead,type Member} from "@/lib/member-server";
export const metadata:Metadata={title:"관리자",robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
type Overview={operator:string;generatedAt:string;latestAdmissionYear:number|null;stats:{label:string;value:number}[];suspiciousPercentiles:number;shingyeongjuExcluded:number;votesToday:number;skipsToday:number};
export default async function AdminPage() {
  const result=await memberRead("/api/v1/member/me");
  if(!result?.ok)return <section className="account-gate panel"><p className="eyebrow">ADMIN CONSOLE</p><h1>관리자 로그인</h1><p>운영 현황과 데이터 점검은 관리자 계정으로만 확인할 수 있습니다.</p><Link className="button primary" href="/login/?next=%2Fadmin%2F">관리자 계정으로 로그인 →</Link></section>;
  const member=await result.json() as Member;
  if(!member.admin)return <section className="account-gate panel"><p className="eyebrow">ACCESS RESTRICTED</p><h1>관리자 권한이 필요합니다</h1><p>이 계정으로는 운영 정보를 조회할 수 없습니다.</p><Link className="button" href="/mypage/">마이페이지로 돌아가기</Link></section>;
  const response=await memberRead("/api/v1/admin/overview");
  if(!response?.ok)return <section className="account-gate panel"><h1>관리자</h1><p>운영 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p><Link className="button" href="/admin/">다시 확인하기</Link></section>;
  const data=await response.json() as Overview;
  const n=(v:number)=>v.toLocaleString("ko-KR");
  return <div className="account-page admin-page">
    <section className="account-hero panel"><div><p className="eyebrow">ADMIN CONSOLE</p><h1>사이트 운영 현황</h1><p>{data.operator}님 · {data.latestAdmissionYear?`${data.latestAdmissionYear}학년도 입결`:"입결 자료 확인 중"}</p></div><Link className="button" href="/mypage/">마이페이지 →</Link></section>
    <div className="admin-stats">{data.stats.map(s=><article className="panel" key={s.label}><p>{s.label}</p><strong>{n(s.value)}</strong></article>)}</div>
    <div className="admin-detail-grid"><section className="panel"><p className="eyebrow">TODAY · KST</p><h2>오늘의 대학 투표</h2><div className="ai-cuts"><p><span>선호 선택</span><b>{n(data.votesToday)}<small>건</small></b></p><p><span>건너뛰기</span><b>{n(data.skipsToday)}<small>건</small></b></p></div><Link href="/ranking/">대학 선호도 순위 보기 →</Link></section>
    <section className="panel"><p className="eyebrow">DATA QUALITY</p><h2>입결 데이터 점검</h2><dl className="admin-quality"><div><dt>평균 백분위 99.99 계열</dt><dd>{n(data.suspiciousPercentiles)}개 지표</dd></div><div><dt>신경주대 백분위 99</dt><dd>{n(data.shingyeongjuExcluded)}개 지표</dd></div></dl><p className="help">원본 자료의 보관 수입니다. 표시·집계 제외 규칙은 별도로 적용되며, 여기서 원본을 삭제하지 않습니다.</p></section></div>
    <section className="panel"><div className="account-section-title"><h2>운영 바로가기</h2><span className="help">{new Date(data.generatedAt).toLocaleString("ko-KR",{timeZone:"Asia/Seoul"})} 기준</span></div><div className="admin-links"><Link href="/universities/">대학 정보 확인 ↗</Link><Link href="/admissions/ranking/">입결 순위 확인 ↗</Link><Link href="/vs/">투표 화면 확인 ↗</Link><Link href="/register/">회원가입 화면 확인 ↗</Link></div></section>
  </div>;
}
