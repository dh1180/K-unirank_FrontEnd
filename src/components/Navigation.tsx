"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation({
  vs,
  ai,
  member,
}: {
  vs: boolean;
  ai: boolean;
  member: boolean;
}) {
  const pathname = usePathname();
  const links = [
    { href: "/", label: "입결 찾기" },
    { href: "/admissions/compare/", label: "내 점수" },
    { href: "/universities/", label: "대학" },
    { href: "/ranking/", label: "선호도 순위" },
    ...(vs ? [{ href: "/vs/", label: "VS" }] : []),
    ...(ai ? [{ href: "/ai/", label: "AI 입결" }] : []),
  ];
  return (
    <nav aria-label="주요 메뉴">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={
            (
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href)
            )
              ? "active"
              : ""
          }
          aria-current={
            (
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href)
            )
              ? "page"
              : undefined
          }
        >
          {link.label}
        </Link>
      ))}
      {member && <Link href="/login/">로그인</Link>}
    </nav>
  );
}
