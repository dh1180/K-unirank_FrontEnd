import type { Metadata } from "next";
import Link from "next/link";
import { memberRead, type Member } from "@/lib/member-server";
import { MyPageClient, type Favorite, type FavoriteUnit } from "@/components/MyPageClient";
export const metadata:Metadata={title:"마이페이지",robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
export default async function MyPage() {
  const profile=await memberRead("/api/v1/member/me");
  if (!profile?.ok) return <section className="account-gate panel">
    <p className="eyebrow">MY SPACE</p><h1>마이페이지</h1>
    <p>관심 대학과 학과를 모아두고, 나의 입시 탐색을 이어가세요.</p>
    <Link className="button primary" href="/login/">로그인하고 내 관심 목록 보기 →</Link>
    {profile?.status!==401 && <p className="help">회원 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>}
  </section>;
  const member=await profile.json() as Member;
  const [universities,units]=await Promise.all([memberRead("/api/v1/member/favorites/universities"),memberRead("/api/v1/member/favorites/units")]);
  if (!universities?.ok || !units?.ok) return <section className="account-gate panel"><h1>마이페이지</h1><p>관심 목록을 불러오지 못했습니다. 새로고침 후 다시 확인해 주세요.</p><Link className="button" href="/mypage/">다시 확인하기</Link></section>;
  return <MyPageClient profile={member} universities={await universities.json() as Favorite[]} units={await units.json() as FavoriteUnit[]}/>;
}
