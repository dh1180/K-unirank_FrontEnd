"use client";

import Link from "next/link";
import { useState } from "react";

type Props = { universityId: number; unitId?: never } | { universityId?: never; unitId: number };

export function FavoriteButton(props: Props) {
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const unit = props.unitId !== undefined;
  const id = unit ? props.unitId : props.universityId;
  const type = unit ? "units" : "universities";

  async function add() {
    if (saving) return;
    setSaving(true);
    setStatus("");
    try {
      const response = await fetch(`/api/member/favorites/${type}/${id}`, {
        method: "PUT", credentials: "same-origin",
      });
      if (response.status === 401) setStatus("로그인 후 관심 목록에 등록할 수 있어.");
      else if (response.status === 503) setStatus("관심 등록 기능은 아직 이전 중이야.");
      else if (!response.ok) setStatus("관심 등록에 실패했어.");
      else setStatus(unit ? "관심 학과에 등록했어." : "관심 대학에 등록했어.");
    } catch {
      setStatus("회원 서버에 연결하지 못했어.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="favorite-actions">
      <button type="button" className="button" disabled={saving} onClick={() => void add()}>
        {saving ? "등록 중..." : unit ? "관심 학과 등록" : "관심 대학 등록"}
      </button>
      {status && <small role="status">{status} <Link href="/login/">로그인</Link></small>}
    </div>
  );
}
