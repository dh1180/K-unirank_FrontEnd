"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import type { GradeComparison } from "@/lib/types";

type Parsed = {
  grade: number;
  year: number | null;
  track: "student" | "holistic";
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
        throw new Error(typeof detail === "string" ? detail : "입결 검색이 실패했어.");
      }
      setResponse(data as AiReply);
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "질문을 처리하지 못했어.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <section className="page-header">
        <h1>AI 입결 검색</h1>
        <p>자연어로 질문해 줘. AI는 조건만 해석하고 실제 입결 수치는 Spring Boot에서 조회해.</p>
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
        {error && <p role="alert" className="notice">{error}</p>}
      </section>
      {response && (
        <section className="panel results">
          <h2>입결 검색 결과</h2>
          <p>내신 {response.filters.grade}등급 · {response.admissions.selectedYear ?? "학년도 미확인"}학년도 ·
            검색 결과 {response.admissions.totalCount.toLocaleString("ko-KR")}건</p>
          {!response.admissions.items.length ? (
            <p>해당 조건의 공개 입결이 없어. <Link href="/admissions/compare/">일반 검색</Link>을 이용해 줘.</p>
          ) : (
            <ul className="ai-evidence">
              {response.admissions.items.map(row => (
                <li key={row.resultId}>
                  <strong>{row.universityName} · {row.recruitmentUnitName}</strong>
                  <p className="muted">{row.selectionCategory} · {row.selectionName} · {row.sourceName}</p>
                  <p>{row.referenceBasis} <b>{row.referenceCut}등급</b></p>
                  <Link href={`/admissions/unit/${row.recruitmentUnitId}/`}>입결 근거 확인</Link>
                </li>
              ))}
            </ul>
          )}
          <p className="help">{response.evidencePolicy}</p>
          <p className="help">과거 컷과 내 등급만으로 합격이나 지원 자격을 확정할 수 없어.</p>
        </section>
      )}
    </>
  );
}
