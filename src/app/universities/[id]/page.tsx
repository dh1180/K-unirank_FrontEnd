import { DisplayAd } from "@/components/DisplayAd";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUniversity, universityOverview } from "@/lib/api";
import { UniversityOverview } from "@/components/UniversityOverview";
import { Notice } from "@/components/Notice";
import { UniversityLogo } from "@/components/UniversityLogo";
import { Icon } from "@/components/Icon";
import { StructuredData } from "@/components/StructuredData";
import { SITE_ORIGIN } from "@/lib/site-policy.mjs";

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
    description: `${data.name}의 공식 공시 지표와 공개 입결 요약을 확인하세요.`,
    alternates: { canonical: `/universities/${id}/` },
  };
}

export default async function UniversityDetailPage({ params }: Props) {
  const id = parseId((await params).id);
  const [data, overview] = await Promise.all([
    getUniversity(id),
    universityOverview(id),
  ]);
  if (!data)
    return (
      <Notice>대학 정보를 불러올 수 없거나 존재하지 않는 대학이야.</Notice>
    );
  return (
    <div
      className="university-profile"
      data-ga-view="university_view"
      data-ga-param-university={data.name}
      data-ga-param-region={data.region ?? ""}
    >
      <StructuredData
        data={{
          "@type": "CollegeOrUniversity",
          "@id": `${SITE_ORIGIN}/universities/${id}/#university`,
          name: data.name,
          url: `${SITE_ORIGIN}/universities/${id}/`,
          address: data.address || undefined,
          ...(data.homepageUrl?.startsWith("http")
            ? { sameAs: [data.homepageUrl] }
            : {}),
        }}
      />
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
              data-ga-event="official_site_click"
              data-ga-param-university={data.name}
              href={data.homepageUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              대학 공식 홈페이지 ↗
            </a>
          ) : null}
          <Link
            className="button"
            data-ga-event="admission_open_from_university"
            data-ga-param-university={data.name}
            href={`/admissions/university/${id}/`}
          >
            이 대학 입시결과 보기 →
          </Link>
        </div>
      </section>
      <DisplayAd />
      <UniversityOverview id={id} data={overview} />
    </div>
  );
}
