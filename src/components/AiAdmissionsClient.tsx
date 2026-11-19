"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import type { GradeComparison, UniversityOverview } from "@/lib/types";

type Conditions = {
  grade: number | null; year: number | null; track: "student" | "holistic";
  special: "exclude" | "all"; scope: "near" | "all"; region: string | null;
  major: string | null; university?: string | null;
};
type Evidence = {resultId:number;sourceUrl:string|null;recruitmentCount:number|null;competitionRate:number|null;explanation:string};
type AiReply = {
  filters: Conditions & {notes?:string[]}; context: Conditions;
  admissions: GradeComparison | null; evidencePolicy: string;
  mode: "comparison" | "lookup" | "schools" | "documents"; summary: string;
  evidence: Evidence[];
  schools: Array<{name:string;admissions:GradeComparison;overview:UniversityOverview|null}>;
  passages: Array<{university:string;year:number;title:string;page:number;text:string;sourceUrl:string}>;
};
function safeSource(url:string|null|undefined) {
  try { const parsed=new URL(url??""); return ["https:","http:"].includes(parsed.protocol)?parsed.href:null; }
  catch {return null;}
}
export function AdmissionEvidenceResults({data,reply}:{data:GradeComparison;reply:AiReply}) {
  const grade=reply.filters.grade;
  return <>
    <p>{data.selectedYear ?? "미확인"}학년도 · 공개 입결 {data.totalCount.toLocaleString("ko-KR")}건</p>
    {!data.items.length ? <p className="notice">현재 조건의 공개 자료가 없습니다. 다른 대학·학년도나 전형으로 자동 대체하지 않았습니다.</p> :
    <ul className="ai-evidence">{data.items.map(row=>{
      const evidence=reply.evidence.find(e=>e.resultId===row.resultId);
      const source=safeSource(evidence?.sourceUrl);
      return <li key={row.resultId}>
        <strong>{row.universityName} · {row.recruitmentUnitName}</strong>
        <p className="muted">{row.selectionCategory} · {row.selectionName} · {row.sourceName}</p>
        <div className="ai-cuts">
          {row.cut50!=null && <p><span>50% 컷</span><b>{Number(row.cut50).toFixed(2)}<small>등급</small></b></p>}
          {row.cut70!=null && <p><span>70% 컷</span><b>{Number(row.cut70).toFixed(2)}<small>등급</small></b></p>}
        </div>
        {grade!=null && <p className="ai-gap">내 등급 {Number(grade).toFixed(2)} · {row.referenceBasis}과 {Math.abs(grade-Number(row.referenceCut)).toFixed(2)}등급 차이</p>}
        {evidence && <>
          <p className="help">모집인원 {evidence.recruitmentCount!=null && evidence.recruitmentCount>0?`${evidence.recruitmentCount}명`:"미공개"} · 경쟁률 {evidence.competitionRate!=null && evidence.competitionRate>0?`${Number(evidence.competitionRate).toFixed(2)} : 1`:"미공개"}</p>
          <details className="ai-explanation"><summary>이 결과를 보여준 이유</summary><p>{evidence.explanation}</p></details>
        </>}
        <div className="ai-result-links"><Link href={`/admissions/unit/${row.recruitmentUnitId}/`}>입결 근거 확인 →</Link>{source && <a href={source} target="_blank" rel="noopener noreferrer">공식 원문 ↗</a>}</div>
      </li>;
    })}</ul>}
  </>;
}
export default function AiAdmissionsPage() {
  const [question,setQuestion]=useState("");
  const [response,setResponse]=useState<AiReply|null>(null);
  const [pending,setPending]=useState(false);
  const [error,setError]=useState("");
  const [needsLogin,setNeedsLogin]=useState(false);
  const [history,setHistory]=useState<string[]>([]);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); if(pending) return;
    setPending(true);setError("");setNeedsLogin(false);
    const text=question.trim();
    try {
      const result=await fetch("/api/ai/questions",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({question:text,context:response?.context})});
      const data=await result.json().catch(()=>({}));
      if(!result.ok) {
        if(result.status===401)setNeedsLogin(true);
        throw new Error(typeof data.detail==="string"?data.detail:"질문을 처리하지 못했습니다.");
      }
      setResponse(data as AiReply);setHistory(old=>[...old,text].slice(-6));setQuestion("");
    } catch(ex) {setError(ex instanceof Error?ex.message:"질문을 처리하지 못했습니다.");}
    finally {setPending(false);}
  }
  function reset() {setResponse(null);setHistory([]);setQuestion("");setError("");setNeedsLogin(false);}
  const f=response?.filters;
  return <>
    <section className="page-header"><h1>AI 입결 검색</h1><p>대학·학과의 공개 입결을 찾고, 내신과 비교하거나 공식 모집요강을 확인해 보세요.</p></section>
    <section className="panel">
      <div className="ai-examples" aria-label="질문 예시">{[
        "항공대 컴공 교과 입결 알려줘","건동홍 2.3등급으로 갈만한 학과 찾아줘","항공대 가천대 컴공 교과 비교해줘","항공대 2027 수능최저 알려줘"
      ].map(example=><button type="button" key={example} disabled={pending} onClick={()=>{reset();setQuestion(example);}}>{example}</button>)}</div>
      {response && <div className="ai-conversation-context"><p>이전 조건을 이어서 검색합니다. 대학·학과·학년도 등을 바꾸거나 새 질문을 시작할 수 있어요.</p><button type="button" className="button" disabled={pending} onClick={reset}>새 질문</button></div>}
      {history.length>0 && <ol className="ai-question-history" aria-label="이번 대화의 질문">{history.map((text,i)=><li key={i}>{text}</li>)}</ol>}
      {f && <p className="ai-filter-summary">{f.university??"전체 대학"} · {f.major??"전체 학과"} · {f.track==="holistic"?"학생부종합":"학생부교과"}{f.region?` · ${f.region}`:""}{f.grade!=null?` · 내신 ${f.grade}등급`:" · 등급 없이 조회"}{response.context?.year?` · ${response.context.year}학년도`:""}</p>}
      <form className="ai-form" onSubmit={submit}>
        <label htmlFor="ai-question">{response?"이어서 질문하기":"입결 질문"}</label>
        <textarea id="ai-question" required minLength={2} maxLength={500} value={question} onChange={event=>setQuestion(event.target.value)}
          placeholder={response?"예: 학종으로 바꿔줘 / 서울만 보여줘 / 2027 수능최저는?":"예: 항공대 컴공 입결 알려줘 / 내신 3.2 수도권 컴공 교과 찾아줘"}/>
        <button type="submit" className="button primary" disabled={pending||question.trim().length<2}>{pending?"근거를 확인하는 중…":"입결 찾아보기"}</button>
      </form>
      <p role="status" className="help">{pending?"검색 중입니다. 잠시 기다려 주세요.":""}</p>
      {error && <p role="alert" className="notice">{error} <Link href={needsLogin?"/login/?next=%2Fai%2F":"/admissions/compare/"}>{needsLogin?"다시 로그인 →":"내 점수로 직접 찾기 →"}</Link></p>}
    </section>
    {response && <section className="panel results" aria-label="검색 결과">
      <h2>{response.mode==="documents"?"공식 모집요강 근거":response.mode==="schools"?"대학별 비교":"입결 검색 결과"}</h2>
      <p>{response.summary}</p>
      {response.filters.notes?.map(note=><p className="help" key={note}>{note}</p>)}
      {response.mode==="schools" ? <div className="ai-school-grid">{response.schools.map(school=><section className="ai-school" key={school.name}>
        <h3>{school.name}</h3><AdmissionEvidenceResults data={school.admissions} reply={response}/>
        <h4>대학 공식 공시 지표</h4>
        {!school.overview?.indicators.length?<p className="help">공개된 공시 지표가 없습니다.</p>:<ul className="ai-indicators">{school.overview.indicators.map(indicator=>{
          const source=safeSource(indicator.sourceUrl);
          return <li key={indicator.slug}><span>{indicator.label}</span><strong>{(indicator.kind==="money"?indicator.value/10000:indicator.value).toLocaleString("ko-KR",{maximumFractionDigits:2})}{indicator.kind==="percent"?"%":indicator.kind==="money"?"만원":"명"}</strong><small>{indicator.year}년 {source&&<a href={source} target="_blank" rel="noopener noreferrer">공시 원문 ↗</a>}</small></li>;
        })}</ul>}
      </section>)}</div>:response.admissions && <AdmissionEvidenceResults data={response.admissions} reply={response}/>}
      {response.mode==="documents" && <>
        <ul className="ai-evidence">{response.passages.map(passage=><li key={`${passage.university}-${passage.year}-${passage.page}`}>
          <strong>{passage.university} · {passage.year}학년도 · PDF {passage.page}페이지</strong><p className="help">{passage.title}</p>
          <blockquote className="ai-document-excerpt">{passage.text}</blockquote>
          {safeSource(passage.sourceUrl)&&<a href={safeSource(passage.sourceUrl)!} target="_blank" rel="noopener noreferrer">이 페이지를 공식 PDF에서 보기 ↗</a>}
        </li>)}</ul>
        <p className="help">현재 모집요강 검색: 항공대 2027 수시, 가천대 2026·2027 수시. 문서가 없는 대학·학년도는 임의로 대체하지 않습니다.</p>
      </>}
      {response.admissions && <Link className="button" href={response.filters.grade!=null?`/admissions/compare/?${new URLSearchParams({grade:String(response.filters.grade),track:response.filters.track,special:response.filters.special,scope:response.filters.scope,...(response.context.year?{year:String(response.context.year)}:{}),...(response.filters.region?{region:response.filters.region}:{}),...(response.filters.major?{q:response.filters.major}:{}),...(response.filters.university?{university:response.filters.university}:{})})}`:`/?${new URLSearchParams({q:response.filters.university?.split(",")[0]??response.filters.major?.split(",")[0]??"",phase:"SUSI",track:response.filters.track})}#explore`}>{response.filters.grade!=null?"같은 조건으로 전체 결과 보기 →":"입결 찾기에서 검색 →"}</Link>}
      <p className="help">{response.evidencePolicy}</p>
      <p className="help">70% 컷을 우선 비교하고, 없으면 50% 컷을 사용합니다. 수시 9등급제 내신 기준의 참고 자료이며, 합격·지원 자격을 보장하지 않습니다.</p>
    </section>}
  </>;
}
