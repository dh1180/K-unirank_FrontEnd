"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { vsVoteRequest, type VsMatch } from "@/lib/vs.mjs";

type VoteReceipt = { vote_id: number; vote_count: number };
type ErrorShape = { detail?: string };

async function readJson<T>(response: Response): Promise<T> {
  const body: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = (body as ErrorShape)?.detail;
    throw new Error(typeof msg === "string" ? msg : "VS 서버 요청이 실패했습니다.");
  }
  return body as T;
}

export default function VsPage() {
  const [match, setMatch] = useState<VsMatch | null>(null);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState("");
  const [voteCount, setVoteCount] = useState<number | null>(null);

  const nextPair = useCallback(async () => {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/vs/next", { credentials: "same-origin", cache: "no-store" });
      const body = await readJson<VsMatch>(response);
      if (body.pair?.length !== 2 || !body.challenge) throw new Error("대진 응답이 잘못되었습니다.");
      setMatch(body);
      setVoteCount(body.voteCount);
    } catch (ex) {
      setMatch(null);
      setError(ex instanceof Error ? ex.message : "대진을 불러올 수 없습니다.");
    } finally {
      setPending(false);
    }
  }, []);

  useEffect(() => { void nextPair(); }, [nextPair]);

  async function vote(selected: number | null) {
    if (!match || pending) return;
    setPending(true);
    setError("");
    try {
      const payload = vsVoteRequest(match, selected);
      const response = await fetch("/api/vs/vote", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const receipt = await readJson<VoteReceipt>(response);
      setVoteCount(receipt.vote_count);
      await nextPair();
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "투표가 실패했습니다.");
      setPending(false);
    }
  }

  return (
    <>
      <section className="page-header">
        <h1>대학 VS</h1>
        <p>더 선호하는 대학을 선택해 줘. 투표는 종합 대학 선호도 순위에 반영돼.</p>
        <p className="muted">한 세션에서 같은 대진이 반복되면 점수 영향도는 줄어들어.</p>
      </section>
      <section className="panel">
        {voteCount !== null && <p className="muted">이 세션의 투표 참여 {voteCount.toLocaleString("ko-KR")}회</p>}
        {error && <p role="alert" className="notice">{error}</p>}
        {match && (
          <div className="vs-grid">
            {match.pair.map((school) => (
              <button type="button" className="vs-choice" key={school.id}
                      disabled={pending} onClick={() => void vote(school.id)}>
                <strong>{school.name}</strong>
                <span className="muted">{school.region ?? "지역 미등록"}</span>
                <span className="vs-select">선택하기</span>
              </button>
            ))}
          </div>
        )}
        <div className="actions">
          {match && <button className="button" type="button" disabled={pending}
                            onClick={() => void vote(null)}>둘 다 건너뛰기</button>}
          <button className="button" type="button" disabled={pending} onClick={() => void nextPair()}>
            {pending ? "불러오는 중..." : match ? "다른 대진 보기" : "다시 시도"}
          </button>
          <Link className="button" href="/ranking/">현재 순위 보기</Link>
        </div>
      </section>
      <p className="help">실제 대학 선호도를 비교하는 투표야. 공식 대학 평가나 합격 가능성을 의미하지 않아.</p>
    </>
  );
}
