"use client";

import Link from "next/link";
import { useState } from "react";

export function FavoriteButton({ universityId }: { universityId: number }) {
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  async function add() {
    if (saving) return;
    setSaving(true);
    setStatus("");
    try {
      const response = await fetch(`/api/member/favorites/universities/${universityId}`, {
        method: "PUT", credentials: "same-origin",
      });
      if (response.status === 401) {
        setStatus("로그인 후 관심 대학에 등록할 수 있어.");
      } else if (response.status === 503) {
        setStatus("관심 대학 기능은 아직 이전 중이야.");
      } else if (!response.ok) {
        setStatus("관심 대학 등록에 실패했어.");
      } else {
        setStatus("관심 대학에 등록했어.");
      }
    } catch {
      setStatus("회원 서버에 연결하지 못했어.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="favorite-actions">
      <button type="button" className="button" disabled={saving} onClick={() => void add()}>
        {saving ? "등록 중..." : "관심 대학 등록"}
      </button>
      {status && <small role="status">{status} <Link href="/login/">로그인</Link></small>}
    </div>
  );
}
