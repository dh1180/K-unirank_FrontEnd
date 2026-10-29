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
};
export function metricLabel(code: string) {
  return metricLabels[code] ?? code.replaceAll("_", " ");
}

function summaryMetrics(row: AdmissionResult) {
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
    row.metrics.filter((metric) => metric.code === code),
  );
  return (selected.length ? selected : row.metrics).slice(0, 2);
}
export function AdmissionsTable({ items }: { items: AdmissionResult[] }) {
  return (
    <div className="table-scroll">
      <table className="admissions-table">
        <thead>
          <tr>
            <th>대학</th>
            <th>모집 구분</th>
            <th>모집단위 · 전형</th>
            <th>모집인원</th>
            <th>경쟁률</th>
            <th>공개 입결 지표</th>
            <th>출처</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.id}>
              <td>
                <Link
                  className="table-university"
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
              <td>
                <span
                  className={`badge ${row.phase === "SUSI" ? "purple" : "neutral"}`}
                >
                  {row.phase === "SUSI"
                    ? "수시"
                    : row.phase === "JEONGSI"
                      ? "정시"
                      : row.phase}
                </span>
              </td>
              <td>
                <Link
                  className="major-link"
                  href={`/admissions/unit/${row.recruitmentUnitId}/`}
                >
                  {row.recruitmentUnitName}
                </Link>
                <small>
                  {row.selectionCategory} · {row.selectionName}
                </small>
              </td>
              <td>
                {row.recruitmentCount ?? "—"}
                <small>명</small>
              </td>
              <td className="numeric">
                {row.competitionRate?.toFixed(2) ?? "—"}
                <small>: 1</small>
              </td>
              <td>
                {summaryMetrics(row).map((metric) => (
                  <div className="table-metric" key={metric.code}>
                    <small>{metricLabel(metric.code)}</small>
                    <b>{metric.value.toFixed(2)}</b>
                    <span>{metric.unit}</span>
                  </div>
                ))}
                {!row.metrics.length && <span className="muted">미공개</span>}
              </td>
              <td>
                {/^https?:\/\//.test(row.sourceUrl) ? (
                  <a
                    className="source-link"
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
