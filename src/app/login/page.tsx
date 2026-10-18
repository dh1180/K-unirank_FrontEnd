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
        throw new Error(typeof detail === "string" ? detail : "로그인이 실패했어.");
      }
      setPassword("");
      router.push("/favorites/");
      router.refresh();
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "로그인이 실패했어.");
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <section className="page-header">
        <h1>기존 K-unirank 계정 로그인</h1>
        <p>기존 Django의 회원 데이터를 유지하면서 Spring Boot로 이전 중인 개발 화면이야.</p>
      </section>
      <section className="panel">
        <form className="member-form" onSubmit={submit}>
          <label htmlFor="account-id">아이디</label>
          <input id="account-id" type="text" autoComplete="username" maxLength={150}
                 required value={username} onChange={e => setUsername(e.target.value)} />
          <label htmlFor="account-password">비밀번호</label>
          <input id="account-password" type="password" autoComplete="current-password"
                 required value={password} onChange={e => setPassword(e.target.value)} />
          <button className="button primary" disabled={pending} type="submit">
            {pending ? "인증 중..." : "로그인"}
          </button>
        </form>
        {error && <p role="alert" className="notice">{error}</p>}
        <p className="help">실제 계정 로그인은 개발용 DB·세션 보안 검증 전까지 비활성화되어 있어.</p>
        <p><Link href="/universities/">대학 목록으로 돌아가기</Link></p>
      </section>
    </>
  );
}
