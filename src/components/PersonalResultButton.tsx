"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
export function PersonalResultButton(){const router=useRouter();const[busy,setBusy]=useState(false);const[error,setError]=useState("");
 async function create(){if(busy)return;setBusy(true);setError("");try{const r=await fetch("/api/vs/result/",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:"{}"});const data=await r.json();if(!r.ok)throw new Error(data.detail||"5번 이상 선택한 후 다시 시도해 주세요.");router.push(`/result/${data.id}/`);}catch(e){setError(e instanceof Error?e.message:"결과를 만들지 못했습니다.");}finally{setBusy(false);}}
 return <><button type="button" className="button" disabled={busy} onClick={()=>void create()}>{busy?"결과 만드는 중...":"나의 선호도 결과 만들기"}</button>{error&&<p className="notice" role="alert">{error}</p>}</>;
}
