import Link from "next/link";
import { Icon } from "@/components/Icon";
import { toQuery } from "@/lib/query.mjs";
import { MetricToggle } from "@/components/MetricToggle";

export function UniversityAdmissionFilters({
  id,
  q,
  phase,
  track,
  year,
  metrics,
}: {
  id: string;
  q: string;
  phase: string;
  track: string;
  year?: number;
  metrics: string;
}) {
  const href = `/admissions/university/${id}/`;
  const filters = { q, phase, track, year, metrics };
  function chips(
    label: string,
    key: "phase" | "track",
    options: [string, string][],
  ) {
    return (
      <div className="filter-chip-row">
        <span>{label}</span>
        <div>
          {options.map(([value, text]) => (
            <Link
              key={value}
              className={`chip ${filters[key] === value ? "active" : ""}`}
              href={`${href}?${toQuery({ ...filters, [key]: value })}#admission-search`}
              aria-current={filters[key] === value ? "true" : undefined}
            >
              {text}
            </Link>
          ))}
        </div>
      </div>
    );
  }
  return (
    <section
      className="university-admission-search"
      id="admission-search"
      aria-label="대학별 입결 검색"
    >
      <div className="explorer-panel">
        <form
          data-ga-submit="admission_detail_search"
          data-ga-search-field="q"
          className="explorer-search"
          action={`${href}#admission-search`}
          method="get"
        >
          <Icon name="search" />
          <input
            name="q"
            aria-label="학과·전형 검색"
            placeholder="학과, 모집단위, 전형 검색"
            defaultValue={q}
          />
          {Object.entries({ phase, track, year, metrics }).map(
            ([key, value]) => (
              <input key={key} type="hidden" name={key} value={value ?? ""} />
            ),
          )}
          <button className="button primary">검색</button>
        </form>
        <div className="filter-groups">
          {chips("모집 구분", "phase", [
            ["", "전체"],
            ["SUSI", "수시"],
            ["JEONGSI", "정시"],
          ])}
          {chips("전형 유형", "track", [
            ["", "전체"],
            ["student", "학생부교과"],
            ["holistic", "학생부종합"],
            ["csat", "수능"],
            ["essay", "논술"],
            ["practical", "실기"],
          ])}
          <form
            className="filter-chip-row admission-year-filter"
            action={`${href}#admission-search`}
            method="get"
          >
            <label htmlFor="admission-year">입결 학년도</label>
            <div>
              {Object.entries({ q, phase, track, metrics }).map(
                ([key, value]) => (
                  <input key={key} type="hidden" name={key} value={value} />
                ),
              )}
              <input
                id="admission-year"
                type="number"
                name="year"
                min="2000"
                max="2100"
                placeholder="전체 학년도"
                defaultValue={year ?? ""}
              />
              <button className="button">적용</button>
            </div>
          </form>
        </div>
      </div>
      <div className="admission-controls">
        <MetricToggle
          href={href}
          params={{ q, phase, track, year }}
          publicOnly={metrics !== "all"}
        />
        <Link className="reset-link" href={`${href}#admission-search`}>
          조건 초기화 ↻
        </Link>
      </div>
    </section>
  );
}
