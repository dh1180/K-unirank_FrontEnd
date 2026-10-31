import Link from "next/link";
export function ExploreTabs({active}:{active:"admissions"|"compare"|"rankings"}) {
  const items=[{key:"admissions",href:"/",label:"입결 찾기"},{key:"compare",href:"/admissions/compare/",label:"내 점수 학과 찾기"},{key:"rankings",href:"/rankings/",label:"대학 순위"}];
  return <nav className="section-tabs" aria-label="입결 탐색 메뉴">{items.map(item=><Link key={item.key} href={item.href} className={active===item.key?"active":""} aria-current={active===item.key?"page":undefined}>{item.label}</Link>)}</nav>;
}
