import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUniversity } from "@/lib/api";
import { Notice } from "@/components/Notice";
import { UniversityLogo } from "@/components/UniversityLogo";
import { Icon } from "@/components/Icon";

type Props = { params: Promise<{ id: string }> };
function parseId(id: string) {
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();
  return Number(id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseId((await params).id);
  const data = await getUniversity(id);
  if (!data)
    return { title: "대학 상세 | K-unirank", robots: { index: false } };
  return {
    title: `${data.name} | 대학 정보`,
    description: `${data.name}의 지역·주소·학과(모집단위) 정보를 확인하세요.`,
    alternates: { canonical: `/universities/${id}/` },
  };
}

export default async function UniversityDetailPage({ params }: Props) {
  const id = parseId((await params).id);
  const data = await getUniversity(id);
  if (!data)
    return (
      <Notice>대학 정보를 불러올 수 없거나 존재하지 않는 대학이야.</Notice>
    );
  return (
    <div className="university-profile">
      <p className="breadcrumb">
        <Link href="/universities/">대학 찾기</Link>
        <span>/</span>
        {data.name}
      </p>
      <section className="university-detail-hero">
        <UniversityLogo
          id={data.id}
          name={data.name}
          logoPath={data.logoPath}
          size="large"
        />
        <div>
          <p className="eyebrow">UNIVERSITY PROFILE</p>
          <h1>{data.name}</h1>
          <p>
            <Icon name="pin" size={16} />
            {data.region ?? "지역 미상"} ·{" "}
            {data.universityType ?? "대학 유형 정보 없음"}
          </p>
        </div>
        <Link className="button primary" href={`/admissions/university/${id}/`}>
          입시결과 보기 <Icon name="arrow" size={18} />
        </Link>
      </section>
      <section className="panel university-facts">
        <h2>대학 정보</h2>
        <dl className="metric-grid">
          <div>
            <dt>주소</dt>
            <dd>{data.address ?? "미등록"}</dd>
          </div>
          <div>
            <dt>설립 구분</dt>
            <dd>{data.establishmentType ?? "미등록"}</dd>
          </div>
        </dl>
        <div className="university-profile-actions">
          {data.homepageUrl?.startsWith("https://") ||
          data.homepageUrl?.startsWith("http://") ? (
            <a
              className="button"
              href={data.homepageUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              대학 공식 홈페이지 ↗
            </a>
          ) : null}
          <Link className="button" href={`/admissions/university/${id}/`}>
            이 대학 입시결과 보기 →
          </Link>
        </div>
      </section>
      <section className="panel results">
        <h2>학과·모집단위 {data.units.length.toLocaleString("ko-KR")}개</h2>
        {data.units.length === 0 ? (
          <Notice>등록된 모집단위 정보가 없어.</Notice>
        ) : (
          <ul className="item-list unit-grid">
            {data.units.map((unit) => (
              <li className="list-item" key={unit.id}>
                <div>
                  <strong>
                    <Link href={`/admissions/unit/${unit.id}/`}>
                      {unit.name}
                    </Link>
                  </strong>
                  {unit.collegeName && (
                    <p className="muted">{unit.collegeName}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
