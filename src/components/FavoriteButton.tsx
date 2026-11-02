"use client";

import Link from "next/link";
import { useState } from "react";

type Props = { universityId: number; unitId?: never } | { universityId?: never; unitId: number };

export function FavoriteButton(props: Props) {
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loginRequired,setLoginRequired]=useState(false);
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
      if (response.status === 401) {setStatus("로그인 후 관심 목록에 등록할 수 있습니다.");setLoginRequired(true);}
      else if (!response.ok) setStatus("관심 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      else {setSaved(true);setStatus(unit ? "관심 학과로 등록했습니다." : "관심 대학으로 등록했습니다.");}
    } catch {
      setStatus("회원 서버에 연결하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="favorite-actions">
      <button type="button" className="button" disabled={saving || saved} onClick={() => void add()}>
        {saving ? "등록 중..." : saved ? "관심 목록에 저장됨 ✓" : unit ? "관심 학과 등록" : "관심 대학 등록"}
      </button>
      {status && <small role="status">{status} <Link href={loginRequired?"/login/":"/mypage/"}>{loginRequired?"로그인":"마이페이지에서 보기"}</Link></small>}
    </div>
  );
}
