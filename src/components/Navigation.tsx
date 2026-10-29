"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function Navigation({ ai, member }: { ai: boolean; member: boolean }) {
  const pathname = usePathname();
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
    { href: "/vs/", label: "대학 투표" },
    ...(ai ? [{ href: "/ai/", label: "AI 입결" }] : []),
  ];
  return (
    <nav aria-label="주요 메뉴">
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
      {member && <Link href="/login/">로그인</Link>}
    </nav>
  );
}
