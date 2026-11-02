"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import type { GradeComparison } from "@/lib/types";

type Parsed = {
  grade: number;
  year: number | null;
  track: "student" | "holistic";
  special: "exclude" | "all";
  scope: "near" | "all";
  region: string | null;
  major: string | null;
};
type AiReply = {
  filters: Parsed;
  admissions: GradeComparison;
  evidencePolicy: string;
};

export default function AiAdmissionsPage() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<AiReply | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    setResponse(null);
    try {
      const result = await fetch("/api/ai/questions", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });
      const data: unknown = await result.json().catch(() => ({}));
      if (!result.ok) {
        const detail = data && typeof data === "object" && "detail" in data
          ? (data as { detail?: unknown }).detail : undefined;
        throw new Error(typeof detail === "string" ? detail : "입결을 검색하지 못했습니다.");
      }
      setResponse(data as AiReply);
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "질문을 처리하지 못했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <section className="page-header">
        <h1>AI 입결 검색</h1>
        <p>내신 등급과 관심 학과를 알려주세요. 공개된 입시결과를 바탕으로 가까운 학과를 찾아드립니다.</p>
      </section>
      <section className="panel">
        <form className="ai-form" onSubmit={submit}>
          <label htmlFor="ai-question">입결 질문</label>
          <textarea id="ai-question" required minLength={8} maxLength={500}
            value={question} onChange={event => setQuestion(event.target.value)}
            placeholder="예: 내신 2.8인데 2026학년도 서울 컴퓨터공학과 학생부교과 전형 알려줘" />
          <button type="submit" className="button primary"
            disabled={pending || question.trim().length < 8}>
            {pending ? "검색 중..." : "입결 찾아보기"}
          </button>
        </form>
        <p className="help">질문은 OpenRouter의 무료 AI 모델로 전달됩니다. 이름·연락처 등 개인정보는 입력하지 마세요. 무료 서비스 상황에 따라 응답이 지연될 수 있습니다.</p>
        {error && <p role="alert" className="notice">{error} <Link href="/admissions/compare/">내 점수로 직접 찾기 →</Link></p>}
      </section>
      {response && (
        <section className="panel results">
          <h2>입결 검색 결과</h2>
          <p>내신 {response.filters.grade}등급 · {response.admissions.selectedYear ?? "학년도 미확인"}학년도 ·
            검색 결과 {response.admissions.totalCount.toLocaleString("ko-KR")}건</p>
          <p className="help">{response.filters.track === "holistic" ? "학생부종합" : "학생부교과"}
            {response.filters.region ? ` · ${response.filters.region}` : " · 전체 지역"}
            {response.filters.major ? ` · ${response.filters.major}` : " · 전체 학과"}</p>
          {!response.admissions.items.length ? (
            <p>조건에 맞는 공개 입결이 없습니다. <Link href="/admissions/compare/">검색 조건을 조정해 보세요.</Link></p>
          ) : (
            <ul className="ai-evidence">
              {response.admissions.items.map(row => (
                <li key={row.resultId}>
                  <strong>{row.universityName} · {row.recruitmentUnitName}</strong>
                  <p className="muted">{row.selectionCategory} · {row.selectionName} · {row.sourceName}</p>
                  <div className="ai-cuts">
                    {row.cut50 != null && <p><span>50% 컷</span><b>{Number(row.cut50).toFixed(2)}<small>등급</small></b></p>}
                    {row.cut70 != null && <p><span>70% 컷</span><b>{Number(row.cut70).toFixed(2)}<small>등급</small></b></p>}
                    {row.cut50 == null && row.cut70 == null && <p><span>{row.referenceBasis}</span><b>{row.referenceCut}<small>등급</small></b></p>}
                  </div>
                  <Link href={`/admissions/unit/${row.recruitmentUnitId}/`}>입결 근거 확인</Link>
                </li>
              ))}
            </ul>
          )}
          <Link className="button" href={`/admissions/compare/?${new URLSearchParams({grade:String(response.filters.grade),track:response.filters.track,special:response.filters.special,scope:response.filters.scope,...(response.filters.region ? {region:response.filters.region} : {}),...(response.filters.major ? {q:response.filters.major} : {})}).toString()}`}>같은 조건으로 전체 결과 보기 →</Link>
          <p className="help">공개 입결 원문 출처를 각 결과에서 확인할 수 있습니다.</p>
          <p className="help">과거 입결과 내 등급을 비교한 참고 자료이며, 합격이나 지원 자격을 보장하지 않습니다.</p>
        </section>
      )}
    </>
  );
}
