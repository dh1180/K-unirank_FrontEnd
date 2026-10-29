import { DisplayAd } from "@/components/DisplayAd";
import Link from "next/link";
import { dataRanking, type RankSearch } from "@/lib/rankings";
import { positivePage, toQuery } from "@/lib/query.mjs";
import { Pagination } from "@/components/Pagination";
import { UniversityLogo } from "@/components/UniversityLogo";
import { Notice } from "@/components/Notice";
import { StructuredData } from "@/components/StructuredData";
import { SITE_ORIGIN } from "@/lib/site-policy.mjs";

function displayValue(value: number, kind: string): [string, string] {
  if (kind === "money")
    return value >= 10000
      ? [
          (value / 10000).toLocaleString("ko-KR", { maximumFractionDigits: 0 }),
          "만원",
        ]
      : [value.toLocaleString("ko-KR", { maximumFractionDigits: 0 }), "원"];
  return [
    value.toLocaleString("ko-KR", {
      minimumFractionDigits: kind === "percent" || kind === "person" ? 1 : 2,
      maximumFractionDigits: kind === "percent" || kind === "person" ? 1 : 2,
    }),
    kind === "percent" ? "%" : kind === "person" ? "명" : kind,
  ];
}
export async function DataRanking({
  slug,
  search,
}: {
  slug: string;
  search: RankSearch;
}) {
  const admissions = slug === "admissions",
    path = admissions
      ? "/admissions/ranking/"
      : `/universities/indicators/${slug}/`;
  const page = positivePage(search.page),
    q = typeof search.q === "string" ? search.q.slice(0, 100) : "",
    region =
      typeof search.region === "string" ? search.region.slice(0, 100) : "";
  const kind = search.kind === "college" ? "college" : "four",
    phase = search.phase === "JEONGSI" ? "JEONGSI" : "SUSI";
  const year =
    search.year && /^\d{4}$/.test(search.year) ? search.year : undefined;
  const params = { year, q, region, ...(admissions ? { kind, phase } : {}) };
  const data = await dataRanking(slug, { ...params, page, size: 40 });
  return (
    <>
      {data && (
        <StructuredData
          data={{
            "@type": "CollectionPage",
            name: admissions
              ? "대학 입결 순위"
              : `${data.metric.label} 대학 순위`,
            url: SITE_ORIGIN + path,
            mainEntity: {
              "@type": "ItemList",
              itemListElement: data.items.map((row, index) => ({
                "@type": "ListItem",
                position: index + 1,
                item: {
                  "@type": "CollegeOrUniversity",
                  name: row.name,
                  url: `${SITE_ORIGIN}/universities/${row.universityId}/`,
                },
              })),
            },
          }}
        />
      )}
      <p className="breadcrumb">
        <Link href="/rankings/">대학 순위</Link>
        <span>/</span>
        {admissions ? "입결 순위" : (data?.metric.label ?? "공시 지표")}
      </p>
      <section
        className="directory-heading"
        data-ga-view={
          admissions
            ? "admission_ranking_view"
            : "official_indicator_ranking_view"
        }
        data-ga-param-year={data?.selectedYear ?? ""}
        data-ga-param-kind={admissions ? kind : ""}
        data-ga-param-phase={admissions ? phase : ""}
        data-ga-param-indicator={data?.metric.code ?? ""}
      >
        <div>
          <p className="eyebrow">
            {admissions ? "ADMISSION RANKING" : "OFFICIAL DATA"}
          </p>
          <h1>
            {admissions
              ? "대학 입결 순위"
              : `${data?.metric.label ?? "공시 지표"} 대학 순위`}
          </h1>
          <p>
            {data?.metric.description ??
              "같은 기준과 연도의 공개 자료를 비교합니다."}
          </p>
        </div>
        {data && (
          <div className="ranking-method">
            <b>{data.metric.ascending ? "낮을수록 상위" : "높을수록 상위"}</b>
            <span>
              {data.selectedYear}년 · {data.metric.label}
            </span>
          </div>
        )}
      </section>
      {!data ? (
        <Notice>
          순위 데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </Notice>
      ) : (
        <>
          <form className="ranking-controls" method="get" action={path}>
            {admissions && (
              <>
                <label>
                  대학 유형
                  <select name="kind" defaultValue={kind}>
                    <option value="four">4년제</option>
                    <option value="college">전문대</option>
                  </select>
                </label>
                <label>
                  모집 구분
                  <select name="phase" defaultValue={phase}>
                    <option value="SUSI">수시</option>
                    <option value="JEONGSI">정시</option>
                  </select>
                </label>
              </>
            )}
            <label>
              {admissions ? "입결 학년도" : "공시연도"}
              <select name="year" defaultValue={data.selectedYear ?? ""}>
                {data.availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y}년
                  </option>
                ))}
              </select>
            </label>
            <label className="ranking-search">
              대학명
              <input
                type="search"
                name="q"
                placeholder="대학명으로 검색"
                defaultValue={q}
              />
            </label>
            <input type="hidden" name="region" value={region} />
            <button className="button primary">조회</button>
          </form>
          <div className="region-chips">
            <Link
              className={`chip ${!region ? "active" : ""}`}
              href={`${path}?${toQuery({ ...params, region: "" })}`}
            >
              전체 지역
            </Link>
            {data.regions.map((r) => (
              <Link
                key={r}
                className={`chip ${r === region ? "active" : ""}`}
                href={`${path}?${toQuery({ ...params, region: r })}`}
              >
                {r}
              </Link>
            ))}
          </div>
          <DisplayAd />
          <div className="result-toolbar" id="results">
            <p>
              <b>{data.totalCount.toLocaleString("ko-KR")}</b>개 대학
            </p>
            <span>검색·지역 필터를 적용해도 전체 순위가 유지됩니다.</span>
          </div>
          {data.items.length ? (
            <div className="data-ranking-list">
              <div className="data-ranking-head">
                <span>순위</span>
                <span>대학</span>
                <span>{data.metric.label}</span>
                <span>{admissions ? "표본" : "공시연도"}</span>
              </div>
              {data.items.map((row) => {
                const [value, unit] = displayValue(row.value, data.metric.kind);
                return (
                  <div
                    className="data-ranking-row"
                    key={`${row.universityId}-${row.rank}`}
                  >
                    <b className={`rank-number ${row.rank <= 3 ? "top" : ""}`}>
                      {row.rank}
                    </b>
                    <Link
                      className="data-ranking-university"
                      href={`/universities/${row.universityId}/`}
                    >
                      <UniversityLogo
                        id={row.universityId}
                        name={row.name}
                        logoPath={row.logoPath}
                      />
                      <span>
                        <strong>{row.name}</strong>
                        <small>{row.region}</small>
                      </span>
                    </Link>
                    <span className="data-ranking-value">
                      <b>{value}</b>
                      <small>{unit}</small>
                    </span>
                    <span className="data-ranking-sample">
                      {admissions ? `${row.sampleCount}건` : `${row.year}년`}
                      {row.sourceUrl && /^https?:\/\//.test(row.sourceUrl) && (
                        <a
                          href={row.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          출처 ↗
                        </a>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <Notice>
              조건에 맞는 공개 자료가 없어요. 연도나 검색 조건을 변경해 주세요.
            </Notice>
          )}
          <Pagination
            href={path}
            page={page}
            hasNext={data.hasNext}
            params={params}
          />
          {data.items.length >= 12 && <DisplayAd />}
          <div className="method-note">
            <strong>이 순위의 기준</strong>
            <p>
              {data.metric.description}.{" "}
              {admissions
                ? "4년제와 전문대, 등급과 백분위는 각각 분리해서 비교합니다. 모집인원 가중평균은 모집인원이 있는 표본을 사용합니다."
                : "대학알리미의 동일 공시연도, 0보다 큰 공개값을 기준으로 정렬합니다."}{" "}
              개별 대학이나 학과의 종합적인 우열을 뜻하지 않습니다.
            </p>
            <Link href="/rankings/">다른 순위 둘러보기 →</Link>
          </div>
        </>
      )}
    </>
  );
}
