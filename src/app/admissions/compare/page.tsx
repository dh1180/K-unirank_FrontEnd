import { DisplayAd } from "@/components/DisplayAd";
import type { Metadata } from "next";
import Link from "next/link";
import { compareGrades } from "@/lib/api";
import { gradeIsValid, positivePage } from "@/lib/query.mjs";
import { Notice } from "@/components/Notice";
import { Pagination } from "@/components/Pagination";
import { UniversityLogo } from "@/components/UniversityLogo";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "내 점수로 학과 찾기" };
type Search = {
  grade?: string;
  track?: string;
  special?: string;
  scope?: string;
  chart_min?: string;
  q?: string;
  region?: string;
  page?: string;
};
const regions = [
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "광주",
  "대전",
  "울산",
  "세종",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
];
export default async function GradeComparisonPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const raw = await searchParams;
  const grade = typeof raw.grade === "string" ? raw.grade.trim() : "";
  const track = raw.track === "holistic" ? "holistic" : "student";
  const special = raw.special === "all" ? "all" : "exclude",
    scope = raw.scope === "all" ? "all" : "near";
  const chartMin = ["1", "2", "3", "5"].includes(raw.chart_min ?? "")
    ? raw.chart_min!
    : "2";
  const q = typeof raw.q === "string" ? raw.q.slice(0, 120) : "",
    region = typeof raw.region === "string" ? raw.region.slice(0, 30) : "";
  const page = positivePage(raw.page),
    attempted = grade.length > 0,
    valid = gradeIsValid(grade);
  const data =
    attempted && valid
      ? await compareGrades({
          grade,
          track,
          special,
          scope,
          chart_min: chartMin,
          q,
          region,
          page,
          size: 60,
        })
      : null;
  return (
    <div className="comparison-page">
      <section
        data-ga-view="admission_compare_view"
        data-ga-param-year={data?.selectedYear ?? ""}
        className="comparison-intro"
      >
        <div>
          <p className="eyebrow">FIND YOUR FIT</p>
          <h1>내 점수로 학과 찾기</h1>
          <p>공개된 입결과 내 등급을 나란히 비교해 보세요.</p>
        </div>
        {data && (
          <div className="my-grade-summary">
            <span>내 평균등급</span>
            <strong>
              {data.grade.toFixed(2)}
              <small>등급</small>
            </strong>
            <span>
              {data.track === "student" ? "학생부교과" : "학생부종합"} ·{" "}
              {data.selectedYear}학년도
            </span>
          </div>
        )}
      </section>
      <form
        method="get"
        action="/admissions/compare/#comparison-results"
        data-ga-submit="admission_compare_search"
        data-ga-search-field="q"
        className="comparison-builder"
      >
        <div className="compare-main-fields">
          <label htmlFor="grade">
            내신 평균등급
            <input
              id="grade"
              name="grade"
              type="number"
              min="1"
              max="9"
              step="0.01"
              defaultValue={grade}
              placeholder="예: 3.00"
              required
            />
          </label>
          <label htmlFor="track">
            전형 유형
            <select id="track" name="track" defaultValue={track}>
              <option value="student">학생부교과</option>
              <option value="holistic">학생부종합</option>
            </select>
          </label>
          <button className="button primary" type="submit">
            <Icon name="search" size={17} />
            학과 찾아보기
          </button>
        </div>
        <details className="compare-extra">
          <summary>
            검색 조건 더 설정하기{" "}
            <span>
              {scope === "all" ? "전체 등급" : "내 등급 ±0.5"}
              {q ? ` · ${q}` : ""}
              {region ? ` · ${region}` : ""}
            </span>
          </summary>
          <div className="compare-extra-fields">
            <label htmlFor="scope">
              비교 범위
              <select id="scope" name="scope" defaultValue={scope}>
                <option value="near">내 등급 ±0.5</option>
                <option value="all">전체</option>
              </select>
            </label>
            <label htmlFor="special">
              전형 범위
              <select id="special" name="special" defaultValue={special}>
                <option value="exclude">일반 지원 중심</option>
                <option value="all">특별전형 포함</option>
              </select>
            </label>
            <label htmlFor="q">
              학과 검색
              <input
                id="q"
                name="q"
                defaultValue={q}
                placeholder="컴퓨터, 간호 등"
              />
            </label>
            <label htmlFor="region">
              지역
              <select id="region" name="region" defaultValue={region}>
                <option value="">전국</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor="chart_min">
              대학 요약 최소 표본
              <select id="chart_min" name="chart_min" defaultValue={chartMin}>
                {[1, 2, 3, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}건 이상
                  </option>
                ))}
              </select>
            </label>
          </div>
        </details>
      </form>
      <DisplayAd />
      {!attempted && (
        <Notice>
          평균등급을 입력하면 비슷한 입결의 학과를 확인할 수 있어요.
        </Notice>
      )}
      {attempted && !valid && (
        <Notice>내신 등급은 1.0~9.0 사이로 입력해 주세요.</Notice>
      )}
      {attempted && valid && !data && (
        <Notice>잠시 결과를 불러오지 못했어요. 다시 조회해 주세요.</Notice>
      )}
      {data && (
        <>
          <section className="comparison-results" id="comparison-results">
            <div className="comparison-result-heading">
              <div>
                <h2>
                  내 등급과 가까운 학과{" "}
                  <span>{data.totalCount.toLocaleString("ko-KR")}건</span>
                </h2>
                <p>
                  {data.selectedYear}학년도 ·{" "}
                  {track === "student" ? "학생부교과" : "학생부종합"} ·{" "}
                  {scope === "all" ? "전체 등급" : "내 등급 ±0.5"}
                  {region ? ` · ${region}` : ""}
                </p>
              </div>
              <span className="comparison-reference">
                70% 컷 우선 · 없으면 50% 컷
              </span>
            </div>
            <p className="comparison-disclaimer">
              합격 가능성 예측이 아닌 과거 공개 입결과의 단순 비교입니다.
            </p>
            {!data.items.length ? (
              <Notice>
                조건에 맞는 학과가 없어요. 비교 범위를 넓혀 보세요.
              </Notice>
            ) : (
              <ol className="compare-result-list">
                {data.items.map((row) => (
                  <li className="compare-result-row" key={row.resultId}>
                    <UniversityLogo
                      id={row.universityId}
                      name={row.universityName}
                      size="small"
                    />
                    <div className="compare-result-copy">
                      <Link
                        className="compare-university-name"
                        href={`/universities/${row.universityId}/`}
                      >
                        {row.universityName}
                      </Link>
                      <Link
                        className="compare-major-name"
                        href={`/admissions/unit/${row.recruitmentUnitId}/`}
                      >
                        {row.recruitmentUnitName}
                      </Link>
                      <p>{row.selectionName}</p>
                    </div>
                    <div className="compare-result-score">
                      <div className="compare-score-values">
                        <div>
                          <span>내 등급</span>
                          <strong className="my-grade">
                            {data.grade.toFixed(2)}
                            <small>등급</small>
                          </strong>
                        </div>
                        <div>
                          <span>{row.referenceBasis}</span>
                          <strong>
                            {row.referenceCut.toFixed(2)}
                            <small>등급</small>
                          </strong>
                        </div>
                      </div>
                      <span className={`compare-position ${row.positionTone}`}>
                        {row.positionLabel}
                      </span>
                    </div>
                    <details className="compare-row-details">
                      <summary>전형 상세·출처</summary>
                      <div>
                        <p>
                          {row.selectionCategory} · {row.selectionName}
                        </p>
                        <dl>
                          <div>
                            <dt>50% 컷</dt>
                            <dd>
                              {row.cut50?.toFixed(2) ?? "미공개"}
                              {row.cut50 !== null ? "등급" : ""}
                            </dd>
                          </div>
                          <div>
                            <dt>70% 컷</dt>
                            <dd>
                              {row.cut70?.toFixed(2) ?? "미공개"}
                              {row.cut70 !== null ? "등급" : ""}
                            </dd>
                          </div>
                          <div>
                            <dt>출처</dt>
                            <dd>{row.sourceName}</dd>
                          </div>
                        </dl>
                        <Link
                          className="compare-source-link"
                          href={`/admissions/unit/${row.recruitmentUnitId}/`}
                        >
                          학과별 입결·원문 출처 보기 →
                        </Link>
                      </div>
                    </details>
                  </li>
                ))}
              </ol>
            )}
            <Pagination
              anchor="comparison-results"
              href="/admissions/compare/"
              page={page}
              hasNext={data.hasNext}
              params={{
                grade,
                track,
                special,
                scope,
                chart_min: chartMin,
                q,
                region,
              }}
            />
          </section>
          <details className="compare-universities">
            <summary>
              <span>
                대학별 입결 요약 <b>{data.chartUniversityCount}개 대학</b>
              </span>
              <span>평균등급 보기</span>
            </summary>
            <p>
              최소 {data.chartMin}개 모집단위의 공개 등급컷 평균입니다. 학과마다
              입결이 다를 수 있어요.
            </p>
            {!data.charts.length ? (
              <Notice>
                조건에 맞는 대학 요약이 없어요. 최소 표본 수를 낮춰 보세요.
              </Notice>
            ) : (
              <ol className="compare-university-list">
                {data.charts.map((row) => (
                  <li key={row.universityId}>
                    <UniversityLogo
                      id={row.universityId}
                      name={row.universityName}
                      size="small"
                    />
                    <Link href={`/admissions/university/${row.universityId}/`}>
                      {row.universityName}
                      <small>
                        {row.sampleCount}개 표본 · {row.referenceBasis}
                      </small>
                    </Link>
                    <strong>
                      {row.averageCut.toFixed(2)}
                      <small>등급</small>
                    </strong>
                  </li>
                ))}
              </ol>
            )}
          </details>
        </>
      )}
    </div>
  );
}
