import type { Metadata } from "next";
import Link from "next/link";
import localFont from "next/font/local";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "100 900",
  display: "swap",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "대학 입결 검색 · 입시결과 비교 | K-unirank",
    template: "%s | K-unirank",
  },
  description:
    "전국 대학과 학과별 입시결과를 검색하고 내 점수와 비교해 보세요.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>
        <header className="site-header">
          <div className="shell header-inner">
            <Link className="brand" href="/" aria-label="K-unirank 홈">
              <span className="brand-mark">K</span>K-unirank
            </Link>
            <Navigation
              vs={process.env.VS_FRONTEND_ENABLED === "true"}
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
