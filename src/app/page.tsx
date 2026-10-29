import { DisplayAd } from "@/components/DisplayAd";
import Link from "next/link";
import { searchAdmissions, listUniversities } from "@/lib/api";
import { positivePage, toQuery } from "@/lib/query.mjs";
import { Icon } from "@/components/Icon";
import { AdmissionsTable } from "@/components/AdmissionsTable";
import { Pagination } from "@/components/Pagination";
import { UniversityLogo } from "@/components/UniversityLogo";
import { MetricToggle } from "@/components/MetricToggle";
import { StructuredData } from "@/components/StructuredData";
import { SITE_ORIGIN } from "@/lib/site-policy.mjs";

type Search = {
  q?: string;
  kind?: string;
  phase?: string;
  track?: string;
  page?: string;
  metrics?: string;
};
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const raw = await searchParams;
  const q = typeof raw.q === "string" ? raw.q.slice(0, 100) : "";
  const kind = ["four", "college"].includes(raw.kind ?? "") ? raw.kind! : "";
  const phase = ["SUSI", "JEONGSI"].includes(raw.phase ?? "") ? raw.phase! : "";
  const track = ["student", "holistic", "csat", "essay", "practical"].includes(
    raw.track ?? "",
  )
    ? raw.track!
    : "";
  const page = positivePage(raw.page);
  const metrics = raw.metrics === "all" ? "all" : "public";
  const filters = { q, kind, phase, track, metrics };
  const [data, totals, universities] = await Promise.all([
    searchAdmissions({ ...filters, page, size: 20 }),
    searchAdmissions({ metrics: "all", size: 1 }),
    listUniversities("", 0),
  ]);
  function chips(
    label: string,
    key: "kind" | "phase" | "track",
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
              href={`/?${toQuery({ ...filters, [key]: value })}#explore`}
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
    <>
      <StructuredData
        data={{
          "@type": "CollectionPage",
          name: "대학·학과 입결 찾기",
          url: SITE_ORIGIN,
        }}
      />
      <StructuredData
        data={{
          "@type": "WebSite",
          name: "K-unirank",
          url: SITE_ORIGIN,
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${SITE_ORIGIN}/?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <div className="section-tabs">
        <Link className="active" href="/">
          입결 찾기
        </Link>
        <Link href="/admissions/compare/">내 점수 학과 찾기</Link>
        <Link href="/rankings/">대학 순위</Link>
      </div>
      <section className="discovery-hero">
        <div className="discovery-copy">
          <p className="eyebrow">
            <span className="status-dot" />
            대학 선택을 위한 데이터 가이드
          </p>
          <h1>
            궁금한 대학부터,
            <br />
            <em>나에게 맞는 학과까지.</em>
          </h1>
          <p className="hero-description">
            대학·학과별 입결을 찾고, 내 점수와 비교해 보세요.
            <br />
            공개된 입시 결과와 원문 출처를 한곳에 모았어요.
          </p>
          <form
            data-ga-submit="home_admission_search"
            data-ga-search-field="q"
            className="hero-search"
            action="/#explore"
            method="get"
          >
            <input type="hidden" name="metrics" value={metrics} />
            <Icon name="search" />
            <input
              name="q"
              aria-label="대학·학과·전형 검색"
              placeholder="대학명, 학과명, 전형명으로 검색"
              defaultValue={q}
            />
            <button type="submit">
              입결 검색 <Icon name="arrow" size={17} />
            </button>
          </form>
          <div className="suggestions">
            <span>이렇게 찾아보세요</span>
            {["컴퓨터", "간호", "기계", "경영"].map((term) => (
              <Link key={term} href={`/?q=${encodeURIComponent(term)}#explore`}>
                {term}
              </Link>
            ))}
          </div>
        </div>
        <aside className="grade-card">
          <div className="grade-card-top">
            <span>MY GRADE</span>
            <span className="badge neutral">4년제 수시</span>
          </div>
          <span className="grade-icon">
            <Icon name="chart" size={23} />
          </span>
          <h2>
            내 점수에 가까운
            <br />
            학과를 찾아볼까요?
          </h2>
          <p>내신과 공개된 등급컷을 비교해요.</p>
          <form
            data-ga-submit="home_grade_compare"
            action="/admissions/compare/"
            method="get"
          >
            <div className="grade-inputs">
              <label>
                내 평균등급
                <input
                  name="grade"
                  aria-label="내 평균등급"
                  type="number"
                  min="1"
                  max="9"
                  step="0.01"
                  required
                  placeholder="예: 3.50"
                />
              </label>
              <label>
                전형
                <select name="track" aria-label="전형">
                  <option value="student">학생부교과</option>
                  <option value="holistic">학생부종합</option>
                </select>
              </label>
            </div>
            <button className="button dark" type="submit">
              내 점수로 학과 찾기 <Icon name="arrow" size={18} />
            </button>
          </form>
          <small>9등급제 내신 기준 · 과거 입결과의 단순 비교</small>
        </aside>
      </section>
      <div className="coverage-bar">
        <span>
          <span className="status-dot" />
          {data?.selectedYear ?? "최신"}학년도 공개 입시결과
        </span>
        <span>
          <b>{universities?.totalCount.toLocaleString("ko-KR") ?? "—"}</b>개
          대학 정보
        </span>
        <span>
          <b>{totals?.totalCount.toLocaleString("ko-KR") ?? "—"}</b>건의
          입시결과
        </span>
        <small>어디가 · 전문대학포털 · 대학 입학처</small>
      </div>
      <DisplayAd />
      <section
        className="explorer"
        id="explore"
        data-ga-view="admission_overview_view"
        data-ga-param-year={data?.selectedYear ?? ""}
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">01 / EXPLORE</p>
            <h2>대학·학과 입결 찾기</h2>
            <p>궁금한 대학과 학과를 검색하고, 조건을 좁혀보세요.</p>
          </div>
          <Link className="text-link" href="/universities/">
            대학 둘러보기 <Icon name="arrow" size={17} />
          </Link>
        </div>
        <div className="explorer-panel">
          <form
            data-ga-submit="home_admission_search"
            data-ga-search-field="q"
            className="explorer-search"
            action="/#explore"
          >
            <Icon name="search" />
            <input
              name="q"
              aria-label="입결 검색어"
              placeholder="대학, 학과, 전형 검색"
              defaultValue={q}
            />
            {Object.entries({ kind, phase, track, metrics }).map(
              ([key, value]) => (
                <input key={key} type="hidden" name={key} value={value} />
              ),
            )}
            <button className="button primary">검색</button>
          </form>
          <div className="filter-groups">
            {chips("대학 유형", "kind", [
              ["", "전체"],
              ["four", "4년제"],
              ["college", "전문대"],
            ])}
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
          </div>
        </div>
        <div className="admission-controls">
          <MetricToggle
            href="/"
            params={filters}
            publicOnly={metrics !== "all"}
          />
          <Link href="/#explore">조건 초기화 ↻</Link>
        </div>
        <div className="result-toolbar" id="results">
          <p>
            <b>{data?.totalCount.toLocaleString("ko-KR") ?? "—"}</b>건{" "}
            <span>
              {metrics === "all" ? "전체 입시결과" : "입결 지표 공개"}
            </span>
          </p>
          <Link href="/#explore">조건 초기화 ↻</Link>
        </div>
        {data ? (
          data.items.length ? (
            <>
              <AdmissionsTable items={data.items} />
              <Pagination
                href="/"
                page={page}
                hasNext={data.hasNext}
                params={filters}
              />
            </>
          ) : (
            <div className="empty-state">
              <Icon name="search" size={32} />
              <h3>조건에 맞는 입결이 없어요</h3>
              <p>검색어를 줄이거나 필터를 변경해 보세요.</p>
              <Link className="button" href="/#explore">
                전체 결과 보기
              </Link>
            </div>
          )
        ) : (
          <div className="notice">
            잠시 데이터를 불러오지 못했어요. 잠시 후 다시 확인해 주세요.
          </div>
        )}
      </section>
      <section className="discover-universities">
        <div className="section-heading">
          <div>
            <p className="eyebrow">02 / UNIVERSITIES</p>
            <h2>궁금한 대학, 더 자세히</h2>
            <p>대학 정보부터 학과별 입시결과까지 한 번에 확인하세요.</p>
          </div>
          <Link className="text-link" href="/universities/">
            전체 대학 보기 <Icon name="arrow" size={17} />
          </Link>
        </div>
        <div className="home-school-grid">
          {universities?.items.slice(0, 6).map((u) => (
            <Link
              key={u.id}
              className="home-school"
              href={`/universities/${u.id}/`}
            >
              <UniversityLogo id={u.id} name={u.name} logoPath={u.logoPath} />
              <strong>{u.name}</strong>
              <small>{u.region}</small>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
