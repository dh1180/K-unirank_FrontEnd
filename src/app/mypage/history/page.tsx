import Link from "next/link";
import {memberRead} from "@/lib/member-server";
import {Pagination} from "@/components/Pagination";
export const dynamic="force-dynamic";
export default async function History({searchParams}:{searchParams:Promise<{page?:string}>}){
 const raw=Number((await searchParams).page||0);const page=Number.isInteger(raw)&&raw>=0&&raw<=100000?raw:0;
 const response=await memberRead(`/api/v1/member/history?page=${page}`);
 if(!response?.ok)return <section className="panel"><h1>내 투표 기록</h1><p>{response?.status===401?"로그인 후 내 기록을 확인할 수 있습니다.":"기록을 불러오지 못했습니다."}</p><Link className="button primary" href="/login/">로그인</Link></section>;
 const data=await response.json() as {total:number;skipped:number;hasNext:boolean;items:{id:number;created:string;skipped:boolean;board:string;university_a:string;university_b:string;selected:string|null}[]};
 return <section className="panel" id="history-results"><p className="eyebrow">MY VOTES</p><h1>내 투표 기록</h1><p>전체 {data.total.toLocaleString()}회 · 선택 {(data.total-data.skipped).toLocaleString()}회 · 건너뛰기 {data.skipped.toLocaleString()}회</p>
 {!data.items.length?<p className="notice">아직 계정에 연결된 투표 기록이 없습니다. 로그인한 상태에서 투표하면 이곳에 표시됩니다.</p>:<ul className="ai-evidence">{data.items.map(v=><li key={v.id}><strong>{v.university_a} vs {v.university_b}</strong><p>{v.skipped?"둘 다 건너뜀":`${v.selected} 선택`} · {v.board}</p><small>{new Date(v.created).toLocaleString("ko-KR",{timeZone:"Asia/Seoul"})}</small></li>)}</ul>}
 <Pagination href="/mypage/history/" anchor="history-results" page={page} hasNext={data.hasNext} params={{}}/><Link className="button" href="/mypage/">마이페이지</Link><Link className="button primary" href="/vs/">대학 투표</Link></section>;
}
