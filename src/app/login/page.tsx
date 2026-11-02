"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/member/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data: unknown = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail = data && typeof data === "object" && "detail" in data
          ? (data as { detail?: unknown }).detail : undefined;
        throw new Error(typeof detail === "string" ? detail : "로그인하지 못했습니다.");
      }
      setPassword("");
      window.dispatchEvent(new Event("member-change"));
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next === "/admin/" ? "/admin/" : "/mypage/");
      router.refresh();
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "로그인하지 못했습니다.");
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="login-layout">
      <section className="login-intro">
        <p className="eyebrow">YOUR NEXT CAMPUS</p><h1>나의 대학 탐색,<br/>이어서 시작하세요.</h1>
        <p>관심 대학과 학과를 저장하고<br/>공개 입결을 한곳에서 확인하세요.</p>
        <div className="login-features"><span>관심 대학 모아보기</span><span>학과별 입결 바로가기</span><span>기존 계정 그대로</span></div>
      </section>
      <section className="panel login-card">
        <p className="eyebrow">WELCOME BACK</p><h2>로그인</h2><p>기존 K-unirank 아이디로 로그인하세요.</p>
        <form className="member-form" onSubmit={submit}>
          <label htmlFor="account-id">아이디</label>
          <input id="account-id" type="text" autoComplete="username" maxLength={150}
                 required value={username} onChange={e => setUsername(e.target.value)} />
          <label htmlFor="account-password">비밀번호</label>
          <input id="account-password" type="password" autoComplete="current-password"
                 required maxLength={256} value={password} onChange={e => setPassword(e.target.value)} />
          <button className="button primary" disabled={pending} type="submit">
            {pending ? "인증 중..." : "로그인"}
          </button>
        </form>
        {error && <p role="alert" className="notice">{error}</p>}
        <p className="help">공용 컴퓨터에서는 이용 후 로그아웃해 주세요.</p>
        <p><Link className="button" href="/register/">새 계정 만들기 →</Link></p>
        <p><Link href="/universities/">로그인 없이 대학 둘러보기 →</Link></p>
      </section>
    </div>
  );
}
