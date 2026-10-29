import type { Metadata, Viewport } from "next";
import Link from "next/link";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { SiteServices } from "@/components/SiteServices";
import {
  AD_CLIENT,
  SITE_ORIGIN,
  SOCIAL_IMAGE,
  pagePolicy,
} from "@/lib/site-policy.mjs";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "100 900",
  display: "swap",
});

export const dynamic = "force-dynamic";
export const viewport: Viewport = { themeColor: "#3157e5" };

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const path = requestHeaders.get("x-site-path") || "/";
  const policy = pagePolicy(
    requestHeaders.get("host"),
    path,
    requestHeaders.get("x-site-query") === "1",
    process.env.SITE_MODE,
  );
  return {
    metadataBase: new URL(SITE_ORIGIN),
    title: {
      default: "대학 입결 검색 · 입시결과 비교 | K-unirank",
      template: "%s | K-unirank",
    },
    description:
      "전국 대학과 학과별 입시결과를 검색하고 내 점수와 비교해 보세요.",
    alternates: { canonical: path },
    icons: {
      icon: "/brand/k-unirank.png",
      shortcut: "/brand/k-unirank.png",
      apple: "/brand/k-unirank.png",
    },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: "K-unirank",
      title: "대학 입결·순위·선호도 비교 | K-unirank",
      description:
        "대학·학과별 입결과 수시·정시 결과, 사용자 VS 기반 대학 선호도 랭킹을 비교해보세요.",
      url: policy.canonical,
      images: [{ url: SOCIAL_IMAGE, alt: "K-unirank" }],
    },
    twitter: {
      card: "summary",
      title: "대학 입결·순위·선호도 비교 | K-unirank",
      description:
        "대학·학과 입결과 대학 선호도 랭킹을 한곳에서 검색하고 비교해보세요.",
      images: [SOCIAL_IMAGE],
    },
    other: { "google-adsense-account": AD_CLIENT },
    robots: {
      index: policy.index,
      follow: policy.follow,
      ...(policy.index
        ? {
            "max-snippet": -1,
            "max-image-preview": "large" as const,
            "max-video-preview": -1,
          }
        : {}),
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const production = pagePolicy(
    requestHeaders.get("host"),
    "/",
    false,
    process.env.SITE_MODE,
  ).production;
  return (
    <html
      lang="ko"
      className={pretendard.variable}
      data-site-production={production ? "true" : "false"}
    >
      <body>
        <SiteServices />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": `${SITE_ORIGIN}/#organization`,
              name: "K-unirank",
              url: SITE_ORIGIN,
              logo: SOCIAL_IMAGE,
              description:
                "대학 입결과 학과별 입시결과, 사용자 VS 기반 대학 선호도 랭킹을 제공하는 대학 정보 서비스",
            }).replaceAll("<", "\\u003c"),
          }}
        />
        <header className="site-header">
          <div className="shell header-inner">
            <Link className="brand" href="/" aria-label="K-unirank 홈">
              <span className="brand-mark">K</span>K-unirank
            </Link>
            <Navigation
              ai={process.env.AI_FRONTEND_ENABLED === "true"}
              member={process.env.MEMBER_FRONTEND_ENABLED === "true"}
            />
          </div>
        </header>
        <main className="shell main-content">{children}</main>
        <footer className="footer">
          <div className="shell footer-inner">
            <div>
              <Link className="brand" href="/">
                <span className="brand-mark small">K</span>K-unirank
              </Link>
              <p>더 나은 대학 선택을 위한 데이터 가이드</p>
            </div>
            <div>
              <div className="footer-links">
                <Link href="/">입결 찾기</Link>
                <Link href="/universities/">대학 정보</Link>
                <Link href="/rankings/">대학 순위</Link>
                <Link href="/vs/">대학 투표</Link>
              </div>
              <p>
                입시 데이터는 원문 출처와 함께 제공합니다.
                <br />
                사용자 선호도 순위는 공식 대학평가가 아닙니다.
              </p>
            </div>
          </div>
          <div className="shell footer-bottom">
            <span>© K-unirank</span>
            <span className="preview-label">새로운 K-unirank 미리보기</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
