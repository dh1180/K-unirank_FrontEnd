import { DisplayAd } from "@/components/DisplayAd";
import type { Metadata } from "next";
import Link from "next/link";
import { listUniversities } from "@/lib/api";
import { positivePage, toQuery } from "@/lib/query.mjs";
import { Notice } from "@/components/Notice";
import { Pagination } from "@/components/Pagination";
import { UniversityLogo } from "@/components/UniversityLogo";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "전국 대학 찾기" };
type Search = { q?: string; region?: string; page?: string };
const regions = [
  ["", "전체"],
  ["서울특별시", "서울"],
  ["경기도", "경기"],
  ["인천광역시", "인천"],
  ["부산광역시", "부산"],
  ["대구광역시", "대구"],
  ["대전광역시", "대전"],
  ["강원특별자치도", "강원"],
  ["충청남도", "충남"],
  ["경상남도", "경남"],
  ["제주특별자치도", "제주"],
];
export default async function UniversitiesPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.slice(0, 100).trim() : "";
  const region =
    typeof params.region === "string" ? params.region.slice(0, 30) : "";
  const page = positivePage(params.page);
  const data = await listUniversities(q, page, region);
  return (
    <>
      <section
        className="directory-heading"
        data-ga-view="university_list_view"
        data-ga-param-query={q}
        data-ga-param-region={region}
      >
        <div>
          <p className="eyebrow">UNIVERSITIES</p>
          <h1>전국 대학 찾기</h1>
          <p>궁금한 대학의 정보와 학과별 입시결과를 한눈에.</p>
        </div>
        <div className="heading-stamp">
          <Icon name="book" size={30} />
          <span>나의 다음 캠퍼스</span>
        </div>
      </section>
      <form
        action="/universities/"
        data-ga-submit="university_search"
        data-ga-search-field="q"
        className="directory-search"
        method="get"
      >
        <Icon name="search" size={22} />
        <input
          id="university-q"
          name="q"
          type="search"
          aria-label="대학명"
          defaultValue={q}
          placeholder="어떤 대학이 궁금하세요?"
          maxLength={100}
        />
        <input type="hidden" name="region" value={region} />
        <button className="button primary" type="submit">
          대학 검색 <Icon name="arrow" size={17} />
        </button>
      </form>
      <div className="region-chips" aria-label="지역 필터">
        {regions.map(([value, label]) => (
          <Link
            key={value}
            className={`chip ${value === region ? "active" : ""}`}
            href={`/universities/?${toQuery({ q, region: value })}`}
            aria-current={value === region ? "true" : undefined}
          >
            {label}
          </Link>
        ))}
      </div>
      <DisplayAd />
      {data === null ? (
        <Notice>
          대학 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </Notice>
      ) : (
        <>
          <div className="result-toolbar" id="results">
            <p>
              총 <b>{data.totalCount.toLocaleString("ko-KR")}</b>개 대학{" "}
              {q && <span>· “{q}” 검색 결과</span>}
            </p>
            <span className="muted">대학명 가나다순</span>
          </div>
          {data.items.length === 0 ? (
            <div className="empty-state">
              <Icon name="search" size={32} />
              <h2>검색 결과가 없어요</h2>
              <p>대학 이름이나 지역을 다시 확인해 주세요.</p>
              <Link href="/universities/" className="button">
                전체 대학 보기
              </Link>
            </div>
          ) : (
            <div className="school-grid">
              {data.items.map((item) => (
                <Link
                  className="school-card"
                  key={item.id}
                  href={`/universities/${item.id}/`}
                >
                  <UniversityLogo
                    id={item.id}
                    name={item.name}
                    logoPath={item.logoPath}
                  />
                  <div className="school-card-content">
                    <h2>{item.name}</h2>
                    <p>
                      <Icon name="pin" size={14} />
                      {item.region ?? "지역 정보 없음"}
                    </p>
                    <span>대학 정보 · 입시결과</span>
                  </div>
                  <span className="school-arrow">
                    <Icon name="arrow" size={18} />
                  </span>
                </Link>
              ))}
            </div>
          )}
          <Pagination
            href="/universities/"
            page={page}
            hasNext={data.hasNext}
            params={{ q, region }}
          />
        </>
      )}
    </>
  );
}
