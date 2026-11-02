"use client";
import Link from "next/link";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {UniversityLogo} from "@/components/UniversityLogo";
import type {Member} from "@/lib/member-server";
export type Favorite={id:number;name:string;region:string|null};
export type FavoriteUnit={id:number;name:string;collegeName:string;universityId:number;universityName:string};
export function MyPageClient({profile,universities,units}:{profile:Member;universities:Favorite[];units:FavoriteUnit[]}) {
  const router=useRouter();
  const [schools,setSchools]=useState(universities);
  const [majors,setMajors]=useState(units);
  const [pending,setPending]=useState("");
  const [error,setError]=useState("");
  async function remove(type:"universities"|"units",id:number) {
    if(pending)return;setPending(`${type}-${id}`);setError("");
    try {
      const result=await fetch(`/api/member/favorites/${type}/${id}/`,{method:"DELETE",credentials:"same-origin"});
      if(!result.ok)throw new Error(result.status===401?"로그인이 만료되었습니다. 다시 로그인해 주세요.":"관심 목록을 수정하지 못했습니다.");
      if(type==="universities")setSchools(old=>old.filter(x=>x.id!==id));else setMajors(old=>old.filter(x=>x.id!==id));
      router.refresh();
    }catch(e){setError(e instanceof Error?e.message:"잠시 후 다시 시도해 주세요.");}finally{setPending("");}
  }
  async function logout() {
    if(pending)return;setPending("logout");setError("");
    try {const result=await fetch("/api/member/logout/",{method:"POST",credentials:"same-origin"});
      if(!result.ok)throw new Error("로그아웃하지 못했습니다. 다시 시도해 주세요.");
      window.dispatchEvent(new Event("member-change"));router.replace("/login/");router.refresh();
    }catch(e){setError(e instanceof Error?e.message:"연결하지 못했습니다.");}finally{setPending("");}
  }
  return <div className="account-page">
    <section className="account-hero panel"><div><p className="eyebrow">MY SPACE</p><h1>{profile.username}님의 마이페이지</h1><p>모아둔 관심 대학과 학과에서 다음 탐색을 시작하세요.</p></div>
      <div className="actions">{profile.admin&&<Link className="button" href="/admin/">관리자 페이지 →</Link>}<button className="button" disabled={!!pending} onClick={()=>void logout()}>로그아웃</button></div>
    </section>
    <div className="actions"><Link className="button" href="/mypage/history/">내 투표 기록 →</Link><Link className="button" href="/mypage/compare/">관심 대학 비교 →</Link></div>
    <div className="account-summary"><a href="#my-universities"><span>관심 대학</span><strong>{schools.length}<small>개</small></strong></a><a href="#my-units"><span>관심 학과</span><strong>{majors.length}<small>개</small></strong></a><Link href="/admissions/compare/"><span>나의 다음 탐색</span><strong className="summary-action">내 점수로 학과 찾기 ↗</strong></Link></div>
    {error&&<p className="notice" role="alert">{error} <Link href="/login/">로그인</Link></p>}
    <section className="panel account-list" id="my-universities"><div className="account-section-title"><h2>관심 대학 <span>{schools.length}</span></h2><Link href="/universities/">대학 더 찾아보기 →</Link></div>
      {!schools.length?<div className="account-empty"><h3>아직 저장한 대학이 없어요</h3><p>대학 상세 페이지에서 관심 대학으로 등록해 보세요.</p><Link className="button" href="/universities/">대학 둘러보기</Link></div>:
        <ul>{schools.map(s=><li key={s.id}><Link className="account-school" href={`/universities/${s.id}/`}><UniversityLogo id={s.id} name={s.name}/><div><strong>{s.name}</strong><p>{s.region||"지역 정보 없음"}</p></div></Link><div className="actions"><Link className="button" href={`/admissions/university/${s.id}/`}>입시결과 보기</Link><button className="account-remove" disabled={!!pending} aria-label={`${s.name} 관심 해제`} onClick={()=>void remove("universities",s.id)}>관심 해제</button></div></li>)}</ul>}
    </section>
    <section className="panel account-list" id="my-units"><div className="account-section-title"><h2>관심 학과·모집단위 <span>{majors.length}</span></h2><Link href="/">입결 찾아보기 →</Link></div>
      {!majors.length?<div className="account-empty"><h3>관심 있는 학과를 저장해 보세요</h3><p>학과 입시결과에서 관심 학과를 등록할 수 있습니다.</p><Link className="button" href="/">입결 찾기</Link></div>:
        <ul>{majors.map(s=><li key={s.id}><Link className="account-school" href={`/admissions/unit/${s.id}/`}><UniversityLogo id={s.universityId} name={s.universityName}/><div><strong>{s.name}</strong><p>{s.universityName}{s.collegeName?` · ${s.collegeName}`:""}</p></div></Link><button className="account-remove" disabled={!!pending} aria-label={`${s.name} 관심 해제`} onClick={()=>void remove("units",s.id)}>관심 해제</button></li>)}</ul>}
    </section>
  </div>;
}
