import { DisplayAd } from "@/components/DisplayAd";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { universityAdmissions, getUniversity } from "@/lib/api";
import { positivePage } from "@/lib/query.mjs";
import { Notice } from "@/components/Notice";
import { Pagination } from "@/components/Pagination";
import { AdmissionsTable } from "@/components/AdmissionsTable";
import { UniversityLogo } from "@/components/UniversityLogo";
import { UniversityAdmissionFilters } from "@/components/UniversityAdmissionFilters";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id)) return { title: "대학별 입시결과" };
  const university = await getUniversity(Number(id));
  return {
    title: university ? `${university.name} 입시결과` : "대학별 입시결과",
    description: university
      ? `${university.name}의 학과·전형별 수시·정시 입결, 모집인원과 경쟁률을 원문 출처와 함께 확인하세요.`
      : undefined,
    alternates: { canonical: `/admissions/university/${id}/` },
  };
}
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    page?: string;
    year?: string;
    metrics?: string;
    q?: string;
    phase?: string;
    track?: string;
  }>;
};
export default async function UniversityAdmissionsPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();
  const query = await searchParams,
    page = positivePage(query.page);
  const year =
    query.year && /^\d{4}$/.test(query.year) ? Number(query.year) : undefined;
  const metrics = query.metrics === "all" ? "all" : "public";
  const q = typeof query.q === "string" ? query.q.slice(0, 100) : "";
  const phase = ["SUSI", "JEONGSI"].includes(query.phase ?? "")
    ? query.phase!
    : "";
  const track = ["student", "holistic", "csat", "essay", "practical"].includes(
    query.track ?? "",
  )
    ? query.track!
    : "";
  const filters = { q, phase, track, year, metrics };
  const [data, university] = await Promise.all([
    universityAdmissions(Number(id), page, year, metrics, { q, phase, track }),
    getUniversity(Number(id)),
  ]);
  const title = university?.name ?? data?.items[0]?.universityName ?? "대학";
  return (
    <>
      <p className="breadcrumb">
        <Link href="/">입결 찾기</Link>
        <span>/</span>
        <Link href={`/universities/${id}/`}>{title}</Link>
        <span>/</span>입시결과
      </p>
      <section
        className="university-detail-hero admissions-detail-heading"
        data-ga-view="admission_view"
        data-ga-param-university={title}
        data-ga-param-year={year ?? "all"}
        data-ga-param-phase={phase || "ALL"}
        data-ga-param-result-count={data?.totalCount ?? 0}
      >
        <UniversityLogo
          id={Number(id)}
          name={title}
          logoPath={university?.logoPath}
          size="large"
        />
        <div>
          <p className="eyebrow">ADMISSION RESULTS</p>
          <h1>
            {title}
            <span className="heading-subtitle">입시결과</span>
          </h1>
          <p>모집단위별 모집인원·경쟁률·입결을 원문 출처와 함께 확인하세요.</p>
        </div>
        <Link className="button" href={`/universities/${id}/`}>
          대학 정보 보기 →
        </Link>
      </section>
      <DisplayAd />
      <UniversityAdmissionFilters id={id} {...filters} />
      {!data ? (
        <Notice>
          입시결과를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </Notice>
      ) : (
        <>
          <div className="result-toolbar" id="results">
            <p>
              <b>{data.totalCount.toLocaleString("ko-KR")}</b>건{" "}
              <span>
                {metrics === "all" ? "전체 입시결과" : "입결 지표 공개 결과"}
              </span>
            </p>
            <span>모집인원·경쟁률은 해당 전형의 공개값입니다.</span>
          </div>
          {data.items.length ? (
            <AdmissionsTable items={data.items} detailed />
          ) : (
            <Notice>
              조건에 맞는 결과가 없어요. 검색어·전형·학년도 조건을 변경하거나
              입결 지표 필터를 해제해 보세요.
            </Notice>
          )}
          <Pagination
            href={`/admissions/university/${id}/`}
            page={page}
            hasNext={data.hasNext}
            params={filters}
          />
        </>
      )}
    </>
  );
}
