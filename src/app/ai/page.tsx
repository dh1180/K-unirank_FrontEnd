"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { GradeComparison } from "@/lib/types";

type Reply = {
  filters: { grade: number; year: number | null; major: string | null; region: string | null };
  admissions: GradeComparison;
  evidencePolicy: string;
};

export default function AiPage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<Reply | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setResult(null);
    setError("");
    try {
      const response = await fetch("/api/ai/questions", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(typeof payload?.detail === "string" ? payload.detail : "AI 조회에 실패했어.");
      }
      setResult(payload as Reply);
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "서버에 연결할 수 없어.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <section className="page-header">
        <h1>AI 입결 검색</h1>
        <p>질문을 자연어로 입력해 줘. AI는 검색 조건만 분석하고 실제 입결은 공식 데이터에서 찾아.</p>
      </section>
      <section className="panel">
        <form onSubmit={submit} className="ai-form">
          <label htmlFor="ai-question">입결 질문</label>
          <textarea id="ai-question" required minLength={8} maxLength={500}
                    value={question} onChange={e => setQuestion(e.target.value)}
                    placeholder="예: 내신 2.8인데 서울 컴퓨터공학과 학생부교과 2026학년도 결과 알려줘" />
          <button className="button primary" type="submit" disabled={pending || question.trim().length < 8}>
            {pending ? "검색 중..." : "입결 찾아보기"}
          </button>
        </form>
        {error && <p role="alert" className="notice">{error}</p>}
      </section>
      {result && (
        <section className="panel results">
          <h2>검색 결과</h2>
          <p>내신 {result.filters.grade}등급 · {result.admissions.selectedYear ?? "학년도 미확인"}학년도 ·
             검색 결과 {result.admissions.totalCount.toLocaleString("ko-KR")}건</p>
          {result.admissions.items.length ? (
            <ul className="item-list">
              {result.admissions.items.map(row => (
                <li className="list-item" key={row.resultId}>
                  <div>
                    <strong>{row.universityName} · {row.recruitmentUnitName}</strong>
                    <p className="muted">{row.selectionCategory} / {row.selectionName} · {row.sourceName}</p>
                    <p>{row.referenceBasis}: {row.referenceCut}등급</p>
                    <Link href={`/admissions/unit/${row.recruitmentUnitId}/`}>공개 입결 확인</Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p>공개된 입결이 없어. <Link href="/admissions/compare/">조건 검색</Link>을 이용해 줘.</p>}
          <p className="help">{result.evidencePolicy}</p>
          <p className="help">과거 컷은 합격 확률이나 지원 자격을 보장하지 않아.</p>
        </section>
      )}
    </>
  );
}
