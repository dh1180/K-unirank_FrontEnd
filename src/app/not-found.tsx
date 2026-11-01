import Link from "next/link";

export default function NotFound() {
  return <section className="panel page-header">
    <p className="eyebrow">404</p>
    <h1>페이지를 찾을 수 없습니다</h1>
    <p>주소가 변경되었거나 공개되지 않은 대학·학과입니다.</p>
    <div className="actions">
      <Link className="button primary" href="/">입결 찾기로 이동</Link>
      <Link className="button" href="/universities/">대학 목록 보기</Link>
    </div>
  </section>;
}
