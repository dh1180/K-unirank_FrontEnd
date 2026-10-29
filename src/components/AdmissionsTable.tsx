import Link from "next/link";
import type { AdmissionResult } from "@/lib/types";
import { UniversityLogo } from "@/components/UniversityLogo";

const metricLabels: Record<string, string> = {
  STUDENT_GRADE_70_CUT: "학생부 70% 컷",
  STUDENT_GRADE_50_CUT: "학생부 50% 컷",
  CSAT_PERCENTILE_70_CUT: "수능 백분위 70% 컷",
  CSAT_SCORE_70_CUT: "수능 환산점수 70% 컷",
  STUDENT_GRADE_AVG: "학생부 평균",
  STUDENT_GRADE_MIN: "학생부 최저",
  CONVERTED_SCORE_50_CUT: "대학 환산점수 50% 컷",
  CONVERTED_SCORE_70_CUT: "대학 환산점수 70% 컷",
  CSAT_CONVERTED_SCORE_50_CUT: "수능 환산점수 50% 컷",
  CSAT_CONVERTED_SCORE_70_CUT: "수능 환산점수 70% 컷",
  CSAT_PERCENTILE_MEAN_50_CUT: "공식 평균 백분위 50% 컷",
  CSAT_PERCENTILE_MEAN_70_CUT: "공식 평균 백분위 70% 컷",
  CSAT_GRADE_50_CUT: "평균 수능등급 50% 컷",
  CSAT_GRADE_70_CUT: "평균 수능등급 70% 컷",
  ESSAY_SCORE_70_CUT: "논술 70% 컷",
  COLLEGE_CSAT_AVERAGE: "수능 합격자 평균",
  COLLEGE_STUDENT_AVERAGE: "학생부 합격자 평균",
  COLLEGE_CSAT_MINIMUM: "수능 합격자 최저",
  COLLEGE_STUDENT_MINIMUM: "학생부 합격자 최저",
  STUDENT_GRADE_85_CUT: "학생부 85% 컷",
  STUDENT_GRADE_90_CUT: "학생부 90% 컷",
  STUDENT_GRADE_STDDEV: "학생부등급 표준편차",
  ESSAY_SCORE_90_CUT: "논술 90% 컷",
};
for (const [subject, label] of Object.entries({
  KOREAN: "국어 백분위",
  MATH: "수학 백분위",
  INQUIRY: "탐구 백분위",
  INQUIRY1: "탐구1 백분위",
  INQUIRY2: "탐구2 백분위",
  ENGLISH: "영어등급",
  KOREAN_HISTORY: "한국사등급",
})) {
  for (const cut of [50, 70])
    metricLabels[
      `CSAT_${subject}_${subject === "ENGLISH" || subject === "KOREAN_HISTORY" ? "GRADE" : "PERCENTILE"}_${cut}_CUT`
    ] = `${label} ${cut}% 컷`;
}
export function metricLabel(code: string) {
  return metricLabels[code] ?? code.replaceAll("_", " ");
}

function summaryMetrics(row: AdmissionResult) {
  const publicMetrics = row.metrics.filter(
    (metric) => !metric.code.includes("REFERENCE_MEAN"),
  );
  const preferred =
    row.phase === "JEONGSI"
      ? [
          "CSAT_PERCENTILE_MEAN_70_CUT",
          "CSAT_CONVERTED_SCORE_70_CUT",
          "CSAT_GRADE_70_CUT",
          "COLLEGE_CSAT_AVERAGE",
          "COLLEGE_CSAT_MINIMUM",
        ]
      : [
          "STUDENT_GRADE_70_CUT",
          "CONVERTED_SCORE_70_CUT",
          "COLLEGE_STUDENT_AVERAGE",
          "COLLEGE_STUDENT_MINIMUM",
          "ESSAY_SCORE_70_CUT",
        ];
  const selected = preferred.flatMap((code) =>
    publicMetrics.filter((metric) => metric.code === code),
  );
  return (selected.length ? selected : publicMetrics).slice(0, 2);
}
export function AdmissionsTable({
  items,
  detailed = false,
}: {
  items: AdmissionResult[];
  detailed?: boolean;
}) {
  return (
    <div className="table-scroll">
      <table className="admissions-table">
        <caption className="sr-only">
          대학·학과별 모집인원, 경쟁률과 공개 입시결과
        </caption>
        <colgroup>
          <col className="col-university" />
          <col className="col-phase" />
          <col className="col-major" />
          <col className="col-count" />
          <col className="col-competition" />
          <col className="col-metrics" />
          <col className="col-source" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">대학</th>
            <th scope="col">모집 구분</th>
            <th scope="col">모집단위 · 전형</th>
            <th scope="col">모집인원</th>
            <th scope="col">경쟁률</th>
            <th scope="col">공개 입결 지표</th>
            <th scope="col">출처</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.id}>
              <td className="university-cell" data-label="대학">
                <Link
                  className="table-university"
                  data-ga-event="admission_university_open"
                  data-ga-param-university={row.universityName}
                  data-ga-param-phase={row.phase}
                  data-ga-param-year={row.admissionYear}
                  href={`/admissions/university/${row.universityId}/`}
                >
                  <UniversityLogo
                    id={row.universityId}
                    name={row.universityName}
                    size="small"
                  />
                  <strong>{row.universityName}</strong>
                </Link>
              </td>
              <td className="phase-cell" data-label="모집 구분">
                <span
                  className={`badge ${row.phase === "SUSI" ? "purple" : "neutral"}`}
                >
                  {row.phase === "SUSI"
                    ? "수시"
                    : row.phase === "JEONGSI"
                      ? "정시"
                      : row.phase}
                </span>
                <small>{row.admissionYear}학년도</small>
              </td>
              <td className="major-cell" data-label="모집단위 · 전형">
                <Link
                  className="major-link"
                  data-ga-event="admission_unit_open"
                  data-ga-param-university={row.universityName}
                  data-ga-param-unit={row.recruitmentUnitName}
                  href={`/admissions/unit/${row.recruitmentUnitId}/`}
                >
                  {row.recruitmentUnitName}
                </Link>
                <small>
                  {row.selectionCategory} · {row.selectionName}
                </small>
              </td>
              <td className="count-cell" data-label="모집인원">
                <span className="stat-value">
                  {row.recruitmentCount?.toLocaleString("ko-KR") ?? "—"}
                  <small>명</small>
                </span>
              </td>
              <td className="numeric competition-cell" data-label="경쟁률">
                <span className="stat-value">
                  {row.competitionRate?.toFixed(2) ?? "—"}
                  <small>: 1</small>
                </span>
              </td>
              <td className="metrics-cell" data-label="공개 입결 지표">
                {summaryMetrics(row).map((metric) => (
                  <div className="table-metric" key={metric.code}>
                    <small>{metricLabel(metric.code)}</small>
                    <b>{metric.value.toFixed(2)}</b>
                    <span>{metric.unit}</span>
                  </div>
                ))}
                {!summaryMetrics(row).length && (
                  <span className="muted">입결 지표 미공개</span>
                )}
                {detailed &&
                  row.metrics.filter((m) => !m.code.includes("REFERENCE_MEAN"))
                    .length > 2 && (
                    <details className="all-metrics">
                      <summary>전체 입결 지표 보기</summary>
                      <dl>
                        {row.metrics
                          .filter((m) => !m.code.includes("REFERENCE_MEAN"))
                          .map((metric) => (
                            <div key={metric.code}>
                              <dt>{metricLabel(metric.code)}</dt>
                              <dd>
                                {metric.value.toFixed(2)} {metric.unit}
                              </dd>
                            </div>
                          ))}
                      </dl>
                    </details>
                  )}
              </td>
              <td className="source-cell" data-label="출처">
                <details className="mobile-admission-details">
                  <summary>상세 보기</summary>
                  <div>
                    <p>
                      {row.admissionYear}학년도 · {row.selectionCategory} ·{" "}
                      {row.selectionName}
                    </p>
                    <dl>
                      {row.metrics
                        .filter(
                          (metric) => !metric.code.includes("REFERENCE_MEAN"),
                        )
                        .map((metric) => (
                          <div key={metric.code}>
                            <dt>{metricLabel(metric.code)}</dt>
                            <dd>
                              {metric.value.toFixed(2)} {metric.unit}
                            </dd>
                          </div>
                        ))}
                    </dl>
                  </div>
                </details>
                {/^https?:\/\//.test(row.sourceUrl) ? (
                  <a
                    className="source-link"
                    data-ga-event="admission_source_click"
                    data-ga-param-university={row.universityName}
                    data-ga-param-source={row.sourceType}
                    href={row.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {row.sourceType === "ADIGA"
                      ? "어디가"
                      : row.sourceType === "PROCOLLEGE"
                        ? "전문대학포털"
                        : "대학 입학처"}{" "}
                    ↗
                  </a>
                ) : (
                  <span className="muted">원문 미등록</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
