import type { Metadata } from "next";
import Link from "next/link";
import AiAdmissionsClient from "@/components/AiAdmissionsClient";

export const metadata: Metadata = { title: "AI 입결 검색", robots: { index: false, follow: true } };

export default function AiPage() {
  if (process.env.AI_FRONTEND_ENABLED === "true") return <AiAdmissionsClient />;
  return <section className="page-header panel">
    <p className="eyebrow">AI ADMISSIONS</p>
    <h1>AI 입결 검색을 준비하고 있습니다</h1>
    <p>지금은 공개된 입결을 검색하거나 내 점수와 직접 비교할 수 있습니다.</p>
    <div className="actions">
      <Link className="button primary" href="/">입결 찾기</Link>
      <Link className="button" href="/admissions/compare/">내 점수로 학과 찾기</Link>
    </div>
  </section>;
}
