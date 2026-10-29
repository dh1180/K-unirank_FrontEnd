import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { unitAdmissions } from "@/lib/api";
import { positivePage } from "@/lib/query.mjs";
import { Notice } from "@/components/Notice";
import { Pagination } from "@/components/Pagination";
import { FavoriteButton } from "@/components/FavoriteButton";
import { AdmissionsTable } from "@/components/AdmissionsTable";
import { UniversityLogo } from "@/components/UniversityLogo";
import { MetricToggle } from "@/components/MetricToggle";

export const metadata: Metadata = { title: "학과별 입시결과" };
export default async function AdmissionUnitPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; year?: string; metrics?: string }>;
}) {
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();
  const query = await searchParams,
    page = positivePage(query.page);
  const year =
    query.year && /^\d{4}$/.test(query.year) ? Number(query.year) : undefined;
  const metrics = query.metrics === "all" ? "all" : "public";
  const data = await unitAdmissions(Number(id), page, year, metrics);
  const row =
    data?.items[0] ??
    (await unitAdmissions(Number(id), 0, undefined, "all"))?.items[0];
  return (
    <>
      <p className="breadcrumb">
        <Link href="/">입결 찾기</Link>
        <span>/</span>
        {row && (
          <Link href={`/admissions/university/${row.universityId}/`}>
            {row.universityName}
          </Link>
        )}
        <span>/</span>학과 입시결과
      </p>
      <section className="university-detail-hero admissions-detail-heading">
        {row && (
          <UniversityLogo
            id={row.universityId}
            name={row.universityName}
            size="large"
          />
        )}
        <div>
          <p className="eyebrow">MAJOR RESULTS</p>
          <h1>{row?.recruitmentUnitName ?? "모집단위 입시결과"}</h1>
          <p>
            {row?.universityName} · 전형별 모집인원, 경쟁률과 공개된 입결 지표
          </p>
        </div>
      </section>
      <div className="admission-controls">
        <MetricToggle
          href={`/admissions/unit/${id}/`}
          params={{ year }}
          publicOnly={metrics !== "all"}
        />
        <form method="get">
          <input type="hidden" name="metrics" value={metrics} />
          <label>
            입결 학년도
            <input
              name="year"
              type="number"
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
      {process.env.MEMBER_FRONTEND_ENABLED === "true" && (
        <FavoriteButton unitId={Number(id)} />
      )}
      {!data ? (
        <Notice>입시결과를 불러오지 못했어요.</Notice>
      ) : (
        <>
          <div className="result-toolbar" id="results">
            <p>
              <b>{data.totalCount.toLocaleString("ko-KR")}</b>건{" "}
              <span>
                {metrics === "all" ? "전체 입시결과" : "입결 지표 공개 결과"}
              </span>
            </p>
          </div>
          {data.items.length ? (
            <AdmissionsTable items={data.items} detailed />
          ) : (
            <Notice>
              조건에 맞는 결과가 없어요. 입결 지표 필터를 해제해 보세요.
            </Notice>
          )}
          <Pagination
            href={`/admissions/unit/${id}/`}
            page={page}
            hasNext={data.hasNext}
            params={{ year, metrics }}
          />
        </>
      )}
    </>
  );
}
