"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {useEffect,useState} from "react";
export function Navigation({ ai, member }: { ai: boolean; member: boolean }) {
  const pathname = usePathname();
  const [profile,setProfile]=useState<{username:string;admin:boolean}|null>(null);
  useEffect(()=>{
    if(!member)return;
    let alive=true;
    const update=()=>{void fetch("/api/member/me/",{credentials:"same-origin",cache:"no-store"})
      .then(async r=>r.ok?await r.json():null).then(data=>{if(alive)setProfile(data);}).catch(()=>{if(alive)setProfile(null);});};
    update();window.addEventListener("member-change",update);
    return()=>{alive=false;window.removeEventListener("member-change",update);};
  },[member,pathname]);
  const rankingPath = [
    "/rankings/",
    "/ranking/",
    "/admissions/ranking/",
    "/universities/indicators/",
  ].some((prefix) => pathname.startsWith(prefix));
  function active(href: string) {
    if (href === "/") return pathname === "/";
    if (href === "/rankings/") return rankingPath;
    if (href === "/universities/")
      return !rankingPath && pathname.startsWith(href);
    return pathname.startsWith(href);
  }
  const links = [
    { href: "/", label: "입결 찾기" },
    { href: "/admissions/compare/", label: "내 점수" },
    { href: "/universities/", label: "대학" },
    { href: "/rankings/", label: "대학 순위" },
    ...(ai ? [{ href: "/ai/", label: "AI 입결" }] : []),
    { href: "/vs/", label: "대학 투표" },
  ];
  return (
    <><nav aria-label="주요 메뉴">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={active(link.href) ? "active" : ""}
          aria-current={active(link.href) ? "page" : undefined}
        >
          {link.label}
        </Link>
      ))}
    </nav>{member&&<div className="header-account" aria-label="내 계정">
      <Link className={pathname.startsWith("/mypage")?"active":""} href="/mypage/">마이페이지</Link>
      {profile?.admin?<Link href="/admin/">관리자</Link>:!profile&&<Link href="/login/">로그인</Link>}
    </div>}</>
  );
}
