import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { universityAdmissions, getUniversity } from "@/lib/api";
import { positivePage } from "@/lib/query.mjs";
import { Notice } from "@/components/Notice";
import { Pagination } from "@/components/Pagination";
import { AdmissionsTable } from "@/components/AdmissionsTable";
import { UniversityLogo } from "@/components/UniversityLogo";
import { MetricToggle } from "@/components/MetricToggle";

export const metadata: Metadata = { title: "대학별 입시결과" };
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; year?: string; metrics?: string }>;
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
  const [data, university] = await Promise.all([
    universityAdmissions(Number(id), page, year, metrics),
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
      <section className="university-detail-hero admissions-detail-heading">
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
      <div className="admission-controls">
        <MetricToggle
          href={`/admissions/university/${id}/`}
          params={{ year }}
          publicOnly={metrics !== "all"}
        />
        <form method="get">
          <input type="hidden" name="metrics" value={metrics} />
          <label>
            입결 학년도
            <input
              type="number"
              name="year"
              min="2000"
              max="2100"
              placeholder="전체"
              aria-label="입결 학년도"
              defaultValue={year ?? ""}
            />
          </label>
          <button className="button">적용</button>
        </form>
      </div>
      {!data ? (
        <Notice>
          입시결과를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </Notice>
      ) : (
        <>
          <div className="result-toolbar">
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
              조건에 맞는 결과가 없어요. 지표 필터를 해제하거나 학년도를 변경해
              보세요.
            </Notice>
          )}
          <Pagination
            href={`/admissions/university/${id}/`}
            page={page}
            hasNext={data.hasNext}
            params={{ year, metrics }}
          />
        </>
      )}
    </>
  );
}
