import Link from "next/link";
import type { UniversityOverview as Overview } from "@/lib/types";
import { metricLabel } from "@/components/AdmissionsTable";
import { toQuery } from "@/lib/query.mjs";

function indicatorValue(value: number, kind: string) {
  if (kind === "money")
    return {
      value: (value / 10000).toLocaleString("ko-KR", {
        maximumFractionDigits: 1,
      }),
      unit: "만원",
    };
  return {
    value: value.toLocaleString("ko-KR", { maximumFractionDigits: 2 }),
    unit: kind === "percent" ? "%" : "명",
  };
}
export function UniversityOverview({
  id,
  data,
}: {
  id: number;
  data: Overview | null;
}) {
  const href = `/admissions/university/${id}/`;
  const admissions = data?.admissions;
  return (
    <>
      <section className="panel overview-section">
        <div className="overview-heading">
          <div>
            <p className="eyebrow">OFFICIAL DATA</p>
            <h2>공식 공시 지표</h2>
          </div>
          <span>대학알리미 · 지표별 최신 공개 자료</span>
        </div>
        {!data ? (
          <p className="overview-empty">
            공시 지표를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.
          </p>
        ) : data.indicators.length ? (
          <div className="official-indicator-grid">
            {data.indicators.map((item) => {
              const display = indicatorValue(item.value, item.kind);
              return (
                <article className="official-indicator-card" key={item.slug}>
                  <div className="indicator-card-label">
                    <h3>{item.label}</h3>
                    <span>{item.year}년</span>
                  </div>
                  <p className="indicator-card-value">
                    {display.value}
                    <small>{display.unit}</small>
                  </p>
                  <div className="indicator-card-links">
                    <Link
                      href={`/universities/indicators/${item.slug}/?year=${item.year}#results`}
                    >
                      전체 대학 비교 →
                    </Link>
                    {item.sourceUrl && /^https?:\/\//.test(item.sourceUrl) ? (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        공시 출처 ↗
                      </a>
                    ) : (
                      <span>대학알리미</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="overview-empty">
            현재 확인할 수 있는 공식 공시 지표가 없습니다.
          </p>
        )}
      </section>
      <section className="panel overview-section admission-overview">
        <div className="overview-heading">
          <div>
            <p className="eyebrow">ADMISSION SNAPSHOT</p>
            <h2>공개 입결 요약</h2>
          </div>
          {admissions?.year && (
            <span>{admissions.year}학년도 · 최신 공개 입결</span>
          )}
        </div>
        {!admissions ? (
          <p className="overview-empty">
            입결 요약을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.
          </p>
        ) : !admissions.resultCount ? (
          <p className="overview-empty">
            현재 입결 지표가 공개된 전형 결과가 없습니다. 대학 입학처의 최신
            모집요강과 입시결과를 확인해 주세요.
          </p>
        ) : (
          <>
            <div className="admission-overview-counts">
              <div>
                <span>공개 전형 결과</span>
                <strong>
                  {admissions.resultCount.toLocaleString("ko-KR")}
                  <small>건</small>
                </strong>
              </div>
              <div>
                <span>수시</span>
                <strong>
                  {admissions.susiCount.toLocaleString("ko-KR")}
                  <small>건</small>
                </strong>
              </div>
              <div>
                <span>정시</span>
                <strong>
                  {admissions.jeongsiCount.toLocaleString("ko-KR")}
                  <small>건</small>
                </strong>
              </div>
            </div>
            {admissions.ranges.length > 0 ? (
              <>
                <div className="overview-range-heading">
                  <h3>전형별 공개 입결 범위</h3>
                  <span>등급·백분위별로 구분</span>
                </div>
                <ul className="overview-cut-ranges">
                  {admissions.ranges.map((range) => (
                    <li key={`${range.phase}-${range.category}-${range.code}`}>
                      <div>
                        <span className="badge neutral">
                          {range.phase === "SUSI"
                            ? "수시"
                            : range.phase === "JEONGSI"
                              ? "정시"
                              : range.phase}
                        </span>
                        <h4>{range.category || "전형 전체"}</h4>
                        <p>
                          {metricLabel(range.code)} · 공개 결과{" "}
                          {range.sampleCount}건
                        </p>
                      </div>
                      <strong>
                        {range.min.toFixed(2)}
                        {range.min !== range.max && `–${range.max.toFixed(2)}`}
                        <small>{range.unit}</small>
                      </strong>
                      <Link
                        href={`${href}?${toQuery({ year: admissions.year ?? undefined, phase: range.phase, q: range.category, metrics: "public" })}#results`}
                      >
                        전형별 입결 →
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="overview-footnote">
                  학과·전형별 공개값의 최솟값과 최댓값입니다. 대학 전체의
                  합격선이나 합격 가능성을 뜻하지 않으며, 원문 출처는 개별
                  입결에서 확인할 수 있습니다.
                </p>
              </>
            ) : (
              <p className="overview-footnote">
                공개 결과에 등급·백분위 요약 대상 지표가 없어 범위는 표시하지
                않습니다. 환산점수 등 상세 지표는 전체 입결에서 확인하세요.
              </p>
            )}
            <Link
              className="button primary overview-admissions-link"
              href={`${href}?${toQuery({ year: admissions.year ?? undefined, metrics: "public" })}#results`}
            >
              공개 입시결과 전체 보기 →
            </Link>
          </>
        )}
      </section>
    </>
  );
}
