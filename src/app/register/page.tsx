"use client";
import Link from "next/link";
import {useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
export default function Register(){
 const router=useRouter();const [error,setError]=useState("");const [busy,setBusy]=useState(false);
 async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();if(busy)return;setBusy(true);setError("");
  const form=new FormData(event.currentTarget);const values=Object.fromEntries(form);
  try{const response=await fetch("/api/member/register/",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify(values)});
   const data=await response.json();if(!response.ok)throw new Error(data.detail||"회원가입 입력을 확인해 주세요.");
   window.dispatchEvent(new Event("member-change"));router.replace("/mypage/");router.refresh();
  }catch(e){setError(e instanceof Error?e.message:"회원가입하지 못했습니다.");}finally{setBusy(false);}
 }
 return <section className="panel login-card" style={{maxWidth:560,margin:"32px auto"}}><p className="eyebrow">JOIN K-UNIRANK</p><h1>회원가입</h1><p>관심 대학을 저장하고 나의 탐색 기록을 이어가세요.</p>
 <form className="member-form" onSubmit={submit}>
 <label htmlFor="register-name">아이디</label><input id="register-name" name="username" autoComplete="username" maxLength={150} required/>
 <label htmlFor="register-email">이메일 (선택)</label><input id="register-email" name="email" type="email" autoComplete="email" maxLength={254}/>
 <label htmlFor="register-password">비밀번호</label><input id="register-password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={256} required/>
 <p className="help">8자 이상으로 입력하세요. 아이디와 비슷하거나 흔한 비밀번호, 숫자로만 된 비밀번호는 사용할 수 없습니다.</p>
 <label htmlFor="register-confirm">비밀번호 확인</label><input id="register-confirm" name="passwordConfirm" type="password" autoComplete="new-password" minLength={8} maxLength={256} required/>
 <button className="button primary" disabled={busy}>{busy?"가입 중...":"가입하고 시작하기"}</button></form>
 {error&&<p className="notice" role="alert">{error}</p>}<p><Link href="/login/">이미 계정이 있다면 로그인 →</Link></p></section>;
}
