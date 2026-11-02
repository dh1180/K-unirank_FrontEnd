import Link from "next/link";
import {memberRead} from "@/lib/member-server";
import {apiGet} from "@/lib/api";
import {UniversityLogo} from "@/components/UniversityLogo";
import type {Favorite} from "@/components/MyPageClient";
export const dynamic="force-dynamic";
type Reference={year:number|null;cuts:{label:string;unit:string;value50:number|null;value70:number|null}[]};
export default async function Compare({searchParams}:{searchParams:Promise<{university?:string|string[]}>}){
 const response=await memberRead("/api/v1/member/favorites/universities");
 if(!response?.ok)return <section className="panel"><h1>관심 대학 비교</h1><Link className="button primary" href="/login/">로그인하고 비교하기</Link></section>;
 const favorites=await response.json() as Favorite[];const raw=(await searchParams).university;
 const ids=[...new Set((Array.isArray(raw)?raw:raw?[raw]:[]).map(Number).filter(Number.isSafeInteger))];
 const selected=favorites.filter(f=>ids.includes(f.id));const error=ids.length>0&&(ids.length<2||ids.length>3||ids.length!==selected.length);
 const results=!error&&selected.length>=2?await Promise.all(selected.map(async school=>({school,ref:await apiGet<Reference>(`/api/v1/universities/${school.id}/admission-reference`)}))):[];
 const years=new Set(results.map(x=>x.ref?.year).filter(Boolean));
 return <><section className="panel"><p className="eyebrow">MY COLLEGES</p><h1>관심 대학 비교</h1><p>저장한 대학 2~3곳을 선택해 공개 입결 요약을 비교하세요.</p>
 <form method="get" action="/mypage/compare/#favorite-comparison"><div className="ai-examples">{favorites.map(s=><label key={s.id}><input type="checkbox" name="university" value={s.id} defaultChecked={ids.includes(s.id)}/>{s.name}</label>)}</div><button className="button primary">선택한 대학 비교</button></form>
 {!favorites.length&&<p>먼저 대학 상세 페이지에서 관심 대학을 저장해 주세요.</p>}{error&&<p className="notice">관심 대학 목록에서 2~3곳을 선택해 주세요.</p>}</section>
 {!!results.length&&<section className="panel" id="favorite-comparison"><h2>공개 입결 비교</h2>{years.size>1&&<p className="notice">대학별 최신 공개 학년도가 다릅니다. 각 학년도를 확인해 주세요.</p>}
 <div className="favorite-comparison-grid">{results.map(({school,ref})=><article className="panel" key={school.id}><UniversityLogo id={school.id} name={school.name}/><h3>{school.name}</h3><p>{ref?.year?`${ref.year}학년도`:"자료 없음"}</p>
 {ref?.cuts.map(c=><div className="ai-cuts" key={c.label}><p><span>{c.label} 50%</span><b>{c.value50?.toFixed(2)??"미공개"}<small>{c.unit}</small></b></p><p><span>70%</span><b>{c.value70?.toFixed(2)??"미공개"}<small>{c.unit}</small></b></p></div>)}<Link className="button" href={`/admissions/university/${school.id}/`}>학과별 입시결과 보기 →</Link></article>)}</div><p className="help">대학 단위 요약이며 학과·전형별 조건은 원문 입시결과를 확인해 주세요.</p></section>}<Link href="/mypage/">마이페이지로 돌아가기</Link></>;
}
