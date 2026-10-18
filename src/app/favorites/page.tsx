"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Member = { id: number; username: string };
type Favorite = { id: number; name: string; region: string | null };

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: "same-origin", cache: "no-store" });
  if (!response.ok) throw new Error(response.status === 401
    ? "로그인 후 관심 대학을 확인할 수 있어." : "회원 서버에 연결할 수 없어.");
  return response.json() as Promise<T>;
}

export default function FavoritesPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Member | null>(null);
  const [items, setItems] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [member, favorites] = await Promise.all([
        fetchJson<Member>("/api/member/me"),
        fetchJson<Favorite[]>("/api/member/favorites/universities"),
      ]);
      setProfile(member);
      setItems(favorites);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "회원 정보를 불러오지 못했어.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  async function remove(id: number) {
    try {
      const response = await fetch(`/api/member/favorites/universities/${id}`, {
        method: "DELETE", credentials: "same-origin",
      });
      if (!response.ok) throw new Error("관심 대학 삭제에 실패했어.");
      setItems(previous => previous.filter(item => item.id !== id));
    } catch (e) { setError(e instanceof Error ? e.message : "삭제에 실패했어."); }
  }

  async function logout() {
    const response = await fetch("/api/member/logout", { method: "POST", credentials: "same-origin" });
    if (response.ok) { router.push("/login/"); router.refresh(); }
    else setError("로그아웃 요청에 실패했어.");
  }

  return (
    <>
      <section className="page-header">
        <h1>내 관심 대학</h1>
        <p>기존 Django에 저장된 관심 대학을 새로운 React 화면에서 확인할 수 있어.</p>
      </section>
      <section className="panel">
        {loading && <p>불러오는 중...</p>}
        {error && <p role="alert" className="notice">{error} <Link href="/login/">로그인</Link></p>}
        {profile && (
          <>
            <div className="actions"><p><b>{profile.username}</b>님의 관심 대학</p>
              <button className="button" type="button" onClick={() => void logout()}>로그아웃</button>
            </div>
            {items.length === 0 ? <p>관심 대학이 없어. <Link href="/universities/">대학 찾기</Link></p>
              : <ul className="item-list">
                {items.map(item => (
                  <li className="list-item" key={item.id}>
                    <div><strong><Link href={`/universities/${item.id}/`}>{item.name}</Link></strong>
                      <p>{item.region ?? "지역 미등록"}</p></div>
                    <button type="button" className="button" onClick={() => void remove(item.id)}>해제</button>
                  </li>
                ))}
              </ul>}
          </>
        )}
      </section>
    </>
  );
}
