"use client";

import Link from "next/link";
import {PersonalResultButton} from "@/components/PersonalResultButton";
import { UniversityLogo } from "@/components/UniversityLogo";
import { regionLabel } from "@/lib/regions.mjs";
import { publicMetricValid } from "@/lib/admission-metrics.mjs";
import { useCallback, useEffect, useState } from "react";
import { vsVoteRequest, type VsMatch, type AdmissionReference } from "@/lib/vs.mjs";

function AdmissionPreview({ info }: { info: AdmissionReference | null | undefined }) {
  const cuts=(info?.cuts ?? []).map(cut => {
    const clean=(value:number|null) => value!==null && publicMetricValid({code:cut.label==="수능 평백"?"CSAT_PERCENTILE_MEAN":"",unit:cut.unit,value}) ? value : null;
    return {...cut,value50:clean(cut.value50),value70:clean(cut.value70)};
  }).filter(cut=>cut.value50!==null || cut.value70!==null);
  return <div className="vote-reference">
    <div className="vote-reference-head"><strong>입시 참고</strong>{info?.year && <span>{info.year}학년도</span>}</div>
    {cuts.length ? cuts.map(cut => <div className="vote-reference-cut" key={cut.label}>
      <h3>{cut.label}</h3>
      <dl>{([50,70] as const).map(percent => <div key={percent}><dt>{percent}%</dt><dd><strong>{(percent===50 ? cut.value50 : cut.value70)?.toFixed(2) ?? "—"}</strong><span>{cut.unit}</span></dd></div>)}</dl>
    </div>) : <p className="muted">{info ? "공개된 입결 집계 자료가 없습니다." : "입결 참고 정보를 불러오지 못했습니다."}</p>}
    <p className="vote-reference-note">대학 단위 집계 · 전형·학과별 결과는 다를 수 있습니다.</p>
  </div>;
}

type VoteReceipt = { vote_id: number; vote_count: number };
type ErrorShape = { detail?: string };

async function readJson<T>(response: Response): Promise<T> {
  const body: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = (body as ErrorShape)?.detail;
    throw new Error(
      typeof msg === "string" ? msg : "VS 서버 요청이 실패했습니다.",
    );
  }
  return body as T;
}

export default function VsPage() {
  const [match, setMatch] = useState<VsMatch | null>(null);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState("");
  const [voteCount, setVoteCount] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const nextPair = useCallback(async () => {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/vs/next", {
        credentials: "same-origin",
        cache: "no-store",
      });
      const body = await readJson<VsMatch>(response);
      if (body.pair?.length !== 2 || !body.challenge)
        throw new Error("대진 응답이 잘못되었습니다.");
      setMatch(body);
      setExpanded(null);
      setVoteCount(body.voteCount);
    } catch (ex) {
      setMatch(null);
      setError(ex instanceof Error ? ex.message : "대진을 불러올 수 없습니다.");
    } finally {
      setPending(false);
    }
  }, []);

  useEffect(() => {
    void nextPair();
  }, [nextPair]);

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
      <section className="page-header vote-header">
        <span className="eyebrow">YOUR CHOICE</span>
        <h1>당신의 선택, 대학 투표</h1>
        <p>
          두 대학 중 더 선호하는 대학을 골라주세요. 선택이 모여 대학 선호도 순위를 만듭니다.
        </p>
        <p className="muted">
          잘 모르는 대학이라면 건너뛰고 다음 대진에 참여할 수 있어요.
        </p>
      </section>
      <section className="panel vote-panel" aria-busy={pending}>
        {voteCount !== null && (
          <p className="muted">
            이 세션의 투표 참여 {voteCount.toLocaleString("ko-KR")}회
          </p>
        )}
        {error && (
          <p role="alert" className="notice">
            {error}
          </p>
        )}
        {match && (
          <div className="vs-grid">
            {match.pair.map((school) => (
              <article className={`vote-card ${expanded === school.id ? "reference-open" : ""}`} key={school.id}>
              <button
                type="button"
                className="vs-choice"
                aria-label={`${school.name}에 투표`}
                disabled={pending}
                onClick={() => void vote(school.id)}
              >
                <UniversityLogo id={school.id} name={school.name} logoPath={school.logo_path} size="large" />
                <strong>{school.name}</strong>
                <span className="muted">{school.region ? regionLabel(school.region) : "지역 미등록"}</span>
                <span className="vs-select">선택하기</span>
              </button>
              <div id={`vote-reference-${school.id}`} className="vote-reference-overlay"><AdmissionPreview info={school.admissionReference} /></div>
              <button className="vote-reference-toggle" type="button" aria-expanded={expanded === school.id} aria-controls={`vote-reference-${school.id}`} onClick={() => setExpanded(expanded === school.id ? null : school.id)}>입결 정보 {expanded === school.id ? "접기" : "보기"}</button>
              </article>
            ))}
          </div>
        )}
        <div className="actions">
          {match && (
            <button
              className="button"
              type="button"
              disabled={pending}
              onClick={() => void vote(null)}
            >
              건너뛰고 다음 대진
            </button>
          )}
          {!match && <button
            className="button"
            type="button"
            disabled={pending}
            onClick={() => void nextPair()}
          >
            {pending ? "불러오는 중..." : "다시 시도"}
          </button>}
          <PersonalResultButton/>
          <Link className="button" href="/ranking/">
            현재 순위 보기
          </Link>
        </div>
      </section>
      <p className="help">
        사용자 선호도를 비교하는 투표입니다. 공식 대학 평가나 합격 가능성을 의미하지 않습니다.
      </p>
    </>
  );
}
