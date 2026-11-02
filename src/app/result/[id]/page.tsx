import Link from "next/link";
import {notFound} from "next/navigation";
import {apiGet} from "@/lib/api";
import {UniversityLogo} from "@/components/UniversityLogo";
export const dynamic="force-dynamic";
export const metadata={title:"나의 대학 선호도 결과",robots:{index:false,follow:false}};
type Result={id:string;voteCount:number;created:string;payload:{board:{name:string};total_votes:number;top10:{rank:number;university_id:number;name:string;score:number;wins:number;losses:number}[]}};
export default async function ResultPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!/^[a-f0-9-]{36}$/i.test(id))notFound();
 const result=await apiGet<Result>(`/api/v1/results/${id}`,true);
 if(!result)return <section className="panel"><h1>개인 결과</h1><p>결과를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.</p></section>;
 return <section className="panel"><p className="eyebrow">MY PREFERENCE</p><h1>나의 대학 선호도 결과</h1><p>{result.payload.board.name} · {result.payload.total_votes}번의 선택으로 만든 개인 결과</p><p className="help">사용자 개인의 선택을 정리한 결과이며 공식 대학평가나 입결 순위가 아닙니다. 이 페이지 주소로 결과를 공유할 수 있습니다.</p>
 <ol className="ranking-list">{result.payload.top10.map(s=><li className="ranking-row" key={s.university_id}><span>{s.rank}</span><UniversityLogo id={s.university_id} name={s.name}/><Link href={`/universities/${s.university_id}/`}>{s.name}</Link><strong>{s.score.toFixed(1)}점</strong><small>선택 {s.wins} · 상대 선택 {s.losses}</small></li>)}</ol><Link className="button primary" href="/vs/">다시 투표하기</Link><Link className="button" href="/ranking/">전체 선호도 순위</Link></section>;
}
